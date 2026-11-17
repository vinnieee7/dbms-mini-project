import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def add_styled_heading(doc, text, level):
    p = doc.add_paragraph()
    p.paragraph_format.keep_with_next = True
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(6)
    run = p.add_run(text)
    run.bold = True
    run.font.name = 'Arial'
    
    if level == 1:
        run.font.size = Pt(16)
        run.font.color.rgb = RGBColor(15, 23, 42) # Slate 900
        p.paragraph_format.space_before = Pt(20)
    elif level == 2:
        run.font.size = Pt(13)
        run.font.color.rgb = RGBColor(30, 58, 138) # Blue 900
    elif level == 3:
        run.font.size = Pt(11.5)
        run.font.color.rgb = RGBColor(51, 65, 85) # Slate 700
    return p

def add_body_p(doc, text, bold=False, italic=False):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.line_spacing = 1.15
    run = p.add_run(text)
    run.bold = bold
    run.italic = italic
    run.font.name = 'Arial'
    run.font.size = Pt(10.5)
    run.font.color.rgb = RGBColor(30, 41, 59)
    return p

def add_code_block(doc, code_text):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    set_cell_background(cell, "0F172A") # Dark slate
    set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = 1.05
    run = p.add_run(code_text.strip())
    run.font.name = 'Consolas'
    run.font.size = Pt(8.5)
    run.font.color.rgb = RGBColor(226, 232, 240)
    
    # spacing after table
    sp = doc.add_paragraph()
    sp.paragraph_format.space_before = Pt(0)
    sp.paragraph_format.space_after = Pt(4)

def add_callout(doc, title, text):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    set_cell_background(cell, "F0FDF4") # Light emerald tint
    set_cell_margins(cell, top=120, bottom=120, left=180, right=180)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(2)
    run_t = p.add_run(title + "\n")
    run_t.bold = True
    run_t.font.name = 'Arial'
    run_t.font.size = Pt(10)
    run_t.font.color.rgb = RGBColor(22, 101, 52)
    
    run_b = p.add_run(text)
    run_b.font.name = 'Arial'
    run_b.font.size = Pt(9.5)
    run_b.font.color.rgb = RGBColor(30, 41, 59)
    
    sp = doc.add_paragraph()
    sp.paragraph_format.space_before = Pt(0)
    sp.paragraph_format.space_after = Pt(4)

def add_image_figure(doc, img_path, caption, width_in=6.0):
    if os.path.exists(img_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(8)
        p_img.paragraph_format.space_after = Pt(4)
        run = p_img.add_run()
        run.add_picture(img_path, width=Inches(width_in))
        
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_before = Pt(2)
        p_cap.paragraph_format.space_after = Pt(12)
        run_cap = p_cap.add_run(caption)
        run_cap.italic = True
        run_cap.font.name = 'Arial'
        run_cap.font.size = Pt(9)
        run_cap.font.color.rgb = RGBColor(71, 85, 105)

def build_report():
    doc = Document()
    
    # Page setup
    for sec in doc.sections:
        sec.top_margin = Inches(1.0)
        sec.bottom_margin = Inches(1.0)
        sec.left_margin = Inches(1.0)
        sec.right_margin = Inches(1.0)

    # -------------------------------------------------------------
    # TITLE PAGE
    # -------------------------------------------------------------
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(36)
    p.paragraph_format.space_after = Pt(12)
    run = p.add_run("Mini Project Report on\n")
    run.font.name = 'Arial'
    run.font.size = Pt(14)
    run.font.color.rgb = RGBColor(100, 116, 139)

    run_title = p.add_run("BREACHVAULT: A DARK WEB DATA BREACH & LEAKED CREDENTIAL INTELLIGENCE SYSTEM\n")
    run_title.bold = True
    run_title.font.name = 'Arial'
    run_title.font.size = Pt(18)
    run_title.font.color.rgb = RGBColor(15, 23, 42)

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_before = Pt(12)
    p_sub.paragraph_format.space_after = Pt(24)
    run_sub = p_sub.add_run(
        "Submitted in partial fulfilment of the requirements for the award of degree of\n"
        "Bachelor of Technology\n"
        "in\n"
        "Computer Science & Engineering\n"
        "UE23CS351A / UE24CS351A — DBMS Project"
    )
    run_sub.font.name = 'Arial'
    run_sub.font.size = Pt(11)
    run_sub.font.color.rgb = RGBColor(71, 85, 105)

    # Team Members Table
    tbl_team = doc.add_table(rows=3, cols=2)
    tbl_team.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_team.cell(0, 0).paragraphs[0].add_run("Submitted by:").bold = True
    tbl_team.cell(0, 1).paragraphs[0].add_run("SRN:").bold = True
    tbl_team.cell(1, 0).paragraphs[0].add_run("A S Vincent")
    tbl_team.cell(1, 1).paragraphs[0].add_run("PES2UG24CS002")
    tbl_team.cell(2, 0).paragraphs[0].add_run("Akshat Kumar")
    tbl_team.cell(2, 1).paragraphs[0].add_run("PES2UG24CS046")
    for r in tbl_team.rows:
        for c in r.cells:
            c.paragraphs[0].runs[0].font.name = 'Arial'
            c.paragraphs[0].runs[0].font.size = Pt(10.5)

    p_guide = doc.add_paragraph()
    p_guide.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_guide.paragraph_format.space_before = Pt(36)
    p_guide.paragraph_format.space_after = Pt(36)
    run_guide = p_guide.add_run(
        "Under the Guidance of\n"
        "_________________________\n"
        "Department of Computer Science and Engineering\n\n"
        "AUG - DEC 2026\n"
        "DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING\n"
        "FACULTY OF ENGINEERING\n"
        "PES UNIVERSITY\n"
        "Electronic City, Hosur Road, Bengaluru – 560 100, Karnataka, India"
    )
    run_guide.font.name = 'Arial'
    run_guide.font.size = Pt(10.5)
    run_guide.font.color.rgb = RGBColor(51, 65, 85)

    doc.add_page_break()

    # -------------------------------------------------------------
    # CERTIFICATE
    # -------------------------------------------------------------
    add_styled_heading(doc, "PES UNIVERSITY", 1).alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_loc = doc.add_paragraph()
    p_loc.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_loc.paragraph_format.space_after = Pt(20)
    p_loc.add_run("(Established under Karnataka Act No. 16 of 2013)\nElectronic City, Hosur Road, Bengaluru – 560 100, Karnataka, India").font.size = Pt(9.5)

    add_styled_heading(doc, "CERTIFICATE", 1).alignment = WD_ALIGN_PARAGRAPH.CENTER
    add_body_p(doc, "This is to certify that the mini project entitled:")
    add_body_p(doc, "BreachVault — A Dark Web Data Breach & Leaked Credential Intelligence System", bold=True)
    add_body_p(doc, "is a bonafide work carried out by:")
    
    t_cert = doc.add_table(rows=2, cols=2)
    t_cert.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_cert.cell(0, 0).paragraphs[0].add_run("A S Vincent").bold = True
    t_cert.cell(0, 1).paragraphs[0].add_run("PES2UG24CS002").bold = True
    t_cert.cell(1, 0).paragraphs[0].add_run("Akshat Kumar").bold = True
    t_cert.cell(1, 1).paragraphs[0].add_run("PES2UG24CS046").bold = True

    add_body_p(doc, "\nIn partial fulfilment for the completion of fifth semester DBMS Project (UE23CS351A / UE24CS351A) in the Program of Study — Bachelor of Technology in Computer Science and Engineering under rules and regulations of PES University, Bengaluru during the period AUG. 2026 – DEC. 2026. It is certified that all corrections / suggestions indicated for internal assessment have been incorporated in the report. The project has been approved as it satisfies the 5th semester academic requirements in respect of project work.")
    
    p_sig = doc.add_paragraph()
    p_sig.paragraph_format.space_before = Pt(40)
    p_sig.add_run("Signature of Guide: _________________________\n\nDept. of CSE, PES University")

    doc.add_page_break()

    # -------------------------------------------------------------
    # DECLARATION & ACKNOWLEDGEMENT
    # -------------------------------------------------------------
    add_styled_heading(doc, "DECLARATION", 1).alignment = WD_ALIGN_PARAGRAPH.CENTER
    add_body_p(doc, "We hereby declare that the DBMS Project entitled 'BreachVault — A Dark Web Data Breach & Leaked Credential Intelligence System' has been carried out by us under guidance and submitted in partial fulfilment of the course requirements for the award of degree of Bachelor of Technology in Computer Science and Engineering of PES University, Bengaluru during the academic semester AUG – DEC 2026. We confirm that this work is original and has not been submitted elsewhere for any academic degree or evaluation.")

    t_dec = doc.add_table(rows=2, cols=3)
    t_dec.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_dec.cell(0, 0).paragraphs[0].add_run("A S Vincent")
    t_dec.cell(0, 1).paragraphs[0].add_run("PES2UG24CS002")
    t_dec.cell(0, 2).paragraphs[0].add_run("Signature: ____________")
    t_dec.cell(1, 0).paragraphs[0].add_run("Akshat Kumar")
    t_dec.cell(1, 1).paragraphs[0].add_run("PES2UG24CS046")
    t_dec.cell(1, 2).paragraphs[0].add_run("Signature: ____________")

    add_styled_heading(doc, "ACKNOWLEDGEMENT", 1).alignment = WD_ALIGN_PARAGRAPH.CENTER
    add_body_p(doc, "We express our sincere gratitude to our faculty guide and the Department of Computer Science and Engineering, PES University, for their invaluable guidance, encouragement, and insightful feedback throughout the conception and implementation of this DBMS project.")
    add_body_p(doc, "We take this opportunity to thank Dr. Sandesh B J, Professor and Chairperson, Department of Computer Science and Engineering, PES University, for fostering an exceptional learning and research environment. We are deeply grateful to Prof. Jawahar Doreswamy, Chancellor, and Dr. J. Suryaprasad, Vice-Chancellor, PES University, for providing academic resources and state-of-the-art infrastructure. Finally, we thank our peers and families for their unwavering encouragement.")

    doc.add_page_break()

    # -------------------------------------------------------------
    # ABSTRACT
    # -------------------------------------------------------------
    add_styled_heading(doc, "ABSTRACT", 1).alignment = WD_ALIGN_PARAGRAPH.CENTER
    add_body_p(doc, "Modern cybersecurity operations face an unprecedented volume of data breaches, underground marketplace dumps, paste site leaks, and compromised credentials. When breach intelligence is processed in silos without structured entity correlation, security operations center (SOC) analysts struggle to identify repeat enterprise targets, gauge corporate risk exposure, detect password reuse across distinct incidents, and formulate incident containment strategies.")
    add_body_p(doc, "This project presents BreachVault, an advanced dual-paradigm threat intelligence and leaked credential management system engineered specifically for enterprise security intelligence. BreachVault addresses these challenges through a unified multi-paradigm database architecture combining a normalized 3NF Relational Database (PostgreSQL / MySQL) with a high-performance Vector Database (PostgreSQL + pgvector). While relational SQL enforces strict ACID transactions, complex multi-entity integrity, foreign key cascades, and automated trigger logging, the vector component leverages 384-dimensional dense semantic embeddings (sentence-transformers/all-MiniLM-L6-v2) indexed with IVFFlat cosine distance (<=>) to enable natural-language similarity search and cross-incident pattern recognition.")
    add_body_p(doc, "BreachVault completely transcends standard CRUD applications by deploying server-side stored procedures for transactional breach ingestion (sp_ingest_breach), credential cross-referencing (fn_check_credential_exposure), and weighted enterprise risk scoring (fn_calculate_org_risk_score). Automated database triggers detect cross-breach credential reuse, record immutable audit logs, and dispatch watchlist alerts to monitoring analysts in real time. The database layer is integrated with a responsive web application developed using Next.js 15 (App Router), React 19, and Tailwind CSS, featuring role-based access control (Admin vs. Analyst), real-time SHA-256 client hashing, vector-driven incident matching, and full incident remediation workflows.")

    doc.add_page_break()

    # -------------------------------------------------------------
    # TABLE OF CONTENTS
    # -------------------------------------------------------------
    add_styled_heading(doc, "TABLE OF CONTENTS", 1).alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    toc_data = [
        ("1. INTRODUCTION", "1"),
        ("2. PROBLEM DEFINITION & JUSTIFICATION", "2"),
        ("3. TECH STACK ARCHITECTURE", "3"),
        ("4. ER MODEL & SYSTEM DESIGN", "4"),
        ("5. ER TO RELATIONAL MAPPING & NORMALIZATION", "5"),
        ("6. SQL DATABASE COMMANDS (DDL, DML & QUERIES)", "7"),
        ("7. ADVANCED SQL: PROCEDURES, FUNCTIONS & TRIGGERS", "11"),
        ("8. NOSQL / VECTOR DATABASE IMPLEMENTATION", "14"),
        ("9. NEXT.JS APPLICATION ARCHITECTURE & TREE STRUCTURE", "16"),
        ("10. APPLICATION SCREENSHOTS & EXPERIMENTAL DEMO", "19"),
        ("11. CONCLUSION & REFERENCES", "23")
    ]
    t_toc = doc.add_table(rows=1, cols=3)
    t_toc.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_toc.cell(0, 0).paragraphs[0].add_run("Chapter No.").bold = True
    t_toc.cell(0, 1).paragraphs[0].add_run("Title").bold = True
    t_toc.cell(0, 2).paragraphs[0].add_run("Page No.").bold = True
    set_cell_background(t_toc.cell(0, 0), "E2E8F0")
    set_cell_background(t_toc.cell(0, 1), "E2E8F0")
    set_cell_background(t_toc.cell(0, 2), "E2E8F0")
    
    for num_title, pg in toc_data:
        row = t_toc.add_row()
        parts = num_title.split(". ", 1)
        row.cells[0].paragraphs[0].add_run(parts[0])
        row.cells[1].paragraphs[0].add_run(parts[1])
        row.cells[2].paragraphs[0].add_run(pg)
        for c in row.cells:
            c.paragraphs[0].runs[0].font.name = 'Arial'
            c.paragraphs[0].runs[0].font.size = Pt(9.5)

    doc.add_page_break()

    # -------------------------------------------------------------
    # CHAPTER 1: INTRODUCTION
    # -------------------------------------------------------------
    add_styled_heading(doc, "1. INTRODUCTION", 1)
    add_body_p(doc, "In the current threat landscape, unauthorized exposure of corporate credentials and proprietary databases on the dark web has become one of the most prolific entry points for cyber attacks. Threat actors operate on dark web forums (such as RaidForums, BreachForums) and underground Telegram channels, buying, trading, and distributing leaked database dumps. Corporate security teams face an overwhelming influx of uncurated breach data, typically ingested in isolation without structured correlation against domain inventories, known threat actor profiles, or historical breach patterns.")
    add_body_p(doc, "BreachVault is engineered to bridge the critical gap between raw underground breach intelligence and actionable enterprise security operations. It establishes a centralized, automated platform where security analysts can ingest, investigate, and mitigate data breach disclosures. By correlating breach events with organizational domains, sensitive data classes, and threat actor tactics, BreachVault transforms unstructured leak text into structured, queryable threat intelligence.")
    
    add_styled_heading(doc, "1.1 Project Objectives", 2)
    add_body_p(doc, "• Relational Integrity & Data Governance: Implement a rigorous 3NF relational database schema across 13 entities to model users, organizations, domains, breaches, compromised credentials, threat actors, and remediation tracking.")
    add_body_p(doc, "• Dual-Paradigm Storage: Integrate PostgreSQL relational storage with the pgvector vector database extension to enable semantic similarity matching over unstructured breach incident reports.")
    add_body_p(doc, "• Automated Incident Intelligence: Deploy server-side stored procedures for atomic breach ingestion and dynamic enterprise risk scoring.")
    add_body_p(doc, "• Proactive Defensive Triggers: Create database triggers that detect password reuse across disparate breaches and dispatch real-time alerts to analysts monitoring targeted organizations.")
    add_body_p(doc, "• Full-Stack Operational Portal: Develop a Next.js 15 web application with role-based access control (Admin / Analyst), interactive credential exposure lookup, semantic search, and audit trail monitoring.")

    # -------------------------------------------------------------
    # CHAPTER 2: PROBLEM DEFINITION
    # -------------------------------------------------------------
    add_styled_heading(doc, "2. PROBLEM DEFINITION & JUSTIFICATION", 1)
    add_body_p(doc, "Traditional database management projects often rely on basic Create-Read-Update-Delete (CRUD) operations, which fail to address real-world data complexity. The problem of dark web threat intelligence presents two distinct, mutually exclusive computational requirements:")
    add_body_p(doc, "1. Structured Transactional Requirements: Tracking which threat actor executed which breach, mapping compromised domains to parent corporations, enforcing foreign key relationships, logging immutable audit trails, and tracking mitigation status requires strict referential integrity and ACID compliance. Relational SQL is irreplaceable for this domain backbone.")
    add_body_p(doc, "2. Unstructured Semantic Retrieval Requirements: Breach descriptions are written in free-form natural language (e.g., 'SQL injection dumping customer credentials and partial credit cards' vs. 'Database exploit exfiltrating user authentication hashes'). Relational exact-match operators (LIKE '%sqli%' or regex) completely fail to identify semantically identical attack vectors phrased in different terminology.")
    
    add_callout(doc, "Dual-Paradigm Justification (SQL + Vector Database)",
                "Relational SQL handles the structured backbone (13 tables, ACID guarantees, foreign keys, cascade deletes, triggers). The Vector Database (PostgreSQL + pgvector) handles the unstructured free-text descriptions. Both paradigms reside cleanly within the same database engine, allowing single transactions to span structured entities and vector embeddings without distributed two-phase commit overhead.")

    # -------------------------------------------------------------
    # CHAPTER 3: TECH STACK
    # -------------------------------------------------------------
    add_styled_heading(doc, "3. TECH STACK ARCHITECTURE", 1)
    add_body_p(doc, "BreachVault utilizes a state-of-the-art technology stack adhering strictly to PES University Level 3 DBMS Project guidelines:")
    
    t_tech = doc.add_table(rows=6, cols=3)
    t_tech.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers = ["Layer", "Technology", "Role & Purpose in BreachVault"]
    for i, h in enumerate(headers):
        t_tech.cell(0, i).paragraphs[0].add_run(h).bold = True
        set_cell_background(t_tech.cell(0, i), "E2E8F0")

    tech_rows = [
        ("Frontend UI", "Next.js 15 (App Router) + React 19 + Tailwind CSS", "Cybersecurity SOC interface, real-time SHA-256 calculation, interactive dashboards, modal workflows"),
        ("Backend / API", "Next.js Route Handlers (Node.js runtime)", "RESTful API routes for breaches, credentials, semantic similarity search, and remediation workflows"),
        ("Relational Database", "PostgreSQL / MySQL 9.7 (SQL mandatory)", "13 normalized 3NF tables, foreign key constraints, triggers, stored procedures, audit logging"),
        ("Vector Database", "PostgreSQL + pgvector (Option 2 paradigm)", "Dense 384-dimensional embeddings (MiniLM-L6-v2), IVFFlat indexing, cosine distance (<=>) matching"),
        ("DevOps & Tooling", "Git, GitHub, Dotenv, Python (python-docx)", "Version control, environment variable isolation, automated report compilation")
    ]
    for row_idx, data in enumerate(tech_rows, start=1):
        for col_idx, text in enumerate(data):
            cell = t_tech.cell(row_idx, col_idx)
            cell.paragraphs[0].add_run(text)
            cell.paragraphs[0].runs[0].font.name = 'Arial'
            cell.paragraphs[0].runs[0].font.size = Pt(9)

    doc.add_page_break()

    # -------------------------------------------------------------
    # CHAPTER 4: ER MODEL & SYSTEM DESIGN
    # -------------------------------------------------------------
    add_styled_heading(doc, "4. ER MODEL & SYSTEM DESIGN", 1)
    add_body_p(doc, "The database design comprises 13 distinct entities categorized into Independent Entities, Dependent Entities, and Junction Tables (M:N Relationships):")
    
    add_body_p(doc, "Independent Entities:")
    add_body_p(doc, "• users: SOC analysts and administrators managing the intelligence system.")
    add_body_p(doc, "• threat_actors: Tracked cyber syndicates and APT groups with risk ratings.")
    add_body_p(doc, "• data_classes: Standardized classification of sensitive PII (Emails, Passwords, SSNs).")
    add_body_p(doc, "• breaches: Core incident entity storing metadata, CVSS scores, and vector embeddings.")
    add_body_p(doc, "• organizations: Monitored corporations, universities, and defense contractors.")

    add_body_p(doc, "Dependent Entities & Junction Tables:")
    add_body_p(doc, "• domains: Corporate domains owned by organizations (1:N from organizations).")
    add_body_p(doc, "• compromised_credentials: Leaked hashes tied to breaches and domains (1:N).")
    add_body_p(doc, "• threat_actor_aliases: Handle names and platform profiles (1:N from threat_actors).")
    add_body_p(doc, "• watchlist: Analyst subscriptions to monitor high-risk organizations (1:N from users & orgs).")
    add_body_p(doc, "• remediation_actions: Incident mitigation tasks (password resets, key rotation).")
    add_body_p(doc, "• audit_logs: System-wide immutable security audit trail.")
    add_body_p(doc, "• breach_data_classes: M:N junction between breaches and exposed data classes.")
    add_body_p(doc, "• breach_threat_actors: M:N junction recording actor attribution confidence.")

    add_image_figure(doc, "extracted_images/page_5_img_1.png", "Figure 4.1: BreachVault Entity-Relationship (ER) Diagram (13 Entities with Cardinalities)", width_in=6.2)

    # -------------------------------------------------------------
    # CHAPTER 5: ER TO RELATIONAL MAPPING & NORMALIZATION
    # -------------------------------------------------------------
    add_styled_heading(doc, "5. ER TO RELATIONAL MAPPING & NORMALIZATION", 1)
    add_body_p(doc, "5.1 Steps of Mapping Algorithm:")
    add_body_p(doc, "Step 1: Mapping Strong Entities — Independent entities (users, threat_actors, data_classes, breaches, organizations) are mapped directly to relation schemas with their single primary keys.")
    add_body_p(doc, "Step 2: Mapping 1:N Binary Relationships — Foreign keys are placed on the 'many' side. For example, org_id is embedded into domains, domain_id and breach_id are embedded into compromised_credentials, and actor_id is embedded into threat_actor_aliases.")
    add_body_p(doc, "Step 3: Mapping M:N Binary Relationships — Dedicated junction relations are constructed: breach_data_classes (breach_id, class_id) and breach_threat_actors (breach_id, actor_id, confidence_level), each possessing a composite primary key.")
    add_body_p(doc, "Step 4: Mapping Audit and Watchlist Relationships — Foreign keys user_id and org_id are mapped to watchlist with a UNIQUE(user_id, org_id) constraint.")

    add_styled_heading(doc, "5.2 Normalization Proof (1NF, 2NF, 3NF)", 2)
    add_body_p(doc, "• First Normal Form (1NF): All attribute domains hold strictly atomic values. Multi-valued aliases are decoupled into threat_actor_aliases, and multiple data classes are isolated into breach_data_classes rather than comma-delimited strings.")
    add_body_p(doc, "• Second Normal Form (2NF): All tables are in 1NF and contain zero partial functional dependencies. In junction tables with composite primary keys (e.g., breach_threat_actors), the non-key attribute confidence_level is functionally dependent on the entire composite key (breach_id, actor_id), not any single part.")
    add_body_p(doc, "• Third Normal Form (3NF): All relations are in 2NF with zero transitive functional dependencies (X → Y where Y → Z). Attributes like severity and cvss_score are independent, and domain metadata is isolated from organizational metadata.")

    add_styled_heading(doc, "5.3 Relational Schema Diagram", 2)
    add_image_figure(doc, "extracted_images/relational_schema.png", "Figure 5.1: BreachVault Relational Schema Diagram (Relational Box Representation with Foreign Key Referential Arrows)", width_in=6.0)

    doc.add_page_break()

    # -------------------------------------------------------------
    # CHAPTER 6: SQL DATABASE COMMANDS
    # -------------------------------------------------------------
    add_styled_heading(doc, "6. SQL DATABASE COMMANDS (DDL, DML & QUERIES)", 1)
    add_body_p(doc, "6.1 Data Definition Language (DDL) Implementation:")
    add_body_p(doc, "Below is the SQL DDL script defining the 13 relational tables, complete with PRIMARY KEY, FOREIGN KEY, ON DELETE CASCADE, and domain CHECK constraints:")

    ddl_sample = """-- Table 1: users
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

-- Table 5: breaches (Core entity with vector embeddings)
CREATE TABLE breaches (
    breach_id             INT AUTO_INCREMENT PRIMARY KEY,
    breach_name           VARCHAR(200) NOT NULL,
    description           TEXT NOT NULL,
    breach_date           DATE,
    discovery_date        DATE,
    source_type           VARCHAR(30) CHECK (source_type IN (
                            'dark_web', 'paste_site', 'public_disclosure', 'insider'
                          )),
    severity              VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    cvss_score            DECIMAL(3,1) CHECK (cvss_score >= 0 AND cvss_score <= 10),
    records_exposed       BIGINT DEFAULT 0,
    attack_vector         VARCHAR(30) CHECK (attack_vector IN (
                            'sqli', 'phishing', 'rce', 'misconfiguration', 'insider', 'zero_day', 'credential_stuffing', 'unknown'
                          )),
    description_embedding JSON, -- or vector(384) in PostgreSQL pgvector
    ingested_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 10: compromised_credentials
CREATE TABLE compromised_credentials (
    cred_id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    breach_id       INT NOT NULL REFERENCES breaches(breach_id) ON DELETE CASCADE,
    domain_id       INT REFERENCES domains(domain_id) ON DELETE SET NULL,
    email_hash      VARCHAR(64) NOT NULL,
    credential_type VARCHAR(30) CHECK (credential_type IN ('password', 'api_key', 'token', 'session', 'certificate')),
    is_reused       BOOLEAN DEFAULT FALSE,
    discovered_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);"""
    add_code_block(doc, ddl_sample)

    add_body_p(doc, "Lab 4 Execution Terminal Output — Table Creation:")
    add_image_figure(doc, "extracted_images/page_9_img_1.png", "Figure 6.1: MySQL Terminal Execution: Database Setup, users, threat_actors, and threat_actor_aliases", width_in=5.8)
    add_image_figure(doc, "extracted_images/page_10_img_1.png", "Figure 6.2: MySQL Terminal Execution: data_classes, breaches, and breach_data_classes", width_in=5.8)
    add_image_figure(doc, "extracted_images/page_11_img_1.png", "Figure 6.3: MySQL Terminal Execution: organizations, domains, and compromised_credentials", width_in=5.8)
    add_image_figure(doc, "extracted_images/page_12_img_1.png", "Figure 6.4: MySQL Terminal Execution: watchlist and remediation_actions", width_in=5.8)
    add_image_figure(doc, "extracted_images/page_13_img_1.png", "Figure 6.5: MySQL Terminal Execution: audit_logs and Index Creation (idx_cred_email_hash, idx_cred_breach)", width_in=5.8)
    add_image_figure(doc, "extracted_images/page_14_img_1.png", "Figure 6.6: MySQL Terminal Execution: ALTER TABLE Statements (Verification column, checks, length mods)", width_in=5.8)
    add_image_figure(doc, "extracted_images/page_15_img_2.png", "Figure 6.7: MySQL SHOW TABLES: Verified 12 Application Tables Created Successfully", width_in=4.5)

    doc.add_page_break()

    # -------------------------------------------------------------
    # CHAPTER 7: ADVANCED SQL
    # -------------------------------------------------------------
    add_styled_heading(doc, "7. ADVANCED SQL: PROCEDURES, FUNCTIONS & TRIGGERS", 1)
    
    add_styled_heading(doc, "7.1 Stored Procedures & Functions", 2)
    add_body_p(doc, "1. sp_ingest_breach: Performs an atomic transaction to ingest a breach incident, associate multiple data classes in breach_data_classes, and insert an audit record into audit_logs.")
    add_body_p(doc, "2. fn_check_credential_exposure: Given an email SHA-256 hash, searches compromised_credentials joined with breaches and domains, returning all incidents where that user was compromised and whether the password was reused.")
    add_body_p(doc, "3. fn_calculate_org_risk_score: Dynamic weighted risk scoring function that evaluates an organization's cumulative exposure:")
    
    proc_sample = """-- Stored Procedure: Atomic Breach Ingestion with Audit Logging
CREATE OR REPLACE PROCEDURE sp_ingest_breach(
    p_name VARCHAR, p_description TEXT, p_breach_date DATE,
    p_source_type VARCHAR, p_severity VARCHAR, p_cvss NUMERIC,
    p_records BIGINT, p_attack_vec VARCHAR, p_data_classes INT[], p_user_id INT
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
END;
$$;"""
    add_code_block(doc, proc_sample)

    add_styled_heading(doc, "7.2 Database Triggers", 2)
    add_body_p(doc, "1. trg_detect_credential_reuse: Executed BEFORE/AFTER INSERT on compromised_credentials. If the inserted email_hash already exists in a different breach, sets is_reused = TRUE on both credentials and logs a CREDENTIAL_REUSE_DETECTED event to audit_logs.")
    add_body_p(doc, "2. trg_watchlist_alert: Executed AFTER INSERT on compromised_credentials. Automatically inspects whether any analyst is monitoring the organization via watchlist. If found, logs a WATCHLIST_ALERT event.")
    add_body_p(doc, "3. trg_update_actor_last_seen: Automatically refreshes the threat actor's last_seen date when a new breach is linked.")

    trigger_sample = """-- Trigger: Detect Credential Reuse Across Distinct Breaches
CREATE OR REPLACE FUNCTION trg_fn_detect_credential_reuse()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_match_count INT;
BEGIN
    SELECT COUNT(*) INTO v_match_count
    FROM compromised_credentials
    WHERE email_hash = NEW.email_hash
      AND breach_id != NEW.breach_id;

    IF v_match_count > 0 THEN
        NEW.is_reused := TRUE;
        UPDATE compromised_credentials
        SET is_reused = TRUE
        WHERE email_hash = NEW.email_hash;

        INSERT INTO audit_logs (user_id, action, target_table, target_id, details)
        VALUES (1, 'CREDENTIAL_REUSE_DETECTED', 'compromised_credentials', NEW.cred_id,
                'Email hash ' || SUBSTRING(NEW.email_hash, 1, 8) || '... reused across breaches');
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_detect_credential_reuse
BEFORE INSERT ON compromised_credentials
FOR EACH ROW EXECUTE FUNCTION trg_fn_detect_credential_reuse();"""
    add_code_block(doc, trigger_sample)

    doc.add_page_break()

    # -------------------------------------------------------------
    # CHAPTER 8: VECTOR DATABASE
    # -------------------------------------------------------------
    add_styled_heading(doc, "8. NOSQL / VECTOR DATABASE IMPLEMENTATION", 1)
    add_body_p(doc, "As required by the Level 3 Option 2 rubric (SQL + Vector Database), BreachVault implements semantic search using the PostgreSQL pgvector extension.")
    
    add_styled_heading(doc, "8.1 Vector Model & Configuration", 2)
    add_body_p(doc, "• Data Converted: The free-form narrative description of each breach incident.")
    add_body_p(doc, "• Embedding Model: sentence-transformers/all-MiniLM-L6-v2 mapping textual narratives into 384-dimensional dense vectors.")
    add_body_p(doc, "• Storage: Stored directly in table breaches under description_embedding vector(384).")
    add_body_p(doc, "• Indexing: IVFFlat index using vector_cosine_ops with lists=10 for fast approximate nearest neighbor search.")
    add_body_p(doc, "• Distance Metric: Cosine Distance (<=>), where Similarity = 1 - (u <=> v).")

    vector_sql = """-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add 384-dimensional dense vector column
ALTER TABLE breaches ADD COLUMN description_embedding vector(384);

-- 3. Create IVFFlat Approximate Nearest Neighbor (ANN) Index
CREATE INDEX idx_breach_embedding ON breaches
USING ivfflat (description_embedding vector_cosine_ops)
WITH (lists = 10);

-- 4. Query: Find 5 Most Similar Historical Breaches to Breach #1
SELECT
    b.breach_id,
    b.breach_name,
    b.severity,
    b.breach_date,
    b.records_exposed,
    ROUND((1 - (b.description_embedding <=> target.emb))::NUMERIC, 4) AS similarity_score
FROM breaches b,
     (SELECT description_embedding AS emb FROM breaches WHERE breach_id = 1) AS target
WHERE b.breach_id != 1
  AND b.description_embedding IS NOT NULL
ORDER BY b.description_embedding <=> target.emb ASC
LIMIT 5;"""
    add_code_block(doc, vector_sql)

    doc.add_page_break()

    # -------------------------------------------------------------
    # CHAPTER 9: NEXT.JS APPLICATION ARCHITECTURE
    # -------------------------------------------------------------
    add_styled_heading(doc, "9. NEXT.JS APPLICATION ARCHITECTURE & TREE STRUCTURE", 1)
    add_body_p(doc, "The web application interface is engineered with Next.js 15 (App Router), React 19, and Tailwind CSS. It communicates with the database layer through server-side Route Handlers with secure environment variable isolation.")

    tree_str = """breachvault/
├── package.json                   # Dependencies (Next 15, React 19, Lucide, MySQL2, PG)
├── next.config.js                 # Next.js configuration
├── jsconfig.json                  # Path aliases (@/* -> ./src/*)
├── .env.example                   # Environment configuration template
├── .env.local                     # Local database connection credentials
├── sql/
│   ├── breachvault_complete.sql   # Complete single-file SQL setup
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
    │   ├── breaches/
    │   │   └── page.jsx           # Breach Explorer & Ingestion Modal (sp_ingest_breach)
    │   ├── credentials/
    │   │   └── page.jsx           # Credential Exposure Lookup (fn_check_credential_exposure)
    │   ├── semantic-search/
    │   │   └── page.jsx           # pgvector Vector Similarity Search (<=> operator)
    │   ├── threat-actors/
    │   │   └── page.jsx           # Threat Actor Dossiers, Aliases & TTPs
    │   ├── organizations/
    │   │   └── page.jsx           # Enterprise Exposure, Risk Scores & Watchlist
    │   ├── remediation/
    │   │   └── page.jsx           # Incident Containment & Action Tracking
    │   ├── audit-logs/
    │   │   └── page.jsx           # Security Audit Trail (audit_logs stream)
    │   └── api/
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
        └── seedData.js            # Initialized database entities and vectors"""
    add_code_block(doc, tree_str)

    doc.add_page_break()

    # -------------------------------------------------------------
    # CHAPTER 10: APPLICATION SCREENSHOTS & EXPERIMENTAL DEMO
    # -------------------------------------------------------------
    add_styled_heading(doc, "10. APPLICATION SCREENSHOTS & EXPERIMENTAL DEMO", 1)
    add_body_p(doc, "Below are actual screenshots captured from the running Next.js application demo and code implementations:")

    add_image_figure(doc, "extracted_images/dash.png", "Figure 10.1: BreachVault Command Center Dashboard — Live Metrics, Critical Feeds, and Org Risk Scores", width_in=6.0)
    add_image_figure(doc, "extracted_images/breaches.png", "Figure 10.2: Breach Intelligence Explorer & Ingestion Modal (Executing sp_ingest_breach)", width_in=6.0)
    add_image_figure(doc, "extracted_images/credentials.png", "Figure 10.3: Leaked Credential Exposure Lookup — SHA-256 Hashing & Password Reuse Warning", width_in=6.0)
    add_image_figure(doc, "extracted_images/vector_search.png", "Figure 10.4: Vector Semantic Similarity Search — Cosine Distance (<=>) & Playbook Recommendations", width_in=6.0)
    add_image_figure(doc, "extracted_images/threat_actors.png", "Figure 10.5: Threat Actor Intelligence Profiles — Aliases, Motivations, and Origin Countries", width_in=6.0)
    add_image_figure(doc, "extracted_images/audit_trail.png", "Figure 10.6: Immutable Database Security Audit Trail (audit_logs populated by Triggers)", width_in=6.0)
    add_image_figure(doc, "extracted_images/code_vector_js.png", "Figure 10.7: Next.js Backend Code: 384-Dimensional Cosine Similarity Math Engine (vector.js)", width_in=5.8)
    add_image_figure(doc, "extracted_images/code_api_breaches.png", "Figure 10.8: Next.js API Route Handler: Ingesting Breaches and Triggering Stored Procedures", width_in=5.8)

    doc.add_page_break()

    # -------------------------------------------------------------
    # CHAPTER 11: CONCLUSION & REFERENCES
    # -------------------------------------------------------------
    add_styled_heading(doc, "11. CONCLUSION & REFERENCES", 1)
    add_body_p(doc, "BreachVault successfully demonstrates the seamless synergy of a Relational SQL Database with a high-performance Vector Database. By modeling 13 entities in 3NF, developing server-side stored procedures, automated integrity triggers, analytical views, and an intuitive Next.js 15 user interface, the system solves real-world challenges in dark web intelligence beyond standard CRUD limitations.")
    
    add_styled_heading(doc, "Individual Database & Backend Contributions:", 2)
    add_body_p(doc, "• A S Vincent (PES2UG24CS002) — Lead Transactional DB & Vector Architecture: Designed 3NF entity-relationship schema (breaches, threat_actors, audit_logs), developed atomic stored procedure sp_ingest_breach with rollback exception handling, engineered pgvector 384-dimensional semantic similarity engine with IVFFlat cosine distance indexing (<=>), built security audit trigger trg_audit_breach_insert, and implemented server-side database controller connection pooling and ingestion APIs.")
    add_body_p(doc, "• Akshat Kumar (PES2UG24CS046) — Lead Analytical DB & Stored Functions: Designed enterprise and credential schemas (organizations, compromised_credentials, remediation), developed stored functions fn_check_credential_exposure (SHA-256 hash lookup) and fn_calculate_org_risk_score (weighted mathematical scoring model), created complex analytical views (v_high_risk_organizations, v_threat_actor_profiles, v_breach_timeline), configured B-Tree index optimization, implemented trg_watchlist_alert triggers, and built query verification pipelines.")

    add_styled_heading(doc, "References:", 2)
    add_body_p(doc, "[1] R. Elmasri and S. B. Navathe, Fundamentals of Database Systems, 7th ed. Pearson, 2016.")
    add_body_p(doc, "[2] PostgreSQL Global Development Group, 'pgvector: Open-source vector similarity search for Postgres', 2024. [Online]. Available: https://github.com/pgvector/pgvector")
    add_body_p(doc, "[3] Next.js Documentation, 'App Router, Server Components, and Route Handlers', Vercel, 2024. [Online]. Available: https://nextjs.org/docs")
    add_body_p(doc, "[4] MITRE Corporation, 'MITRE ATT&CK: Enterprise Tactics and Techniques', 2024. [Online]. Available: https://attack.mitre.org")

    output_filename = "DBMS_Project_Report_BreachVault_002_046.docx"
    doc.save(output_filename)
    print(f"Report successfully generated and saved to: {output_filename}")

if __name__ == "__main__":
    build_report()

