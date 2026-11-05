-- ============================================================
-- Dark Web Data Breach Intelligence System
-- PostgreSQL DDL — Full Schema
-- ============================================================

-- Enable pgvector extension for semantic similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- TABLE 1: users
-- ============================================================
CREATE TABLE users (
    user_id      SERIAL PRIMARY KEY,
    username     VARCHAR(50) UNIQUE NOT NULL,
    email        VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role         VARCHAR(20) NOT NULL DEFAULT 'analyst'
                 CHECK (role IN ('analyst', 'admin')),
    created_at   TIMESTAMP DEFAULT NOW(),
    last_login   TIMESTAMP
);

-- ============================================================
-- TABLE 2: threat_actors
-- ============================================================
CREATE TABLE threat_actors (
    actor_id       SERIAL PRIMARY KEY,
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

-- ============================================================
-- TABLE 3: threat_actor_aliases
-- ============================================================
CREATE TABLE threat_actor_aliases (
    alias_id   SERIAL PRIMARY KEY,
    actor_id   INT NOT NULL REFERENCES threat_actors(actor_id)
               ON DELETE CASCADE,
    alias_name VARCHAR(100) NOT NULL,
    platform   VARCHAR(100)
);

-- ============================================================
-- TABLE 4: data_classes
-- ============================================================
CREATE TABLE data_classes (
    class_id         SERIAL PRIMARY KEY,
    class_name       VARCHAR(50) UNIQUE NOT NULL,
    sensitivity_level VARCHAR(20) CHECK (sensitivity_level IN (
                       'low', 'medium', 'high', 'critical'
                     ))
);

-- ============================================================
-- TABLE 5: breaches (core table with pgvector embedding)
-- ============================================================
CREATE TABLE breaches (
    breach_id             SERIAL PRIMARY KEY,
    breach_name           VARCHAR(200) NOT NULL,
    description           TEXT NOT NULL,
    breach_date           DATE,
    discovery_date        DATE,
    source_type           VARCHAR(30) CHECK (source_type IN (
                            'dark_web', 'paste_site', 'public_disclosure', 'insider'
                          )),
    severity              VARCHAR(20) CHECK (severity IN (
                            'low', 'medium', 'high', 'critical'
                          )),
    cvss_score            NUMERIC(3,1) CHECK (cvss_score >= 0 AND cvss_score <= 10),
    records_exposed       BIGINT DEFAULT 0,
    attack_vector         VARCHAR(30) CHECK (attack_vector IN (
                            'sqli', 'phishing', 'rce', 'misconfiguration',
                            'insider', 'zero_day', 'credential_stuffing', 'unknown'
                          )),
    description_embedding vector(384),
    ingested_at           TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_breach_embedding ON breaches
USING ivfflat (description_embedding vector_cosine_ops)
WITH (lists = 10);

-- ============================================================
-- TABLE 6: breach_data_classes (M:N junction)
-- ============================================================
CREATE TABLE breach_data_classes (
    breach_id INT NOT NULL REFERENCES breaches(breach_id) ON DELETE CASCADE,
    class_id  INT NOT NULL REFERENCES data_classes(class_id) ON DELETE CASCADE,
    PRIMARY KEY (breach_id, class_id)
);

-- ============================================================
-- TABLE 7: breach_threat_actors (M:N junction)
-- ============================================================
CREATE TABLE breach_threat_actors (
    breach_id        INT NOT NULL REFERENCES breaches(breach_id) ON DELETE CASCADE,
    actor_id         INT NOT NULL REFERENCES threat_actors(actor_id) ON DELETE CASCADE,
    confidence_level VARCHAR(20) CHECK (confidence_level IN (
                       'low', 'medium', 'high', 'confirmed'
                     )),
    PRIMARY KEY (breach_id, actor_id)
);

-- ============================================================
-- TABLE 8: organizations
-- ============================================================
CREATE TABLE organizations (
    org_id         SERIAL PRIMARY KEY,
    org_name       VARCHAR(150) NOT NULL,
    industry       VARCHAR(80) NOT NULL,
    country        VARCHAR(60),
    employee_count INT,
    risk_tier      VARCHAR(20) DEFAULT 'low'
                   CHECK (risk_tier IN ('low', 'medium', 'high', 'critical'))
);

-- ============================================================
-- TABLE 9: domains
-- ============================================================
CREATE TABLE domains (
    domain_id   SERIAL PRIMARY KEY,
    org_id      INT NOT NULL REFERENCES organizations(org_id) ON DELETE CASCADE,
    domain_name VARCHAR(255) UNIQUE NOT NULL,
    is_primary  BOOLEAN DEFAULT FALSE
);

-- ============================================================
-- TABLE 10: compromised_credentials
-- ============================================================
CREATE TABLE compromised_credentials (
    cred_id         BIGSERIAL PRIMARY KEY,
    breach_id       INT NOT NULL REFERENCES breaches(breach_id) ON DELETE CASCADE,
    domain_id       INT REFERENCES domains(domain_id) ON DELETE SET NULL,
    email_hash      VARCHAR(64) NOT NULL,
    credential_type VARCHAR(30) CHECK (credential_type IN (
                      'password', 'api_key', 'token', 'session', 'certificate'
                    )),
    is_reused       BOOLEAN DEFAULT FALSE,
    discovered_at   TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cred_email_hash ON compromised_credentials(email_hash);
CREATE INDEX idx_cred_breach ON compromised_credentials(breach_id);
CREATE INDEX idx_cred_domain ON compromised_credentials(domain_id);

-- ============================================================
-- TABLE 11: watchlist
-- ============================================================
CREATE TABLE watchlist (
    watch_id      SERIAL PRIMARY KEY,
    user_id       INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    org_id        INT NOT NULL REFERENCES organizations(org_id) ON DELETE CASCADE,
    watch_type    VARCHAR(20) CHECK (watch_type IN (
                    'domain', 'keyword', 'actor'
                  )),
    alert_enabled BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, org_id)
);

-- ============================================================
-- TABLE 12: remediation_actions
-- ============================================================
CREATE TABLE remediation_actions (
    action_id   SERIAL PRIMARY KEY,
    breach_id   INT NOT NULL REFERENCES breaches(breach_id) ON DELETE CASCADE,
    user_id     INT NOT NULL REFERENCES users(user_id),
    action_type VARCHAR(30) CHECK (action_type IN (
                  'password_reset', 'key_rotation', 'account_lock',
                  'notify_affected', 'patch', 'blocklist'
                )),
    description TEXT,
    status      VARCHAR(20) DEFAULT 'pending'
                CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
    created_at  TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

-- ============================================================
-- TABLE 13: audit_logs
-- ============================================================
CREATE TABLE audit_logs (
    log_id       BIGSERIAL PRIMARY KEY,
    user_id      INT REFERENCES users(user_id) ON DELETE SET NULL,
    action       VARCHAR(50) NOT NULL,
    target_table VARCHAR(50),
    target_id    INT,
    details      TEXT,
    performed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_time ON audit_logs(performed_at);
