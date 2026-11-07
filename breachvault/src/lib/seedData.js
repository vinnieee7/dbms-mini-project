// BreachVault Seed Data - Corresponds directly to seed_data.sql & schema.sql
export const initialUsers = [
  { user_id: 1, username: 'admin_raven', email: 'raven@secops.io', role: 'admin', created_at: '2024-01-01T09:00:00Z', last_login: '2024-11-01T14:22:00Z' },
  { user_id: 2, username: 'analyst_ghost', email: 'ghost@secops.io', role: 'analyst', created_at: '2024-01-15T10:30:00Z', last_login: '2024-10-31T18:45:00Z' },
  { user_id: 3, username: 'analyst_cipher', email: 'cipher@secops.io', role: 'analyst', created_at: '2024-02-01T11:15:00Z', last_login: '2024-10-29T08:12:00Z' }
];

export const initialDataClasses = [
  { class_id: 1, class_name: 'Email Addresses', sensitivity_level: 'medium' },
  { class_id: 2, class_name: 'Passwords', sensitivity_level: 'critical' },
  { class_id: 3, class_name: 'Credit Card Numbers', sensitivity_level: 'critical' },
  { class_id: 4, class_name: 'Phone Numbers', sensitivity_level: 'high' },
  { class_id: 5, class_name: 'Social Security Numbers', sensitivity_level: 'critical' },
  { class_id: 6, class_name: 'API Keys', sensitivity_level: 'critical' },
  { class_id: 7, class_name: 'Session Tokens', sensitivity_level: 'high' },
  { class_id: 8, class_name: 'Physical Addresses', sensitivity_level: 'high' },
  { class_id: 9, class_name: 'IP Addresses', sensitivity_level: 'medium' },
  { class_id: 10, class_name: 'Usernames', sensitivity_level: 'low' },
  { class_id: 11, class_name: 'Date of Birth', sensitivity_level: 'medium' },
  { class_id: 12, class_name: 'Cryptocurrency Wallets', sensitivity_level: 'high' }
];

export const initialThreatActors = [
  {
    actor_id: 1,
    name: 'PhantomSpider',
    origin_country: 'Russia',
    motivation: 'financial',
    description: 'Sophisticated ransomware group targeting financial institutions. Operates via dark web marketplaces and uses custom exfiltration tools.',
    risk_level: 'critical',
    first_seen: '2019-03-15',
    last_seen: '2024-11-20',
    aliases: ['Ph4nt0m_Sp1d3r (RaidForums)', 'SpiderOps (Telegram)']
  },
  {
    actor_id: 2,
    name: 'ShadowSyndicate',
    origin_country: 'Unknown',
    motivation: 'financial',
    description: 'Large-scale credential harvesting operation selling dumps on underground forums. Known for combining phishing with credential stuffing attacks.',
    risk_level: 'high',
    first_seen: '2020-07-01',
    last_seen: '2024-10-05',
    aliases: ['ShadowDumps (BreachForums)', 'S_Syndicate (Dark Web Marketplace)']
  },
  {
    actor_id: 3,
    name: 'NullSec Collective',
    origin_country: 'China',
    motivation: 'espionage',
    description: 'State-sponsored APT group focused on intellectual property theft from technology and defense contractors.',
    risk_level: 'critical',
    first_seen: '2017-01-10',
    last_seen: '2024-09-18',
    aliases: ['APT-NullSec (MITRE ATT&CK)', 'Operation GhostDragon (Mandiant)']
  },
  {
    actor_id: 4,
    name: 'DarkForge Crew',
    origin_country: 'Brazil',
    motivation: 'hacktivism',
    description: 'Hacktivist group targeting government and corporate entities. Known for defacement and data leaks to paste sites.',
    risk_level: 'medium',
    first_seen: '2021-05-22',
    last_seen: '2024-08-30',
    aliases: ['DrkForge (Twitter/X)']
  },
  {
    actor_id: 5,
    name: 'CryptoWraith',
    origin_country: 'North Korea',
    motivation: 'financial',
    description: 'State-linked group specializing in cryptocurrency exchange breaches and wallet draining operations.',
    risk_level: 'critical',
    first_seen: '2018-11-03',
    last_seen: '2024-12-01',
    aliases: ['WraithWallet (Telegram)', 'LazarusChild (CrowdStrike)']
  }
];

export const initialOrganizations = [
  { org_id: 1, org_name: 'NexaCorp Technologies', industry: 'Technology', country: 'United States', employee_count: 15000, risk_tier: 'high', domains: ['nexacorp.com (primary)', 'nexacorp.io'] },
  { org_id: 2, org_name: 'GlobalBank Financial', industry: 'Finance', country: 'United Kingdom', employee_count: 42000, risk_tier: 'critical', domains: ['globalbank.co.uk (primary)', 'gb-internal.net'] },
  { org_id: 3, org_name: 'MedVault Health Systems', industry: 'Healthcare', country: 'United States', employee_count: 8000, risk_tier: 'high', domains: ['medvault.com (primary)'] },
  { org_id: 4, org_name: 'CryptoHaven Exchange', industry: 'Cryptocurrency', country: 'Singapore', employee_count: 500, risk_tier: 'critical', domains: ['cryptohaven.io (primary)'] },
  { org_id: 5, org_name: 'EduConnect University', industry: 'Education', country: 'India', employee_count: 3000, risk_tier: 'medium', domains: ['educonnect.ac.in (primary)'] },
  { org_id: 6, org_name: 'Sentinel Defense Corp', industry: 'Defense', country: 'United States', employee_count: 20000, risk_tier: 'high', domains: ['sentineldef.com (primary)'] },
  { org_id: 7, org_name: 'ShopStream Retail', industry: 'Retail', country: 'Germany', employee_count: 12000, risk_tier: 'medium', domains: ['shopstream.de (primary)'] },
  { org_id: 8, org_name: 'CloudNine SaaS', industry: 'Technology', country: 'Canada', employee_count: 2000, risk_tier: 'medium', domains: ['cloudnine.ca (primary)'] }
];

export const initialDomains = [
  { domain_id: 1, org_id: 1, domain_name: 'nexacorp.com', is_primary: true },
  { domain_id: 2, org_id: 1, domain_name: 'nexacorp.io', is_primary: false },
  { domain_id: 3, org_id: 2, domain_name: 'globalbank.co.uk', is_primary: true },
  { domain_id: 4, org_id: 2, domain_name: 'gb-internal.net', is_primary: false },
  { domain_id: 5, org_id: 3, domain_name: 'medvault.com', is_primary: true },
  { domain_id: 6, org_id: 4, domain_name: 'cryptohaven.io', is_primary: true },
  { domain_id: 7, org_id: 5, domain_name: 'educonnect.ac.in', is_primary: true },
  { domain_id: 8, org_id: 6, domain_name: 'sentineldef.com', is_primary: true },
  { domain_id: 9, org_id: 7, domain_name: 'shopstream.de', is_primary: true },
  { domain_id: 10, org_id: 8, domain_name: 'cloudnine.ca', is_primary: true }
];

export const initialBreaches = [
  {
    breach_id: 1,
    breach_name: 'ShadowVault Dump 2024',
    description: 'Massive credential dump discovered on a dark web marketplace containing email-password pairs, SSNs, and partial credit card data from multiple e-commerce platforms. The data appears to have been aggregated from multiple SQL injection attacks over a 6-month period.',
    breach_date: '2024-03-15',
    discovery_date: '2024-04-02',
    source_type: 'dark_web',
    severity: 'critical',
    cvss_score: 9.1,
    records_exposed: 12300000,
    attack_vector: 'sqli',
    data_classes: ['Email Addresses', 'Passwords', 'Social Security Numbers', 'Credit Card Numbers'],
    attributed_actors: ['ShadowSyndicate (high confidence)'],
    keywords: ['credential dump', 'dark web', 'marketplace', 'sql injection', 'credit card', 'passwords']
  },
  {
    breach_id: 2,
    breach_name: 'PhantomMarket Insider Leak',
    description: 'A disgruntled employee at a financial services firm exfiltrated customer records including email addresses, credit card numbers, and transaction histories. Data was found being sold on a Telegram channel linked to ShadowSyndicate.',
    breach_date: '2024-05-20',
    discovery_date: '2024-06-01',
    source_type: 'insider',
    severity: 'high',
    cvss_score: 7.8,
    records_exposed: 890000,
    attack_vector: 'insider',
    data_classes: ['Email Addresses', 'Credit Card Numbers', 'Phone Numbers'],
    attributed_actors: ['ShadowSyndicate (confirmed)'],
    keywords: ['insider leak', 'financial', 'telegram', 'exfiltration', 'credit card']
  },
  {
    breach_id: 3,
    breach_name: 'NexusCloud S3 Exposure',
    description: 'Misconfigured AWS S3 buckets belonging to a cloud SaaS provider exposed 45 million records including API keys, OAuth tokens, and PII. The buckets were publicly accessible for approximately 3 months before discovery.',
    breach_date: '2024-01-10',
    discovery_date: '2024-04-15',
    source_type: 'public_disclosure',
    severity: 'critical',
    cvss_score: 9.8,
    records_exposed: 45000000,
    attack_vector: 'misconfiguration',
    data_classes: ['API Keys', 'Session Tokens', 'Email Addresses'],
    attributed_actors: ['PhantomSpider (medium confidence)'],
    keywords: ['cloud misconfiguration', 'aws s3 bucket', 'api keys', 'oauth tokens', 'pii exposed']
  },
  {
    breach_id: 4,
    breach_name: 'DarkForge Credential Dump',
    description: 'A large-scale phishing campaign targeting university and education sector employees resulted in harvested credentials being dumped on paste sites. Includes email-password combinations and internal system access tokens.',
    breach_date: '2024-07-12',
    discovery_date: '2024-07-18',
    source_type: 'paste_site',
    severity: 'high',
    cvss_score: 7.2,
    records_exposed: 3200000,
    attack_vector: 'phishing',
    data_classes: ['Email Addresses', 'Passwords', 'Session Tokens'],
    attributed_actors: ['DarkForge Crew (confirmed)'],
    keywords: ['phishing campaign', 'paste site', 'university', 'credentials', 'access tokens']
  },
  {
    breach_id: 5,
    breach_name: 'CryptoHaven Exchange Breach',
    description: 'Zero-day vulnerability in the exchange platform authentication system exploited to drain cryptocurrency wallets and exfiltrate user KYC data including government IDs, wallet addresses, and email addresses.',
    breach_date: '2024-08-01',
    discovery_date: '2024-08-03',
    source_type: 'dark_web',
    severity: 'critical',
    cvss_score: 9.5,
    records_exposed: 1100000,
    attack_vector: 'zero_day',
    data_classes: ['Cryptocurrency Wallets', 'Email Addresses', 'Date of Birth'],
    attributed_actors: ['CryptoWraith (high confidence)'],
    keywords: ['zero day vulnerability', 'cryptocurrency exchange', 'kyc data', 'wallet drain']
  },
  {
    breach_id: 6,
    breach_name: 'GhostNet Database Leak',
    description: 'A remote code execution vulnerability in an unpatched web server led to full database extraction. Exposed records include full names, phone numbers, physical addresses, and dates of birth from a healthcare patient management system.',
    breach_date: '2024-02-28',
    discovery_date: '2024-03-10',
    source_type: 'dark_web',
    severity: 'critical',
    cvss_score: 9.3,
    records_exposed: 8700000,
    attack_vector: 'rce',
    data_classes: ['Phone Numbers', 'Physical Addresses', 'Date of Birth', 'Email Addresses'],
    attributed_actors: ['PhantomSpider (high confidence)'],
    keywords: ['remote code execution', 'rce', 'healthcare', 'database dump', 'patient records']
  },
  {
    breach_id: 7,
    breach_name: 'OperationBlueFox',
    description: 'APT group conducted a multi-stage supply chain attack targeting defense contractors. Exfiltrated classified project codenames, employee credentials, and internal network architecture documents over a period of 8 months.',
    breach_date: '2023-06-01',
    discovery_date: '2024-02-15',
    source_type: 'public_disclosure',
    severity: 'critical',
    cvss_score: 9.9,
    records_exposed: 250000,
    attack_vector: 'zero_day',
    data_classes: ['Email Addresses', 'Passwords', 'API Keys'],
    attributed_actors: ['NullSec Collective (confirmed)'],
    keywords: ['apt supply chain', 'defense contractor', 'zero day', 'classified espionage']
  },
  {
    breach_id: 8,
    breach_name: 'RetailSweep Skimmer Attack',
    description: 'Web skimming malware injected into the checkout pages of multiple retail websites. Captured credit card numbers, CVVs, billing addresses, and customer emails in real-time for approximately 4 months.',
    breach_date: '2024-04-05',
    discovery_date: '2024-08-12',
    source_type: 'dark_web',
    severity: 'high',
    cvss_score: 8.1,
    records_exposed: 5600000,
    attack_vector: 'sqli',
    data_classes: ['Credit Card Numbers', 'Email Addresses', 'Physical Addresses'],
    attributed_actors: ['ShadowSyndicate (medium confidence)'],
    keywords: ['web skimmer', 'magecart', 'checkout page', 'credit card numbers', 'retail']
  }
];

export const initialCompromisedCredentials = [
  { cred_id: 1, breach_id: 1, domain_id: 1, email_hash: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2', credential_type: 'password', is_reused: true, plain_preview: 'j.smith@nexacorp.com', discovered_at: '2024-04-02T10:00:00Z' },
  { cred_id: 2, breach_id: 1, domain_id: 1, email_hash: 'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3', credential_type: 'password', is_reused: false, plain_preview: 'm.davis@nexacorp.com', discovered_at: '2024-04-02T10:05:00Z' },
  { cred_id: 3, breach_id: 1, domain_id: 3, email_hash: 'c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4', credential_type: 'password', is_reused: true, plain_preview: 'alicia.w@globalbank.co.uk', discovered_at: '2024-04-02T10:10:00Z' },
  { cred_id: 4, breach_id: 2, domain_id: 3, email_hash: 'd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5', credential_type: 'password', is_reused: false, plain_preview: 'robert.k@globalbank.co.uk', discovered_at: '2024-06-01T08:20:00Z' },
  { cred_id: 5, breach_id: 2, domain_id: 3, email_hash: 'c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4', credential_type: 'password', is_reused: true, plain_preview: 'alicia.w@globalbank.co.uk', discovered_at: '2024-06-01T08:22:00Z' },
  { cred_id: 6, breach_id: 3, domain_id: 10, email_hash: 'e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6', credential_type: 'api_key', is_reused: false, plain_preview: 'prod-api-key@cloudnine.ca', discovered_at: '2024-04-15T12:00:00Z' },
  { cred_id: 7, breach_id: 3, domain_id: 10, email_hash: 'f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1', credential_type: 'token', is_reused: false, plain_preview: 'oauth-token@cloudnine.ca', discovered_at: '2024-04-15T12:05:00Z' },
  { cred_id: 8, breach_id: 4, domain_id: 7, email_hash: 'a1a1a1a1b2b2b2b2c3c3c3c3d4d4d4d4e5e5e5e5f6f6f6f6a1a1a1a1b2b2b2b2', credential_type: 'password', is_reused: false, plain_preview: 'dean_office@educonnect.ac.in', discovered_at: '2024-07-18T16:40:00Z' },
  { cred_id: 9, breach_id: 4, domain_id: 7, email_hash: 'b1b1b1b1c2c2c2c2d3d3d3d3e4e4e4e4f5f5f5f5a6a6a6a6b1b1b1b1c2c2c2c2', credential_type: 'session', is_reused: false, plain_preview: 'portal_sess@educonnect.ac.in', discovered_at: '2024-07-18T16:45:00Z' },
  { cred_id: 10, breach_id: 5, domain_id: 6, email_hash: 'c1c1c1c1d2d2d2d2e3e3e3e3f4f4f4f4a5a5a5a5b6b6b6b6c1c1c1c1d2d2d2d2', credential_type: 'password', is_reused: false, plain_preview: 'vip_trader@cryptohaven.io', discovered_at: '2024-08-03T19:30:00Z' },
  { cred_id: 11, breach_id: 6, domain_id: 5, email_hash: 'd1d1d1d1e2e2e2e2f3f3f3f3a4a4a4a4b5b5b5b5c6c6c6c6d1d1d1d1e2e2e2e2', credential_type: 'password', is_reused: false, plain_preview: 'dr.watson@medvault.com', discovered_at: '2024-03-10T09:15:00Z' },
  { cred_id: 12, breach_id: 6, domain_id: 5, email_hash: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2', credential_type: 'password', is_reused: true, plain_preview: 'staff_med@medvault.com', discovered_at: '2024-03-10T09:18:00Z' },
  { cred_id: 13, breach_id: 7, domain_id: 8, email_hash: 'e1e1e1e1f2f2f2f2a3a3a3a3b4b4b4b4c5c5c5c5d6d6d6d6e1e1e1e1f2f2f2f2', credential_type: 'password', is_reused: false, plain_preview: 'lead_eng@sentineldef.com', discovered_at: '2024-02-15T11:50:00Z' },
  { cred_id: 14, breach_id: 7, domain_id: 8, email_hash: 'f1f1f1f1a2a2a2a2b3b3b3b3c4c4c4c4d5d5d5d5e6e6e6e6f1f1f1f1a2a2a2a2', credential_type: 'api_key', is_reused: false, plain_preview: 'scada_key@sentineldef.com', discovered_at: '2024-02-15T11:55:00Z' },
  { cred_id: 15, breach_id: 8, domain_id: 9, email_hash: 'a2a2a2a2b3b3b3b3c4c4c4c4d5d5d5d5e6e6e6e6f1f1f1f1a2a2a2a2b3b3b3b3', credential_type: 'password', is_reused: false, plain_preview: 'checkout_admin@shopstream.de', discovered_at: '2024-08-12T14:10:00Z' },
  { cred_id: 16, breach_id: 8, domain_id: 9, email_hash: 'b2b2b2b2c3c3c3c3d4d4d4d4e5e5e5e5f6f6f6f6a1a1a1a1b2b2b2b2c3c3c3c3', credential_type: 'password', is_reused: false, plain_preview: 'orders@shopstream.de', discovered_at: '2024-08-12T14:15:00Z' }
];

export const initialWatchlist = [
  { watch_id: 1, user_id: 1, org_id: 2, org_name: 'GlobalBank Financial', watch_type: 'domain', alert_enabled: true, created_at: '2024-01-20T10:00:00Z' },
  { watch_id: 2, user_id: 1, org_id: 4, org_name: 'CryptoHaven Exchange', watch_type: 'domain', alert_enabled: true, created_at: '2024-01-20T10:05:00Z' },
  { watch_id: 3, user_id: 2, org_id: 1, org_name: 'NexaCorp Technologies', watch_type: 'domain', alert_enabled: true, created_at: '2024-02-01T15:30:00Z' },
  { watch_id: 4, user_id: 2, org_id: 6, org_name: 'Sentinel Defense Corp', watch_type: 'actor', alert_enabled: true, created_at: '2024-02-10T12:00:00Z' },
  { watch_id: 5, user_id: 3, org_id: 3, org_name: 'MedVault Health Systems', watch_type: 'domain', alert_enabled: true, created_at: '2024-02-15T09:45:00Z' }
];

export const initialRemediationActions = [
  { action_id: 1, breach_id: 1, breach_name: 'ShadowVault Dump 2024', user_id: 1, action_type: 'password_reset', description: 'Force password reset for all NexaCorp accounts found in ShadowVault dump', status: 'completed', created_at: '2024-04-03T11:00:00Z', resolved_at: '2024-04-10T16:00:00Z' },
  { action_id: 2, breach_id: 1, breach_name: 'ShadowVault Dump 2024', user_id: 2, action_type: 'notify_affected', description: 'Email notification sent to 12.3M affected users and enterprise partners', status: 'completed', created_at: '2024-04-03T12:30:00Z', resolved_at: '2024-04-05T18:00:00Z' },
  { action_id: 3, breach_id: 3, breach_name: 'NexusCloud S3 Exposure', user_id: 1, action_type: 'key_rotation', description: 'Rotate all exposed API keys and OAuth tokens from NexusCloud S3 buckets', status: 'in_progress', created_at: '2024-04-16T09:00:00Z', resolved_at: null },
  { action_id: 4, breach_id: 5, breach_name: 'CryptoHaven Exchange Breach', user_id: 3, action_type: 'account_lock', description: 'Lock all CryptoHaven user accounts pending KYC re-verification', status: 'completed', created_at: '2024-08-03T20:00:00Z', resolved_at: '2024-08-05T14:30:00Z' },
  { action_id: 5, breach_id: 5, breach_name: 'CryptoHaven Exchange Breach', user_id: 1, action_type: 'blocklist', description: 'Blocklist known attacker wallet addresses across partner exchanges', status: 'in_progress', created_at: '2024-08-04T10:15:00Z', resolved_at: null },
  { action_id: 6, breach_id: 7, breach_name: 'OperationBlueFox', user_id: 2, action_type: 'patch', description: 'Apply emergency patch for zero-day vulnerability in supply chain component', status: 'completed', created_at: '2024-02-16T08:00:00Z', resolved_at: '2024-02-20T17:00:00Z' }
];

export const initialAuditLogs = [
  { log_id: 1, user_id: 1, action: 'INGEST_BREACH', target_table: 'breaches', target_id: 1, details: 'Ingested breach: ShadowVault Dump 2024 (CVSS: 9.1, Records: 12.3M)', performed_at: '2024-04-02T10:00:00Z' },
  { log_id: 2, user_id: 1, action: 'WATCHLIST_ALERT', target_table: 'compromised_credentials', target_id: 3, details: 'Watched organization GlobalBank Financial credential leaked in breach_id: 1', performed_at: '2024-04-02T10:10:00Z' },
  { log_id: 3, user_id: 2, action: 'CREDENTIAL_REUSE_DETECTED', target_table: 'compromised_credentials', target_id: 5, details: 'Email hash c3d4e5f6... reused across breaches 1 and 2', performed_at: '2024-06-01T08:22:00Z' },
  { log_id: 4, user_id: 1, action: 'INGEST_BREACH', target_table: 'breaches', target_id: 3, details: 'Ingested breach: NexusCloud S3 Exposure (CVSS: 9.8)', performed_at: '2024-04-15T12:00:00Z' },
  { log_id: 5, user_id: 3, action: 'ACTOR_LAST_SEEN_UPDATED', target_table: 'threat_actors', target_id: 5, details: 'Updated CryptoWraith last_seen date to 2024-08-01 based on breach CryptoHaven', performed_at: '2024-08-03T19:30:00Z' },
  { log_id: 6, user_id: 2, action: 'CREDENTIAL_REUSE_DETECTED', target_table: 'compromised_credentials', target_id: 12, details: 'Email hash a1b2c3d4... reused across breaches 1 and 6', performed_at: '2024-03-10T09:18:00Z' }
];

