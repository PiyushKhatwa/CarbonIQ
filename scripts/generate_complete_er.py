"""
Enhanced ER Diagram Generator for CarbonIQ (All 13 Tables)
Generates high-resolution Figure 3.3 featuring all 13 relational PostgreSQL tables.
"""
import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'docs', 'figures')
os.makedirs(OUTPUT_DIR, exist_ok=True)

PRIMARY = '#176B4D'      # Forest Green
SECONDARY = '#104B38'    # Deep Forest
ACCENT = '#2BB673'       # Emerald Mint
CARD_BG = '#FFFFFF'
TEXT_MAIN = '#111827'
TEXT_MUTED = '#4B5563'
BORDER = '#D1D5DB'
DB_BLUE = '#1E40AF'

plt.rcParams['font.sans-serif'] = 'DejaVu Sans'
plt.rcParams['font.family'] = 'sans-serif'

def generate_complete_13_table_er_diagram():
    # 15 x 11.5 inches at 300 DPI gives plenty of room for all 13 tables to be crystal clear
    fig, ax = plt.subplots(figsize=(15, 11.5))
    ax.set_xlim(0, 150)
    ax.set_ylim(0, 115)
    ax.axis('off')
    ax.add_patch(patches.Rectangle((0, 0), 150, 115, color='#F8FAFC', zorder=0))

    # Title Banner
    ax.text(75, 111, "Figure 3.3: CarbonIQ Complete Relational Entity Relationship Diagram (13 Tables, 3NF)", 
            ha='center', va='center', fontsize=14, fontweight='bold', color=SECONDARY)

    def draw_table(x, y, w, h, title, fields, border_col='#2563EB', header_bg='#1E40AF'):
        # Card outer border and background
        ax.add_patch(patches.Rectangle((x, y), w, h, edgecolor=border_col, facecolor='#FFFFFF', lw=1.2, zorder=1))
        # Header banner
        header_h = 3.6
        ax.add_patch(patches.Rectangle((x, y + h - header_h), w, header_h, edgecolor=border_col, facecolor=header_bg, lw=1.2, zorder=2))
        ax.text(x + w/2, y + h - header_h/2, title, ha='center', va='center', fontsize=7.8, fontweight='bold', color='#FFFFFF', zorder=3)
        
        y_text = y + h - header_h - 2.2
        for f in fields:
            # Color primary key and foreign key badges
            if f.startswith("PK"):
                ax.text(x + 1.2, y_text, f, ha='left', va='center', fontsize=6.3, fontweight='bold', color='#B91C1C', zorder=3)
            elif f.startswith("FK"):
                ax.text(x + 1.2, y_text, f, ha='left', va='center', fontsize=6.3, fontweight='bold', color='#1D4ED8', zorder=3)
            elif f.startswith("CHK") or f.startswith("UQ"):
                ax.text(x + 1.2, y_text, f, ha='left', va='center', fontsize=6.0, fontstyle='italic', color='#047857', zorder=3)
            else:
                ax.text(x + 1.2, y_text, f, ha='left', va='center', fontsize=6.2, color=TEXT_MAIN, zorder=3)
            y_text -= 1.85

    # -------------------------------------------------------------
    # ROW 1 (TOP): IDENTITY & WORKSPACE (y = 86 to 106)
    # -------------------------------------------------------------
    # 1. users
    draw_table(4, 85, 32, 22, "1. users", [
        "PK id: UUID",
        "email: VARCHAR(255) [UQ]",
        "password_hash: VARCHAR(255)",
        "full_name: VARCHAR(150)",
        "system_role: VARCHAR(50)",
        "default_workspace_type: VARCHAR(20)",
        "created_at, updated_at: TIMESTAMPTZ",
        "CHK: system_role IN ('user', 'admin')"
    ], border_col='#1E3A8A', header_bg='#1E3A8A')

    # 2. organizations
    draw_table(40, 85, 32, 22, "2. organizations", [
        "PK id: UUID",
        "name: VARCHAR(200)",
        "slug: VARCHAR(200) [UQ]",
        "industry, country: VARCHAR",
        "FK created_by -> users(id)",
        "created_at, updated_at: TIMESTAMPTZ"
    ], border_col='#1E3A8A', header_bg='#1E3A8A')

    # 3. organization_members
    draw_table(76, 85, 34, 22, "3. organization_members", [
        "PK id: UUID",
        "FK organization_id -> organizations(id)",
        "FK user_id -> users(id)",
        "role: VARCHAR(50) [owner/admin/member]",
        "joined_at: TIMESTAMPTZ",
        "UQ: (organization_id, user_id)",
        "CHK: role IN ('owner','admin','member')"
    ], border_col='#1E3A8A', header_bg='#1E3A8A')

    # 4. departments
    draw_table(114, 85, 32, 22, "4. departments", [
        "PK id: UUID",
        "FK organization_id -> organizations(id)",
        "name: VARCHAR(120)",
        "code: VARCHAR(50)",
        "description: TEXT",
        "created_at: TIMESTAMPTZ",
        "UQ: (organization_id, name)"
    ], border_col='#1E3A8A', header_bg='#1E3A8A')

    # -------------------------------------------------------------
    # ROW 2 (MIDDLE-UP): TAXONOMY & FACTORS (y = 57 to 79)
    # -------------------------------------------------------------
    # 5. activity_categories
    draw_table(4, 57, 32, 22, "5. activity_categories", [
        "PK id: UUID",
        "code: VARCHAR(50) [UQ]",
        "name: VARCHAR(100)",
        "description: TEXT",
        "icon_name: VARCHAR(50)",
        "display_order: INT",
        "is_active: BOOLEAN",
        "created_at: TIMESTAMPTZ"
    ], border_col='#065F46', header_bg='#065F46')

    # 6. activity_types
    draw_table(40, 57, 32, 22, "6. activity_types", [
        "PK id: UUID",
        "FK category_id -> categories(id)",
        "code: VARCHAR(80) [UQ]",
        "name: VARCHAR(150)",
        "standard_unit: VARCHAR(30)",
        "is_active: BOOLEAN",
        "created_at: TIMESTAMPTZ"
    ], border_col='#065F46', header_bg='#065F46')

    # 7. emission_factor_sources
    draw_table(76, 57, 34, 22, "7. emission_factor_sources", [
        "PK id: UUID",
        "short_name: VARCHAR(100) [UQ]",
        "publisher: VARCHAR(200)",
        "source_title: VARCHAR(300)",
        "reference_url: VARCHAR(500)",
        "publication_year: INT",
        "notes: TEXT, created_at: TIMESTAMPTZ"
    ], border_col='#065F46', header_bg='#065F46')

    # 8. emission_factors
    draw_table(114, 57, 32, 22, "8. emission_factors", [
        "PK id: UUID",
        "FK activity_type_id -> types(id)",
        "FK source_id -> sources(id)",
        "factor_value: NUMERIC(14,6)",
        "unit, geography: VARCHAR",
        "valid_from, valid_to: DATE",
        "version_tag: VARCHAR, is_verified: BOOL",
        "CHK: factor_value >= 0"
    ], border_col='#065F46', header_bg='#065F46')

    # -------------------------------------------------------------
    # ROW 3 (MIDDLE-DOWN): CORE OPERATIONAL LEDGER (y = 28 to 51)
    # -------------------------------------------------------------
    # 9. activities
    draw_table(22, 28, 48, 23, "9. activities (Operational Ledger)", [
        "PK id: UUID",
        "FK user_id -> users(id) [ON DELETE CASCADE, Nullable]",
        "FK organization_id -> organizations(id) [ON DELETE CASCADE, Nullable]",
        "FK department_id -> departments(id) [ON DELETE SET NULL]",
        "FK activity_type_id -> activity_types(id) [RESTRICT]",
        "FK created_by -> users(id) [RESTRICT]",
        "quantity: NUMERIC(14,4), unit: VARCHAR(30), activity_date: DATE",
        "CHK: quantity > 0",
        "CHK: (user_id IS NOT NULL AND org_id IS NULL) OR (org_id IS NOT NULL)"
    ], border_col='#047857', header_bg='#104B38')

    # 10. emission_records
    draw_table(82, 28, 48, 23, "10. emission_records (Deterministic Footprint)", [
        "PK id: UUID",
        "FK activity_id -> activities(id) [UQ, ON DELETE CASCADE] (1 : 1)",
        "FK emission_factor_id -> emission_factors(id) [RESTRICT]",
        "emission_factor_snapshot: NUMERIC(14,6) [Frozen factor value]",
        "factor_source_snapshot: VARCHAR(200) [Frozen source citation]",
        "calculated_co2e_kg: NUMERIC(16,4) [quantity * factor]",
        "calculation_method: VARCHAR(50) [factor_multiplication]",
        "calculated_at: TIMESTAMPTZ, CHK: calculated_co2e_kg >= 0"
    ], border_col='#B91C1C', header_bg='#991B1B')

    # -------------------------------------------------------------
    # ROW 4 (BOTTOM): ADVISORY & AUDIT (y = 3 to 22)
    # -------------------------------------------------------------
    # 11. goals
    draw_table(4, 3, 44, 20, "11. goals (Reduction Targets)", [
        "PK id: UUID",
        "FK user_id -> users(id) [Nullable]",
        "FK organization_id -> organizations(id) [Nullable]",
        "FK category_id -> categories(id) [Nullable]",
        "title: VARCHAR(200), target_reduction_pct: NUMERIC",
        "baseline_co2e_kg, target_co2e_kg: NUMERIC(16,4)",
        "start_date, target_date: DATE, status: VARCHAR(30)"
    ], border_col='#6B21A8', header_bg='#581C87')

    # 12. recommendations
    draw_table(52, 3, 48, 20, "12. recommendations (AI Advisory & Fallback)", [
        "PK id: UUID",
        "FK user_id -> users(id) [Nullable]",
        "FK organization_id -> organizations(id) [Nullable]",
        "category_code: VARCHAR(50), title: VARCHAR(250)",
        "explanation, action_text: TEXT, priority: VARCHAR(20)",
        "potential_reduction_co2e_kg: NUMERIC(14,4)",
        "source_type: VARCHAR(30) [ai_gemini / rule_based]"
    ], border_col='#6B21A8', header_bg='#581C87')

    # 13. audit_logs
    draw_table(104, 3, 42, 20, "13. audit_logs (Forensic JSONB Trail)", [
        "PK id: UUID",
        "FK actor_id -> users(id) [ON DELETE SET NULL]",
        "action: VARCHAR(50) [INSERT, UPDATE, DELETE]",
        "entity_type: VARCHAR(80) ['activities', 'factors']",
        "entity_id: UUID, old_state: JSONB, new_state: JSONB",
        "ip_address: VARCHAR(45), created_at: TIMESTAMPTZ"
    ], border_col='#374151', header_bg='#1F2937')

    # -------------------------------------------------------------
    # RELATIONSHIP CONNECTORS & CARDINALITIES
    # -------------------------------------------------------------
    # users -> organizations (created_by)
    ax.annotate("", xy=(40, 95), xytext=(36, 95), arrowprops=dict(arrowstyle="->", color='#4B5563', lw=1.2))
    ax.text(38, 96.5, "1:M", fontsize=6, ha='center', color='#4B5563')

    # organizations -> organization_members
    ax.annotate("", xy=(76, 95), xytext=(72, 95), arrowprops=dict(arrowstyle="->", color='#4B5563', lw=1.2))
    ax.text(74, 96.5, "1:M", fontsize=6, ha='center', color='#4B5563')

    # organizations -> departments
    ax.annotate("", xy=(114, 95), xytext=(108, 95), arrowprops=dict(arrowstyle="->", color='#4B5563', lw=1.2))
    ax.text(111, 96.5, "1:M", fontsize=6, ha='center', color='#4B5563')

    # categories -> types
    ax.annotate("", xy=(40, 68), xytext=(36, 68), arrowprops=dict(arrowstyle="->", color='#4B5563', lw=1.2))
    ax.text(38, 69.5, "1:M", fontsize=6, ha='center', color='#4B5563')

    # types -> emission_factors
    ax.annotate("", xy=(114, 68), xytext=(72, 68), arrowprops=dict(arrowstyle="->", color='#4B5563', lw=1.2, ls='--'))
    ax.text(93, 70, "1:M (activity_type_id)", fontsize=6, ha='center', color='#4B5563')

    # sources -> emission_factors
    ax.annotate("", xy=(114, 64), xytext=(110, 64), arrowprops=dict(arrowstyle="->", color='#4B5563', lw=1.2))
    ax.text(112, 65.5, "1:M", fontsize=6, ha='center', color='#4B5563')

    # types -> activities
    ax.annotate("", xy=(46, 51), xytext=(46, 57), arrowprops=dict(arrowstyle="->", color='#047857', lw=1.2))
    ax.text(49, 54, "1:M", fontsize=6, color='#047857')

    # activities <-> emission_records (Strict 1:1)
    ax.annotate("", xy=(82, 39), xytext=(70, 39), arrowprops=dict(arrowstyle="<->", color='#B91C1C', lw=1.8))
    ax.text(76, 40.5, "1 : 1 (UNIQUE FK)", fontsize=7, fontweight='bold', color='#B91C1C', ha='center')

    # emission_factors -> emission_records
    ax.annotate("", xy=(114, 51), xytext=(114, 57), arrowprops=dict(arrowstyle="->", color='#B91C1C', lw=1.2))
    ax.text(117, 54, "1:M", fontsize=6, color='#B91C1C')

    # users -> activities
    ax.plot([20, 20, 22], [85, 42, 42], color='#1E3A8A', lw=1.1, ls=':')
    ax.text(18, 50, "1:M (user_id)", fontsize=6, ha='right', color='#1E3A8A')

    # users -> goals, recs, audit
    ax.plot([10, 10, 26], [85, 23, 23], color='#6B21A8', lw=1.1, ls=':')
    ax.plot([148, 148, 146], [85, 23, 23], color='#374151', lw=1.1, ls=':')

    filepath = os.path.join(OUTPUT_DIR, 'fig3_3_entity_relationship_diagram.png')
    fig.savefig(filepath, dpi=300, bbox_inches='tight')
    plt.close(fig)
    print(f"[OK] Successfully generated full 13-table ER diagram at: {filepath}")

if __name__ == '__main__':
    generate_complete_13_table_er_diagram()

