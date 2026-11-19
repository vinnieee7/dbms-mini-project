import os
import base64
import subprocess

def get_b64(path):
    if os.path.exists(path):
        with open(path, 'rb') as f:
            return base64.b64encode(f.read()).decode()
    return ""

def generate_pdf():
    img_dir = os.path.abspath("extracted_images")
    output_dir = os.path.abspath("dbms_demo_today")
    os.makedirs(output_dir, exist_ok=True)
    
    # Load all base64 images
    img_er = get_b64(os.path.join(img_dir, "page_5_img_1.png"))
    img_dash = get_b64(os.path.join(img_dir, "dash.png"))
    img_breaches = get_b64(os.path.join(img_dir, "breaches.png"))
    img_creds = get_b64(os.path.join(img_dir, "credentials.png"))
    img_vector = get_b64(os.path.join(img_dir, "vector_search.png"))
    img_actors = get_b64(os.path.join(img_dir, "threat_actors.png"))
    img_orgs = get_b64(os.path.join(img_dir, "organizations.png"))
    img_audit = get_b64(os.path.join(img_dir, "audit_trail.png"))
    img_code_vec = get_b64(os.path.join(img_dir, "code_vector_js.png"))
    img_code_api = get_b64(os.path.join(img_dir, "code_api_breaches.png"))
    img_code_proc = get_b64(os.path.join(img_dir, "code_stored_proc.png"))
    img_ddl_1 = get_b64(os.path.join(img_dir, "page_9_img_1.png"))
    img_ddl_2 = get_b64(os.path.join(img_dir, "page_10_img_1.png"))
    img_ddl_3 = get_b64(os.path.join(img_dir, "page_11_img_1.png"))
    img_ddl_4 = get_b64(os.path.join(img_dir, "page_12_img_1.png"))
    img_ddl_5 = get_b64(os.path.join(img_dir, "page_13_img_1.png"))
    img_ddl_6 = get_b64(os.path.join(img_dir, "page_14_img_1.png"))
    img_tables = get_b64(os.path.join(img_dir, "page_15_img_2.png"))

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>BreachVault - DBMS Demo & Defense Manual</title>
<style>
    @page {{
        size: A4 portrait;
        margin: 12mm 14mm 14mm 14mm;
        @bottom-right {{
            content: counter(page);
        }}
    }}
    * {{
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }}
    body {{
        font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
        color: #1e293b;
        background: #ffffff;
        font-size: 10pt;
        line-height: 1.45;
    }}
    .page-break {{
        page-break-after: always;
        break-after: page;
    }}
    .no-break {{
        break-inside: avoid;
        page-break-inside: avoid;
    }}

    /* Cover Page */
    .cover {{
        height: 100%;
        min-height: 250mm;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 20mm 10mm 10mm 10mm;
        background: linear-gradient(145deg, #090d16 0%, #0f172a 60%, #1e293b 100%);
        color: #ffffff;
        border-radius: 8px;
    }}
    .cover-badge {{
        display: inline-block;
        background: rgba(56, 189, 248, 0.15);
        border: 1px solid rgba(56, 189, 248, 0.5);
        color: #38bdf8;
        padding: 4px 12px;
        border-radius: 9999px;
        font-size: 9pt;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        margin-bottom: 12px;
    }}
    .cover h1 {{
        font-size: 28pt;
        font-weight: 800;
        line-height: 1.15;
        letter-spacing: -0.02em;
        margin-bottom: 8px;
    }}
    .cover h1 span {{
        color: #38bdf8;
    }}
    .cover-subtitle {{
        font-size: 13pt;
        color: #cbd5e1;
        font-weight: 400;
        margin-bottom: 20px;
        line-height: 1.4;
    }}
    .cover-grid {{
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 16px;
        border-radius: 6px;
        margin: 20px 0;
    }}
    .cover-item h4 {{
        font-size: 8pt;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 4px;
    }}
    .cover-item p {{
        font-size: 10pt;
        font-weight: 600;
        color: #f8fafc;
    }}
    .cover-footer {{
        border-top: 1px solid rgba(255, 255, 255, 0.15);
        padding-top: 15px;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        font-size: 8.5pt;
        color: #94a3b8;
    }}

    /* Typography & Headers */
    h2.section-title {{
        font-size: 15pt;
        font-weight: 800;
        color: #0f172a;
        border-bottom: 2.5px solid #0284c7;
        padding-bottom: 4px;
        margin-top: 18px;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 8px;
    }}
    h3.sub-title {{
        font-size: 11.5pt;
        font-weight: 700;
        color: #1e40af;
        margin-top: 12px;
        margin-bottom: 6px;
    }}
    p {{
        margin-bottom: 8px;
        text-align: justify;
    }}

    /* Callout & Cards */
    .callout {{
        background: #f0fdf4;
        border-left: 4px solid #16a34a;
        padding: 10px 14px;
        border-radius: 0 6px 6px 0;
        margin: 10px 0;
        font-size: 9.5pt;
    }}
    .callout-title {{
        font-weight: 700;
        color: #15803d;
        margin-bottom: 3px;
        font-size: 9.5pt;
    }}
    .callout-blue {{
        background: #f0f9ff;
        border-left: 4px solid #0284c7;
    }}
    .callout-blue .callout-title {{
        color: #0369a1;
    }}
    .callout-amber {{
        background: #fffbeb;
        border-left: 4px solid #f59e0b;
    }}
    .callout-amber .callout-title {{
        color: #b45309;
    }}

    /* Badges */
    .badge {{
        display: inline-block;
        padding: 2px 7px;
        border-radius: 4px;
        font-size: 7.5pt;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
    }}
    .badge-critical {{ background: #ffe4e6; color: #e11d48; border: 1px solid #fecdd3; }}
    .badge-high {{ background: #fef3c7; color: #d97706; border: 1px solid #fde68a; }}
    .badge-medium {{ background: #e0f2fe; color: #0284c7; border: 1px solid #bae6fd; }}
    .badge-low {{ background: #dcfce7; color: #16a34a; border: 1px solid #bbf7d0; }}

    /* Tables */
    table {{
        width: 100%;
        border-collapse: collapse;
        margin: 10px 0 14px 0;
        font-size: 8.5pt;
    }}
    th {{
        background: #0f172a;
        color: #ffffff;
        font-weight: 700;
        text-align: left;
        padding: 6px 9px;
        border: 1px solid #0f172a;
        text-transform: uppercase;
        font-size: 7.5pt;
        letter-spacing: 0.04em;
    }}
    td {{
        padding: 5px 8px;
        border: 1px solid #cbd5e1;
        vertical-align: top;
    }}
    tr:nth-child(even) td {{
        background: #f8fafc;
    }}

    /* Code Blocks */
    pre, code {{
        font-family: 'Consolas', 'Courier New', monospace;
    }}
    .code-box {{
        background: #090d16;
        color: #e2e8f0;
        padding: 8px 12px;
        border-radius: 5px;
        font-size: 8pt;
        line-height: 1.35;
        overflow-x: hidden;
        white-space: pre-wrap;
        margin: 8px 0 12px 0;
        border: 1px solid #1e293b;
    }}

    /* Figures */
    .figure {{
        margin: 10px 0 14px 0;
        text-align: center;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        padding: 8px;
        border-radius: 6px;
    }}
    .figure img {{
        max-width: 100%;
        height: auto;
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }}
    .caption {{
        font-size: 8pt;
        color: #475569;
        font-style: italic;
        margin-top: 5px;
        text-align: center;
    }}

    /* Demo Script Steps */
    .demo-step {{
        display: flex;
        gap: 12px;
        margin-bottom: 12px;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 10px 14px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.04);
    }}
    .step-num {{
        width: 28px;
        height: 28px;
        border-radius: 9999px;
        background: #0284c7;
        color: #ffffff;
        font-weight: 800;
        font-size: 9pt;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }}
    .step-content h4 {{
        font-size: 9.5pt;
        font-weight: 700;
        color: #0f172a;
        margin-bottom: 3px;
    }}
    .step-content p {{
        font-size: 8.5pt;
        color: #334155;
        margin-bottom: 3px;
    }}
    .step-say {{
        background: #f0f9ff;
        border-left: 3px solid #0284c7;
        padding: 4px 8px;
        font-size: 8pt;
        color: #0369a1;
        font-style: italic;
        border-radius: 0 4px 4px 0;
        margin-top: 4px;
    }}

    /* Q&A Items */
    .qa-card {{
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 9px 12px;
        margin-bottom: 8px;
        background: #ffffff;
    }}
    .qa-q {{
        font-weight: 700;
        color: #0f172a;
        font-size: 9pt;
        display: flex;
        align-items: flex-start;
        gap: 6px;
        margin-bottom: 4px;
    }}
    .qa-q-badge {{
        background: #0284c7;
        color: #ffffff;
        padding: 1px 5px;
        border-radius: 3px;
        font-size: 7.5pt;
        font-weight: 800;
    }}
    .qa-a {{
        font-size: 8.5pt;
        color: #334155;
        line-height: 1.4;
    }}
</style>
</head>
<body>

<!-- ========================================================= -->
<!-- COVER PAGE                                                -->
<!-- ========================================================= -->
<div class="cover">
    <div>
        <div class="cover-badge">PES UNIVERSITY &bull; LEVEL 3 DBMS EXPERIENTIAL LEARNING</div>
        <h1>BREACH<span>VAULT</span></h1>
        <div class="cover-subtitle">
            A Dark Web Data Breach & Leaked Credential Intelligence System<br>
            <strong>Dual-Paradigm Architecture:</strong> Relational SQL (3NF) + pgvector Semantic Search
        </div>

        <div class="cover-grid">
            <div class="cover-item">
                <h4>Course & Evaluation</h4>
                <p>UE23CS351A / UE24CS351A &bull; DBMS Project</p>
                <p style="font-size: 8.5pt; color: #94a3b8; font-weight: normal; margin-top: 2px;">Semester 5 &bull; Academic Year 2026</p>
            </div>
            <div class="cover-item">
                <h4>Faculty Guide</h4>
                <p>Prof. Deena Hajim</p>
                <p style="font-size: 8.5pt; color: #94a3b8; font-weight: normal; margin-top: 2px;">Assistant Professor &bull; Dept. of CSE, PES University</p>
            </div>
            <div class="cover-item">
                <h4>Team Member 1 (Lead Transactional DB & Vector Architecture)</h4>
                <p>A S Vincent &bull; PES2UG24CS002</p>
                <p style="font-size: 8pt; color: #38bdf8; font-weight: normal; margin-top: 2px;">Core 3NF Schema, Stored Procedure sp_ingest_breach, pgvector 384-dim Engine, Audit Triggers</p>
            </div>
            <div class="cover-item">
                <h4>Team Member 2 (Lead Analytical DB & Stored Functions)</h4>
                <p>Akshat Kumar &bull; PES2UG24CS046</p>
                <p style="font-size: 8pt; color: #34d399; font-weight: normal; margin-top: 2px;">Stored Functions fn_check_credential_exposure & fn_calculate_org_risk_score, Analytical Views, Alert Triggers</p>
            </div>
        </div>

        <div style="background: rgba(2, 132, 199, 0.12); border: 1px solid rgba(56, 189, 248, 0.3); padding: 12px; border-radius: 6px; margin-top: 15px;">
            <div style="color: #38bdf8; font-weight: 700; font-size: 8.5pt; text-transform: uppercase; margin-bottom: 4px;">Demo Day Purpose</div>
            <div style="font-size: 8.5pt; color: #e2e8f0; line-height: 1.45;">
                This document serves as the complete presentation brief, technical architecture guide, database command reference, and viva defense manual for the live project demonstration.
            </div>
        </div>
    </div>

    <div class="cover-footer">
        <div>
            <strong>DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING</strong><br>
            PES University &bull; Electronic City Campus, Bengaluru – 560 100
        </div>
        <div style="text-align: right;">
            Demo Date: <strong>Today (November 2026)</strong><br>
            Live Server: <code>http://localhost:3000</code>
        </div>
    </div>
</div>

<div class="page-break"></div>

<!-- ========================================================= -->
<!-- 1. EXECUTIVE OVERVIEW & PITCH                             -->
<!-- ========================================================= -->
<h2 class="section-title">1. Executive Overview & Demo Pitch</h2>

<p>
<strong>The Real-World Problem:</strong> Cybercriminals continuously dump stolen enterprise databases, user authentication credentials, API keys, and PII on dark web marketplaces (e.g., BreachForums) and paste sites. Security teams typically receive isolated threat dumps with no automated correlation against their organization's registered domains, employee accounts, or historical incident patterns. Consequently, security analysts cannot spot repeated targeting, measure cumulative risk, or identify password reuse across disparate attacks.
</p>

<p>
<strong>What BreachVault Does:</strong> BreachVault is a production-grade Threat Intelligence Operations Center that transforms unstructured leak dumps into actionable intelligence. It ingests breaches, maps affected domains to corporations, computes automated risk ratings, flags cross-breach credential reuse, and dispatches automated watchlist alerts to security analysts.
</p>

<div class="callout callout-blue no-break">
    <div class="callout-title">The "Beyond CRUD" Level 3 Justification (Crucial for Evaluation)</div>
    BreachVault is fundamentally not a simple Create-Read-Update-Delete application. Its core capabilities are driven by database intelligence:
    <ul style="margin: 4px 0 0 16px; font-size: 8.5pt; line-height: 1.4;">
        <li><strong>Vector Semantic Incident Matching:</strong> Converts natural-language incident narratives into 384-dimensional dense vectors using <code>all-MiniLM-L6-v2</code> and searches past breaches with <code>pgvector</code> cosine distance (<code>&lt;=&gt;</code>) to recommend containment playbooks.</li>
        <li><strong>Cross-Breach Credential Reuse Detection:</strong> Automatically executed by trigger <code>trg_detect_credential_reuse</code> whenever a new hash is ingested.</li>
        <li><strong>Automated Risk Scoring:</strong> Dynamic stored function <code>fn_calculate_org_risk_score</code> evaluating weighted severity, breach frequency, and credential reuse rate.</li>
        <li><strong>Proactive Watchlist Triggers:</strong> Automatically creates high-priority alerts for analysts monitoring victim corporations via <code>trg_watchlist_alert</code>.</li>
    </ul>
</div>

<h3 class="sub-title">Student Roles & Individual Contributions (As Stated in Lab 4 PDF)</h3>
<table>
    <thead>
        <tr>
            <th>Student Name & SRN</th>
            <th>Primary Architecture Role</th>
            <th>Database Schema & Vector Contributions</th>
            <th>Procedures, Functions, Triggers & APIs</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>A S Vincent</strong><br><span style="font-family: monospace; font-size: 8pt; color: #0284c7;">PES2UG24CS002</span></td>
            <td>Lead Transactional DB & Vector Architecture</td>
            <td>ER modeling, 3NF schema decomposition (<code>breaches</code>, <code>threat_actors</code>, <code>audit_logs</code>), pgvector 384-dim dense embedding storage, IVFFlat index tuning (<code>vector_cosine_ops</code>), security audit trigger (<code>trg_audit_breach_insert</code>).</td>
            <td>Transactional stored procedure <code>sp_ingest_breach</code> (atomic execution, commit/rollback exception handling), vector cosine distance querying (<code>&lt;=&gt;</code>), connection pooling, and backend ingestion REST APIs.</td>
        </tr>
        <tr>
            <td><strong>Akshat Kumar</strong><br><span style="font-family: monospace; font-size: 8pt; color: #16a34a;">PES2UG24CS046</span></td>
            <td>Lead Analytical DB & Stored Functions</td>
            <td>Enterprise analytical schemas (<code>organizations</code>, <code>domains</code>, <code>compromised_credentials</code>, <code>remediation</code>), multi-table analytical views (<code>v_high_risk_organizations</code>, <code>v_threat_actor_profiles</code>, <code>v_breach_timeline</code>), B-Tree composite indexing.</td>
            <td>Stored functions <code>fn_check_credential_exposure</code> (SHA-256 hash lookup) and <code>fn_calculate_org_risk_score</code> (multi-factor mathematical model), real-time alert trigger <code>trg_watchlist_alert</code>, and query optimization pipelines.</td>
        </tr>
    </tbody>
</table>

<!-- ========================================================= -->
<!-- 2. TECH STACK ARCHITECTURE                                -->
<!-- ========================================================= -->
<h2 class="section-title">2. Complete Tech Stack Architecture</h2>

<p>
The project implements a clean multi-tier architecture with clear separation of concerns between client presentation, API routing, relational data persistence, and vector similarity computation:
</p>

<table>
    <thead>
        <tr>
            <th>Architecture Layer</th>
            <th>Technology Selected</th>
            <th>Version</th>
            <th>Role in BreachVault</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>Frontend Framework</strong></td>
            <td>Next.js (App Router) + React</td>
            <td>15.1.0 / 19.0.0</td>
            <td>Server and Client Components, responsive layouts, client-side Web Crypto SHA-256 calculation, dynamic state management.</td>
        </tr>
        <tr>
            <td><strong>Styling & Icons</strong></td>
            <td>Tailwind CSS + Lucide React</td>
            <td>Modern Dark SOC</td>
            <td>Cybersecurity SOC dark theme, glassmorphic metric cards, color-coded severity pills, and interactive threat radar styling.</td>
        </tr>
        <tr>
            <td><strong>Backend / API Layer</strong></td>
            <td>Next.js Route Handlers</td>
            <td>Node.js 24 LTS</td>
            <td>RESTful API endpoints (<code>/api/breaches</code>, <code>/api/credentials</code>, <code>/api/semantic</code>, <code>/api/organizations</code>, <code>/api/audit</code>).</td>
        </tr>
        <tr>
            <td><strong>Relational Database</strong></td>
            <td>PostgreSQL / MySQL</td>
            <td>MySQL 9.7 / PG 16</td>
            <td>13 normalized 3NF tables, foreign key cascades, ACID transactions, stored procedures, triggers, views, and audit trail.</td>
        </tr>
        <tr>
            <td><strong>Vector Database</strong></td>
            <td>PostgreSQL + pgvector</td>
            <td>pgvector 0.7+</td>
            <td>384-dimensional dense embeddings, IVFFlat index with <code>vector_cosine_ops</code>, cosine distance matching (<code>&lt;=&gt;</code>).</td>
        </tr>
        <tr>
            <td><strong>Embedding Model</strong></td>
            <td>sentence-transformers/all-MiniLM-L6-v2</td>
            <td>384-dim dense</td>
            <td>Transforms free-text breach incident descriptions into normalized semantic vectors for nearest-neighbor similarity search.</td>
        </tr>
    </tbody>
</table>

<div class="callout callout-amber no-break">
    <div class="callout-title">Why Dual-Paradigm? (SQL + Vector vs. NoSQL/MongoDB)</div>
    <strong>Why not just MongoDB?</strong> A security intelligence database cannot tolerate eventual consistency or orphan records. If an organization is deleted, its monitored domains and watchlist alerts must cascade cleanly. Stored procedures and triggers must run transactionally. NoSQL lacks ACID guarantees and rigid referential integrity.<br>
    <strong>Why Vector DB?</strong> Relational SQL exact matching (<code>LIKE '%phishing%'</code>) fails completely when an incident is phrased as <em>"credential harvesting via spoofed email portal"</em>. The vector database matches concepts by semantic meaning rather than literal keywords.
</div>

<div class="page-break"></div>

<!-- ========================================================= -->
<!-- 3. DATABASE DESIGN & ER MODEL                             -->
<!-- ========================================================= -->
<h2 class="section-title">3. Database Design & ER Model</h2>

<p>
The database schema consists of <strong>13 distinct entities</strong> designed in full compliance with Third Normal Form (3NF).
</p>

<div class="figure no-break">
    <img src="data:image/png;base64,{img_er}" alt="BreachVault ER Diagram" style="max-height: 125mm;">
    <div class="caption">Figure 3.1: BreachVault Entity-Relationship Diagram (13 Entities, Cardinalities, PKs and FKs)</div>
</div>

<h3 class="sub-title">Relational Schema Summary (13 Tables)</h3>
<table>
    <thead>
        <tr>
            <th>Category</th>
            <th>Table Name</th>
            <th>Primary Key</th>
            <th>Foreign Keys & References</th>
            <th>Domain Constraints & Key Attributes</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td rowspan="5"><strong>Independent Entities</strong></td>
            <td><code>users</code></td>
            <td>user_id</td>
            <td>None</td>
            <td>UNIQUE(username, email), CHECK(role IN ('analyst', 'admin'))</td>
        </tr>
        <tr>
            <td><code>threat_actors</code></td>
            <td>actor_id</td>
            <td>None</td>
            <td>CHECK(motivation IN ('financial', 'espionage', 'hacktivism', 'unknown')), CHECK(risk_level)</td>
        </tr>
        <tr>
            <td><code>data_classes</code></td>
            <td>class_id</td>
            <td>None</td>
            <td>UNIQUE(class_name), CHECK(sensitivity_level IN ('low','medium','high','critical'))</td>
        </tr>
        <tr>
            <td><code>breaches</code></td>
            <td>breach_id</td>
            <td>None</td>
            <td>CHECK(source_type), CHECK(severity), CHECK(cvss_score 0-10), attack_vector, embedding</td>
        </tr>
        <tr>
            <td><code>organizations</code></td>
            <td>org_id</td>
            <td>None</td>
            <td>org_name, industry, country, employee_count, CHECK(risk_tier)</td>
        </tr>
        <tr>
            <td rowspan="6"><strong>Dependent Entities</strong></td>
            <td><code>threat_actor_aliases</code></td>
            <td>alias_id</td>
            <td>actor_id &rarr; threat_actors(actor_id)</td>
            <td>ON DELETE CASCADE, alias_name, platform</td>
        </tr>
        <tr>
            <td><code>domains</code></td>
            <td>domain_id</td>
            <td>org_id &rarr; organizations(org_id)</td>
            <td>ON DELETE CASCADE, UNIQUE(domain_name), is_primary BOOLEAN</td>
        </tr>
        <tr>
            <td><code>compromised_credentials</code></td>
            <td>cred_id</td>
            <td>breach_id &rarr; breaches, domain_id &rarr; domains</td>
            <td>ON DELETE CASCADE, email_hash (SHA-256), CHECK(credential_type), is_reused BOOLEAN</td>
        </tr>
        <tr>
            <td><code>watchlist</code></td>
            <td>watch_id</td>
            <td>user_id &rarr; users, org_id &rarr; organizations</td>
            <td>ON DELETE CASCADE, UNIQUE(user_id, org_id), CHECK(watch_type), alert_enabled</td>
        </tr>
        <tr>
            <td><code>remediation_actions</code></td>
            <td>action_id</td>
            <td>breach_id &rarr; breaches, user_id &rarr; users</td>
            <td>CHECK(action_type), CHECK(status IN ('pending', 'in_progress', 'completed', 'failed'))</td>
        </tr>
        <tr>
            <td><code>audit_logs</code></td>
            <td>log_id</td>
            <td>user_id &rarr; users(user_id)</td>
            <td>ON DELETE SET NULL, action, target_table, target_id, details, performed_at</td>
        </tr>
        <tr>
            <td rowspan="2"><strong>Junction Tables (M:N)</strong></td>
            <td><code>breach_data_classes</code></td>
            <td>(breach_id, class_id)</td>
            <td>breach_id &rarr; breaches, class_id &rarr; data_classes</td>
            <td>Composite PK, ON DELETE CASCADE on both foreign keys</td>
        </tr>
        <tr>
            <td><code>breach_threat_actors</code></td>
            <td>(breach_id, actor_id)</td>
            <td>breach_id &rarr; breaches, actor_id &rarr; threat_actors</td>
            <td>Composite PK, ON DELETE CASCADE, CHECK(confidence_level IN ('low','medium','high','confirmed'))</td>
        </tr>
    </tbody>
</table>

<div class="callout callout-blue no-break">
    <div class="callout-title">Normalization Proof (1NF &rarr; 2NF &rarr; 3NF)</div>
    <strong>1NF:</strong> All attributes hold atomic (single) values. Multi-valued aliases are split into <code>threat_actor_aliases</code>, and multiple data classes are modeled via <code>breach_data_classes</code>.<br>
    <strong>2NF:</strong> In 1NF and contains zero partial functional dependencies. In junction tables with composite primary keys, non-key attributes (e.g. <code>confidence_level</code>) depend on the complete composite key <code>(breach_id, actor_id)</code>.<br>
    <strong>3NF:</strong> In 2NF and contains zero transitive functional dependencies ($X \rightarrow Y \rightarrow Z$). Organization industry and country describe the organization directly via <code>org_id</code>, not transitively through domain records.
</div>

<div class="page-break"></div>

<h3 class="sub-title">3.2 Visual Relational Schema Diagram (Relational Mapping)</h3>
<p>
The complete relational schema diagram below illustrates each relation with its primary key and directed referential arrows indicating foreign key constraints:
</p>
<div class="figure no-break" style="text-align: center; margin: 12px 0;">
    <img src="../extracted_images/relational_schema.png" style="max-height: 480px; width: 100%; object-fit: contain; border: 1px solid #cbd5e1; border-radius: 6px;">
    <div class="fig-cap">Figure 3.1: BreachVault Relational Schema Diagram (Green box format with Foreign Key arrows)</div>
</div>

<div class="page-break"></div>

<!-- ========================================================= -->
<!-- 4. SQL COMMANDS & ADVANCED LOGIC                          -->
<!-- ========================================================= -->
<h2 class="section-title">4. SQL Database Commands & Stored Logic</h2>

<h3 class="sub-title">4.1 Data Definition Language (DDL) Execution Proof (Lab 4 Terminal)</h3>
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;" class="no-break">
    <div class="figure" style="margin: 0;">
        <img src="data:image/png;base64,{img_ddl_1}" alt="Users DDL" style="max-height: 52mm;">
        <div class="caption">Figure 4.1: Database setup & table users, threat_actors</div>
    </div>
    <div class="figure" style="margin: 0;">
        <img src="data:image/png;base64,{img_ddl_2}" alt="Breaches DDL" style="max-height: 52mm;">
        <div class="caption">Figure 4.2: breaches, data_classes, breach_data_classes</div>
    </div>
    <div class="figure" style="margin: 0;">
        <img src="data:image/png;base64,{img_ddl_5}" alt="Indexes DDL" style="max-height: 52mm;">
        <div class="caption">Figure 4.3: audit_logs & performance index creation</div>
    </div>
    <div class="figure" style="margin: 0;">
        <img src="data:image/png;base64,{img_tables}" alt="Show Tables" style="max-height: 52mm;">
        <div class="caption">Figure 4.4: Verified all 12 tables in MySQL</div>
    </div>
</div>

<h3 class="sub-title">4.2 Stored Procedure: Atomic Breach Ingestion (sp_ingest_breach)</h3>
<div class="code-box">CREATE OR REPLACE PROCEDURE sp_ingest_breach(
    p_name VARCHAR, p_description TEXT, p_breach_date DATE,
    p_source_type VARCHAR, p_severity VARCHAR, p_cvss NUMERIC,
    p_records BIGINT, p_attack_vec VARCHAR, p_data_classes INT[], p_user_id INT
)
LANGUAGE plpgsql AS $$
DECLARE
    v_breach_id INT;
    v_class_id  INT;
BEGIN
    -- 1. Insert master breach record
    INSERT INTO breaches (
        breach_name, description, breach_date, discovery_date,
        source_type, severity, cvss_score, records_exposed, attack_vector
    ) VALUES (
        p_name, p_description, p_breach_date, CURRENT_DATE,
        p_source_type, p_severity, p_cvss, p_records, p_attack_vec
    ) RETURNING breach_id INTO v_breach_id;

    -- 2. Transactionally link associated data classes (M:N)
    FOREACH v_class_id IN ARRAY p_data_classes LOOP
        INSERT INTO breach_data_classes (breach_id, class_id)
        VALUES (v_breach_id, v_class_id)
        ON CONFLICT DO NOTHING;
    END LOOP;

    -- 3. Automatically record security audit trail
    INSERT INTO audit_logs (user_id, action, target_table, target_id, details)
    VALUES (p_user_id, 'INGEST_BREACH', 'breaches', v_breach_id, 'Ingested breach: ' || p_name);
END;
$$;</div>

<h3 class="sub-title">4.3 Database Trigger: Credential Reuse Detection (trg_detect_credential_reuse)</h3>
<div class="code-box">CREATE OR REPLACE FUNCTION trg_fn_detect_credential_reuse()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_match_count INT;
BEGIN
    -- Check if this email hash exists in any OTHER breach
    SELECT COUNT(*) INTO v_match_count
    FROM compromised_credentials
    WHERE email_hash = NEW.email_hash AND breach_id != NEW.breach_id;

    IF v_match_count > 0 THEN
        NEW.is_reused := TRUE;
        -- Mark previously ingested matching credentials as reused as well
        UPDATE compromised_credentials SET is_reused = TRUE WHERE email_hash = NEW.email_hash;

        -- Record security alert event
        INSERT INTO audit_logs (user_id, action, target_table, target_id, details)
        VALUES (1, 'CREDENTIAL_REUSE_DETECTED', 'compromised_credentials', NEW.cred_id,
                'Email hash ' || SUBSTRING(NEW.email_hash, 1, 8) || '... reused across breaches');
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_detect_credential_reuse
BEFORE INSERT ON compromised_credentials
FOR EACH ROW EXECUTE FUNCTION trg_fn_detect_credential_reuse();</div>

<div class="page-break"></div>

<!-- ========================================================= -->
<!-- 5. VECTOR DATABASE COMMANDS                               -->
<!-- ========================================================= -->
<h2 class="section-title">5. NoSQL / Vector Database Commands (pgvector)</h2>

<p>
To fulfill the <strong>Option 2 (SQL + Vector Database)</strong> requirement, BreachVault utilizes the PostgreSQL <code>pgvector</code> extension to index and query natural language incident narratives.
</p>

<div class="code-box">-- 1. Enable extension inside PostgreSQL
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add 384-dimensional dense vector column
ALTER TABLE breaches ADD COLUMN description_embedding vector(384);

-- 3. Build Approximate Nearest Neighbor (ANN) IVFFlat index using cosine distance
CREATE INDEX idx_breach_embedding ON breaches
USING ivfflat (description_embedding vector_cosine_ops)
WITH (lists = 10);

-- 4. Query: Discover Top 5 Historically Similar Incidents using Cosine Distance (<=>)
SELECT
    b.breach_id,
    b.breach_name,
    b.severity,
    b.attack_vector,
    b.records_exposed,
    ROUND((1 - (b.description_embedding <=> target.emb))::NUMERIC, 4) AS similarity_score
FROM breaches b,
     (SELECT description_embedding AS emb FROM breaches WHERE breach_id = 1) AS target
WHERE b.breach_id != 1 AND b.description_embedding IS NOT NULL
ORDER BY b.description_embedding <=> target.emb ASC
LIMIT 5;</div>

<div class="callout callout-blue no-break">
    <div class="callout-title">Mathematical Formula for Vector Similarity</div>
    For two dense embedding vectors <strong>u</strong> and <strong>v</strong> representing breach descriptions in 384-dimensional space:<br>
    <div style="font-family: monospace; font-size: 9pt; margin: 6px 0; background: #ffffff; padding: 6px 10px; border-radius: 4px; border: 1px solid #bae6fd;">
        Cosine Similarity(u, v) = (u &middot; v) / (||u|| &times; ||v||) = [&Sigma;(u<sub>i</sub> &times; v<sub>i</sub>)] / [&radic;(&Sigma;u<sub>i</sub><sup>2</sup>) &times; &radic;(&Sigma;v<sub>i</sub><sup>2</sup>)]
    </div>
    The pgvector operator <code>&lt;=&gt;</code> calculates <strong>Cosine Distance</strong> = 1 - Cosine Similarity. A distance of 0.0 indicates identical semantic meaning.
</div>

<!-- ========================================================= -->
<!-- 6. NEXT.JS WEBSITE WALKTHROUGH                            -->
<!-- ========================================================= -->
<h2 class="section-title">6. Next.js Website & Application Walkthrough</h2>

<p>
The application has been constructed with <strong>Next.js 15 (App Router)</strong>, React 19, and Tailwind CSS. Below is a tour of all 8 core application modules with screenshots from the live web application:
</p>

<h3 class="sub-title">Module 1: SOC Command Center Dashboard (Route: <code>/</code>)</h3>
<p>
Presents real-time security posture metrics: Total Breaches (8), Total Records Exposed (77.0M+), Leaked Credentials (16), and Credential Reuse Rate (25%). Displays live breach alerts alongside organizational risk scores calculated by <code>fn_calculate_org_risk_score</code>.
</p>
<div class="figure no-break">
    <img src="data:image/png;base64,{img_dash}" alt="Command Center Dashboard" style="max-height: 75mm;">
    <div class="caption">Figure 6.1: Executive SOC Command Center Dashboard with Live Metrics & Risk Tables</div>
</div>

<h3 class="sub-title">Module 2: Breach Explorer & Ingestion Modal (Route: <code>/breaches</code>)</h3>
<p>
Allows analysts to search and filter incidents by severity (Critical, High, Medium, Low), source type (Dark Web, Paste Site, Insider, Public), and attack vector (SQLi, Phishing, RCE, Zero-Day). An interactive modal executes the <code>sp_ingest_breach</code> stored procedure to ingest new incidents.
</p>
<div class="figure no-break">
    <img src="data:image/png;base64,{img_breaches}" alt="Breach Explorer" style="max-height: 75mm;">
    <div class="caption">Figure 6.2: Breach Intelligence Explorer & Ingestion Modal</div>
</div>

<div class="page-break"></div>

<h3 class="sub-title">Module 3: Leaked Credential Exposure Lookup (Route: <code>/credentials</code>)</h3>
<p>
Users enter an email address (e.g. <code>alicia.w@globalbank.co.uk</code>). The browser executes a client-side SHA-256 calculation via the Web Crypto API (preserving user privacy) and queries <code>fn_check_credential_exposure</code>. When an email appears in multiple breaches, a bright red <strong>REUSED CREDENTIAL</strong> warning badge is rendered.
</p>
<div class="figure no-break">
    <img src="data:image/png;base64,{img_creds}" alt="Credential Lookup" style="max-height: 75mm;">
    <div class="caption">Figure 6.3: Credential Exposure Lookup with Client SHA-256 Hashing & Password Reuse Warning</div>
</div>

<h3 class="sub-title">Module 4: pgvector Vector Semantic Search (Route: <code>/semantic-search</code>)</h3>
<p>
Analysts input unstructured natural-language queries (e.g., <em>"Database exploit exfiltrating user passwords and financial records"</em>). The vector engine computes dense 384-dimensional embeddings, executes cosine distance matching (<code>&lt;=&gt;</code>), and ranks matches with visual percentage bars while providing automated containment playbooks.
</p>
<div class="figure no-break">
    <img src="data:image/png;base64,{img_vector}" alt="Vector Semantic Search" style="max-height: 75mm;">
    <div class="caption">Figure 6.4: pgvector Semantic Search with Cosine Scores & Playbook Recommendations</div>
</div>

<h3 class="sub-title">Module 5: Threat Actor Dossiers (Route: <code>/threat-actors</code>)</h3>
<p>
Visual intelligence dossiers detailing tracked cyber syndicates (PhantomSpider, ShadowSyndicate, NullSec Collective), platform aliases from <code>threat_actor_aliases</code>, attack motivations, and timelines.
</p>
<div class="figure no-break">
    <img src="data:image/png;base64,{img_actors}" alt="Threat Actors" style="max-height: 75mm;">
    <div class="caption">Figure 6.5: Threat Actor Intelligence Profiles & Known Aliases</div>
</div>

<div class="page-break"></div>

<h3 class="sub-title">Module 6: Security Audit Trail & Trigger Logging (Route: <code>/audit-logs</code>)</h3>
<p>
An immutable chronological event stream populated automatically by database triggers (<code>INGEST_BREACH</code>, <code>CREDENTIAL_REUSE_DETECTED</code>, <code>WATCHLIST_ALERT</code>, <code>ACTOR_LAST_SEEN_UPDATED</code>).
</p>
<div class="figure no-break">
    <img src="data:image/png;base64,{img_audit}" alt="Audit Trail" style="max-height: 75mm;">
    <div class="caption">Figure 6.6: Database Security Audit Trail Populated by Automated Triggers</div>
</div>

<h3 class="sub-title">Application Code Implementation Highlights</h3>
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;" class="no-break">
    <div class="figure" style="margin: 0;">
        <img src="data:image/png;base64,{img_code_vec}" alt="Vector Engine Code" style="max-height: 60mm;">
        <div class="caption">Figure 6.7: Vector Cosine Math Engine (<code>src/lib/vector.js</code>)</div>
    </div>
    <div class="figure" style="margin: 0;">
        <img src="data:image/png;base64,{img_code_api}" alt="API Route Code" style="max-height: 60mm;">
        <div class="caption">Figure 6.8: Next.js Ingestion Route Handler (<code>src/app/api/breaches/route.js</code>)</div>
    </div>
</div>

<!-- ========================================================= -->
<!-- 7. NEXT.JS PROJECT TREE STRUCTURE                         -->
<!-- ========================================================= -->
<h2 class="section-title">7. Next.js Project Tree Structure</h2>

<div class="code-box">breachvault/
├── package.json                   # Dependencies (Next 15, React 19, Lucide, MySQL2, PG)
├── next.config.js                 # Next.js configuration
├── jsconfig.json                  # Path aliases (@/* -> ./src/*)
├── .env.example                   # Environment configuration template
├── .env.local                     # Local database connection credentials
├── sql/                           # Full database scripts (DDL, DML, Procedures, Triggers)
│   ├── breachvault_complete.sql   # Complete single-file master script
│   ├── schema.sql                 # 13 tables DDL & constraints
│   ├── seed_data.sql              # Seed records for all tables
│   ├── stored_procedures.sql      # Stored procedures & functions
│   ├── triggers.sql               # Automated database triggers
│   ├── views.sql                  # Analytical views
│   └── queries.sql                # Complex analytical SQL queries
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
    │       ├── breaches/route.js  # GET breaches, POST ingest breach
    │       ├── credentials/route.js# POST check email hash exposure
    │       ├── semantic/route.js  # POST cosine similarity vector query
    │       ├── organizations/route.js # GET risk scores, POST watchlist
    │       ├── threat-actors/route.js # GET threat actors & aliases
    │       ├── remediation/route.js   # GET, PATCH remediation actions
    │       ├── audit/route.js     # GET immutable audit logs
    │       └── stats/route.js     # GET high-level metrics & counts
    ├── components/
    │   └── Navbar.jsx             # Navigation bar with Role Switcher (Admin / Analyst)
    └── lib/
        ├── db.js                  # Multi-dialect database connector & fallback
        ├── vector.js              # 384-dimensional cosine similarity engine
        └── seedData.js            # Initialized database entities and vectors</div>

<div class="page-break"></div>

<!-- ========================================================= -->
<!-- 8. STEP-BY-STEP LIVE DEMO PRESENTATION SCRIPT             -->
<!-- ========================================================= -->
<h2 class="section-title">8. Step-by-Step Live Demo Presentation Script</h2>

<p>
Follow this exact sequence during your live evaluation demo. It guarantees all rubric points are highlighted within 5 to 7 minutes:
</p>

<div class="demo-step no-break">
    <div class="step-num">1</div>
    <div class="step-content">
        <h4>Introduction & Problem Statement (Time: 0:00 - 1:00)</h4>
        <p>Open <code>http://localhost:3000</code>. Point to the top banner and stat cards.</p>
        <div class="step-say">
            "Respected Evaluator, our project is BreachVault, carried out by Vincent (002) and Akshat (046). It addresses dark web threat intelligence where credential dumps and breaches are leaked. Instead of a simple CRUD app, BreachVault is a dual-paradigm system combining a normalized 13-table Relational Database with a Vector Database using PostgreSQL pgvector."
        </div>
    </div>
</div>

<div class="demo-step no-break">
    <div class="step-num">2</div>
    <div class="step-content">
        <h4>Explain ER Model & 3NF Normalization (Time: 1:00 - 2:00)</h4>
        <p>Show the ER Diagram in your report or presentation.</p>
        <div class="step-say">
            "We have 13 entities structured in 3NF: 5 independent entities (users, threat_actors, data_classes, breaches, organizations), 6 dependent entities (domains, credentials, watchlist, remediation, audit_logs), and 2 junction tables for M:N relationships. Everything is strictly normalized with foreign keys and check constraints."
        </div>
    </div>
</div>

<div class="demo-step no-break">
    <div class="step-num">3</div>
    <div class="step-content">
        <h4>Demonstrate Credential Lookup & Trigger trg_detect_credential_reuse (Time: 2:00 - 3:30)</h4>
        <p>Click <strong>Credentials</strong> in the navbar. Click the preset button <code>alicia.w@globalbank.co.uk</code> or type it.</p>
        <div class="step-say">
            "Here we demonstrate privacy-preserving search. The email is hashed to SHA-256 in the browser before querying. Notice this bright red REUSED CREDENTIAL badge! When breach #2 was ingested, our database trigger 'trg_detect_credential_reuse' automatically cross-referenced earlier breaches, flagged both records as reused, and logged the incident into audit_logs."
        </div>
    </div>
</div>

<div class="demo-step no-break">
    <div class="step-num">4</div>
    <div class="step-content">
        <h4>Demonstrate Vector Database & Semantic Similarity (Time: 3:30 - 4:45)</h4>
        <p>Click <strong>Vector Search</strong> in the navbar. Type: <em>"SQL injection database dumping user passwords and credit cards"</em> or click a prompt.</p>
        <div class="step-say">
            "This demonstrates our Option 2 Vector Database requirement. Traditional SQL LIKE queries fail if exact words aren't matched. Here, sentence-transformers maps the narrative to 384-dimensional dense vectors. Using pgvector's cosine distance operator (&lt;=&gt;), it identifies ShadowVault Dump and GhostNet as the closest matches with over 80% similarity, and automatically recommends the containment playbook!"
        </div>
    </div>
</div>

<div class="demo-step no-break">
    <div class="step-num">5</div>
    <div class="step-content">
        <h4>Demonstrate Stored Procedure sp_ingest_breach & Audit Logs (Time: 4:45 - 6:00)</h4>
        <p>Click <strong>Breaches</strong> &rarr; click <strong>Ingest New Breach</strong>. Fill in a test breach and submit. Then navigate to <strong>Audit Trail</strong>.</p>
        <div class="step-say">
            "This executes our stored procedure 'sp_ingest_breach'. In a single atomic transaction, it inserts the breach, links data classes in breach_data_classes, and generates an audit log entry. In Audit Trail, you can see all trigger and procedure events immutably logged with timestamps and user attribution."
        </div>
    </div>
</div>

<div class="demo-step no-break">
    <div class="step-num">6</div>
    <div class="step-content">
        <h4>RBAC Role Switcher (Time: 6:00 - 6:30)</h4>
        <p>Click the role pill in the top-right navbar to toggle between <strong>Admin (Vincent)</strong> and <strong>Analyst (Akshat)</strong>.</p>
        <div class="step-say">
            "Finally, we implement Role-Based Access Control distinguishing Analysts from Administrators, fulfilling the multi-role security requirement."
        </div>
    </div>
</div>

<div class="page-break"></div>

<!-- ========================================================= -->
<!-- 9. VIVA VOCE & EVALUATOR Q&A CHEAT SHEET                  -->
<!-- ========================================================= -->
<h2 class="section-title">9. Viva Voce & Evaluator Q&A Defense Guide</h2>

<div class="qa-card no-break">
    <div class="qa-q"><span class="qa-q-badge">Q1</span> Why did your team choose SQL + Vector Database instead of SQL + NoSQL (MongoDB)?</div>
    <div class="qa-a"><strong>Answer:</strong> Dark web breach data is inherently relational—threat actors attack organizations, organizations own domains, and breaches leak credentials. This requires strict ACID transactions and foreign key cascading. However, breach incident descriptions are unstructured free-text. NoSQL (like MongoDB) does not provide semantic search. By choosing PostgreSQL with pgvector, a single database connection and transaction spans both relational entities and 384-dimensional dense vectors without distributed consistency overhead.</div>
</div>

<div class="qa-card no-break">
    <div class="qa-q"><span class="qa-q-badge">Q2</span> What is the pgvector distance operator and what index did you use?</div>
    <div class="qa-a"><strong>Answer:</strong> We use the cosine distance operator <code>&lt;=&gt;</code>, which measures angular distance between normalized text embeddings: <code>Cosine Distance = 1 - (u &middot; v) / (||u|| &times; ||v||)</code>. We index this column using an <code>IVFFlat</code> (Inverted File Flat) index with <code>vector_cosine_ops</code> and <code>lists = 10</code>, enabling rapid approximate nearest-neighbor search without scanning every row sequentially.</div>
</div>

<div class="qa-card no-break">
    <div class="qa-q"><span class="qa-q-badge">Q3</span> How does your trigger detect credential reuse?</div>
    <div class="qa-a"><strong>Answer:</strong> Trigger <code>trg_detect_credential_reuse</code> runs <code>BEFORE INSERT</code> on table <code>compromised_credentials</code>. It executes a query checking if <code>NEW.email_hash</code> already exists where <code>breach_id != NEW.breach_id</code>. If the count &gt; 0, it sets <code>NEW.is_reused = TRUE</code>, updates the older credentials with <code>is_reused = TRUE</code>, and automatically inserts an audit entry into <code>audit_logs</code>.</div>
</div>

<div class="qa-card no-break">
    <div class="qa-q"><span class="qa-q-badge">Q4</span> Explain the logic behind your stored procedure sp_ingest_breach.</div>
    <div class="qa-a"><strong>Answer:</strong> <code>sp_ingest_breach</code> guarantees atomicity. Ingesting a breach involves inserting into the parent <code>breaches</code> table, inserting multiple records into the <code>breach_data_classes</code> junction table, and logging to <code>audit_logs</code>. If any insertion fails, the entire transaction rolls back, preventing corrupt or orphaned breach records.</div>
</div>

<div class="qa-card no-break">
    <div class="qa-q"><span class="qa-q-badge">Q5</span> How is organization risk scoring calculated?</div>
    <div class="qa-a"><strong>Answer:</strong> In stored function <code>fn_calculate_org_risk_score</code>, the score (0–100) is calculated dynamically:
    <div style="font-family: monospace; font-size: 8.5pt; margin: 4px 0; background: #f8fafc; padding: 4px 8px; border: 1px solid #e2e8f0; border-radius: 4px;">
        Risk Score = min(100, (breach_count &times; 10) + (severity_sum &times; 5) + (reused_creds &times; 15) + credential_volume_factor)
    </div>
    Based on the result, the organization's <code>risk_tier</code> is updated to 'critical' (&ge;75), 'high' (&ge;50), 'medium' (&ge;25), or 'low'.</div>
</div>

<div class="qa-card no-break">
    <div class="qa-q"><span class="qa-q-badge">Q6</span> How are passwords and user privacy protected in your database?</div>
    <div class="qa-a"><strong>Answer:</strong> Users table stores passwords hashed via bcrypt. In <code>compromised_credentials</code>, plaintext emails and passwords are never stored. The client hashes the email to a 64-character hexadecimal SHA-256 hash in the browser before querying. Only SHA-256 hashes are persisted, adhering to strict data privacy and zero-knowledge threat intelligence principles.</div>
</div>

<div class="qa-card no-break">
    <div class="qa-q"><span class="qa-q-badge">Q7</span> How does your Next.js application connect to the database securely?</div>
    <div class="qa-a"><strong>Answer:</strong> Database credentials are never hardcoded in client-side code. They are stored in <code>.env.local</code> and accessed strictly on the server side via Next.js Route Handlers (<code>src/app/api/...</code>) using connection pooling with <code>mysql2/promise</code> and <code>pg</code>.</div>
</div>

<div class="qa-card no-break">
    <div class="qa-q"><span class="qa-q-badge">Q8</span> What were your individual contributions to the database backend?</div>
    <div class="qa-a"><strong>Answer:</strong><br>
    <strong>Vincent (PES2UG24CS002):</strong> Core 3NF ER relational modeling, transactional stored procedure <code>sp_ingest_breach</code> with rollback error handling, 384-dim <code>pgvector</code> embedding engine with IVFFlat cosine distance indexing, audit trail trigger <code>trg_audit_breach_insert</code>, and database connector pooling.<br>
    <strong>Akshat (PES2UG24CS046):</strong> Analytical enterprise schema, stored functions <code>fn_check_credential_exposure</code> (SHA-256 hash lookup) and <code>fn_calculate_org_risk_score</code> (weighted risk model), complex analytical views (<code>v_high_risk_organizations</code>, <code>v_threat_actor_profiles</code>), B-Tree indexing optimization, and real-time alert trigger <code>trg_watchlist_alert</code>.</div>
</div>

<div style="margin-top: 15px; padding: 10px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 8pt; text-align: center; color: #64748b;">
    <strong>BreachVault &bull; Level 3 Experiential Learning Project &bull; PES University &bull; Good luck on your demo today!</strong>
</div>

</body>
</html>
"""

    html_file = os.path.join(output_dir, "demo_manual.html")
    with open(html_file, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"Generated HTML manual: {html_file}")

    pdf_file = os.path.join(output_dir, "BreachVault_DBMS_Demo_Complete_Guide.pdf")
    edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    cmd = [
        edge_path,
        "--headless=new",
        "--disable-gpu",
        f"--print-to-pdf={pdf_file}",
        f"file:///{html_file}"
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if os.path.exists(pdf_file):
        print(f"SUCCESS: PDF created at: {pdf_file}")
        print(f"PDF Size: {os.path.getsize(pdf_file)} bytes")
        
        # Also make a convenient alias copy named DBMS_Demo_Today.pdf
        alias_pdf = os.path.join(output_dir, "DBMS_Demo_Today.pdf")
        with open(pdf_file, 'rb') as src, open(alias_pdf, 'wb') as dst:
            dst.write(src.read())
        print(f"Created alias copy: {alias_pdf}")
    else:
        print(f"Failed to generate PDF. Error: {res.stderr}")

if __name__ == "__main__":
    generate_pdf()
