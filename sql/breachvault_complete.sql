-- ============================================================
-- BreachVault — Dark Web Data Breach Intelligence System
-- COMPLETE MySQL Script (Single File)
-- Includes: Schema, Indexes, Triggers, Stored Procedures,
--           Views, Seed Data, Complex Queries
-- ============================================================

-- ============================================================
-- 0. DATABASE SETUP
-- ============================================================
CREATE DATABASE IF NOT EXISTS BreachVault;
USE BreachVault;

SET FOREIGN_KEY_CHECKS = 0;
DROP VIEW IF EXISTS vw_breach_dashboard, vw_org_exposure_report,
                    vw_credential_reuse_stats, vw_threat_actor_profile,
                    vw_monthly_breach_trends;
DROP TABLE IF EXISTS audit_logs, remediation_actions, watchlist,
                     compromised_credentials, breach_threat_actors,
                     breach_data_classes, domains, organizations,
                     breaches, data_classes, threat_actor_aliases,
                     threat_actors, users;
SET FOREIGN_KEY_CHECKS = 1;


-- ============================================================
--  1. CREATE TABLE STATEMENTS (13 Tables)
-- ============================================================

-- TABLE 1: users
CREATE TABLE users (
    user_id       INT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(50) UNIQUE NOT NULL,
    email         VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20) NOT NULL DEFAULT 'analyst'
                  CHECK (role IN ('analyst', 'admin')),
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login    TIMESTAMP NULL
);


-- TABLE 2: threat_actors
CREATE TABLE threat_actors (
    actor_id       INT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(100) NOT NULL,
    origin_country VARCHAR(60),
    motivation     VARCHAR(30) CHECK (motivation IN (
                     'financial', 'espionage', 'hacktivism', 'unknown'
                   )),
    description    TEXT,
    risk_level     VARCHAR(20) CHECK (risk_level IN (
                     'low', 'medium', 'high', 'critical'
                   )),
    first_seen     DATE,
    last_seen      DATE
);


-- TABLE 3: threat_actor_aliases
CREATE TABLE threat_actor_aliases (
    alias_id   INT AUTO_INCREMENT PRIMARY KEY,
    actor_id   INT NOT NULL,
    alias_name VARCHAR(100) NOT NULL,
    platform   VARCHAR(100),
    FOREIGN KEY (actor_id) REFERENCES threat_actors(actor_id)
        ON DELETE CASCADE
);


-- TABLE 4: data_classes
CREATE TABLE data_classes (
    class_id          INT AUTO_INCREMENT PRIMARY KEY,
    class_name        VARCHAR(50) UNIQUE NOT NULL,
    sensitivity_level VARCHAR(20) CHECK (sensitivity_level IN (
                        'low', 'medium', 'high', 'critical'
                      ))
);


-- TABLE 5: breaches (core table — embedding stored as JSON for vector search)
CREATE TABLE breaches (
    breach_id             INT AUTO_INCREMENT PRIMARY KEY,
    breach_name           VARCHAR(200) NOT NULL,
    description           TEXT NOT NULL,
    breach_date           DATE,
    discovery_date        DATE,
    source_type           VARCHAR(30) CHECK (source_type IN (
                            'dark_web', 'paste_site',
                            'public_disclosure', 'insider'
                          )),
    severity              VARCHAR(20) CHECK (severity IN (
                            'low', 'medium', 'high', 'critical'
                          )),
    cvss_score            DECIMAL(3,1) CHECK (
                            cvss_score >= 0 AND cvss_score <= 10
                          ),
    records_exposed       BIGINT DEFAULT 0,
    attack_vector         VARCHAR(30) CHECK (attack_vector IN (
                            'sqli', 'phishing', 'rce',
                            'misconfiguration', 'insider',
                            'zero_day', 'credential_stuffing',
                            'unknown'
                          )),
    description_embedding JSON,
    ingested_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- TABLE 6: breach_data_classes (M:N junction)
CREATE TABLE breach_data_classes (
    breach_id INT NOT NULL,
    class_id  INT NOT NULL,
    PRIMARY KEY (breach_id, class_id),
    FOREIGN KEY (breach_id) REFERENCES breaches(breach_id)
        ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES data_classes(class_id)
        ON DELETE CASCADE
);


-- TABLE 7: breach_threat_actors (M:N junction)
CREATE TABLE breach_threat_actors (
    breach_id        INT NOT NULL,
    actor_id         INT NOT NULL,
    confidence_level VARCHAR(20) CHECK (confidence_level IN (
                       'low', 'medium', 'high', 'confirmed'
                     )),
    PRIMARY KEY (breach_id, actor_id),
    FOREIGN KEY (breach_id) REFERENCES breaches(breach_id)
        ON DELETE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES threat_actors(actor_id)
        ON DELETE CASCADE
);


-- TABLE 8: organizations
CREATE TABLE organizations (
    org_id         INT AUTO_INCREMENT PRIMARY KEY,
    org_name       VARCHAR(150) NOT NULL,
    industry       VARCHAR(80) NOT NULL,
    country        VARCHAR(60),
    employee_count INT,
    risk_tier      VARCHAR(20) DEFAULT 'low'
                   CHECK (risk_tier IN (
                     'low', 'medium', 'high', 'critical'
                   ))
);


-- TABLE 9: domains
CREATE TABLE domains (
    domain_id   INT AUTO_INCREMENT PRIMARY KEY,
    org_id      INT NOT NULL,
    domain_name VARCHAR(255) UNIQUE NOT NULL,
    is_primary  BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (org_id) REFERENCES organizations(org_id)
        ON DELETE CASCADE
);


-- TABLE 10: compromised_credentials
CREATE TABLE compromised_credentials (
    cred_id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    breach_id       INT NOT NULL,
    domain_id       INT,
    email_hash      VARCHAR(64) NOT NULL,
    credential_type VARCHAR(30) CHECK (credential_type IN (
                      'password', 'api_key', 'token',
                      'session', 'certificate'
                    )),
    is_reused       BOOLEAN DEFAULT FALSE,
    discovered_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (breach_id) REFERENCES breaches(breach_id)
        ON DELETE CASCADE,
    FOREIGN KEY (domain_id) REFERENCES domains(domain_id)
        ON DELETE SET NULL
);


-- TABLE 11: watchlist
CREATE TABLE watchlist (
    watch_id      INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT NOT NULL,
    org_id        INT NOT NULL,
    watch_type    VARCHAR(20) CHECK (watch_type IN (
                    'domain', 'keyword', 'actor'
                  )),
    alert_enabled BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, org_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,
    FOREIGN KEY (org_id) REFERENCES organizations(org_id)
        ON DELETE CASCADE
);


-- TABLE 12: remediation_actions
CREATE TABLE remediation_actions (
    action_id   INT AUTO_INCREMENT PRIMARY KEY,
    breach_id   INT NOT NULL,
    user_id     INT NOT NULL,
    action_type VARCHAR(30) CHECK (action_type IN (
                  'password_reset', 'key_rotation',
                  'account_lock', 'notify_affected',
                  'patch', 'blocklist'
                )),
    description TEXT,
    status      VARCHAR(20) DEFAULT 'pending'
                CHECK (status IN (
                  'pending', 'in_progress',
                  'completed', 'failed'
                )),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (breach_id) REFERENCES breaches(breach_id)
        ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);


-- TABLE 13: audit_logs
CREATE TABLE audit_logs (
    log_id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id      INT,
    action       VARCHAR(50) NOT NULL,
    target_table VARCHAR(50),
    target_id    INT,
    details      TEXT,
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE SET NULL
);


-- ============================================================
--  2. CREATE INDEX STATEMENTS
-- ============================================================

CREATE INDEX idx_cred_email_hash ON compromised_credentials(email_hash);
CREATE INDEX idx_cred_breach     ON compromised_credentials(breach_id);
CREATE INDEX idx_cred_domain     ON compromised_credentials(domain_id);
CREATE INDEX idx_audit_user      ON audit_logs(user_id);
CREATE INDEX idx_audit_time      ON audit_logs(performed_at);
CREATE INDEX idx_breach_date     ON breaches(breach_date);
CREATE INDEX idx_breach_severity ON breaches(severity);


-- ============================================================
--  3. ALTER TABLE STATEMENTS
-- ============================================================

-- ALTER 1: Add a column to track breach verification status
ALTER TABLE breaches
ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;

-- ALTER 2: Increase org_name column length
ALTER TABLE organizations
MODIFY COLUMN org_name VARCHAR(255) NOT NULL;

-- ALTER 3: Add a column for tracking last password change date
ALTER TABLE compromised_credentials
ADD COLUMN last_password_change DATE;

-- ALTER 4: Add a CHECK constraint on email_hash length
ALTER TABLE compromised_credentials
ADD CONSTRAINT chk_email_hash_length
CHECK (CHAR_LENGTH(email_hash) = 64);

-- ALTER 5: Drop and re-add a UNIQUE constraint with a better name
ALTER TABLE watchlist
DROP INDEX user_id;

ALTER TABLE watchlist
ADD CONSTRAINT uq_watchlist_user_org UNIQUE (user_id, org_id);


-- ============================================================
--  4. DROP STATEMENTS (demonstrative — commented out)
-- ============================================================

-- DROP 1: Drop an index
-- DROP INDEX idx_audit_time ON audit_logs;

-- DROP 2: Drop a view
-- DROP VIEW IF EXISTS vw_monthly_breach_trends;

-- DROP 3: Drop a table with cascade
-- DROP TABLE IF EXISTS audit_logs;

-- DROP 4: Drop a column
-- ALTER TABLE breaches DROP COLUMN is_verified;

-- DROP 5: Drop a constraint
-- ALTER TABLE compromised_credentials DROP CHECK chk_email_hash_length;


-- ============================================================
--  5. TRIGGERS
-- ============================================================

-- TRIGGER 1: Auto-log breach ingestion to audit_logs
DELIMITER //
CREATE TRIGGER trg_breach_audit
AFTER INSERT ON breaches
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, target_table, target_id, details)
    VALUES (
        NULL,
        'BREACH_INGESTED',
        'breaches',
        NEW.breach_id,
        CONCAT('New breach ingested: ', NEW.breach_name,
               ' | Severity: ', NEW.severity,
               ' | Records: ', COALESCE(NEW.records_exposed, 'unknown'))
    );
END //
DELIMITER ;


-- TRIGGER 2: Detect credential reuse across breaches
DELIMITER //
CREATE TRIGGER trg_credential_reuse_check
BEFORE INSERT ON compromised_credentials
FOR EACH ROW
BEGIN
    DECLARE v_count INT;

    SELECT COUNT(*) INTO v_count
    FROM compromised_credentials
    WHERE email_hash = NEW.email_hash
      AND breach_id != NEW.breach_id;

    IF v_count > 0 THEN
        SET NEW.is_reused = TRUE;

        UPDATE compromised_credentials
        SET is_reused = TRUE
        WHERE email_hash = NEW.email_hash
          AND is_reused = FALSE;
    END IF;
END //
DELIMITER ;


-- TRIGGER 3: Update threat actor's last_seen date
DELIMITER //
CREATE TRIGGER trg_update_actor_last_seen
AFTER INSERT ON breach_threat_actors
FOR EACH ROW
BEGIN
    DECLARE v_breach_date DATE;

    SELECT breach_date INTO v_breach_date
    FROM breaches WHERE breach_id = NEW.breach_id;

    UPDATE threat_actors
    SET last_seen = GREATEST(
        COALESCE(last_seen, '1970-01-01'),
        COALESCE(v_breach_date, CURDATE())
    )
    WHERE actor_id = NEW.actor_id;
END //
DELIMITER ;


-- TRIGGER 4: Watchlist alert on credential leak
DELIMITER //
CREATE TRIGGER trg_watchlist_alert
AFTER INSERT ON compromised_credentials
FOR EACH ROW
BEGIN
    DECLARE v_org_id INT;
    DECLARE v_user_id INT;
    DECLARE done INT DEFAULT FALSE;
    DECLARE watcher_cursor CURSOR FOR
        SELECT user_id FROM watchlist
        WHERE org_id = v_org_id AND alert_enabled = TRUE;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    SELECT org_id INTO v_org_id
    FROM domains WHERE domain_id = NEW.domain_id;

    IF v_org_id IS NOT NULL THEN
        OPEN watcher_cursor;

        read_loop: LOOP
            FETCH watcher_cursor INTO v_user_id;
            IF done THEN
                LEAVE read_loop;
            END IF;

            INSERT INTO audit_logs (user_id, action, target_table, target_id, details)
            VALUES (
                v_user_id,
                'WATCHLIST_ALERT',
                'compromised_credentials',
                NEW.cred_id,
                CONCAT('Watched organization credential leaked in breach_id: ', NEW.breach_id)
            );
        END LOOP;

        CLOSE watcher_cursor;
    END IF;
END //
DELIMITER ;


-- ============================================================
--  6. STORED PROCEDURES & FUNCTIONS
-- ============================================================

-- PROCEDURE 1: Ingest a new breach
DELIMITER //
CREATE PROCEDURE sp_ingest_breach(
    IN p_name         VARCHAR(200),
    IN p_description  TEXT,
    IN p_breach_date  DATE,
    IN p_source_type  VARCHAR(30),
    IN p_severity     VARCHAR(20),
    IN p_cvss         DECIMAL(3,1),
    IN p_records      BIGINT,
    IN p_attack_vec   VARCHAR(30),
    IN p_user_id      INT
)
BEGIN
    DECLARE v_breach_id INT;

    INSERT INTO breaches (
        breach_name, description, breach_date, discovery_date,
        source_type, severity, cvss_score, records_exposed, attack_vector
    ) VALUES (
        p_name, p_description, p_breach_date, CURDATE(),
        p_source_type, p_severity, p_cvss, p_records, p_attack_vec
    );

    SET v_breach_id = LAST_INSERT_ID();

    INSERT INTO audit_logs (user_id, action, target_table, target_id, details)
    VALUES (p_user_id, 'INGEST_BREACH', 'breaches', v_breach_id,
            CONCAT('Ingested breach: ', p_name));

    SELECT v_breach_id AS new_breach_id;
END //
DELIMITER ;


-- PROCEDURE 2: Check credential exposure for an email hash
DELIMITER //
CREATE PROCEDURE sp_check_credential_exposure(
    IN p_email_hash VARCHAR(64)
)
BEGIN
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
END //
DELIMITER ;


-- PROCEDURE 3: Calculate organization risk score
DELIMITER //
CREATE PROCEDURE sp_calculate_org_risk_score(
    IN p_org_id INT
)
BEGIN
    DECLARE v_breach_count  INT;
    DECLARE v_cred_count    INT;
    DECLARE v_reused_count  INT;
    DECLARE v_severity_sum  INT;
    DECLARE v_score         INT;
    DECLARE v_org_name      VARCHAR(255);

    SELECT org_name INTO v_org_name
    FROM organizations WHERE org_id = p_org_id;

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

    SET v_score = LEAST(100, (
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
    WHERE org_id = p_org_id;

    SELECT v_org_name AS org_name,
           v_breach_count AS total_breaches,
           v_cred_count AS total_creds,
           v_reused_count AS reused_creds,
           v_score AS risk_score;
END //
DELIMITER ;


-- PROCEDURE 4: Generate threat actor report
DELIMITER //
CREATE PROCEDURE sp_generate_threat_report(
    IN p_actor_id INT
)
BEGIN
    SELECT
        ta.name AS actor_name,
        ta.risk_level,
        ta.motivation,
        (SELECT GROUP_CONCAT(taa.alias_name SEPARATOR ', ')
         FROM threat_actor_aliases taa
         WHERE taa.actor_id = ta.actor_id) AS aliases,
        COUNT(DISTINCT bta.breach_id) AS total_breaches,
        COALESCE(SUM(b.records_exposed), 0) AS total_records,
        (SELECT GROUP_CONCAT(DISTINCT o.industry SEPARATOR ', ')
         FROM breach_threat_actors bta2
         JOIN breaches b2 ON bta2.breach_id = b2.breach_id
         JOIN compromised_credentials cc ON cc.breach_id = b2.breach_id
         JOIN domains d ON cc.domain_id = d.domain_id
         JOIN organizations o ON d.org_id = o.org_id
         WHERE bta2.actor_id = ta.actor_id) AS targeted_industries,
        (SELECT GROUP_CONCAT(DISTINCT b3.attack_vector SEPARATOR ', ')
         FROM breach_threat_actors bta3
         JOIN breaches b3 ON bta3.breach_id = b3.breach_id
         WHERE bta3.actor_id = ta.actor_id) AS attack_vectors,
        MAX(b.breach_date) AS latest_breach
    FROM threat_actors ta
    LEFT JOIN breach_threat_actors bta ON ta.actor_id = bta.actor_id
    LEFT JOIN breaches b ON bta.breach_id = b.breach_id
    WHERE ta.actor_id = p_actor_id
    GROUP BY ta.actor_id, ta.name, ta.risk_level, ta.motivation;
END //
DELIMITER ;


-- PROCEDURE 5: Link data classes to a breach
DELIMITER //
CREATE PROCEDURE sp_link_data_classes(
    IN p_breach_id INT,
    IN p_class_ids VARCHAR(255)
)
BEGIN
    -- p_class_ids is a comma-separated string like '1,2,5,3'
    DECLARE v_class_id INT;
    DECLARE v_pos INT;
    DECLARE v_remaining VARCHAR(255);

    SET v_remaining = p_class_ids;

    WHILE CHAR_LENGTH(v_remaining) > 0 DO
        SET v_pos = LOCATE(',', v_remaining);

        IF v_pos > 0 THEN
            SET v_class_id = CAST(LEFT(v_remaining, v_pos - 1) AS UNSIGNED);
            SET v_remaining = SUBSTRING(v_remaining, v_pos + 1);
        ELSE
            SET v_class_id = CAST(v_remaining AS UNSIGNED);
            SET v_remaining = '';
        END IF;

        INSERT IGNORE INTO breach_data_classes (breach_id, class_id)
        VALUES (p_breach_id, v_class_id);
    END WHILE;
END //
DELIMITER ;


-- ============================================================
--  7. VIEWS
-- ============================================================

-- VIEW 1: Breach Dashboard Summary
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
    GROUP_CONCAT(DISTINCT dc.class_name SEPARATOR ', ') AS data_classes,
    GROUP_CONCAT(DISTINCT ta.name SEPARATOR ', ') AS attributed_actors
FROM breaches b
LEFT JOIN breach_data_classes bdc ON b.breach_id = bdc.breach_id
LEFT JOIN data_classes dc ON bdc.class_id = dc.class_id
LEFT JOIN breach_threat_actors bta ON b.breach_id = bta.breach_id
LEFT JOIN threat_actors ta ON bta.actor_id = ta.actor_id
GROUP BY b.breach_id;


-- VIEW 2: Organization Exposure Report
CREATE OR REPLACE VIEW vw_org_exposure_report AS
SELECT
    o.org_id,
    o.org_name,
    o.industry,
    o.risk_tier,
    COUNT(DISTINCT cc.breach_id) AS breach_count,
    COUNT(cc.cred_id) AS total_compromised_credentials,
    SUM(CASE WHEN cc.is_reused THEN 1 ELSE 0 END) AS reused_credentials,
    GROUP_CONCAT(DISTINCT d.domain_name SEPARATOR ', ') AS affected_domains,
    MAX(b.breach_date) AS latest_breach_date
FROM organizations o
JOIN domains d ON o.org_id = d.org_id
LEFT JOIN compromised_credentials cc ON d.domain_id = cc.domain_id
LEFT JOIN breaches b ON cc.breach_id = b.breach_id
GROUP BY o.org_id, o.org_name, o.industry, o.risk_tier;


-- VIEW 3: Credential Reuse Statistics
CREATE OR REPLACE VIEW vw_credential_reuse_stats AS
SELECT
    cc.email_hash,
    COUNT(DISTINCT cc.breach_id) AS breach_count,
    GROUP_CONCAT(DISTINCT b.breach_name SEPARATOR ', ') AS breaches_appeared_in,
    GROUP_CONCAT(DISTINCT b.severity SEPARATOR ', ') AS severities,
    MIN(b.breach_date) AS first_exposure,
    MAX(b.breach_date) AS latest_exposure
FROM compromised_credentials cc
JOIN breaches b ON cc.breach_id = b.breach_id
WHERE cc.is_reused = TRUE
GROUP BY cc.email_hash
HAVING COUNT(DISTINCT cc.breach_id) >= 2
ORDER BY breach_count DESC;


-- VIEW 4: Threat Actor Full Profile
CREATE OR REPLACE VIEW vw_threat_actor_profile AS
SELECT
    ta.actor_id,
    ta.name,
    ta.origin_country,
    ta.motivation,
    ta.risk_level,
    ta.first_seen,
    ta.last_seen,
    GROUP_CONCAT(DISTINCT taa.alias_name SEPARATOR ', ') AS aliases,
    COUNT(DISTINCT bta.breach_id) AS attributed_breaches,
    COALESCE(SUM(b.records_exposed), 0) AS total_records_exposed,
    GROUP_CONCAT(DISTINCT b.attack_vector SEPARATOR ', ') AS attack_vectors_used
FROM threat_actors ta
LEFT JOIN threat_actor_aliases taa ON ta.actor_id = taa.actor_id
LEFT JOIN breach_threat_actors bta ON ta.actor_id = bta.actor_id
LEFT JOIN breaches b ON bta.breach_id = b.breach_id
GROUP BY ta.actor_id;


-- VIEW 5: Monthly Breach Trends
CREATE OR REPLACE VIEW vw_monthly_breach_trends AS
SELECT
    DATE_FORMAT(breach_date, '%Y-%m-01') AS month,
    COUNT(*) AS breach_count,
    SUM(records_exposed) AS total_records_exposed,
    ROUND(AVG(cvss_score), 1) AS avg_cvss_score,
    SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) AS critical_count,
    SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) AS high_count,
    SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) AS medium_count,
    SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) AS low_count
FROM breaches
WHERE breach_date IS NOT NULL
GROUP BY DATE_FORMAT(breach_date, '%Y-%m-01')
ORDER BY month DESC;


-- ============================================================
--  8. SEED DATA
-- ============================================================

-- Users
INSERT INTO users (username, email, password_hash, role) VALUES
('admin_raven', 'raven@secops.io', '$2b$12$LJ3m9XvKpQhashed1234567890abcdef', 'admin'),
('analyst_ghost', 'ghost@secops.io', '$2b$12$KP8n2YzRqhashed1234567890abcdef', 'analyst'),
('analyst_cipher', 'cipher@secops.io', '$2b$12$MN4k8ZwTshashed1234567890abcdef', 'analyst');

-- Data Classes
INSERT INTO data_classes (class_name, sensitivity_level) VALUES
('Email Addresses', 'medium'),
('Passwords', 'critical'),
('Credit Card Numbers', 'critical'),
('Phone Numbers', 'high'),
('Social Security Numbers', 'critical'),
('API Keys', 'critical'),
('Session Tokens', 'high'),
('Physical Addresses', 'high'),
('IP Addresses', 'medium'),
('Usernames', 'low'),
('Date of Birth', 'medium'),
('Cryptocurrency Wallets', 'high');

-- Threat Actors
INSERT INTO threat_actors (name, origin_country, motivation, description, risk_level, first_seen, last_seen) VALUES
('PhantomSpider', 'Russia', 'financial', 'Sophisticated ransomware group known for targeting financial institutions. Operates via dark web marketplaces and uses custom exfiltration tools.', 'critical', '2019-03-15', '2024-11-20'),
('ShadowSyndicate', 'Unknown', 'financial', 'Large-scale credential harvesting operation selling dumps on underground forums. Known for combining phishing with credential stuffing attacks.', 'high', '2020-07-01', '2024-10-05'),
('NullSec Collective', 'China', 'espionage', 'State-sponsored APT group focused on intellectual property theft from technology and defense contractors.', 'critical', '2017-01-10', '2024-09-18'),
('DarkForge Crew', 'Brazil', 'hacktivism', 'Hacktivist group targeting government and corporate entities. Known for defacement and data leaks to paste sites.', 'medium', '2021-05-22', '2024-08-30'),
('CryptoWraith', 'North Korea', 'financial', 'State-linked group specializing in cryptocurrency exchange breaches and wallet draining operations.', 'critical', '2018-11-03', '2024-12-01');

-- Threat Actor Aliases
INSERT INTO threat_actor_aliases (actor_id, alias_name, platform) VALUES
(1, 'Ph4nt0m_Sp1d3r', 'RaidForums'),
(1, 'SpiderOps', 'Telegram'),
(2, 'ShadowDumps', 'BreachForums'),
(2, 'S_Syndicate', 'Dark Web Marketplace'),
(3, 'APT-NullSec', 'MITRE ATT&CK'),
(3, 'Operation GhostDragon', 'Mandiant Report'),
(4, 'DrkForge', 'Twitter/X'),
(5, 'WraithWallet', 'Telegram'),
(5, 'LazarusChild', 'CrowdStrike Report');

-- Organizations
INSERT INTO organizations (org_name, industry, country, employee_count, risk_tier) VALUES
('NexaCorp Technologies', 'Technology', 'United States', 15000, 'high'),
('GlobalBank Financial', 'Finance', 'United Kingdom', 42000, 'critical'),
('MedVault Health Systems', 'Healthcare', 'United States', 8000, 'high'),
('CryptoHaven Exchange', 'Cryptocurrency', 'Singapore', 500, 'critical'),
('EduConnect University', 'Education', 'India', 3000, 'medium'),
('Sentinel Defense Corp', 'Defense', 'United States', 20000, 'high'),
('ShopStream Retail', 'Retail', 'Germany', 12000, 'medium'),
('CloudNine SaaS', 'Technology', 'Canada', 2000, 'medium');

-- Domains
INSERT INTO domains (org_id, domain_name, is_primary) VALUES
(1, 'nexacorp.com', TRUE),
(1, 'nexacorp.io', FALSE),
(2, 'globalbank.co.uk', TRUE),
(2, 'gb-internal.net', FALSE),
(3, 'medvault.com', TRUE),
(4, 'cryptohaven.io', TRUE),
(5, 'educonnect.ac.in', TRUE),
(6, 'sentineldef.com', TRUE),
(7, 'shopstream.de', TRUE),
(8, 'cloudnine.ca', TRUE);

-- Breaches
INSERT INTO breaches (breach_name, description, breach_date, discovery_date, source_type, severity, cvss_score, records_exposed, attack_vector) VALUES
('ShadowVault Dump 2024', 'Massive credential dump discovered on a dark web marketplace containing email-password pairs, SSNs, and partial credit card data from multiple e-commerce platforms. The data appears to have been aggregated from multiple SQL injection attacks over a 6-month period.', '2024-03-15', '2024-04-02', 'dark_web', 'critical', 9.1, 12300000, 'sqli'),
('PhantomMarket Insider Leak', 'A disgruntled employee at a financial services firm exfiltrated customer records including email addresses, credit card numbers, and transaction histories. Data was found being sold on a Telegram channel linked to ShadowSyndicate.', '2024-05-20', '2024-06-01', 'insider', 'high', 7.8, 890000, 'insider'),
('NexusCloud S3 Exposure', 'Misconfigured AWS S3 buckets belonging to a cloud SaaS provider exposed 45 million records including API keys, OAuth tokens, and PII. The buckets were publicly accessible for approximately 3 months before discovery.', '2024-01-10', '2024-04-15', 'public_disclosure', 'critical', 9.8, 45000000, 'misconfiguration'),
('DarkForge Credential Dump', 'A large-scale phishing campaign targeting university and education sector employees resulted in harvested credentials being dumped on paste sites. Includes email-password combinations and internal system access tokens.', '2024-07-12', '2024-07-18', 'paste_site', 'high', 7.2, 3200000, 'phishing'),
('CryptoHaven Exchange Breach', 'Zero-day vulnerability in the exchange platform authentication system exploited to drain cryptocurrency wallets and exfiltrate user KYC data including government IDs, wallet addresses, and email addresses.', '2024-08-01', '2024-08-03', 'dark_web', 'critical', 9.5, 1100000, 'zero_day'),
('GhostNet Database Leak', 'A remote code execution vulnerability in an unpatched web server led to full database extraction. Exposed records include full names, phone numbers, physical addresses, and dates of birth from a healthcare patient management system.', '2024-02-28', '2024-03-10', 'dark_web', 'critical', 9.3, 8700000, 'rce'),
('OperationBlueFox', 'APT group conducted a multi-stage supply chain attack targeting defense contractors. Exfiltrated classified project codenames, employee credentials, and internal network architecture documents over a period of 8 months.', '2023-06-01', '2024-02-15', 'public_disclosure', 'critical', 9.9, 250000, 'zero_day'),
('RetailSweep Skimmer Attack', 'Web skimming malware injected into the checkout pages of multiple retail websites. Captured credit card numbers, CVVs, billing addresses, and customer emails in real-time for approximately 4 months.', '2024-04-05', '2024-08-12', 'dark_web', 'high', 8.1, 5600000, 'sqli');

-- Breach ↔ Data Classes
INSERT INTO breach_data_classes (breach_id, class_id) VALUES
(1, 1), (1, 2), (1, 5), (1, 3),
(2, 1), (2, 3), (2, 4),
(3, 6), (3, 7), (3, 1),
(4, 1), (4, 2), (4, 7),
(5, 12), (5, 1), (5, 11),
(6, 4), (6, 8), (6, 11), (6, 1),
(7, 1), (7, 2), (7, 6),
(8, 3), (8, 1), (8, 8);

-- Breach ↔ Threat Actors
INSERT INTO breach_threat_actors (breach_id, actor_id, confidence_level) VALUES
(1, 2, 'high'),
(2, 2, 'confirmed'),
(3, 1, 'medium'),
(4, 4, 'confirmed'),
(5, 5, 'high'),
(6, 1, 'high'),
(7, 3, 'confirmed'),
(8, 2, 'medium');

-- Compromised Credentials
INSERT INTO compromised_credentials (breach_id, domain_id, email_hash, credential_type) VALUES
(1, 1, 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2', 'password'),
(1, 1, 'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3', 'password'),
(1, 3, 'c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4', 'password'),
(2, 3, 'd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5', 'password'),
(2, 3, 'c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4', 'password'),
(3, 10, 'e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6', 'api_key'),
(3, 10, 'f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1', 'token'),
(4, 7, 'a1a1a1a1b2b2b2b2c3c3c3c3d4d4d4d4e5e5e5e5f6f6f6f6a1a1a1a1b2b2b2b2', 'password'),
(4, 7, 'b1b1b1b1c2c2c2c2d3d3d3d3e4e4e4e4f5f5f5f5a6a6a6a6b1b1b1b1c2c2c2c2', 'session'),
(5, 6, 'c1c1c1c1d2d2d2d2e3e3e3e3f4f4f4f4a5a5a5a5b6b6b6b6c1c1c1c1d2d2d2d2', 'password'),
(6, 5, 'd1d1d1d1e2e2e2e2f3f3f3f3a4a4a4a4b5b5b5b5c6c6c6c6d1d1d1d1e2e2e2e2', 'password'),
(6, 5, 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2', 'password'),
(7, 8, 'e1e1e1e1f2f2f2f2a3a3a3a3b4b4b4b4c5c5c5c5d6d6d6d6e1e1e1e1f2f2f2f2', 'password'),
(7, 8, 'f1f1f1f1a2a2a2a2b3b3b3b3c4c4c4c4d5d5d5d5e6e6e6e6f1f1f1f1a2a2a2a2', 'api_key'),
(8, 9, 'a2a2a2a2b3b3b3b3c4c4c4c4d5d5d5d5e6e6e6e6f1f1f1f1a2a2a2a2b3b3b3b3', 'password'),
(8, 9, 'b2b2b2b2c3c3c3c3d4d4d4d4e5e5e5e5f6f6f6f6a1a1a1a1b2b2b2b2c3c3c3c3', 'password');

-- Watchlist
INSERT INTO watchlist (user_id, org_id, watch_type, alert_enabled) VALUES
(1, 2, 'domain', TRUE),
(1, 4, 'domain', TRUE),
(2, 1, 'domain', TRUE),
(2, 6, 'actor', TRUE),
(3, 3, 'domain', TRUE);

-- Remediation Actions
INSERT INTO remediation_actions (breach_id, user_id, action_type, description, status, resolved_at) VALUES
(1, 1, 'password_reset', 'Force password reset for all NexaCorp accounts found in ShadowVault dump', 'completed', '2024-04-10'),
(1, 2, 'notify_affected', 'Email notification sent to 12.3M affected users', 'completed', '2024-04-05'),
(3, 1, 'key_rotation', 'Rotate all exposed API keys and OAuth tokens from NexusCloud S3 buckets', 'in_progress', NULL),
(5, 3, 'account_lock', 'Lock all CryptoHaven user accounts pending KYC re-verification', 'completed', '2024-08-05'),
(5, 1, 'blocklist', 'Blocklist known attacker wallet addresses across partner exchanges', 'in_progress', NULL),
(7, 2, 'patch', 'Apply emergency patch for zero-day vulnerability in supply chain component', 'completed', '2024-02-20');


-- ============================================================
--  9. COMPLEX QUERIES
-- ============================================================

-- QUERY 1: Top 10 Most Targeted Organizations
-- Techniques: JOIN, GROUP BY, ORDER BY, aggregate functions
SELECT
    o.org_name,
    o.industry,
    COUNT(DISTINCT cc.breach_id) AS times_breached,
    COUNT(cc.cred_id) AS credentials_exposed,
    SUM(CASE WHEN cc.is_reused THEN 1 ELSE 0 END) AS reused_credentials,
    MAX(b.breach_date) AS most_recent_breach
FROM organizations o
JOIN domains d ON o.org_id = d.org_id
JOIN compromised_credentials cc ON d.domain_id = cc.domain_id
JOIN breaches b ON cc.breach_id = b.breach_id
GROUP BY o.org_id, o.org_name, o.industry
ORDER BY times_breached DESC, credentials_exposed DESC
LIMIT 10;


-- QUERY 2: Threat Actors Targeting the Finance Industry
-- Techniques: Multi-table JOIN, subquery, HAVING, DISTINCT
SELECT
    ta.name AS threat_actor,
    ta.risk_level,
    ta.motivation,
    COUNT(DISTINCT b.breach_id) AS finance_breaches,
    SUM(b.records_exposed) AS total_records_exposed
FROM threat_actors ta
JOIN breach_threat_actors bta ON ta.actor_id = bta.actor_id
JOIN breaches b ON bta.breach_id = b.breach_id
WHERE b.breach_id IN (
    SELECT DISTINCT cc.breach_id
    FROM compromised_credentials cc
    JOIN domains d ON cc.domain_id = d.domain_id
    JOIN organizations o ON d.org_id = o.org_id
    WHERE o.industry = 'Finance'
)
GROUP BY ta.actor_id, ta.name, ta.risk_level, ta.motivation
HAVING COUNT(DISTINCT b.breach_id) >= 1
ORDER BY finance_breaches DESC;


-- QUERY 3: Credential Reuse Across Breaches for a Specific Domain
-- Techniques: Self-JOIN, comparison to avoid duplicates
SELECT
    cc1.email_hash,
    b1.breach_name AS breach_1,
    b1.breach_date AS breach_1_date,
    b2.breach_name AS breach_2,
    b2.breach_date AS breach_2_date
FROM compromised_credentials cc1
JOIN compromised_credentials cc2
    ON cc1.email_hash = cc2.email_hash
    AND cc1.breach_id < cc2.breach_id
JOIN breaches b1 ON cc1.breach_id = b1.breach_id
JOIN breaches b2 ON cc2.breach_id = b2.breach_id
JOIN domains d ON cc1.domain_id = d.domain_id
WHERE d.domain_name = 'globalbank.co.uk'
ORDER BY cc1.email_hash, b1.breach_date;


-- QUERY 4: Monthly Breach Severity Trend with Rolling Average
-- Techniques: Window functions, DATE_FORMAT, CTE
WITH monthly_stats AS (
    SELECT
        DATE_FORMAT(breach_date, '%Y-%m-01') AS month,
        COUNT(*) AS breach_count,
        ROUND(AVG(cvss_score), 2) AS avg_cvss,
        SUM(records_exposed) AS total_records
    FROM breaches
    WHERE breach_date IS NOT NULL
    GROUP BY DATE_FORMAT(breach_date, '%Y-%m-01')
)
SELECT
    month,
    breach_count,
    avg_cvss,
    total_records,
    ROUND(AVG(avg_cvss) OVER (
        ORDER BY month
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ), 2) AS moving_avg_cvss_3mo,
    SUM(breach_count) OVER (
        ORDER BY month
    ) AS cumulative_breaches
FROM monthly_stats
ORDER BY month;


-- QUERY 5: Full Breach Intelligence Report with All Related Data
-- Techniques: Multiple JOINs, GROUP BY, subquery, aggregation
SELECT
    b.breach_name,
    b.breach_date,
    b.severity,
    b.cvss_score,
    b.records_exposed,
    b.source_type,
    b.attack_vector,
    GROUP_CONCAT(DISTINCT dc.class_name SEPARATOR ', ') AS data_types_exposed,
    GROUP_CONCAT(DISTINCT ta.name SEPARATOR ', ') AS threat_actors,
    GROUP_CONCAT(DISTINCT CONCAT(ta.name, ' [', bta.confidence_level, ']')
                 SEPARATOR ', ') AS actor_attribution,
    (SELECT COUNT(*)
     FROM compromised_credentials cc
     WHERE cc.breach_id = b.breach_id) AS total_credentials,
    (SELECT COUNT(*)
     FROM compromised_credentials cc
     WHERE cc.breach_id = b.breach_id AND cc.is_reused = TRUE) AS reused_credentials,
    (SELECT COUNT(*)
     FROM remediation_actions ra
     WHERE ra.breach_id = b.breach_id AND ra.status = 'completed') AS completed_remediations
FROM breaches b
LEFT JOIN breach_data_classes bdc ON b.breach_id = bdc.breach_id
LEFT JOIN data_classes dc ON bdc.class_id = dc.class_id
LEFT JOIN breach_threat_actors bta ON b.breach_id = bta.breach_id
LEFT JOIN threat_actors ta ON bta.actor_id = ta.actor_id
GROUP BY b.breach_id
ORDER BY b.breach_date DESC;


-- ============================================================
-- END OF FILE
-- ============================================================
