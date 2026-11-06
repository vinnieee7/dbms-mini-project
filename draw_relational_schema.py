import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Setup figure with high DPI
fig, ax = plt.subplots(figsize=(15, 12), dpi=200)
ax.set_facecolor('#ffffff')
fig.patch.set_facecolor('#ffffff')

# Define tables and their attributes
# Underlined / bold are PKs
tables = [
    {
        "id": "users",
        "name": "Users",
        "text": "Users ( user_id, username, email, password_hash, role, created_at, last_login )",
        "pk": "user_id",
        "pos": (0.05, 0.90),
        "width": 0.42,
        "height": 0.045
    },
    {
        "id": "threat_actors",
        "name": "Threat_Actors",
        "text": "Threat_Actors ( actor_id, name, origin_country, motivation, risk_level, first_seen, last_seen )",
        "pk": "actor_id",
        "pos": (0.53, 0.90),
        "width": 0.42,
        "height": 0.045
    },
    {
        "id": "threat_actor_aliases",
        "name": "Threat_Actor_Aliases",
        "text": "Threat_Actor_Aliases ( alias_id, actor_id, alias_name, platform )",
        "pk": "alias_id",
        "pos": (0.53, 0.81),
        "width": 0.42,
        "height": 0.045
    },
    {
        "id": "data_classes",
        "name": "Data_Classes",
        "text": "Data_Classes ( class_id, class_name, sensitivity_level )",
        "pk": "class_id",
        "pos": (0.05, 0.72),
        "width": 0.42,
        "height": 0.045
    },
    {
        "id": "breach_threat_actors",
        "name": "Breach_Threat_Actors",
        "text": "Breach_Threat_Actors ( breach_id, actor_id, confidence_level )",
        "pk": "breach_id, actor_id",
        "pos": (0.53, 0.72),
        "width": 0.42,
        "height": 0.045
    },
    {
        "id": "breaches",
        "name": "Breaches",
        "text": "Breaches ( breach_id, breach_name, breach_date, discovery_date, source_type, severity, cvss_score, records_exposed, attack_vector, description_embedding )",
        "pk": "breach_id",
        "pos": (0.05, 0.61),
        "width": 0.90,
        "height": 0.048
    },
    {
        "id": "breach_data_classes",
        "name": "Breach_Data_Classes",
        "text": "Breach_Data_Classes ( breach_id, class_id )",
        "pk": "breach_id, class_id",
        "pos": (0.05, 0.51),
        "width": 0.38,
        "height": 0.045
    },
    {
        "id": "organizations",
        "name": "Organizations",
        "text": "Organizations ( org_id, org_name, industry, country, employee_count, risk_tier )",
        "pk": "org_id",
        "pos": (0.48, 0.51),
        "width": 0.47,
        "height": 0.045
    },
    {
        "id": "domains",
        "name": "Domains",
        "text": "Domains ( domain_id, org_id, domain_name, is_primary )",
        "pk": "domain_id",
        "pos": (0.48, 0.41),
        "width": 0.47,
        "height": 0.045
    },
    {
        "id": "compromised_credentials",
        "name": "Compromised_Credentials",
        "text": "Compromised_Credentials ( cred_id, breach_id, domain_id, email_hash, credential_type, is_reused, discovered_at )",
        "pk": "cred_id",
        "pos": (0.05, 0.30),
        "width": 0.90,
        "height": 0.048
    },
    {
        "id": "watchlist",
        "name": "Watchlist",
        "text": "Watchlist ( watch_id, user_id, org_id, watch_type, alert_enabled, created_at )",
        "pk": "watch_id",
        "pos": (0.05, 0.19),
        "width": 0.44,
        "height": 0.045
    },
    {
        "id": "remediation_actions",
        "name": "Remediation_Actions",
        "text": "Remediation_Actions ( action_id, breach_id, user_id, action_type, description, status, created_at, resolved_at )",
        "pk": "action_id",
        "pos": (0.52, 0.19),
        "width": 0.43,
        "height": 0.045
    },
    {
        "id": "audit_logs",
        "name": "Audit_Logs",
        "text": "Audit_Logs ( log_id, user_id, action, target_table, target_id, details, performed_at )",
        "pk": "log_id",
        "pos": (0.05, 0.08),
        "width": 0.90,
        "height": 0.045
    }
]

# Draw title
ax.text(0.5, 0.975, "BreachVault — Relational Database Schema Diagram", 
        fontsize=16, fontweight='bold', ha='center', va='center', color='#1b5e20')

# Store box coordinates for arrow routing
coords = {}

# Draw boxes
for t in tables:
    x, y = t["pos"]
    w = t["width"]
    t_h = t["height"]
    coords[t["id"]] = {
        "x": x, "y": y, "w": w, "h": t_h,
        "top": (x + w/2, y + t_h),
        "bottom": (x + w/2, y),
        "left": (x, y + t_h/2),
        "right": (x + w, y + t_h/2)
    }
    
    # Draw green rectangle matching user's reference
    rect = patches.FancyBboxPatch(
        (x, y), w, t_h,
        boxstyle="round,pad=0.006,rounding_size=0.008",
        facecolor='#2e7d32', edgecolor='#1b5e20', linewidth=1.5,
        zorder=2
    )
    ax.add_patch(rect)
    
    # Text inside box
    ax.text(
        x + w/2, y + t_h/2, t["text"],
        color='#ffffff', fontsize=8.5, fontweight='bold',
        ha='center', va='center', zorder=3
    )

# Define Foreign Key Arrows (from referencing table attribute to referenced table primary key)
# Matches reference image arrow style
arrows = [
    # threat_actor_aliases.actor_id -> threat_actors.actor_id
    ("threat_actor_aliases", "threat_actors", (0.74, 0.855), (0.74, 0.90)),
    
    # breach_threat_actors.actor_id -> threat_actors.actor_id
    ("breach_threat_actors", "threat_actors", (0.95, 0.742), (0.95, 0.92)),
    
    # breach_threat_actors.breach_id -> breaches.breach_id
    ("breach_threat_actors", "breaches", (0.65, 0.72), (0.65, 0.658)),
    
    # breach_data_classes.class_id -> data_classes.class_id
    ("breach_data_classes", "data_classes", (0.24, 0.555), (0.24, 0.72)),
    
    # breach_data_classes.breach_id -> breaches.breach_id
    ("breach_data_classes", "breaches", (0.15, 0.555), (0.15, 0.61)),
    
    # domains.org_id -> organizations.org_id
    ("domains", "organizations", (0.71, 0.455), (0.71, 0.51)),
    
    # compromised_credentials.breach_id -> breaches.breach_id
    ("compromised_credentials", "breaches", (0.03, 0.324), (0.03, 0.634)),
    
    # compromised_credentials.domain_id -> domains.domain_id
    ("compromised_credentials", "domains", (0.75, 0.348), (0.75, 0.41)),
    
    # watchlist.user_id -> users.user_id
    ("watchlist", "users", (0.02, 0.212), (0.02, 0.922)),
    
    # watchlist.org_id -> organizations.org_id
    ("watchlist", "organizations", (0.45, 0.235), (0.55, 0.51)),
    
    # remediation_actions.breach_id -> breaches.breach_id
    ("remediation_actions", "breaches", (0.97, 0.212), (0.97, 0.634)),
    
    # remediation_actions.user_id -> users.user_id
    ("remediation_actions", "users", (0.52, 0.212), (0.40, 0.90)),
    
    # audit_logs.user_id -> users.user_id
    ("audit_logs", "users", (0.01, 0.102), (0.01, 0.922))
]

for src_table, dst_table, start_pt, end_pt in arrows:
    con = patches.ConnectionPatch(
        xyA=end_pt, xyB=start_pt,
        coordsA="data", coordsB="data",
        arrowstyle="-|>", mutation_scale=11,
        color="#111111", linewidth=1.2,
        connectionstyle="arc3,rad=0.05",
        zorder=4
    )
    ax.add_patch(con)

ax.set_xlim(-0.01, 1.01)
ax.set_ylim(0.04, 1.00)
ax.axis('off')

plt.tight_layout()
output_img = "c:/Users/vincent/Downloads/DBMS_miniproject/extracted_images/relational_schema.png"
plt.savefig(output_img, dpi=250, bbox_inches='tight')
print("Successfully generated:", output_img)
