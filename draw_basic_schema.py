import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Set up figure
fig, ax = plt.subplots(figsize=(10, 11), dpi=220)
ax.set_facecolor('#ffffff')
fig.patch.set_facecolor('#ffffff')

# 7 Core Tables - Basic, clean, standard university DBMS style
# Stacked vertically in a single central column just like the reference image
tables = [
    {
        "id": "users",
        "name": "Users",
        "text": "Users ( user_id, username, email, role )",
        "y": 0.88
    },
    {
        "id": "threat_actors",
        "name": "Threat_Actors",
        "text": "Threat_Actors ( actor_id, name, origin_country, motivation, risk_level )",
        "y": 0.75
    },
    {
        "id": "breach_threat_actors",
        "name": "Breach_Threat_Actors",
        "text": "Breach_Threat_Actors ( breach_id, actor_id, confidence_level )",
        "y": 0.62
    },
    {
        "id": "breaches",
        "name": "Breaches",
        "text": "Breaches ( breach_id, breach_name, severity, cvss_score, records_exposed, attack_vector )",
        "y": 0.49
    },
    {
        "id": "organizations",
        "name": "Organizations",
        "text": "Organizations ( org_id, org_name, industry, country, risk_tier )",
        "y": 0.36
    },
    {
        "id": "domains",
        "name": "Domains",
        "text": "Domains ( domain_id, org_id, domain_name )",
        "y": 0.23
    },
    {
        "id": "compromised_credentials",
        "name": "Compromised_Credentials",
        "text": "Compromised_Credentials ( cred_id, breach_id, domain_id, email_hash, credential_type, is_reused )",
        "y": 0.10
    }
]

box_x = 0.14
box_w = 0.72
box_h = 0.055

coords = {}

# Draw boxes matching reference image (green rectangle, white bold text)
for t in tables:
    y = t["y"]
    coords[t["id"]] = y
    
    rect = patches.FancyBboxPatch(
        (box_x, y), box_w, box_h,
        boxstyle="round,pad=0.005,rounding_size=0.006",
        facecolor='#388e3c', edgecolor='#1b5e20', linewidth=1.5,
        zorder=2
    )
    ax.add_patch(rect)
    
    ax.text(
        box_x + box_w/2, y + box_h/2, t["text"],
        color='#ffffff', fontsize=9.5, fontweight='bold',
        ha='center', va='center', zorder=3,
        family='sans-serif'
    )

# Foreign key arrows matching reference image style
# (pointing from FK attribute to the referenced table / PK)
arrows = [
    # Breach_Threat_Actors.actor_id -> Threat_Actors.actor_id (upward)
    ((box_x + 0.45, 0.62 + box_h), (box_x + 0.45, 0.75)),
    
    # Breach_Threat_Actors.breach_id -> Breaches.breach_id (downward)
    ((box_x + 0.25, 0.62), (box_x + 0.25, 0.49 + box_h)),
    
    # Domains.org_id -> Organizations.org_id (upward)
    ((box_x + 0.35, 0.23 + box_h), (box_x + 0.35, 0.36)),
    
    # Compromised_Credentials.domain_id -> Domains.domain_id (upward)
    ((box_x + 0.55, 0.10 + box_h), (box_x + 0.55, 0.23)),
    
    # Compromised_Credentials.breach_id -> Breaches.breach_id (left side loop)
    ((box_x, 0.10 + box_h/2), (box_x, 0.49 + box_h/2), "left", 0.06),
]

# Draw straight vertical arrows
for start_pt, end_pt in arrows[:4]:
    ax.annotate(
        "", xy=end_pt, xytext=start_pt,
        arrowprops=dict(
            arrowstyle="-|>", color="#111111", lw=1.3,
            mutation_scale=12
        ),
        zorder=4
    )

# Draw side looping arrow for breach_id from Compromised_Credentials to Breaches
# (starts at left of Credentials, goes left, goes up, goes right into Breaches)
p_cred = arrows[4][0]
p_breach = arrows[4][1]
loop_x = arrows[4][3]

path_x = [p_cred[0], loop_x, loop_x, p_breach[0]]
path_y = [p_cred[1], p_cred[1], p_breach[1], p_breach[1]]

ax.plot(path_x[:-1], path_y[:-1], color='#111111', lw=1.3, zorder=4)
ax.annotate(
    "", xy=(p_breach[0], p_breach[1]), xytext=(loop_x, p_breach[1]),
    arrowprops=dict(
        arrowstyle="-|>", color="#111111", lw=1.3,
        mutation_scale=12
    ),
    zorder=4
)

ax.set_xlim(0.0, 1.0)
ax.set_ylim(0.04, 0.98)
ax.axis('off')

plt.tight_layout()
output_img = "c:/Users/vincent/Downloads/DBMS_miniproject/extracted_images/relational_schema.png"
plt.savefig(output_img, dpi=250, bbox_inches='tight')
print("Successfully generated basic schema image:", output_img)
