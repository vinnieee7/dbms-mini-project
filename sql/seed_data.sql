-- ============================================================
-- SEED DATA — Dark Web Data Breach Intelligence System
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
