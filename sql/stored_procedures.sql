-- ============================================================
-- STORED PROCEDURES & FUNCTIONS
-- Dark Web Data Breach Intelligence System
-- ============================================================

-- ============================================================
-- 1. sp_ingest_breach: Insert a new breach with data class linking
-- ============================================================
CREATE OR REPLACE PROCEDURE sp_ingest_breach(
    p_name         VARCHAR,
    p_description  TEXT,
    p_breach_date  DATE,
    p_source_type  VARCHAR,
    p_severity     VARCHAR,
    p_cvss         NUMERIC,
    p_records      BIGINT,
    p_attack_vec   VARCHAR,
    p_data_classes INT[],
    p_user_id      INT
)
LANGUAGE plpgsql AS $$
DECLARE
    v_breach_id INT;
    v_class_id  INT;
BEGIN
    INSERT INTO breaches (
        breach_name, description, breach_date, discovery_date,
        source_type, severity, cvss_score, records_exposed, attack_vector
    ) VALUES (
        p_name, p_description, p_breach_date, CURRENT_DATE,
        p_source_type, p_severity, p_cvss, p_records, p_attack_vec
    ) RETURNING breach_id INTO v_breach_id;

    FOREACH v_class_id IN ARRAY p_data_classes LOOP
        INSERT INTO breach_data_classes (breach_id, class_id)
        VALUES (v_breach_id, v_class_id)
        ON CONFLICT DO NOTHING;
    END LOOP;

    INSERT INTO audit_logs (user_id, action, target_table, target_id, details)
    VALUES (p_user_id, 'INGEST_BREACH', 'breaches', v_breach_id,
            'Ingested breach: ' || p_name);

    RAISE NOTICE 'Breach ingested with ID: %', v_breach_id;
END;
$$;


-- ============================================================
-- 2. fn_check_credential_exposure: Look up email hash across breaches
-- ============================================================
CREATE OR REPLACE FUNCTION fn_check_credential_exposure(
    p_email_hash VARCHAR
)
RETURNS TABLE (
    breach_name     VARCHAR,
    breach_date     DATE,
    severity        VARCHAR,
    credential_type VARCHAR,
    is_reused       BOOLEAN,
    records_exposed BIGINT
)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT
        b.breach_name,
        b.breach_date,
        b.severity,
        cc.credential_type,
        cc.is_reused,
        b.records_exposed
    FROM compromised_credentials cc
    JOIN breaches b ON cc.breach_id = b.breach_id
    WHERE cc.email_hash = p_email_hash
    ORDER BY b.breach_date DESC;
END;
$$;


-- ============================================================
-- 3. fn_calculate_org_risk_score: Weighted risk scoring for an org
-- ============================================================
CREATE OR REPLACE FUNCTION fn_calculate_org_risk_score(
    p_org_id INT
)
RETURNS TABLE (
    org_name        VARCHAR,
    total_breaches  BIGINT,
    total_creds     BIGINT,
    reused_creds    BIGINT,
    risk_score      NUMERIC
)
LANGUAGE plpgsql AS $$
DECLARE
    v_breach_count  BIGINT;
    v_cred_count    BIGINT;
    v_reused_count  BIGINT;
    v_severity_sum  NUMERIC;
    v_score         NUMERIC;
    v_org_name      VARCHAR;
BEGIN
    SELECT o.org_name INTO v_org_name
    FROM organizations o WHERE o.org_id = p_org_id;

    SELECT COUNT(DISTINCT cc.breach_id) INTO v_breach_count
    FROM compromised_credentials cc
    JOIN domains d ON cc.domain_id = d.domain_id
    WHERE d.org_id = p_org_id;

    SELECT COUNT(*) INTO v_cred_count
    FROM compromised_credentials cc
    JOIN domains d ON cc.domain_id = d.domain_id
    WHERE d.org_id = p_org_id;

    SELECT COUNT(*) INTO v_reused_count
    FROM compromised_credentials cc
    JOIN domains d ON cc.domain_id = d.domain_id
    WHERE d.org_id = p_org_id AND cc.is_reused = TRUE;

    SELECT COALESCE(SUM(
        CASE b.severity
            WHEN 'critical' THEN 4
            WHEN 'high' THEN 3
            WHEN 'medium' THEN 2
            WHEN 'low' THEN 1
            ELSE 0
        END
    ), 0) INTO v_severity_sum
    FROM compromised_credentials cc
    JOIN domains d ON cc.domain_id = d.domain_id
    JOIN breaches b ON cc.breach_id = b.breach_id
    WHERE d.org_id = p_org_id;

    v_score := LEAST(100, (
        (v_breach_count * 10) +
        (v_severity_sum * 5) +
        (v_reused_count * 15) +
        (CASE WHEN v_cred_count > 10000 THEN 20
              WHEN v_cred_count > 1000  THEN 10
              ELSE 5 END)
    ));

    UPDATE organizations SET risk_tier =
        CASE
            WHEN v_score >= 75 THEN 'critical'
            WHEN v_score >= 50 THEN 'high'
            WHEN v_score >= 25 THEN 'medium'
            ELSE 'low'
        END
    WHERE organizations.org_id = p_org_id;

    RETURN QUERY SELECT v_org_name, v_breach_count, v_cred_count, v_reused_count, v_score;
END;
$$;


-- ============================================================
-- 4. fn_find_similar_breaches: Semantic similarity via pgvector
-- ============================================================
CREATE OR REPLACE FUNCTION fn_find_similar_breaches(
    p_breach_id INT,
    p_limit     INT DEFAULT 5
)
RETURNS TABLE (
    breach_id       INT,
    breach_name     VARCHAR,
    severity        VARCHAR,
    similarity      DOUBLE PRECISION,
    breach_date     DATE,
    records_exposed BIGINT
)
LANGUAGE plpgsql AS $$
DECLARE
    v_embedding vector(384);
BEGIN
    SELECT b.description_embedding INTO v_embedding
    FROM breaches b WHERE b.breach_id = p_breach_id;

    IF v_embedding IS NULL THEN
        RAISE EXCEPTION 'Breach % has no embedding', p_breach_id;
    END IF;

    RETURN QUERY
    SELECT
        b.breach_id,
        b.breach_name,
        b.severity,
        (1 - (b.description_embedding <=> v_embedding))::DOUBLE PRECISION AS similarity,
        b.breach_date,
        b.records_exposed
    FROM breaches b
    WHERE b.breach_id != p_breach_id
      AND b.description_embedding IS NOT NULL
    ORDER BY b.description_embedding <=> v_embedding ASC
    LIMIT p_limit;
END;
$$;


-- ============================================================
-- 5. fn_generate_threat_report: Full actor intelligence dossier
-- ============================================================
CREATE OR REPLACE FUNCTION fn_generate_threat_report(
    p_actor_id INT
)
RETURNS TABLE (
    actor_name       VARCHAR,
    risk_level       VARCHAR,
    motivation       VARCHAR,
    aliases          TEXT,
    total_breaches   BIGINT,
    total_records    BIGINT,
    targeted_industries TEXT,
    attack_vectors   TEXT,
    latest_breach    DATE
)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT
        ta.name,
        ta.risk_level,
        ta.motivation,
        (SELECT STRING_AGG(taa.alias_name, ', ')
         FROM threat_actor_aliases taa WHERE taa.actor_id = ta.actor_id),
        COUNT(DISTINCT bta.breach_id),
        COALESCE(SUM(b.records_exposed), 0),
        (SELECT STRING_AGG(DISTINCT o.industry, ', ')
         FROM breach_threat_actors bta2
         JOIN breaches b2 ON bta2.breach_id = b2.breach_id
         JOIN compromised_credentials cc ON cc.breach_id = b2.breach_id
         JOIN domains d ON cc.domain_id = d.domain_id
         JOIN organizations o ON d.org_id = o.org_id
         WHERE bta2.actor_id = ta.actor_id),
        (SELECT STRING_AGG(DISTINCT b3.attack_vector, ', ')
         FROM breach_threat_actors bta3
         JOIN breaches b3 ON bta3.breach_id = b3.breach_id
         WHERE bta3.actor_id = ta.actor_id),
        MAX(b.breach_date)
    FROM threat_actors ta
    LEFT JOIN breach_threat_actors bta ON ta.actor_id = bta.actor_id
    LEFT JOIN breaches b ON bta.breach_id = b.breach_id
    WHERE ta.actor_id = p_actor_id
    GROUP BY ta.actor_id, ta.name, ta.risk_level, ta.motivation;
END;
$$;
