# BreachVault — A Dark Web Data Breach & Leaked Credential Intelligence System

**Course:** UE23CS351A / UE24CS351A — DBMS Project  
**Program:** Bachelor of Technology in Computer Science & Engineering  
**Department:** Department of Computer Science and Engineering, Faculty of Engineering  
**Institution:** PES University, Electronic City Campus, Bengaluru – 560 100  
**Academic Period:** AUG – DEC 2026  
**Faculty Guide:** Prof. Deena Hajim  

---

## 1. Title & Team Details

### Project Title
**BreachVault — A Dark Web Data Breach & Leaked Credential Intelligence System**

### Team Formation & Individual Database/Backend Contributions

| Student Name | SRN | Primary Responsibility | Contribution to Database Architecture | Backend Engineering & Procedures |
| :--- | :--- | :--- | :--- | :--- |
| **A S Vincent** | **PES2UG24CS002** | Lead Transactional Database Architect & Vector DB Engineer | Core 3NF ER modeling, schema design (`breaches`, `threat_actors`, `audit_logs`), `pgvector` 384-dim embedding storage, IVFFlat index tuning (`vector_cosine_ops`), audit trigger `trg_audit_breach_insert` | Stored procedure `sp_ingest_breach` (atomic transaction handling & rollback recovery), vector cosine distance querying (`<=>`), database connection pooling, and backend ingestion Route Handlers |
| **Akshat Kumar** | **PES2UG24CS046** | Lead Analytical Database Architect & Stored Functions Engineer | Enterprise entity design (`organizations`, `domains`, `compromised_credentials`, `remediation`), analytical views (`v_high_risk_organizations`, `v_threat_actor_profiles`, `v_breach_timeline`), B-Tree composite indexing & query optimization | Stored functions `fn_check_credential_exposure` (SHA-256 hash lookup) & `fn_calculate_org_risk_score` (multi-factor mathematical model), real-time alert trigger `trg_watchlist_alert`, cryptographic verification pipelines |

---

## 2. Abstract

In modern enterprise cybersecurity, the uncontrolled exfiltration of sensitive databases and corporate credentials onto underground forums and dark web marketplaces represents a critical threat. Traditional security operations centers (SOCs) typically ingest breach dumps in isolation without correlating them against corporate domain inventories, employee accounts, or known threat actor profiles. This makes it difficult to detect repeat organizational targeting, gauge true exposure risk, identify dangerous cross-breach password reuse, and apply containment actions that proved successful in previous incidents.

**BreachVault** addresses these challenges by delivering an end-to-end, dual-paradigm threat intelligence and credential management platform. The system combines:
1. **A Relational Database (PostgreSQL / MySQL)** enforcing 3NF normalization across 13 core entities with strict referential integrity, foreign key cascades, and ACID compliance for structured transactional records (breaches, compromised credentials, organizations, domains, watchlist alerts, and immutable audit logs).
2. **A Vector Database Component (PostgreSQL + pgvector)** storing 384-dimensional dense semantic embeddings generated via `sentence-transformers/all-MiniLM-L6-v2` with IVFFlat approximate nearest neighbor (ANN) cosine distance indexing (`<=>`). This enables semantic free-text search and automated discovery of historically similar attack patterns across unstructured incident narratives.

BreachVault goes substantially beyond standard CRUD operations through transactional stored procedures (`sp_ingest_breach`, `fn_check_credential_exposure`, `fn_calculate_org_risk_score`), automated integrity triggers (`trg_detect_credential_reuse`, `trg_watchlist_alert`), analytical views, and an interactive **Next.js 15 (App Router)** portal with role-based access control (Admin vs. Analyst), client-side SHA-256 calculation, and incident remediation tracking.

---

## 3. Tech Stack Architecture

| Layer | Technologies Selected | Justification & Role in BreachVault |
| :--- | :--- | :--- |
| **Frontend UI** | **Next.js 15 (App Router)**, React 19, Tailwind CSS, Lucide React | Modern dark-themed SOC operations portal, real-time client-side SHA-256 calculation, responsive tables, filterable views, and dynamic risk badges. |
| **Backend & API** | **Next.js Route Handlers** (Node.js runtime) | Serverless RESTful endpoints (`/api/breaches`, `/api/credentials`, `/api/semantic`, `/api/organizations`, `/api/remediation`, `/api/audit`). |
| **Relational Database** | **PostgreSQL / MySQL 9.7** (Mandatory SQL) | 13 normalized tables in 3NF, multi-column indexes, foreign key cascading, stored procedures, triggers, views, and ACID audit logging. |
| **Vector Database** | **PostgreSQL + pgvector** (Option 2 Paradigm) | Dense 384-dimensional vector embeddings, IVFFlat index (`vector_cosine_ops`), cosine distance operator `<=>` for semantic incident matching. |
| **DevOps & Tooling** | Git, GitHub, Dotenv, Python (python-docx, Pillow, PyMuPDF) | Version control, environment variable isolation, automated report compilation, and test execution. |

---

## 4. Entity-Relationship (ER) Design & Relational Schema

### 4.1 ER Diagram
The system models 13 entities categorized into Independent Entities, Dependent Entities, and Junction Tables:
- `users`: Analysts and administrators.
- `threat_actors`: Cyber syndicates with threat ratings.
- `threat_actor_aliases`: Known underground handles and forums.
- `data_classes`: PII types (Emails, Passwords, SSNs, API Keys, etc.).
- `breaches`: Incident records with severity, CVSS scores, attack vectors, and embeddings.
- `breach_data_classes`: M:N link between breaches and compromised data types.
- `breach_threat_actors`: M:N attribution link with confidence ratings.
- `organizations`: Targeted institutions and enterprises.
- `domains`: Corporate domains mapped to organizations.
- `compromised_credentials`: Exposed email hashes and credential types.
- `watchlist`: Monitored entities mapped to analysts.
- `remediation_actions`: Incident containment protocols and resolution states.
- `audit_logs`: Immutable security audit trail.

---

## 5. SQL Database Commands (DDL, DML & Advanced Queries)

Complete SQL scripts are provided in the `sql/` directory:
- `sql/schema.sql` (13 normalized 3NF tables with foreign keys and check constraints)
- `sql/seed_data.sql` (Initial seed data for all entities)
- `sql/stored_procedures.sql` (`sp_ingest_breach`, `fn_check_credential_exposure`, `fn_calculate_org_risk_score`)
- `sql/triggers.sql` (`trg_detect_credential_reuse`, `trg_watchlist_alert`, `trg_update_actor_last_seen`)
- `sql/views.sql` (`vw_breach_dashboard`, `vw_org_exposure_report`, `vw_credential_reuse_stats`, `vw_threat_actor_profile`, `vw_monthly_breach_trends`)
- `sql/queries.sql` (Complex multi-table queries, window functions, and CTEs)
- `sql/breachvault_complete.sql` (Single-file master execution script)

---

## 6. NoSQL / Vector Database Commands (pgvector)

```sql
-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add dense vector column
ALTER TABLE breaches ADD COLUMN description_embedding vector(384);

-- 3. Create Approximate Nearest Neighbor index
CREATE INDEX idx_breach_embedding ON breaches
USING ivfflat (description_embedding vector_cosine_ops)
WITH (lists = 10);

-- 4. Cosine similarity query
SELECT
    b.breach_id,
    b.breach_name,
    b.severity,
    ROUND((1 - (b.description_embedding <=> target.emb))::NUMERIC, 4) AS similarity_score
FROM breaches b,
     (SELECT description_embedding AS emb FROM breaches WHERE breach_id = 1) AS target
WHERE b.breach_id != 1 AND b.description_embedding IS NOT NULL
ORDER BY b.description_embedding <=> target.emb ASC
LIMIT 5;
```

---

## 7. Next.js Project Tree Structure

```
breachvault/
├── package.json                   # Dependencies (Next 15, React 19, Lucide, MySQL2, PG)
├── next.config.js                 # Next.js configuration
├── jsconfig.json                  # Path aliases (@/* -> ./src/*)
├── .env.example                   # Environment configuration template
├── .env.local                     # Local database connection credentials
├── sql/                           # Full database scripts
└── src/
    ├── app/
    │   ├── layout.jsx             # Cyber SOC Root Layout with Header & Footer
    │   ├── globals.css            # Dark mode cyber SOC theme & responsive UI
    │   ├── page.jsx               # Command Center Dashboard (Live metrics & feeds)
    │   ├── breaches/page.jsx      # Breach Explorer & Ingestion Modal (sp_ingest_breach)
    │   ├── credentials/page.jsx   # Credential Exposure Lookup (fn_check_credential_exposure)
    │   ├── semantic-search/page.jsx # pgvector Vector Similarity Search (<=> operator)
    │   ├── threat-actors/page.jsx # Threat Actor Dossiers, Aliases & TTPs
    │   ├── organizations/page.jsx # Enterprise Exposure, Risk Scores & Watchlist
    │   ├── remediation/page.jsx   # Incident Containment & Action Tracking
    │   ├── audit-logs/page.jsx    # Security Audit Trail (audit_logs stream)
    │   └── api/                   # RESTful API route handlers
    ├── components/
    │   └── Navbar.jsx             # Navigation bar with Role Switcher (Admin / Analyst)
    └── lib/
        ├── db.js                  # Multi-dialect database connector & fallback
        ├── vector.js              # 384-dimensional cosine similarity engine
        └── seedData.js            # Initialized database entities and vectors
```

---

## 8. Sample Screenshots of Application Code and Demo

All image assets have been extracted and embedded directly inside the compiled Word document:
- **`DBMS_Project_Report_BreachVault_002_046.docx`** (Official submission document)
- **`DBMS MINI PROJECT REPORT SAMPLE.docx`** (Template updated with full contents)
- Image directory: `extracted_images/` containing live UI screenshots (`dash.png`, `breaches.png`, `credentials.png`, `vector_search.png`, `threat_actors.png`, `audit_trail.png`), ER diagram (`page_5_img_1.png`), and code highlights (`code_vector_js.png`, `code_api_breaches.png`, `code_stored_proc.png`).

