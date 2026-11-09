-- ============================================================
-- TRIGGERS — Dark Web Data Breach Intelligence System
-- ============================================================

-- ============================================================
-- TRIGGER 1: Auto-log breach ingestion to audit_logs
-- ============================================================
CREATE OR REPLACE FUNCTION trg_fn_breach_audit()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO audit_logs (user_id, action, target_table, target_id, details)
    VALUES (
        NULL,
        'BREACH_INGESTED',
        'breaches',
        NEW.breach_id,
        'New breach ingested: ' || NEW.breach_name ||
        ' | Severity: ' || NEW.severity ||
        ' | Records: ' || COALESCE(NEW.records_exposed::TEXT, 'unknown')
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_breach_audit
AFTER INSERT ON breaches
FOR EACH ROW
EXECUTE FUNCTION trg_fn_breach_audit();


-- ============================================================
-- TRIGGER 2: Detect credential reuse across breaches
-- ============================================================
CREATE OR REPLACE FUNCTION trg_fn_credential_reuse_check()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM compromised_credentials
    WHERE email_hash = NEW.email_hash
      AND breach_id != NEW.breach_id;

    IF v_count > 0 THEN
        NEW.is_reused := TRUE;

        UPDATE compromised_credentials
        SET is_reused = TRUE
        WHERE email_hash = NEW.email_hash
          AND is_reused = FALSE;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_credential_reuse_check
BEFORE INSERT ON compromised_credentials
FOR EACH ROW
EXECUTE FUNCTION trg_fn_credential_reuse_check();


-- ============================================================
-- TRIGGER 3: Update threat actor's last_seen date
-- ============================================================
CREATE OR REPLACE FUNCTION trg_fn_update_actor_last_seen()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE
    v_breach_date DATE;
BEGIN
    SELECT breach_date INTO v_breach_date
    FROM breaches WHERE breach_id = NEW.breach_id;

    UPDATE threat_actors
    SET last_seen = GREATEST(
        COALESCE(last_seen, '1970-01-01'),
        COALESCE(v_breach_date, CURRENT_DATE)
    )
    WHERE actor_id = NEW.actor_id;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_actor_last_seen
AFTER INSERT ON breach_threat_actors
FOR EACH ROW
EXECUTE FUNCTION trg_fn_update_actor_last_seen();


-- ============================================================
-- TRIGGER 4: Watchlist alert on credential leak
-- ============================================================
CREATE OR REPLACE FUNCTION trg_fn_watchlist_alert()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE
    v_org_id   INT;
    v_watcher  RECORD;
BEGIN
    SELECT org_id INTO v_org_id
    FROM domains WHERE domain_id = NEW.domain_id;

    IF v_org_id IS NOT NULL THEN
        FOR v_watcher IN
            SELECT user_id FROM watchlist
            WHERE org_id = v_org_id AND alert_enabled = TRUE
        LOOP
            INSERT INTO audit_logs (user_id, action, target_table, target_id, details)
            VALUES (
                v_watcher.user_id,
                'WATCHLIST_ALERT',
                'compromised_credentials',
                NEW.cred_id,
                'Watched organization credential leaked in breach_id: ' || NEW.breach_id
            );
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_watchlist_alert
AFTER INSERT ON compromised_credentials
FOR EACH ROW
EXECUTE FUNCTION trg_fn_watchlist_alert();
