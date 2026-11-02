"""
CarbonIQ UI Figures Generator
Generates high-resolution academic figures (300 DPI) for Chapter 4 Application Walkthrough.
"""
import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'docs', 'figures')
os.makedirs(OUTPUT_DIR, exist_ok=True)

PRIMARY = '#176B4D'      # Forest Green
SECONDARY = '#104B38'    # Deep Forest
ACCENT = '#2BB673'       # Emerald Mint
SURFACE = '#F4F9F6'      # Light Mint Surface
CARD_BG = '#FFFFFF'      # Pure White Card
TEXT_MAIN = '#111827'    # Charcoal
TEXT_MUTED = '#4B5563'   # Muted Gray
BORDER = '#D1D5DB'       # Border Gray
AI_PURPLE = '#6D28D9'    # Purple for AI Tier

plt.rcParams['font.sans-serif'] = 'DejaVu Sans'
plt.rcParams['font.family'] = 'sans-serif'

def save_fig(fig, filename):
    filepath = os.path.join(OUTPUT_DIR, filename)
    fig.savefig(filepath, dpi=300, bbox_inches='tight')
    plt.close(fig)
    print(f"[OK] Generated {filename}")

# ----------------------------------------------------------------------
# FIGURE 4.1: Landing Page & Quick-Fill Authentication
# ----------------------------------------------------------------------
def generate_ui_landing_auth():
    fig, ax = plt.subplots(figsize=(10, 5.5))
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    ax.add_patch(patches.Rectangle((0, 0), 100, 100, color='#F8FAFC', zorder=0))

    ax.text(50, 94, "Figure 4.1: CarbonIQ Public Landing Page & Quick-Fill Authentication", 
            ha='center', va='center', fontsize=12, fontweight='bold', color=SECONDARY)

    # Left: Landing Page Wireframe
    ax.add_patch(patches.Rectangle((4, 8), 44, 80, edgecolor='#059669', facecolor='#FFFFFF', lw=1.2))
    ax.add_patch(patches.Rectangle((4, 76), 44, 12, color=PRIMARY))
    ax.text(8, 82, "CarbonIQ", fontsize=11, fontweight='bold', color='#FFFFFF')
    ax.text(38, 82, "Sign In | Get Started", fontsize=7.5, color='#D1FAE5')
    
    ax.text(26, 68, "Track, Decarbonize & Comply", fontsize=10, fontweight='bold', color=TEXT_MAIN, ha='center')
    ax.text(26, 62, "Deterministic Scope 1 & 2 carbon accounting\nfor individuals and forward-looking organizations.", fontsize=7, color=TEXT_MUTED, ha='center')
    
    ax.add_patch(patches.FancyBboxPatch((14, 50), 24, 7, boxstyle="round,pad=0.5", color=PRIMARY))
    ax.text(26, 53.5, "Launch CarbonIQ Dashboard ->", fontsize=7.5, fontweight='bold', color='#FFFFFF', ha='center')

    # Value props cards
    for idx, (title, desc) in enumerate([("Local-First ADBMS", "PostgreSQL 18 with 3NF schema"),
                                         ("Verified Factors", "CEA, DEFRA, US EPA standards"),
                                         ("AI Advisory", "Personalized reduction plans")]):
        y = 38 - idx * 10
        ax.add_patch(patches.Rectangle((8, y), 36, 8, edgecolor=BORDER, facecolor=SURFACE, lw=0.8))
        ax.text(10, y + 5, f"✔ {title}", fontsize=7.5, fontweight='bold', color=PRIMARY)
        ax.text(10, y + 2, desc, fontsize=6.5, color=TEXT_MUTED)

    # Right: Login Card Wireframe
    ax.add_patch(patches.Rectangle((52, 8), 44, 80, edgecolor='#2563EB', facecolor='#FFFFFF', lw=1.2))
    ax.add_patch(patches.Rectangle((52, 80), 44, 8, color='#1E40AF'))
    ax.text(74, 84, "Sign In to Your Workspace", fontsize=9.5, fontweight='bold', color='#FFFFFF', ha='center')

    ax.text(56, 73, "Email Address", fontsize=7.5, fontweight='bold', color=TEXT_MAIN)
    ax.add_patch(patches.Rectangle((56, 65), 36, 6, edgecolor=BORDER, facecolor='#FFFFFF', lw=0.8))
    ax.text(58, 68, "aarav.sharma@example.com", fontsize=7, color=TEXT_MAIN)

    ax.text(56, 59, "Password", fontsize=7.5, fontweight='bold', color=TEXT_MAIN)
    ax.add_patch(patches.Rectangle((56, 51), 36, 6, edgecolor=BORDER, facecolor='#FFFFFF', lw=0.8))
    ax.text(58, 54, "••••••••••••", fontsize=7, color=TEXT_MAIN)

    ax.add_patch(patches.FancyBboxPatch((56, 40), 36, 7, boxstyle="round,pad=0.5", color='#2563EB'))
    ax.text(74, 43.5, "Sign In ->", fontsize=8, fontweight='bold', color='#FFFFFF', ha='center')

    # Demo quick-fill pill box
    ax.add_patch(patches.Rectangle((55, 12), 38, 22, edgecolor='#F59E0B', facecolor='#FEF3C7', lw=1))
    ax.text(74, 30, "One-Click Quick-Fill Demo Accounts", fontsize=7.5, fontweight='bold', color='#B45309', ha='center')
    ax.add_patch(patches.FancyBboxPatch((57, 21), 34, 6, boxstyle="round,pad=0.4", color='#FDE68A'))
    ax.text(74, 24, "User: Aarav Sharma (Individual)", fontsize=7, fontweight='bold', color='#78350F', ha='center')
    ax.add_patch(patches.FancyBboxPatch((57, 14), 34, 6, boxstyle="round,pad=0.4", color='#FDE68A'))
    ax.text(74, 17, "Admin: Priya Patel (EcoTech Org)", fontsize=7, fontweight='bold', color='#78350F', ha='center')

    save_fig(fig, 'fig4_1_ui_landing_auth.png')

# ----------------------------------------------------------------------
# FIGURE 4.2: Executive Carbon Dashboard
# ----------------------------------------------------------------------
def generate_ui_dashboard():
    fig, ax = plt.subplots(figsize=(10, 5.5))
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    ax.add_patch(patches.Rectangle((0, 0), 100, 100, color='#F8FAFC', zorder=0))

    ax.text(50, 95, "Figure 4.2: Executive Carbon Footprint Overview Dashboard", 
            ha='center', va='center', fontsize=12, fontweight='bold', color=SECONDARY)

    # Top KPI Cards
    kpis = [
        ("Gross Footprint", "1,248.50 kg", "CO2e this month (-8.4%)", '#10B981'),
        ("Recorded Activities", "24 entries", "Across 5 Scope 1 & 2 types", '#3B82F6'),
        ("Dominant Source", "Grid Electricity", "62.4% of workspace total", '#F59E0B'),
        ("Reduction Goal", "74.8% achieved", "Target: 1,000 kg CO2e", PRIMARY)
    ]
    for idx, (title, val, sub, col) in enumerate(kpis):
        x = 4 + idx * 23.5
        ax.add_patch(patches.Rectangle((x, 70), 22.5, 20, edgecolor=BORDER, facecolor='#FFFFFF', lw=1))
        ax.add_patch(patches.Rectangle((x, 87), 22.5, 3, color=col))
        ax.text(x + 2, 82, title, fontsize=7.5, color=TEXT_MUTED)
        ax.text(x + 2, 76, val, fontsize=10, fontweight='bold', color=TEXT_MAIN)
        ax.text(x + 2, 72, sub, fontsize=6.2, color=TEXT_MUTED)

    # Middle Left: Monthly Trend Chart
    ax.add_patch(patches.Rectangle((4, 10), 55, 56, edgecolor=BORDER, facecolor='#FFFFFF', lw=1))
    ax.text(7, 61, "Monthly Emissions Trajectory (kg CO2e)", fontsize=8.5, fontweight='bold', color=TEXT_MAIN)
    # Draw simulated area chart
    months = [10, 20, 30, 40, 50]
    vals = [40, 48, 42, 38, 30]
    ax.plot([4 + m for m in months], vals, color=PRIMARY, lw=2, marker='o')
    ax.fill_between([4 + m for m in months], 15, vals, color='#D1FAE5', alpha=0.5)
    for m, name in zip(months, ["Jun", "Jul", "Aug", "Sep", "Oct"]):
        ax.text(4 + m, 12, name, fontsize=7, ha='center', color=TEXT_MUTED)

    # Middle Right: Donut Category Chart
    ax.add_patch(patches.Rectangle((62, 10), 34, 56, edgecolor=BORDER, facecolor='#FFFFFF', lw=1))
    ax.text(65, 61, "Emissions by Category", fontsize=8.5, fontweight='bold', color=TEXT_MAIN)
    circle = patches.Circle((79, 36), 14, edgecolor=BORDER, facecolor='#ECFDF5', lw=1)
    ax.add_patch(circle)
    inner_circle = patches.Circle((79, 36), 8, edgecolor=BORDER, facecolor='#FFFFFF', lw=1)
    ax.add_patch(inner_circle)
    ax.text(79, 37, "1.25 t", fontsize=8.5, fontweight='bold', color=PRIMARY, ha='center')
    ax.text(79, 34, "CO2e", fontsize=6.5, color=TEXT_MUTED, ha='center')

    # Legend below circle
    cats = [("Electricity (62%)", '#10B981'), ("Transport (22%)", '#3B82F6'), ("Fuel / LPG (16%)", '#F59E0B')]
    for c_idx, (c_name, c_col) in enumerate(cats):
        y = 18 - c_idx * 3.5
        ax.add_patch(patches.Rectangle((65, y), 2.5, 2, color=c_col))
        ax.text(69, y + 1, c_name, fontsize=6.5, va='center', color=TEXT_MAIN)

    save_fig(fig, 'fig4_2_ui_dashboard.png')

# ----------------------------------------------------------------------
# FIGURE 4.3: Add Activity Modal Wizard with Live Preview
# ----------------------------------------------------------------------
def generate_ui_activity_modal():
    fig, ax = plt.subplots(figsize=(10, 5.5))
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    ax.add_patch(patches.Rectangle((0, 0), 100, 100, color='#F8FAFC', zorder=0))

    ax.text(50, 95, "Figure 4.3: Add Activity Modal Wizard with Real-Time Calculation Preview", 
            ha='center', va='center', fontsize=12, fontweight='bold', color=SECONDARY)

    # Modal container
    ax.add_patch(patches.FancyBboxPatch((15, 6), 70, 82, boxstyle="round,pad=1", edgecolor='#059669', facecolor='#FFFFFF', lw=1.5))
    ax.text(19, 83, "Log New Carbon Activity", fontsize=11, fontweight='bold', color=SECONDARY)
    ax.text(19, 79, "Record energy, travel, fuel or waste data with deterministic factor verification.", fontsize=7.2, color=TEXT_MUTED)

    # Category Selector Tabs
    tab_names = ["Electricity", "Transport", "Fuel", "LPG", "Waste"]
    for idx, tname in enumerate(tab_names):
        x = 19 + idx * 12.5
        col = PRIMARY if idx == 0 else '#F3F4F6'
        tcol = '#FFFFFF' if idx == 0 else TEXT_MAIN
        ax.add_patch(patches.FancyBboxPatch((x, 69), 11.5, 6, boxstyle="round,pad=0.3", color=col))
        ax.text(x + 5.75, 72, tname, fontsize=7.2, fontweight='bold', color=tcol, ha='center', va='center')

    # Activity Type Dropdown
    ax.text(19, 63, "Activity Type", fontsize=7.5, fontweight='bold', color=TEXT_MAIN)
    ax.add_patch(patches.Rectangle((19, 56), 62, 5.5, edgecolor=BORDER, facecolor='#FFFFFF', lw=0.8))
    ax.text(21, 58.75, "Grid Electricity - Commercial / Institutional (CEA Baseline v19)", fontsize=7, color=TEXT_MAIN)

    # Quantity & Unit
    ax.text(19, 50, "Quantity", fontsize=7.5, fontweight='bold', color=TEXT_MAIN)
    ax.add_patch(patches.Rectangle((19, 43), 38, 5.5, edgecolor=BORDER, facecolor='#FFFFFF', lw=0.8))
    ax.text(21, 45.75, "250.00", fontsize=7, color=TEXT_MAIN)

    ax.text(60, 50, "Unit of Measure", fontsize=7.5, fontweight='bold', color=TEXT_MAIN)
    ax.add_patch(patches.Rectangle((60, 43), 21, 5.5, edgecolor=BORDER, facecolor='#F9FAFB', lw=0.8))
    ax.text(62, 45.75, "kWh (Kilowatt-hour)", fontsize=7, color=TEXT_MUTED)

    # Dynamic Live Preview Box
    ax.add_patch(patches.FancyBboxPatch((19, 21), 62, 17, boxstyle="round,pad=0.5", edgecolor='#10B981', facecolor='#ECFDF5', lw=1.2))
    ax.text(22, 34, "⚡ LIVE EMISSION CALCULATION PREVIEW", fontsize=8, fontweight='bold', color='#065F46')
    ax.text(22, 29, "Estimated Footprint: 179.0000 kg CO2e", fontsize=10, fontweight='bold', color='#047857')
    ax.text(22, 24, "Factor: 0.7160 kg CO2e / kWh | Source: Central Electricity Authority India (CEA Baseline 2023)", fontsize=6.8, color='#065F46')

    # Submit Button
    ax.add_patch(patches.FancyBboxPatch((55, 11), 26, 6.5, boxstyle="round,pad=0.4", color=PRIMARY))
    ax.text(68, 14.25, "Save & Commit Activity ->", fontsize=7.5, fontweight='bold', color='#FFFFFF', ha='center', va='center')

    ax.add_patch(patches.FancyBboxPatch((40, 11), 13, 6.5, boxstyle="round,pad=0.4", color='#E5E7EB'))
    ax.text(46.5, 14.25, "Cancel", fontsize=7.5, color=TEXT_MAIN, ha='center', va='center')

    save_fig(fig, 'fig4_3_ui_activity_modal.png')

# ----------------------------------------------------------------------
# FIGURE 4.4: Analytics, Breakdown & CSV Export
# ----------------------------------------------------------------------
def generate_ui_analytics():
    fig, ax = plt.subplots(figsize=(10, 5.5))
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    ax.add_patch(patches.Rectangle((0, 0), 100, 100, color='#F8FAFC', zorder=0))

    ax.text(50, 95, "Figure 4.4: Emissions Analytics, Departmental Breakdown & CSV Export", 
            ha='center', va='center', fontsize=12, fontweight='bold', color=SECONDARY)

    # Top action bar
    ax.add_patch(patches.Rectangle((5, 80), 90, 9, edgecolor=BORDER, facecolor='#FFFFFF', lw=1))
    ax.text(8, 84.5, "Emissions Analytics & Comprehensive Audit Reports", fontsize=9.5, fontweight='bold', color=TEXT_MAIN)
    ax.add_patch(patches.FancyBboxPatch((74, 82), 18, 5, boxstyle="round,pad=0.3", color='#0284C7'))
    ax.text(83, 84.5, "Export CSV Report", fontsize=7.2, fontweight='bold', color='#FFFFFF', ha='center', va='center')

    # Departmental distribution card
    ax.add_patch(patches.Rectangle((5, 12), 43, 64, edgecolor=BORDER, facecolor='#FFFFFF', lw=1))
    ax.text(8, 71, "Departmental Breakdown (Organization)", fontsize=8.5, fontweight='bold', color=TEXT_MAIN)
    depts = [
        ("Engineering & R&D", "742.80 kg CO2e", 75, '#10B981'),
        ("Operations & Facilities", "380.20 kg CO2e", 45, '#3B82F6'),
        ("Sales & Marketing", "125.50 kg CO2e", 20, '#F59E0B')
    ]
    for d_idx, (d_name, d_co2, d_len, d_col) in enumerate(depts):
        y = 56 - d_idx * 16
        ax.text(8, y + 6, d_name, fontsize=7.5, fontweight='bold', color=TEXT_MAIN)
        ax.text(38, y + 6, d_co2, fontsize=7, color=TEXT_MUTED, ha='right')
        ax.add_patch(patches.Rectangle((8, y), 35, 3.5, color='#F3F4F6'))
        ax.add_patch(patches.Rectangle((8, y), 35 * (d_len / 100), 3.5, color=d_col))

    # Factor Provenance & Audit Card
    ax.add_patch(patches.Rectangle((52, 12), 43, 64, edgecolor=BORDER, facecolor='#FFFFFF', lw=1))
    ax.text(55, 71, "Traceable Factor Citations & Provenance", fontsize=8.5, fontweight='bold', color=TEXT_MAIN)
    sources = [
        ("CEA India Baseline v19 (2023)", "Grid Electricity emission factor 0.716 kg/kWh"),
        ("UK DEFRA Greenhouse Gas Hub (2023)", "Diesel passenger transport 0.171 kg/km"),
        ("US EPA Emission Factors Hub (2023)", "Commercial natural gas heating 2.03 kg/m3"),
        ("IPCC Guidelines (2019 Refinement)", "Municipal solid waste composting metrics")
    ]
    for s_idx, (s_title, s_desc) in enumerate(sources):
        y = 56 - s_idx * 12
        ax.add_patch(patches.Rectangle((55, y), 37, 9, edgecolor=BORDER, facecolor=SURFACE, lw=0.8))
        ax.text(57, y + 5.5, s_title, fontsize=7, fontweight='bold', color=PRIMARY)
        ax.text(57, y + 2, s_desc, fontsize=6.2, color=TEXT_MUTED)

    save_fig(fig, 'fig4_4_ui_analytics.png')

# ----------------------------------------------------------------------
# FIGURE 4.5: Goals & AI Insights Advisory
# ----------------------------------------------------------------------
def generate_ui_goals_insights():
    fig, ax = plt.subplots(figsize=(10, 5.5))
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    ax.add_patch(patches.Rectangle((0, 0), 100, 100, color='#F8FAFC', zorder=0))

    ax.text(50, 95, "Figure 4.5: Carbon Reduction Goals Tracking & AI Insights Advisory", 
            ha='center', va='center', fontsize=12, fontweight='bold', color=SECONDARY)

    # Left: Goals Tracker
    ax.add_patch(patches.Rectangle((5, 10), 43, 78, edgecolor=BORDER, facecolor='#FFFFFF', lw=1))
    ax.text(8, 83, "Active Reduction Goals", fontsize=9.5, fontweight='bold', color=TEXT_MAIN)
    
    # Goal 1
    ax.add_patch(patches.Rectangle((8, 54), 37, 24, edgecolor=PRIMARY, facecolor='#ECFDF5', lw=1))
    ax.text(10, 73, "Q4 Grid Electricity Curtailment", fontsize=8, fontweight='bold', color=PRIMARY)
    ax.text(10, 68, "Target: 20.0% Reduction | Baseline: 1,500 kWh", fontsize=6.8, color=TEXT_MUTED)
    ax.add_patch(patches.Rectangle((10, 62), 33, 3, color='#E5E7EB'))
    ax.add_patch(patches.Rectangle((10, 62), 24, 3, color=PRIMARY))
    ax.text(10, 57, "74.8% Progress (On Track)", fontsize=6.8, fontweight='bold', color=PRIMARY)

    # Goal 2
    ax.add_patch(patches.Rectangle((8, 25), 37, 24, edgecolor='#3B82F6', facecolor='#EFF6FF', lw=1))
    ax.text(10, 44, "Fleet EV Transition - Phase 1", fontsize=8, fontweight='bold', color='#1D4ED8')
    ax.text(10, 39, "Target: 15.0% Scope 1 Reduction", fontsize=6.8, color=TEXT_MUTED)
    ax.add_patch(patches.Rectangle((10, 33), 33, 3, color='#E5E7EB'))
    ax.add_patch(patches.Rectangle((10, 33), 16, 3, color='#3B82F6'))
    ax.text(10, 28, "51.2% Progress (Active)", fontsize=6.8, fontweight='bold', color='#1D4ED8')

    # Right: AI Insights Cards
    ax.add_patch(patches.Rectangle((52, 10), 43, 78, edgecolor=BORDER, facecolor='#FFFFFF', lw=1))
    ax.text(55, 83, "AI Advisory & Heuristic Insights", fontsize=9.5, fontweight='bold', color=AI_PURPLE)

    # Insight 1 (High priority)
    ax.add_patch(patches.Rectangle((55, 50), 37, 28, edgecolor='#DC2626', facecolor='#FEF2F2', lw=1))
    ax.text(57, 72, "HVAC & Off-Peak Optimization", fontsize=8, fontweight='bold', color='#B91C1C')
    ax.text(57, 67, "Priority: HIGH | Potential Impact: -18.5% CO2e", fontsize=6.8, fontweight='bold', color='#B91C1C')
    ax.text(57, 58, "Electricity contributes 62.4% of total footprint.\nShifting non-critical loads and optimizing AC setpoints\nyields immediate verified carbon and cost savings.", fontsize=6.5, color=TEXT_MAIN)
    ax.add_patch(patches.FancyBboxPatch((75, 52), 15, 4.5, boxstyle="round,pad=0.2", color='#DC2626'))
    ax.text(82.5, 54.25, "Mark Done", fontsize=6.2, fontweight='bold', color='#FFFFFF', ha='center', va='center')

    # Insight 2 (Medium priority)
    ax.add_patch(patches.Rectangle((55, 18), 37, 28, edgecolor='#D97706', facecolor='#FFFBEB', lw=1))
    ax.text(57, 40, "Consolidate Regional Travel Routes", fontsize=8, fontweight='bold', color='#B45309')
    ax.text(57, 35, "Priority: MEDIUM | Potential Impact: -8.0% CO2e", fontsize=6.8, fontweight='bold', color='#B45309')
    ax.text(57, 26, "Transportation diesel emissions peaked mid-month.\nBatching departmental logistics reduces fossil fuel\ncombustion without impacting operational delivery.", fontsize=6.5, color=TEXT_MAIN)
    ax.add_patch(patches.FancyBboxPatch((75, 20), 15, 4.5, boxstyle="round,pad=0.2", color='#D97706'))
    ax.text(82.5, 22.25, "Mark Done", fontsize=6.2, fontweight='bold', color='#FFFFFF', ha='center', va='center')

    save_fig(fig, 'fig4_5_ui_goals_insights.png')

if __name__ == '__main__':
    generate_ui_landing_auth()
    generate_ui_dashboard()
    generate_ui_activity_modal()
    generate_ui_analytics()
    generate_ui_goals_insights()
    print("All 5 UI Application Walkthrough diagrams successfully created in docs/figures/!")
