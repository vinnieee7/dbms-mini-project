# BreachVault — Dark Web Data Breach & Leaked Credential Intelligence System

> **PES University — Department of Computer Science and Engineering**  
> **Course:** UE24CS351A / UE23CS351A — Database Management Systems (Experiential Learning Level 3)  
> **Team:**  
> - **A S Vincent** (`PES2UG24CS002`)  
> - **Akshat Kumar** (`PES2UG24CS046`)  
> **Faculty Guide:** Prof. Deena Hajim  

---

## 🛡️ Project Overview

**BreachVault** is a full-stack dark web intelligence and credential exposure tracking system designed to ingest, correlate, and monitor cybersecurity incidents from underground marketplaces, paste sites, and public data leaks.

The system combines:
1. **Relational Database Management (PostgreSQL & MySQL)**: Enforcing strict referential integrity across breaches, credential dumps, threat actor dossiers, enterprise domains, and audit trails.
2. **AI & Cognitive Similarity Search (`pgvector`)**: 384-dimensional dense vector embeddings generated via `sentence-transformers/all-MiniLM-L6-v2` with IVFFlat indexing and cosine distance (`<=>`) operators to find nearest-neighbor incident attack vectors and recommend automated containment playbooks.
3. **Advanced Database Features**:
   - **Stored Procedures**: `sp_ingest_breach` (atomic breach ingestion and vector staging).
   - **Stored Functions**: `fn_check_credential_exposure` (SHA-256 hash lookup) and `fn_calculate_org_risk_score` (multi-factor mathematical risk model).
   - **Triggers**: `trg_audit_breach_insert` and `trg_watchlist_alert` (automated real-time alerts).
   - **Views**: `v_high_risk_organizations`, `v_threat_actor_profiles`, and `v_breach_timeline`.
4. **Modern UI System**: Built with **Next.js 15 (App Router)**, **React 19**, and animated UI components from **React Bits** (`SpotlightCard`, `ShinyText`, `CountUp`).

---

## 🏗️ Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | Next.js 15.1.0, React 19, Lucide React | Clean dark SOC UI, responsive design |
| **Component FX** | React Bits Components | `SpotlightCard` cursor spotlight, `ShinyText` gradient sweep, `CountUp` animators |
| **Relational DB** | PostgreSQL 16+ / MySQL 9.7+ | Relational schema, foreign keys, cascade rules, views |
| **Vector DB** | `pgvector` (0.7+) | 384-dim dense embeddings, IVFFlat index, cosine distance (`<=>`) |
| **Runtime & APIs** | Node.js v24+, Next.js Route Handlers | REST endpoints for breaches, credentials, semantic search, orgs, actors, audit |
| **Security** | SHA-256 Hashing, Web Crypto API | Privacy-preserving email lookups without storing plaintext credentials |

---

## 📁 Repository Structure

```text
├── breachvault/                  # Next.js Full-Stack Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/              # REST Route Handlers
│   │   │   │   ├── audit/        # Security audit log queries
│   │   │   │   ├── breaches/     # Ingestion & listing API
│   │   │   │   ├── credentials/  # SHA-256 lookup API
│   │   │   │   ├── organizations/# Monitored orgs & watchlist toggle API
│   │   │   │   ├── remediation/  # Incident containment status API
│   │   │   │   ├── semantic/     # pgvector cosine similarity API
│   │   │   │   ├── stats/        # Global SOC KPI metric aggregator
│   │   │   │   └── threat-actors/# Threat intelligence dossiers API
│   │   │   ├── audit-logs/       # Database audit log trail UI
│   │   │   ├── breaches/         # Breach explorer & ingestion modal UI
│   │   │   ├── credentials/      # Exposure lookup & hash copier UI
│   │   │   ├── organizations/    # Monitored domain inventory UI
│   │   │   ├── remediation/      # Incident containment tracker UI
│   │   │   ├── semantic-search/  # pgvector similarity search UI
│   │   │   ├── threat-actors/    # Threat actor dossiers UI
│   │   │   ├── globals.css       # Clean dark theme CSS system
│   │   │   ├── layout.jsx        # Root application layout
│   │   │   └── page.jsx          # SOC Command Center Dashboard
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Pill navigation & RBAC switcher
│   │   │   └── reactbits/        # React Bits component library
│   │   │       ├── CountUp.jsx
│   │   │       ├── ShinyText.jsx
│   │   │       └── SpotlightCard.jsx
│   │   └── lib/
│   │       ├── db.js             # Dual-engine controller (SQL + fallback)
│   │       ├── seedData.js       # Verified seed dataset
│   │       └── vector.js         # 384-dim cosine similarity engine
│   ├── package.json
│   └── next.config.js
├── sql/                          # Comprehensive SQL Scripts
│   ├── breachvault_complete.sql  # Master schema, procedures, triggers, views, seeds
│   ├── schema.sql                # Table definitions & constraints
│   ├── stored_procedures.sql     # PL/pgSQL & MySQL procedures/functions
│   ├── triggers.sql              # Audit & alert triggers
│   ├── views.sql                 # Analytical aggregation views
│   ├── queries.sql               # Complex joins, groupings, and vector operators
│   └── seed_data.sql             # Realistic dark web intelligence seed records
├── dbms_demo_today/              # Demo Guides & Headless PDFs
│   ├── BreachVault_DBMS_Demo_Complete_Guide.pdf
│   ├── DBMS_Demo_Today.pdf
│   └── demo_manual.html
├── extracted_images/             # UI Screenshots & Code Highlights
├── DBMS_Project_Report_BreachVault_002_046.docx # Complete Academic Word Report
├── build_demo_pdf.py             # Headless PDF generation script
├── generate_report.py            # Python Word report builder
└── README.md
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js** v18+ (tested on Node.js v24)
- **PostgreSQL** with `pgvector` extension enabled (or MySQL 8.0+)
- **Python** 3.10+ (optional, for PDF and Word report generation)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/vinnieee7/dbms-mini-project.git
cd dbms-mini-project

# Navigate to the Next.js app directory
cd breachvault

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env.local` file inside the `breachvault/` folder:
```env
# PostgreSQL Configuration (pgvector)
DATABASE_URL=postgresql://postgres:password@localhost:5432/breachvault

# Or MySQL Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=breachvault
```
*(Note: If no live database is connected, BreachVault automatically switches to its built-in in-memory fallback engine with all 8 breaches, 16 credentials, and vector similarity calculations).*

### 4. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 5. Production Build
```bash
npm run build
npm run start
```

---

## 🗄️ Database Commands & Capabilities

### Relational Schema Setup
```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE breaches (
    breach_id SERIAL PRIMARY KEY,
    breach_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    breach_date DATE NOT NULL,
    discovery_date DATE DEFAULT CURRENT_DATE,
    source_type VARCHAR(50) CHECK (source_type IN ('dark_web', 'paste_site', 'public_disclosure', 'insider')),
    severity VARCHAR(20) CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    cvss_score NUMERIC(3,1) CHECK (cvss_score BETWEEN 0.0 AND 10.0),
    records_exposed BIGINT CHECK (records_exposed >= 0),
    attack_vector VARCHAR(100),
    embedding vector(384)
);
```

### pgvector Semantic Similarity Query
```sql
-- Retrieve top 3 nearest breach attack vectors using cosine distance (<=>)
SELECT 
    breach_id, 
    breach_name, 
    severity, 
    cvss_score,
    ROUND((1 - (embedding <=> '[0.012, -0.045, ...]'::vector)) * 100, 2) AS similarity_score
FROM breaches
ORDER BY embedding <=> '[0.012, -0.045, ...]'::vector ASC
LIMIT 3;
```

### Stored Procedure Execution
```sql
CALL sp_ingest_breach(
    'HydraMarket 2024 Database Exfiltration',
    'Massive SQL injection dump on dark web forum.',
    '2024-05-10',
    'dark_web',
    'critical',
    9.4,
    15000000,
    'sqli'
);
```

### Stored Function Execution
```sql
-- SHA-256 credential lookup
SELECT * FROM fn_check_credential_exposure('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');

-- Multi-factor organization risk scoring
SELECT fn_calculate_org_risk_score(1) AS calculated_score;
```

---

## 👥 Authors & Database Work Division

| Student Name & SRN | Database Core Area | Primary Database & Backend Engineering Deliverables |
|---|---|---|
| **A S Vincent** (`PES2UG24CS002`) | **Lead Transactional DB & Vector Architecture** | • Core 3NF ER Schema (`breaches`, `threat_actors`, `audit_logs`)<br>• Stored Procedure `sp_ingest_breach` (Atomic transaction rollback handling)<br>• `pgvector` 384-dim semantic similarity search & IVFFlat index (`<=>`)<br>• Security audit trigger `trg_audit_breach_insert`<br>• Server-side database connection pooling & REST APIs |
| **Akshat Kumar** (`PES2UG24CS046`) | **Lead Analytical DB & Stored Functions** | • Enterprise & Credential Schemas (`organizations`, `domains`, `credentials`)<br>• Stored Function `fn_check_credential_exposure` (SHA-256 hash lookup)<br>• Stored Function `fn_calculate_org_risk_score` (Multi-factor risk model)<br>• Analytical Views (`v_high_risk_organizations`, `v_threat_actor_profiles`)<br>• Real-time alert triggers (`trg_watchlist_alert`) & B-Tree index optimization |

- **Faculty Guide:** Prof. Deena Hajim

