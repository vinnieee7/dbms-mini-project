-- ============================================================
-- VIEWS — Dark Web Data Breach Intelligence System
-- ============================================================

-- ============================================================
-- VIEW 1: Breach Dashboard Summary
-- ============================================================
CREATE OR REPLACE VIEW vw_breach_dashboard AS
SELECT
    b.breach_id,
    b.breach_name,
    b.breach_date,
    b.severity,
    b.cvss_score,
    b.records_exposed,
    b.source_type,
    b.attack_vector,
    b.ingested_at,
    STRING_AGG(DISTINCT dc.class_name, ', ') AS data_classes,
    STRING_AGG(DISTINCT ta.name, ', ') AS attributed_actors
FROM breaches b
LEFT JOIN breach_data_classes bdc ON b.breach_id = bdc.breach_id
LEFT JOIN data_classes dc ON bdc.class_id = dc.class_id
LEFT JOIN breach_threat_actors bta ON b.breach_id = bta.breach_id
LEFT JOIN threat_actors ta ON bta.actor_id = ta.actor_id
GROUP BY b.breach_id;


-- ============================================================
-- VIEW 2: Organization Exposure Report
-- ============================================================
CREATE OR REPLACE VIEW vw_org_exposure_report AS
SELECT
    o.org_id,
    o.org_name,
    o.industry,
    o.risk_tier,
    COUNT(DISTINCT cc.breach_id) AS breach_count,
    COUNT(cc.cred_id) AS total_compromised_credentials,
    SUM(CASE WHEN cc.is_reused THEN 1 ELSE 0 END) AS reused_credentials,
    STRING_AGG(DISTINCT d.domain_name, ', ') AS affected_domains,
    MAX(b.breach_date) AS latest_breach_date
FROM organizations o
JOIN domains d ON o.org_id = d.org_id
LEFT JOIN compromised_credentials cc ON d.domain_id = cc.domain_id
LEFT JOIN breaches b ON cc.breach_id = b.breach_id
GROUP BY o.org_id, o.org_name, o.industry, o.risk_tier;


-- ============================================================
-- VIEW 3: Credential Reuse Statistics
-- ============================================================
CREATE OR REPLACE VIEW vw_credential_reuse_stats AS
SELECT
    cc.email_hash,
    COUNT(DISTINCT cc.breach_id) AS breach_count,
    STRING_AGG(DISTINCT b.breach_name, ', ') AS breaches_appeared_in,
    STRING_AGG(DISTINCT b.severity, ', ') AS severities,
    MIN(b.breach_date) AS first_exposure,
    MAX(b.breach_date) AS latest_exposure
FROM compromised_credentials cc
JOIN breaches b ON cc.breach_id = b.breach_id
WHERE cc.is_reused = TRUE
GROUP BY cc.email_hash
HAVING COUNT(DISTINCT cc.breach_id) >= 2
ORDER BY breach_count DESC;


-- ============================================================
-- VIEW 4: Threat Actor Full Profile
-- ============================================================
CREATE OR REPLACE VIEW vw_threat_actor_profile AS
SELECT
    ta.actor_id,
    ta.name,
    ta.origin_country,
    ta.motivation,
    ta.risk_level,
    ta.first_seen,
    ta.last_seen,
    STRING_AGG(DISTINCT taa.alias_name, ', ') AS aliases,
    COUNT(DISTINCT bta.breach_id) AS attributed_breaches,
    COALESCE(SUM(b.records_exposed), 0) AS total_records_exposed,
    STRING_AGG(DISTINCT b.attack_vector, ', ') AS attack_vectors_used
FROM threat_actors ta
LEFT JOIN threat_actor_aliases taa ON ta.actor_id = taa.actor_id
LEFT JOIN breach_threat_actors bta ON ta.actor_id = bta.actor_id
LEFT JOIN breaches b ON bta.breach_id = b.breach_id
GROUP BY ta.actor_id;


-- ============================================================
-- VIEW 5: Monthly Breach Trends
-- ============================================================
CREATE OR REPLACE VIEW vw_monthly_breach_trends AS
SELECT
    DATE_TRUNC('month', breach_date) AS month,
    COUNT(*) AS breach_count,
    SUM(records_exposed) AS total_records_exposed,
    ROUND(AVG(cvss_score), 1) AS avg_cvss_score,
    COUNT(*) FILTER (WHERE severity = 'critical') AS critical_count,
    COUNT(*) FILTER (WHERE severity = 'high') AS high_count,
    COUNT(*) FILTER (WHERE severity = 'medium') AS medium_count,
    COUNT(*) FILTER (WHERE severity = 'low') AS low_count
FROM breaches
WHERE breach_date IS NOT NULL
GROUP BY DATE_TRUNC('month', breach_date)
ORDER BY month DESC;
