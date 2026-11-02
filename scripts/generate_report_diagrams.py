"""
CarbonIQ Report Diagram Generator
Generates high-resolution academic figures (300 DPI) for the final project report.
"""
import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'docs', 'figures')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Common styling palette
PRIMARY = '#176B4D'      # Forest Green
SECONDARY = '#104B38'    # Deep Forest
ACCENT = '#2BB673'       # Emerald Mint
SURFACE = '#F4F9F6'      # Light Mint Surface
CARD_BG = '#FFFFFF'      # Pure White Card
TEXT_MAIN = '#111827'    # Charcoal
TEXT_MUTED = '#4B5563'   # Muted Gray
BORDER = '#D1D5DB'       # Border Gray
DB_BLUE = '#1E40AF'      # Blue for Database Tier
AI_PURPLE = '#6D28D9'    # Purple for AI Tier

plt.rcParams['font.sans-serif'] = 'DejaVu Sans'
plt.rcParams['font.family'] = 'sans-serif'

def save_fig(fig, filename):
    filepath = os.path.join(OUTPUT_DIR, filename)
    fig.savefig(filepath, dpi=300, bbox_inches='tight')
    plt.close(fig)
    print(f"[OK] Generated {filename}")

# ----------------------------------------------------------------------
# FIGURE 3.1: Overall System Architecture
# ----------------------------------------------------------------------
def generate_system_architecture():
    fig, ax = plt.subplots(figsize=(10, 6.5))
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # Background
    ax.add_patch(patches.Rectangle((0, 0), 100, 100, color='#F8FAFC', zorder=0))

    # Title Banner
    ax.text(50, 95, "Figure 3.1: CarbonIQ 4-Tier System Architecture", 
            ha='center', va='center', fontsize=14, fontweight='bold', color=SECONDARY)

    # 1. Client Tier (Frontend)
    ax.add_patch(patches.FancyBboxPatch((5, 68), 90, 20, boxstyle="round,pad=1", 
                                        edgecolor=PRIMARY, facecolor='#E8F5E9', linewidth=1.5, zorder=1))
    ax.text(8, 84, "PRESENTATION TIER (Client Web App)", fontsize=11, fontweight='bold', color=PRIMARY)
    ax.text(8, 79, "• React 18 SPA + Vite 5 Build Engine   • Tailwind CSS SaaS Theme (Forest Green / Mint)", fontsize=9.5, color=TEXT_MAIN)
    ax.text(8, 74, "• Recharts Data Visualizations (Area Trends, Donut Categorical Share)   • Lucide Icons", fontsize=9.5, color=TEXT_MAIN)
    ax.text(8, 69, "• Workspace Context (Personal / Org Scoping) & LocalStorage JWT Session Management", fontsize=9.5, color=TEXT_MAIN)

    # Communication Arrows: Client <-> Backend
    ax.annotate("", xy=(30, 48), xytext=(30, 68),
                arrowprops=dict(arrowstyle="<->", color=PRIMARY, lw=2))
    ax.text(32, 58, "HTTPS / REST APIs + JWT Auth + Workspace Scoping Headers", fontsize=8.5, fontweight='bold', color=PRIMARY, va='center')

    # 2. Application Tier (Backend)
    ax.add_patch(patches.FancyBboxPatch((5, 28), 45, 20, boxstyle="round,pad=1", 
                                        edgecolor='#0284C7', facecolor='#F0F9FF', linewidth=1.5, zorder=1))
    ax.text(8, 44, "APPLICATION TIER (REST API Backend)", fontsize=10.5, fontweight='bold', color='#0369A1')
    ax.text(8, 39, "• Node.js & Express Modular MVC Architecture", fontsize=8.5, color=TEXT_MAIN)
    ax.text(8, 35, "• Bcrypt Password Hashing (12 Salt Rounds)", fontsize=8.5, color=TEXT_MAIN)
    ax.text(8, 31, "• Deterministic Arithmetic Calculation Engine", fontsize=8.5, color=TEXT_MAIN)
    ax.text(8, 27, "• Multi-Tenant Isolation Middleware (resolveWorkspaceScope)", fontsize=8.5, color=TEXT_MAIN)

    # Communication Arrows: Backend <-> AI Microservice
    ax.annotate("", xy=(50, 38), xytext=(55, 38),
                arrowprops=dict(arrowstyle="<->", color=AI_PURPLE, lw=2))
    ax.text(52.5, 41, "JSON (Port 8000)", fontsize=7.5, fontweight='bold', color=AI_PURPLE, ha='center')

    # 3. AI Microservice Tier
    ax.add_patch(patches.FancyBboxPatch((55, 28), 40, 20, boxstyle="round,pad=1", 
                                        edgecolor=AI_PURPLE, facecolor='#FAF5FF', linewidth=1.5, zorder=1))
    ax.text(58, 44, "AI ADVISORY MICROSERVICE (FastAPI)", fontsize=10.5, fontweight='bold', color=AI_PURPLE)
    ax.text(58, 39, "• Python 3.14 + FastAPI Microservice", fontsize=8.5, color=TEXT_MAIN)
    ax.text(58, 35, "• Pydantic Strict Payload Schema Validation", fontsize=8.5, color=TEXT_MAIN)
    ax.text(58, 31, "• Google Gemini 2.5 API with Privacy Masking", fontsize=8.5, color=TEXT_MAIN)
    ax.text(58, 27, "• Deterministic Rule-Based Heuristic Fallback", fontsize=8.5, color=TEXT_MAIN)

    # Communication Arrows: Backend <-> Database
    ax.annotate("", xy=(27, 20), xytext=(27, 28),
                arrowprops=dict(arrowstyle="<->", color=DB_BLUE, lw=2))
    ax.text(29, 24, "TCP Connection Pool (pg.Pool / 5432)", fontsize=8.5, fontweight='bold', color=DB_BLUE, va='center')

    # 4. Database Tier
    ax.add_patch(patches.FancyBboxPatch((5, 2), 90, 18, boxstyle="round,pad=1", 
                                        edgecolor=DB_BLUE, facecolor='#EFF6FF', linewidth=1.5, zorder=1))
    ax.text(8, 16.5, "DATABASE PERSISTENCE TIER (PostgreSQL 18.6 Enterprise)", fontsize=11, fontweight='bold', color=DB_BLUE)
    ax.text(8, 12, "• 13 3NF Tables with UUID PKs, Strict FK Cascades, and Table-Level CHECK Constraints", fontsize=8.5, color=TEXT_MAIN)
    ax.text(8, 8, "• ACID Atomic Transactions   • 10 Triggers (JSONB Audit Trails)   • 4 SQL Analytical Views", fontsize=8.5, color=TEXT_MAIN)
    ax.text(8, 4, "• Stored Procedures (sp_record_activity_with_emissions)   • 31 B-Tree Indexes (EXPLAIN ANALYZE Optimized)", fontsize=8.5, color=TEXT_MAIN)

    save_fig(fig, 'fig3_1_system_architecture.png')

# ----------------------------------------------------------------------
# FIGURE 3.2: Data Flow Diagram (Level 0 / Level 1)
# ----------------------------------------------------------------------
def generate_data_flow_diagram():
    fig, ax = plt.subplots(figsize=(10, 6.5))
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    ax.add_patch(patches.Rectangle((0, 0), 100, 100, color='#F8FAFC', zorder=0))

    ax.text(50, 96, "Figure 3.2: CarbonIQ Data Flow Diagram (DFD Level 1)", 
            ha='center', va='center', fontsize=13, fontweight='bold', color=SECONDARY)

    # Entities
    def draw_entity(x, y, w, h, title):
        ax.add_patch(patches.Rectangle((x, y), w, h, edgecolor='#374151', facecolor='#E5E7EB', lw=1.5))
        ax.text(x + w/2, y + h/2, title, ha='center', va='center', fontsize=9, fontweight='bold', color=TEXT_MAIN)

    # Processes
    def draw_process(x, y, r, pid, title):
        circle = patches.Circle((x, y), r, edgecolor=PRIMARY, facecolor='#ECFDF5', lw=1.5)
        ax.add_patch(circle)
        ax.text(x, y + 2, pid, ha='center', va='center', fontsize=8.5, fontweight='bold', color=SECONDARY)
        ax.text(x, y - 2, title, ha='center', va='center', fontsize=7.5, color=TEXT_MAIN)

    # Stores
    def draw_store(x, y, w, h, sid, title):
        ax.plot([x, x+w], [y+h, y+h], color='#1E3A8A', lw=1.5)
        ax.plot([x, x+w], [y, y], color='#1E3A8A', lw=1.5)
        ax.fill_between([x, x+w], [y, y], [y+h, y+h], color='#EFF6FF')
        ax.text(x + 3, y + h/2, sid, ha='left', va='center', fontsize=8, fontweight='bold', color='#1E3A8A')
        ax.text(x + 12, y + h/2, title, ha='left', va='center', fontsize=8, color=TEXT_MAIN)

    # Draw Entities
    draw_entity(3, 70, 18, 12, "User / Org Admin\n(Web Client)")
    draw_entity(78, 25, 18, 12, "AI Advisory Service\n(FastAPI / Gemini)")

    # Draw Processes
    draw_process(35, 76, 7.5, "P1.0", "Auth & Workspace\nResolution")
    draw_process(65, 76, 7.5, "P2.0", "Activity Logging &\nLive Preview")
    draw_process(65, 45, 7.5, "P3.0", "ACID Emission\nCalculation Engine")
    draw_process(35, 45, 7.5, "P4.0", "Analytical Views &\nReporting Engine")
    draw_process(65, 15, 7.5, "P5.0", "AI Recommendation\n& Advisory")

    # Draw Data Stores
    draw_store(3, 25, 24, 7, "D1", "users / organizations")
    draw_store(35, 25, 24, 7, "D2", "emission_factors")
    draw_store(3, 10, 24, 7, "D3", "activities / emission_records")
    draw_store(35, 10, 24, 7, "D4", "audit_logs / goals")

    # Connectors & Annotations
    ax.annotate("", xy=(27.5, 76), xytext=(21, 76), arrowprops=dict(arrowstyle="->", color=TEXT_MAIN, lw=1.2))
    ax.text(24, 78, "Credentials", fontsize=7, ha='center')

    ax.annotate("", xy=(42.5, 76), xytext=(57.5, 76), arrowprops=dict(arrowstyle="->", color=TEXT_MAIN, lw=1.2))
    ax.text(50, 78, "Validated Scope", fontsize=7, ha='center')

    ax.annotate("", xy=(65, 52.5), xytext=(65, 68.5), arrowprops=dict(arrowstyle="->", color=TEXT_MAIN, lw=1.2))
    ax.text(66, 60, "Activity Payload", fontsize=7, ha='left')

    ax.annotate("", xy=(57.5, 45), xytext=(42.5, 45), arrowprops=dict(arrowstyle="->", color=TEXT_MAIN, lw=1.2))
    ax.text(50, 47, "Footprint Record", fontsize=7, ha='center')

    ax.annotate("", xy=(65, 22.5), xytext=(65, 37.5), arrowprops=dict(arrowstyle="->", color=TEXT_MAIN, lw=1.2))
    ax.text(66, 30, "Aggregated KPIs", fontsize=7, ha='left')

    ax.annotate("", xy=(78, 28), xytext=(72.5, 18), arrowprops=dict(arrowstyle="<->", color=AI_PURPLE, lw=1.2))
    ax.text(78, 18, "Anonymized Metrics\n& Structured Recs", fontsize=7, ha='left', color=AI_PURPLE)

    save_fig(fig, 'fig3_2_data_flow_diagram.png')

# ----------------------------------------------------------------------
# FIGURE 3.3: Entity Relationship (ER) Diagram
# ----------------------------------------------------------------------
def generate_er_diagram():
    fig, ax = plt.subplots(figsize=(11, 7.5))
    ax.set_xlim(0, 110)
    ax.set_ylim(0, 100)
    ax.axis('off')
    ax.add_patch(patches.Rectangle((0, 0), 110, 100, color='#F8FAFC', zorder=0))

    ax.text(55, 97, "Figure 3.3: CarbonIQ Relational Entity Relationship Diagram (Crow's Foot 3NF)", 
            ha='center', va='center', fontsize=12.5, fontweight='bold', color=SECONDARY)

    def draw_table_card(x, y, w, h, title, fields, border_col='#2563EB'):
        ax.add_patch(patches.Rectangle((x, y), w, h, edgecolor=border_col, facecolor='#FFFFFF', lw=1.2, zorder=1))
        ax.add_patch(patches.Rectangle((x, y + h - 4.5), w, 4.5, edgecolor=border_col, facecolor=border_col, lw=1.2, zorder=2))
        ax.text(x + w/2, y + h - 2.25, title, ha='center', va='center', fontsize=7.5, fontweight='bold', color='#FFFFFF', zorder=3)
        y_text = y + h - 7
        for f in fields:
            ax.text(x + 1.5, y_text, f, ha='left', va='center', fontsize=6.2, color=TEXT_MAIN, zorder=3)
            y_text -= 2.6

    # Users & Orgs
    draw_table_card(5, 70, 24, 23, "users", 
                    ["PK id: UUID", "email: VARCHAR (UQ)", "password_hash: VARCHAR", "first_name, last_name", "role: VARCHAR", "created_at: TIMESTAMPTZ"])

    draw_table_card(38, 70, 26, 23, "organizations", 
                    ["PK id: UUID", "name: VARCHAR", "slug: VARCHAR (UQ)", "subscription_tier: VARCHAR", "created_at: TIMESTAMPTZ"])

    draw_table_card(73, 70, 28, 23, "organization_members", 
                    ["PK id: UUID", "FK organization_id: UUID", "FK user_id: UUID", "role: VARCHAR (admin/analyst)", "joined_at: TIMESTAMPTZ"])

    draw_table_card(73, 40, 28, 21, "departments", 
                    ["PK id: UUID", "FK organization_id: UUID", "name: VARCHAR", "code: VARCHAR", "created_at: TIMESTAMPTZ"])

    # Taxonomies & Factors
    draw_table_card(5, 38, 24, 24, "activity_categories", 
                    ["PK id: UUID", "code: VARCHAR (UQ)", "name: VARCHAR", "description: TEXT", "display_order: INT"])

    draw_table_card(38, 38, 26, 24, "activity_types", 
                    ["PK id: UUID", "FK category_id: UUID", "code: VARCHAR (UQ)", "name: VARCHAR", "unit_of_measure: VARCHAR", "scope: SMALLINT"])

    draw_table_card(5, 5, 26, 26, "emission_factors", 
                    ["PK id: UUID", "FK activity_type_id: UUID", "FK source_id: UUID", "factor_value: NUMERIC(14,6)", "region_code: VARCHAR", "effective_start: DATE"])

    # Ledger & Calculations
    draw_table_card(38, 5, 32, 27, "activities", 
                    ["PK id: UUID", "FK user_id: UUID (Nullable)", "FK organization_id: UUID (Nullable)", "FK department_id: UUID", "FK activity_type_id: UUID", "quantity: NUMERIC(14,4)", "activity_date: DATE", "CHK: user_id XOR org_id"])

    draw_table_card(75, 5, 30, 27, "emission_records", 
                    ["PK id: UUID", "FK activity_id: UUID (UQ/CASCADE)", "FK emission_factor_id: UUID", "emission_factor_snapshot: NUM(14,6)", "factor_source_snapshot: VARCHAR", "calculated_co2e_kg: NUMERIC(16,4)"])

    # Relationship connectors
    ax.plot([29, 38], [80, 80], color='#4B5563', lw=1, ls='--')
    ax.text(33.5, 81.5, "1 : M", fontsize=6, ha='center')

    ax.plot([64, 73], [80, 80], color='#4B5563', lw=1)
    ax.text(68.5, 81.5, "1 : M", fontsize=6, ha='center')

    ax.plot([50, 73], [70, 50], color='#4B5563', lw=1)
    ax.text(60, 58, "1 : M", fontsize=6, ha='center')

    ax.plot([29, 38], [50, 50], color='#4B5563', lw=1)
    ax.text(33.5, 51.5, "1 : M", fontsize=6, ha='center')

    ax.plot([50, 50], [38, 32], color='#4B5563', lw=1)
    ax.text(52, 35, "1 : M", fontsize=6)

    ax.plot([70, 75], [18, 18], color='#DC2626', lw=1.5)
    ax.text(72.5, 19.5, "1 : 1", fontsize=6.5, ha='center', fontweight='bold', color='#DC2626')

    save_fig(fig, 'fig3_3_entity_relationship_diagram.png')

# ----------------------------------------------------------------------
# FIGURE 3.4: Activity and Emission Calculation Workflow
# ----------------------------------------------------------------------
def generate_calculation_workflow():
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    ax.add_patch(patches.Rectangle((0, 0), 100, 100, color='#F8FAFC', zorder=0))

    ax.text(50, 95, "Figure 3.4: Activity Logging & Deterministic Emission Calculation Workflow", 
            ha='center', va='center', fontsize=12, fontweight='bold', color=SECONDARY)

    steps = [
        ("Step 1: User Input & Unit Hint", "Selects Category (e.g., Grid Electricity) & enters quantity (kWh) in React Modal wizard.", 82),
        ("Step 2: Debounced Live Preview", "Client calls POST /api/v1/emissions/preview. Backend evaluates factor without DB commit.", 66),
        ("Step 3: Workspace & Scoping Check", "resolveWorkspaceScope middleware verifies user authorization for personal or org workspace.", 50),
        ("Step 4: ACID Transaction Initiation", "db.withTransaction(async client => { ... }) executes BEGIN statement.", 34),
        ("Step 5: Multi-Table Atomic Commit", "INSERT INTO activities + INSERT INTO emission_records with frozen factor snapshot. COMMIT.", 18),
        ("Step 6: Trigger & Response Delivery", "trg_audit_activities writes JSONB state to audit_logs. 201 Created sent to client.", 2)
    ]

    for title, desc, y in steps:
        ax.add_patch(patches.FancyBboxPatch((8, y), 84, 11, boxstyle="round,pad=0.8", 
                                            edgecolor=PRIMARY, facecolor='#FFFFFF', lw=1.2))
        ax.text(11, y + 7.5, title, fontsize=8.5, fontweight='bold', color=PRIMARY)
        ax.text(11, y + 3, desc, fontsize=7.5, color=TEXT_MAIN)
        if y > 10:
            ax.annotate("", xy=(50, y - 1), xytext=(50, y + 0.5), arrowprops=dict(arrowstyle="->", color=PRIMARY, lw=1.2))

    save_fig(fig, 'fig3_4_calculation_workflow.png')

# ----------------------------------------------------------------------
# FIGURE 3.5: AI Recommendation Workflow
# ----------------------------------------------------------------------
def generate_ai_workflow():
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    ax.add_patch(patches.Rectangle((0, 0), 100, 100, color='#F8FAFC', zorder=0))

    ax.text(50, 95, "Figure 3.5: Privacy-Preserving AI Advisory & Offline Fallback Workflow", 
            ha='center', va='center', fontsize=12, fontweight='bold', color=AI_PURPLE)

    # Box 1: Backend Aggregation
    ax.add_patch(patches.FancyBboxPatch((5, 60), 26, 26, boxstyle="round,pad=1", edgecolor='#0369A1', facecolor='#F0F9FF', lw=1.5))
    ax.text(18, 81, "1. SQL Aggregation", fontsize=9, fontweight='bold', color='#0369A1', ha='center')
    ax.text(18, 73, "• Queries view v_category_emissions\n• Computes totals & % breakdown\n• Masks all PII / user identities", fontsize=7.2, color=TEXT_MAIN, ha='center')

    # Arrow 1 -> 2
    ax.annotate("", xy=(36, 73), xytext=(31, 73), arrowprops=dict(arrowstyle="->", color=TEXT_MAIN, lw=1.5))
    ax.text(33.5, 76, "JSON Payload", fontsize=7, ha='center')

    # Box 2: FastAPI Microservice
    ax.add_patch(patches.FancyBboxPatch((36, 52), 30, 36, boxstyle="round,pad=1", edgecolor=AI_PURPLE, facecolor='#FAF5FF', lw=1.5))
    ax.text(51, 83, "2. FastAPI Microservice", fontsize=9, fontweight='bold', color=AI_PURPLE, ha='center')
    ax.text(51, 76, "• Pydantic schema validation\n• Evaluates external API availability", fontsize=7.2, color=TEXT_MAIN, ha='center')

    # Decision Branch inside FastAPI
    ax.add_patch(patches.Rectangle((40, 60), 22, 10, edgecolor='#10B981', facecolor='#ECFDF5', lw=1))
    ax.text(51, 65, "Google Gemini 2.5 API\n(Online Generator)", fontsize=7, fontweight='bold', color='#065F46', ha='center')

    ax.add_patch(patches.Rectangle((40, 44), 22, 11, edgecolor='#F59E0B', facecolor='#FEF3C7', lw=1))
    ax.text(51, 49.5, "Deterministic Heuristic\n(Offline Fallback Engine)", fontsize=7, fontweight='bold', color='#92400E', ha='center')

    # Arrow 2 -> 3
    ax.annotate("", xy=(71, 73), xytext=(66, 73), arrowprops=dict(arrowstyle="->", color=TEXT_MAIN, lw=1.5))
    ax.text(68.5, 76, "Structured JSON", fontsize=7, ha='center')

    # Box 3: Database Persistence
    ax.add_patch(patches.FancyBboxPatch((71, 60), 24, 26, boxstyle="round,pad=1", edgecolor=DB_BLUE, facecolor='#EFF6FF', lw=1.5))
    ax.text(83, 81, "3. DB Persistence", fontsize=9, fontweight='bold', color=DB_BLUE, ha='center')
    ax.text(83, 73, "• Upserts recommendations table\n• Stores priority & impact score\n• Renders to UI with action buttons", fontsize=7.2, color=TEXT_MAIN, ha='center')

    # Flow explanation note
    ax.add_patch(patches.Rectangle((5, 10), 90, 24, edgecolor='#9CA3AF', facecolor='#FFFFFF', lw=1))
    ax.text(7, 29, "Key Reliability & Privacy Assurances:", fontsize=8.5, fontweight='bold', color=SECONDARY)
    ax.text(7, 24, "• Privacy Preservation: Zero user names, email addresses, or unformatted text notes are sent to external LLMs.", fontsize=7.5, color=TEXT_MAIN)
    ax.text(7, 19, "• Zero Dependency on Paid Services: If Gemini API key is unset or network times out (>3.0s), offline engine activates instantly.", fontsize=7.5, color=TEXT_MAIN)
    ax.text(7, 14, "• Deterministic Quantities: Recommendations are grounded exclusively in verified database emission factor arithmetic.", fontsize=7.5, color=TEXT_MAIN)

    save_fig(fig, 'fig3_5_ai_workflow.png')

if __name__ == '__main__':
    generate_system_architecture()
    generate_data_flow_diagram()
    generate_er_diagram()
    generate_calculation_workflow()
    generate_ai_workflow()
    print("All 5 core architectural diagrams successfully created in docs/figures/!")
