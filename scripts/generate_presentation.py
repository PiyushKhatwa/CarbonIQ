"""
CarbonIQ Project Presentation Generator
Generates a professional, fully-editable 18-slide PowerPoint presentation
for the ADBMS academic project evaluation using python-pptx.
"""

import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.dml import MSO_THEME_COLOR
from pptx.oxml.ns import qn
from pptx.oxml import parse_xml
from lxml import etree
import copy

# ─── Output paths ──────────────────────────────────────────────────────────────
BASE_DIR  = os.path.join(os.path.dirname(__file__), '..')
DOCS_DIR  = os.path.join(BASE_DIR, 'docs')
FIGS_DIR  = os.path.join(DOCS_DIR, 'figures')
PPTX_PATH = os.path.join(DOCS_DIR, 'CarbonIQ_Project_Presentation.pptx')
SCRIPT_PATH = os.path.join(DOCS_DIR, 'CarbonIQ_Presenter_Script.md')

# ─── Brand palette ─────────────────────────────────────────────────────────────
C_GREEN      = RGBColor(0x17, 0x6B, 0x4D)   # Forest green  #176B4D
C_DEEP       = RGBColor(0x10, 0x4B, 0x38)   # Deep forest   #104B38
C_MINT       = RGBColor(0xDD, 0xF3, 0xE8)   # Light mint    #DDF3E8
C_MINT_MED   = RGBColor(0xA8, 0xD8, 0xBF)   # Mid mint
C_WHITE      = RGBColor(0xFF, 0xFF, 0xFF)
C_OFFWHITE   = RGBColor(0xF7, 0xF9, 0xF7)   # Off-white
C_CHARCOAL   = RGBColor(0x18, 0x23, 0x1E)   # Charcoal      #18231E
C_GRAY       = RGBColor(0x4B, 0x55, 0x63)   # Muted gray
C_ACCENT     = RGBColor(0xE8, 0xF8, 0xF0)   # Very light mint
C_GOLD       = RGBColor(0xF5, 0xA6, 0x23)   # Accent gold

SLIDE_W = Inches(13.33)
SLIDE_H = Inches(7.5)

prs = Presentation()
prs.slide_width  = SLIDE_W
prs.slide_height = SLIDE_H

# Use blank layout
BLANK = prs.slide_layouts[6]


# ═══════════════════════════════════════════════════════════════════════════════
# HELPER UTILITIES
# ═══════════════════════════════════════════════════════════════════════════════

def add_rect(slide, x, y, w, h, fill=None, line=None, line_w=Pt(0)):
    from pptx.util import Pt as _Pt
    shape = slide.shapes.add_shape(1, x, y, w, h)  # MSO_SHAPE_TYPE.RECTANGLE = 1
    shape.line.fill.background()
    if fill:
        shape.fill.solid()
        shape.fill.fore_color.rgb = fill
    else:
        shape.fill.background()
    if line:
        shape.line.color.rgb = line
        shape.line.width = line_w
    else:
        shape.line.fill.background()
    return shape


def add_text(slide, text, x, y, w, h,
             font_size=Pt(14), bold=False, italic=False,
             color=C_CHARCOAL, align=PP_ALIGN.LEFT,
             wrap=True, font_name='Calibri'):
    txBox = slide.shapes.add_textbox(x, y, w, h)
    tf = txBox.text_frame
    tf.word_wrap = wrap
    p = tf.paragraphs[0]
    p.alignment = align
    run = p.add_run()
    run.text = text
    run.font.size = font_size
    run.font.bold = bold
    run.font.italic = italic
    run.font.color.rgb = color
    run.font.name = font_name
    return txBox


def add_text_box_multiline(slide, lines, x, y, w, h,
                            font_size=Pt(13), color=C_CHARCOAL,
                            bold=False, line_spacing=None, font_name='Calibri',
                            align=PP_ALIGN.LEFT):
    """lines: list of (text, bold, color_override, size_override)"""
    txBox = slide.shapes.add_textbox(x, y, w, h)
    tf = txBox.text_frame
    tf.word_wrap = True
    first = True
    for item in lines:
        if isinstance(item, str):
            item = (item, bold, color, font_size)
        txt, bd, clr, sz = item
        if first:
            p = tf.paragraphs[0]
            first = False
        else:
            p = tf.add_paragraph()
        p.alignment = align
        if line_spacing:
            p.line_spacing = line_spacing
        run = p.add_run()
        run.text = txt
        run.font.size = sz if sz else font_size
        run.font.bold = bd
        run.font.color.rgb = clr if clr else color
        run.font.name = font_name
    return txBox


def add_image(slide, img_path, x, y, w, h=None):
    if not os.path.exists(img_path):
        print(f"  [WARN] Image not found: {img_path}")
        return None
    if h:
        pic = slide.shapes.add_picture(img_path, x, y, w, h)
    else:
        pic = slide.shapes.add_picture(img_path, x, y, w)
    return pic


def add_slide_number(slide, num, total=18):
    add_text(slide, f"{num} / {total}",
             SLIDE_W - Inches(1.1), SLIDE_H - Inches(0.38),
             Inches(1.0), Inches(0.3),
             font_size=Pt(10), color=C_GRAY, align=PP_ALIGN.RIGHT)


def add_header_bar(slide, title, subtitle=None):
    """Green header bar with title"""
    add_rect(slide, 0, 0, SLIDE_W, Inches(1.15), fill=C_GREEN)
    add_text(slide, title,
             Inches(0.4), Inches(0.1), SLIDE_W - Inches(0.5), Inches(0.65),
             font_size=Pt(24), bold=True, color=C_WHITE, font_name='Calibri')
    if subtitle:
        add_text(slide, subtitle,
                 Inches(0.4), Inches(0.72), SLIDE_W - Inches(5), Inches(0.35),
                 font_size=Pt(13), color=C_MINT_MED, font_name='Calibri')


def add_footer(slide, label="CarbonIQ – ADBMS Mini-Project | Bennett University"):
    add_rect(slide, 0, SLIDE_H - Inches(0.32), SLIDE_W, Inches(0.32), fill=C_DEEP)
    add_text(slide, label,
             Inches(0.3), SLIDE_H - Inches(0.3), Inches(8), Inches(0.28),
             font_size=Pt(9), color=C_MINT_MED)


def add_bullet_card(slide, x, y, w, h, title, bullets, bg=C_ACCENT,
                    title_color=C_DEEP, bullet_color=C_CHARCOAL,
                    title_size=Pt(14), bullet_size=Pt(12)):
    add_rect(slide, x, y, w, h, fill=bg, line=C_MINT_MED, line_w=Pt(1))
    add_text(slide, title, x + Inches(0.15), y + Inches(0.1),
             w - Inches(0.3), Inches(0.35),
             font_size=title_size, bold=True, color=title_color)
    bullet_y = y + Inches(0.42)
    bullet_h = (h - Inches(0.5)) / max(len(bullets), 1)
    lines = []
    for b in bullets:
        lines.append((f"  • {b}", False, bullet_color, bullet_size))
    add_text_box_multiline(slide, lines,
                            x + Inches(0.1), y + Inches(0.42),
                            w - Inches(0.2), h - Inches(0.5))


def add_kpi_box(slide, x, y, w, h, value, label, bg=C_GREEN, val_clr=C_WHITE, lbl_clr=C_MINT):
    add_rect(slide, x, y, w, h, fill=bg)
    add_text(slide, value, x, y + Inches(0.18), w, Inches(0.42),
             font_size=Pt(28), bold=True, color=val_clr, align=PP_ALIGN.CENTER)
    add_text(slide, label, x, y + Inches(0.6), w, Inches(0.32),
             font_size=Pt(11), color=lbl_clr, align=PP_ALIGN.CENTER)


def add_tag(slide, x, y, text, bg=C_GREEN, fg=C_WHITE, size=Pt(11)):
    w = Inches(len(text) * 0.1 + 0.4)
    h = Inches(0.32)
    add_rect(slide, x, y, w, h, fill=bg)
    add_text(slide, text, x + Inches(0.08), y + Inches(0.03), w - Inches(0.1), h,
             font_size=size, bold=True, color=fg)


# ═══════════════════════════════════════════════════════════════════════════════
# SLIDE 1 – TITLE SLIDE
# ═══════════════════════════════════════════════════════════════════════════════

# ═══════════════════════════════════════════════════════════════════════════════
# SPEAKER NOTES FOR ALL 18 SLIDES (Piyush Khatwa & Shobhit Tiwari)
# ═══════════════════════════════════════════════════════════════════════════════
SLIDE_SPEAKER_NOTES = {
    1: """[Presenter 1: Piyush Khatwa | Timing: ~40s]
Respected evaluators, faculty members, and colleagues, good morning.
I am Piyush Khatwa (Roll Number E23CSEU0853), and along with my project partner Shobhit Tiwari (Roll Number E23CSEU0891), from the School of Computer Science Engineering and Technology at Bennett University, we are pleased to present our Advanced Database Management Systems mini-project: 'CarbonIQ — AI-Powered Carbon Emissions Footprint Tracker'.

CarbonIQ is an engineering-driven, local-first web application and relational database system designed to calculate, analyze, and mitigate greenhouse gas emissions across both individual and institutional workspaces. In this presentation, we will demonstrate our four-tier decoupled architecture, a 3NF relational schema in PostgreSQL 18.6, core ADBMS implementations including atomic transactions and B-tree indexing, our verified deterministic calculation engine, and a privacy-preserving AI advisory microservice.

Let us begin with the background and motivation behind CarbonIQ.""",

    2: """[Presenter 1: Piyush Khatwa | Timing: ~45s]
To provide context, climate change mitigation requires precise, verifiable greenhouse gas accounting. As Lord Kelvin famously noted, 'If you cannot measure it, you cannot improve it.'

CarbonIQ addresses this fundamental challenge by providing an end-to-end platform that tracks operational emissions across five major human and organizational categories: Grid Electricity, Road and Air Transportation, Stationary Fossil Fuel Combustion, Liquefied Petroleum Gas (LPG), and Municipal Solid Waste.

The application computes carbon dioxide equivalent emissions using nationally and internationally accredited emission factors from the Central Electricity Authority (CEA) of India, the UK DEFRA, and the US EPA.

Crucially, CarbonIQ is architected with a dual-workspace paradigm, seamlessly supporting individual personal tracking alongside multi-tenant institutional workspaces with role-based access control. All calculations are executed with exact decimal precision, and personalized reduction strategies are generated using an integrated AI advisory microservice.

Next, let us examine the critical gaps in existing carbon tracking approaches that prompted our design.""",

    3: """[Presenter 1: Piyush Khatwa | Timing: ~45s]
Before developing CarbonIQ, we analyzed why existing carbon tracking efforts fall short in educational institutions and small-to-medium enterprises. We identified five acute architectural deficiencies:

First, Data Fragmentation: most organizations track emissions using unstandardized spreadsheets that lack referential integrity, schema constraints, and concurrent access control, leading to frequent corruption and human error.
Second, Opaque 'Black-Box' Calculations: commercial tools frequently present aggregated footprint numbers without exposing the underlying emission factor edition, regional grid baseline, or mathematical methodology.
Third, Scalability Bottlenecks: analytical queries across multi-year historical logs suffer severe latency when executed on flat files or non-indexed databases.
Fourth, Lack of Actionable Intelligence: static dashboards present raw numerical data but fail to translate emissions into prioritized, cost-effective reduction roadmaps.
Finally, High Licensing Barriers: enterprise ESG solutions such as Persefoni or Watershed require substantial enterprise budgets, leaving university departments and individual users without viable tools.

To overcome these five gaps, we formulated a set of concrete, measurable technical objectives.""",

    4: """[Presenter 1: Piyush Khatwa | Timing: ~45s]
Our overarching project aim was to design, implement, empirically verify, and rigorously document a production-grade, local-first carbon emissions tracking platform adhering to core ADBMS principles.

We formulated ten concrete, measurable technical objectives:
1. Engineer a Third Normal Form schema comprising 13 tables with UUID primary keys and cascaded foreign keys.
2. Ensure mathematical accuracy using NUMERIC(14,4) fixed-point arithmetic without IEEE 754 floating-point inaccuracies.
3. Guarantee ACID transactional safety through PL/pgSQL stored functions and zero-orphan rollback semantics.
4. Enforce automated audit trails via row-level database triggers.
5. Create parameterized analytical views for multi-dimensional reporting.
6. Optimize query performance below 1 ms using targeted multi-column B-tree composite indexes.
7. Implement dual-workspace support with structural ownership constraints.
8. Build a responsive React 18 single-page application with real-time interactive visual analytics.
9. Deploy a privacy-preserving FastAPI microservice powered by Google Gemini with an offline heuristic fallback.
10. Achieve 100% test coverage across database constraints, API endpoints, and concurrency workloads.

Let us now review the competitive landscape and academic literature.""",

    5: """[Presenter 1: Piyush Khatwa | Timing: ~40s]
We surveyed three primary categories of existing carbon accounting systems to establish our project baseline:

1. Enterprise Platforms like Persefoni and Watershed: While robust, they are proprietary, cloud-locked, cost-prohibitive for academic settings, and do not provide individual or SME-tier granular tracking.
2. Manual Spreadsheets: Ubiquitous in universities, but completely lacking ACID transaction guarantees, referential integrity, concurrent write safety, and automated auditing.
3. Public Web Calculators like Carbon Footprint or WWF: These provide high-level one-off estimations without persistent relational storage, longitudinal tracking, or institutional organizational structures.

CarbonIQ closes this academic and technical gap: we deliver an open-source, local-first system combining enterprise-grade relational integrity and indexing with accessible, privacy-first AI advisory capabilities.

Now, let us explore the proposed solution and core capabilities of CarbonIQ.""",

    6: """[Presenter 1: Piyush Khatwa | Timing: ~40s]
The proposed CarbonIQ platform addresses each identified limitation through six unified technical capabilities:

1. Dual-Workspace Architecture: Users can toggle between a private personal space and multi-tenant organizational workspaces featuring Owner, Admin, Member, and Viewer role-based access.
2. 5-Category Activity Ingestion: A guided, validated modal captures activities across Electricity, Transport, Fuel, LPG, and Waste with automatic unit conversions.
3. Deterministic Calculation Engine: Calculations pair verified baseline emission factors with activity quantities, snapshotting the active factor ID to maintain permanent historical auditability.
4. Real-Time Interactive Visualizations: Recharts-powered trend analysis, category breakdowns, and goal tracking provide immediate visual feedback.
5. Privacy-Preserving AI Insights: The AI engine processes exclusively aggregated category metrics—never personally identifiable information or raw notes.
6. Enterprise-Grade ADBMS Foundation: Built on PostgreSQL 18.6 with stored functions, audit triggers, and sub-millisecond indexed queries.

Let us look under the hood at the four-tier system architecture.""",

    7: """[Presenter 1: Piyush Khatwa | Timing: ~45s]
Here we illustrate the four-tier decoupled architecture of CarbonIQ:

- Tier 1 is the Presentation Layer: A single-page application built on React 18, Vite 5, Tailwind CSS, and Recharts, communicating via standard REST over HTTP/JSON on port 5173.
- Tier 2 is the Application Layer: A Node.js and Express 4.19 REST API running on port 5000, enforcing JWT authentication, Zod request validation, workspace isolation middleware, and database connection pooling.
- Tier 3 is the AI Advisory Layer: An independent Python FastAPI microservice on port 8000, integrating Google Gemini 2.5 Flash with a robust offline heuristic fallback engine.
- Tier 4 is the Data Layer: A PostgreSQL 18.6 relational database on port 5432 containing 13 normalized tables, 4 analytical views, 5 PL/pgSQL stored functions, 10 triggers, and 31 B-tree indexes.

This clean separation of concerns ensures horizontal scalability, local-first privacy, and minimal coupling between services.""",

    8: """[Presenter 1: Piyush Khatwa | Timing: ~40s]
Every component in our technology stack is verified directly from our project dependency manifests:

- On the Frontend: React 18.2 with React Router 6.22, bundled by Vite 5.1 in under 18 seconds across 2,303 modules, styled with Tailwind CSS 3.4, and visualized using Recharts 2.12 and Lucide React icons.
- On the Backend: Node.js with Express 4.19, utilizing the node-postgres driver 8.11 with connection pooling, Zod 3.22 schema validation, bcryptjs 2.4 password hashing, and jsonwebtoken 9.0 for stateless session authorization.
- On the Database: PostgreSQL 18.6, selected for its ACID reliability, PL/pgSQL procedural engine, JSONB support, and advanced B-tree indexing capabilities.
- In the AI Service: Python 3.14 with FastAPI 0.110, Uvicorn 0.28 ASGI server, Pydantic 2.6 schema validation, and the official Google GenAI SDK 0.1.1.
- In Testing: Custom automated suites using Supertest and Jest patterns, validating all 54 assertions in under 2 seconds.

Next, let us review how these technologies are structured into application modules.""",

    9: """[Presenter 1: Piyush Khatwa | Timing: ~45s]
CarbonIQ is organized into seven modular feature subsystems:

1. Authentication Module: Secure registration, login, bcrypt password hashing with salt rounds, JWT issuance, and quick-fill demo credentials for seamless evaluation.
2. Workspace & Organization Module: Workspace switching, multi-tenant organization creation, invitation workflows, and four-tier RBAC enforcement.
3. Activity Tracking Module: Validated multi-category data entry forms with category-specific units and real-time validation.
4. Calculation Engine Module: Synchronous emission calculation via database stored function, factoring in snapshotted emission factor coefficients.
5. Analytics & Reporting Module: Time-series aggregations, category breakdowns, departmental comparisons, and printable PDF export.
6. AI Recommendation Module: Context-aware reduction recommendations with estimated kg CO₂e savings and implementation feasibility ratings.
7. Audit & Administration Module: Complete immutable audit logs capturing activity creation, modifications, and deletions with pre- and post-state snapshots.

I would now like to hand over to my partner, Shobhit Tiwari, who will present our database design, ADBMS concepts, and empirical verification results.""",

    10: """[Presenter 2: Shobhit Tiwari | Timing: ~50s]
Thank you, Piyush. Good morning everyone. I am Shobhit Tiwari, and I will walk you through our database architecture and ADBMS engineering implementations.

Slide 10 presents our Entity-Relationship model, fully normalized into Third Normal Form (3NF) across 13 PostgreSQL tables:
- The core identity tables are 'users', 'organizations', 'organization_members', and 'departments'.
- The metadata and configuration tables include 'categories', 'emission_factors', and 'reduction_tips'.
- The primary transactional table is 'activities', which records every individual emission event.
- Supporting tracking tables include 'activity_tags', 'reduction_goals', 'audit_logs', and 'ai_recommendations'.

Key structural design decisions include:
First, all primary keys utilize cryptographically random UUIDv4 via pgcrypto, preventing enumeration attacks and enabling distributed key generation.
Second, all foreign keys enforce explicit referential integrity with ON DELETE CASCADE or ON DELETE RESTRICT where audit trails must be preserved.
Third, we enforce strict domain constraints, such as 'chk_activity_workspace_scope', which ensures an activity is owned either by an individual user or by an organization workspace, never an orphaned state.

Let us now examine the specific ADBMS concepts implemented across these relations.""",

    11: """[Presenter 2: Shobhit Tiwari | Timing: ~55s]
This slide highlights the six advanced database management concepts implemented in CarbonIQ:

1. Normalization: Strict 3NF decomposition eliminates all insertion, update, and deletion anomalies. Zero transitive functional dependencies exist in our schema.
2. ACID Transactions: Multi-statement atomic operations ensure that creating an activity and its corresponding audit log succeeds completely or rolls back entirely, verified with zero orphan rows.
3. PL/pgSQL Stored Functions: We authored 5 stored functions, including 'sp_record_activity_with_emissions', which performs factor lookup, emission arithmetic, activity insertion, and audit recording inside a single atomic database execution context.
4. Triggers: 10 database triggers, such as 'trg_audit_activities', execute automatically on INSERT, UPDATE, or DELETE to capture before-and-after JSONB state snapshots into 'audit_logs'.
5. Views: 4 analytical views—including 'v_user_monthly_summary' and 'v_org_department_emissions'—abstract complex multi-table joins and aggregations for reporting.
6. Indexing & Optimization: 31 B-tree indexes, including composite indexes like 'idx_activities_user_date' on (user_id, activity_date), achieve a 0.58 ms EXPLAIN ANALYZE execution time, representing an 85% query acceleration over sequential scans.

Next, let us delve into the emission calculation engine and mathematical validation.""",

    12: """[Presenter 2: Shobhit Tiwari | Timing: ~45s]
Our emission calculation follows deterministic, reproducible, and verifiable arithmetic grounded in the GHG Protocol corporate standard:

The core equation is: Emissions in kilograms of CO₂ equivalent equals Activity Quantity multiplied by the snapshotted Emission Factor.
To prevent rounding drift inherent in IEEE 754 floating-point numbers, all emissions and quantities are stored as PostgreSQL NUMERIC(14,4) fixed-point data types.

Let us examine our verified live calculation example:
When a user records 100 kWh of grid electricity in India:
- The active factor from the Central Electricity Authority (CEA 2023) is exactly 0.7160 kg CO₂e per kWh.
- The stored function computes: 100 times 0.7160 = exactly 71.6000 kg CO₂e, or 0.0716 metric tonnes.
- The exact emission factor ID is snapshotted in the activity row. If national grid emission factors are updated next year, historical calculations remain permanently auditable and invariant.

In terms of GHG Scopes: Purchased electricity represents Scope 2; direct vehicle fuel and LPG represent Scope 1; and municipal waste treatment represents Scope 3 Category 5.

Now, let us see how these calculations feed into our AI Advisory Microservice.""",

    13: """[Presenter 2: Shobhit Tiwari | Timing: ~45s]
Moving to our AI Advisory Microservice, CarbonIQ pairs deterministic data with intelligent, personalized recommendations:

- The service is implemented in Python FastAPI with Pydantic schema validation.
- Privacy-by-Design: The service receives exclusively aggregated category summaries and top emission drivers. It never receives user names, email addresses, passwords, or raw user notes.
- Dual-Mode Engine: Under normal conditions, it queries Google Gemini 2.5 Flash via structured JSON prompting, returning prioritized recommendations with estimated percentage and kilogram reductions.
- Offline Heuristic Fallback: If network connectivity is unavailable, the API key is not configured, or rate limits are reached, CarbonIQ automatically switches in under 20 milliseconds to an internal rule-based heuristic engine, generating contextual reduction tips derived directly from our database seeds.

This ensures 100% service uptime even in completely offline local deployment environments.""",

    14: """[Presenter 2: Shobhit Tiwari | Timing: ~40s]
Slide 14 showcases illustrative architectural schematics representing the responsive React 18 single-page application interface, fully accessible at localhost:5173:

- The Landing and Authentication interface features clean emerald branding, role-based onboarding, and quick-fill buttons for immediate evaluation.
- The Executive Dashboard displays four summary metric cards: Total Emissions, Monthly Trend with delta percentage, Active Reduction Goals, and AI Insight count, accompanied by Recharts area and bar charts.
- The Add Activity Modal provides an intuitive 3-step wizard with category icons, automatic unit labeling, dynamic previews, and instant validation.
- The Emissions Analytics view offers multi-dimensional filtering by date range, category, and workspace, alongside departmental distribution charts.
- Finally, the Goals and Insights screen presents active reduction progress bars and structured AI recommendation cards with one-click adoption.

Now, let us examine our empirical test verification and system performance results.""",

    15: """[Presenter 2: Shobhit Tiwari | Timing: ~45s]
To validate system reliability, we implemented and executed a comprehensive automated test harness comprising 54 assertions across 5 specialized test suites, achieving a 100% pass rate:

1. Database Integrity Suite (7 tests): Validated UUID generation, CHECK constraints, foreign key cascades, and trigger execution.
2. REST API Integration Suite (25 tests): Validated all endpoints for authentication, activities, organizations, analytics, and error handling.
3. AI Microservice Suite (4 tests): Validated health checks, Pydantic request validation, Gemini prompt generation, and heuristic fallback.
4. ADBMS Advanced Feature Suite (8 tests): Validated NUMERIC(14,4) precision (Test 6: 100 kWh × 0.7160 = 71.6000 kg CO₂e), transaction rollback with zero orphan rows (Test 7), and EXPLAIN ANALYZE index execution at 0.58 ms (Test 8).
5. Concurrency & Stress Suite (10 tests): Executed 10 concurrent activity creation transactions in 274 milliseconds, resulting in zero deadlocks, zero lock timeouts, and perfect serializable consistency.

Next, let us discuss our identified limitations and roadmap for future research.""",

    16: """[Presenter 2: Shobhit Tiwari | Timing: ~40s]
In the interest of scientific rigor and academic honesty, we have explicitly documented the current limitations of CarbonIQ and our roadmap for future development:

Current Boundaries:
1. Data Ingestion: Activity entries currently rely on manual form input rather than automated IoT smart-meter or utility API integrations.
2. Scope 3 Coverage: In accordance with our project boundaries, Scope 3 is limited to Category 5 (waste disposal), omitting upstream supply chains and purchased goods.
3. Emission Factor Granularity: Emission factors represent national averages (CEA/DEFRA) rather than real-time regional marginal grid variations.

Future Research & Roadmap:
- Ingesting real-time IoT smart plug telemetry via MQTT or WebSockets.
- Expanding Scope 3 upstream supply chain calculations using open LCA databases.
- Implementing automated OCR utility bill ingestion using multimodal computer vision.
- Enabling verifiable blockchain hashing for tamper-proof regulatory ESG audits.

Let us now summarize the key achievements and conclusions of this project.""",

    17: """[Presenter 2: Shobhit Tiwari | Timing: ~40s]
To conclude our presentation, CarbonIQ successfully bridges database theory and practical environmental software engineering:

Key Achievements:
- We delivered a production-ready, local-first carbon footprint tracker across 5 major emission categories.
- We proved all 10 technical ADBMS objectives, demonstrating 3NF relational normalization, atomic ACID transactions, automated audit triggers, analytical views, and sub-millisecond B-tree indexing.
- We verified all 54 test assertions with a 100% pass rate, zero deadlocks under concurrency, and zero orphan rows on rollback.
- We combined deterministic mathematical precision with a privacy-preserving, fault-tolerant AI advisory microservice.

Key Learnings:
- The paramount importance of fixed-point NUMERIC types in financial and environmental accounting.
- How database triggers and stored functions guarantee data integrity at the lowest layer, independent of application bugs.
- How decoupled microservice architecture enables robust offline fallbacks and strong privacy guarantees.

We will now conclude and invite questions.""",

    18: """[Presenter 1 & 2: Piyush Khatwa & Shobhit Tiwari | Timing: ~30s + Q&A]
Piyush Khatwa & Shobhit Tiwari:
Thank you very much for your time, attention, and guidance throughout this project.
We would like to express our sincere gratitude to our course instructor, faculty advisors, and the School of Computer Science Engineering and Technology at Bennett University.

We are now open and eager to take your questions, feedback, and discussion on our database schema, ACID verification, index optimization, or application architecture."""
}


def add_speaker_notes(slide, notes_text):
    """Add speaker notes to a slide's notes frame"""
    notes_slide = slide.notes_slide
    tf = notes_slide.notes_text_frame
    tf.text = notes_text.strip()



def slide_01_title():
    slide = prs.slides.add_slide(BLANK)

    # Full deep-green background
    add_rect(slide, 0, 0, SLIDE_W, SLIDE_H, fill=C_DEEP)

    # Decorative mint stripe top
    add_rect(slide, 0, 0, SLIDE_W, Inches(0.18), fill=C_GREEN)

    # Decorative circle accents (top-right)
    add_rect(slide, SLIDE_W - Inches(3), Inches(0.2), Inches(2.5), Inches(2.5), fill=RGBColor(0x1A, 0x5E, 0x42))
    add_rect(slide, SLIDE_W - Inches(1.8), Inches(0.1), Inches(1.6), Inches(1.6), fill=RGBColor(0x22, 0x7A, 0x56))

    # CarbonIQ logo text
    add_text(slide, "🌿 CarbonIQ",
             Inches(0.6), Inches(0.9), Inches(10), Inches(1.0),
             font_size=Pt(52), bold=True, color=C_WHITE, font_name='Calibri')

    # Subtitle
    add_text(slide, "AI-Powered Carbon Emissions Footprint Tracker",
             Inches(0.6), Inches(1.9), Inches(11), Inches(0.6),
             font_size=Pt(24), color=C_MINT, font_name='Calibri')

    # Divider line
    add_rect(slide, Inches(0.6), Inches(2.7), Inches(7), Inches(0.04), fill=C_GREEN)

    # Course label
    add_text(slide, "Advanced Database Management Systems (ADBMS)",
             Inches(0.6), Inches(2.85), Inches(10), Inches(0.4),
             font_size=Pt(15), color=C_MINT_MED, font_name='Calibri')

    # Team details card
    add_rect(slide, Inches(0.6), Inches(3.45), Inches(7.5), Inches(1.9), fill=RGBColor(0x1C, 0x52, 0x3B))
    add_text(slide, "Team Members",
             Inches(0.85), Inches(3.58), Inches(5), Inches(0.35),
             font_size=Pt(13), bold=True, color=C_MINT, font_name='Calibri')
    lines = [
        ("Piyush Khatwa   •   Roll No: E23CSEU0853", False, C_WHITE, Pt(15)),
        ("Shobhit Tiwari   •   Roll No: E23CSEU0891", False, C_WHITE, Pt(15)),
    ]
    add_text_box_multiline(slide, lines, Inches(0.85), Inches(3.98), Inches(7), Inches(1.0))

    # University
    add_text(slide, "School of Computer Science Engineering and Technology\nBennett University, Greater Noida  |  November 2026",
             Inches(0.6), Inches(5.45), Inches(9), Inches(0.7),
             font_size=Pt(13), color=C_MINT_MED, font_name='Calibri')

    # Bottom stripe
    add_rect(slide, 0, SLIDE_H - Inches(0.18), SLIDE_W, Inches(0.18), fill=C_GREEN)

    add_slide_number(slide, 1)
    return slide


# ═══════════════════════════════════════════════════════════════════════════════
# SLIDE 2 – PROJECT INTRODUCTION
# ═══════════════════════════════════════════════════════════════════════════════
def slide_02_intro():
    slide = prs.slides.add_slide(BLANK)
    add_rect(slide, 0, 0, SLIDE_W, SLIDE_H, fill=C_OFFWHITE)
    add_header_bar(slide, "What is CarbonIQ?", "Project Introduction")
    add_footer(slide)
    add_slide_number(slide, 2)

    # Left: description
    add_text(slide, "CarbonIQ is a production-grade, local-first web application and relational database system that enables individuals and organizations to:",
             Inches(0.4), Inches(1.3), Inches(6.0), Inches(0.8),
             font_size=Pt(13), color=C_CHARCOAL, wrap=True)

    features = [
        "📊  Track carbon emissions across 5 operational categories",
        "🔢  Calculate CO₂e using verified emission factors (CEA, DEFRA, EPA)",
        "🏢  Support both personal & multi-tenant organizational workspaces",
        "📈  Visualize trends with interactive analytics dashboards",
        "🎯  Set and track carbon reduction goals",
        "🤖  Receive AI-powered personalized reduction recommendations",
    ]
    for i, f in enumerate(features):
        add_rect(slide, Inches(0.4), Inches(2.2) + Inches(i * 0.72), Inches(5.8), Inches(0.62),
                 fill=C_ACCENT, line=C_MINT_MED, line_w=Pt(1))
        add_text(slide, f, Inches(0.55), Inches(2.26) + Inches(i * 0.72),
                 Inches(5.5), Inches(0.5), font_size=Pt(12.5), color=C_CHARCOAL)

    # Right: Why it matters
    add_rect(slide, Inches(6.6), Inches(1.28), Inches(6.3), Inches(5.85),
             fill=C_GREEN)
    add_text(slide, "🌍  Why Carbon Tracking Matters",
             Inches(6.8), Inches(1.42), Inches(6.0), Inches(0.45),
             font_size=Pt(15), bold=True, color=C_WHITE)
    why_points = [
        ("Global Crisis", "IPCC 2023: Rising CO₂e levels drive extreme climate events"),
        ("Compliance", "Paris Agreement & GHG Protocol mandate corporate reporting"),
        ("Awareness", "80% of users underestimate their personal carbon footprint"),
        ("Action", "Identifying top-emission activities enables targeted reductions"),
    ]
    for i, (title, desc) in enumerate(why_points):
        yy = Inches(2.02) + Inches(i * 1.22)
        add_rect(slide, Inches(6.8), yy, Inches(5.9), Inches(1.08),
                 fill=RGBColor(0x1A, 0x5E, 0x42))
        add_text(slide, title, Inches(7.0), yy + Inches(0.07), Inches(5.5), Inches(0.35),
                 font_size=Pt(13), bold=True, color=C_MINT)
        add_text(slide, desc, Inches(7.0), yy + Inches(0.4), Inches(5.5), Inches(0.6),
                 font_size=Pt(11.5), color=C_WHITE)

    return slide


# ═══════════════════════════════════════════════════════════════════════════════
# SLIDE 3 – PROBLEM STATEMENT
# ═══════════════════════════════════════════════════════════════════════════════
def slide_03_problem():
    slide = prs.slides.add_slide(BLANK)
    add_rect(slide, 0, 0, SLIDE_W, SLIDE_H, fill=C_OFFWHITE)
    add_header_bar(slide, "Problem Statement", "Gaps in existing carbon tracking approaches")
    add_footer(slide)
    add_slide_number(slide, 3)

    problems = [
        ("❌  Data Fragmentation",
         "Institutions rely on unstandardized spreadsheets — no referential integrity, no concurrency control, prone to formula overwrites."),
        ("❌  Opaque Calculations",
         "Many tools act as 'black boxes' — they omit the exact emission factor value, edition, and governmental citation used."),
        ("❌  No Transactional Atomicity",
         "If a network error occurs between activity entry and emission calculation, orphan records corrupt the analytical ledger."),
        ("❌  Weak Multi-Tenant Isolation",
         "Existing apps use loosely partitioned schemas without database-level constraints — risking cross-tenant data leakage."),
        ("❌  Disconnected AI Advisory",
         "LLM-integrated tools hallucinate emission values, or transmit sensitive user identities to third-party cloud APIs."),
    ]
    for i, (title, desc) in enumerate(problems):
        yy = Inches(1.28) + Inches(i * 1.18)
        add_rect(slide, Inches(0.35), yy, Inches(12.6), Inches(1.05),
                 fill=C_WHITE, line=RGBColor(0xE8, 0xB4, 0xB8), line_w=Pt(1.5))
        add_rect(slide, Inches(0.35), yy, Inches(0.18), Inches(1.05),
                 fill=RGBColor(0xC0, 0x39, 0x2B))
        add_text(slide, title, Inches(0.65), yy + Inches(0.06), Inches(4.5), Inches(0.38),
                 font_size=Pt(13.5), bold=True, color=RGBColor(0xC0, 0x39, 0x2B))
        add_text(slide, desc, Inches(0.65), yy + Inches(0.44), Inches(11.8), Inches(0.55),
                 font_size=Pt(12), color=C_CHARCOAL)

    return slide


# ═══════════════════════════════════════════════════════════════════════════════
# SLIDE 4 – AIM AND OBJECTIVES
# ═══════════════════════════════════════════════════════════════════════════════
def slide_04_objectives():
    slide = prs.slides.add_slide(BLANK)
    add_rect(slide, 0, 0, SLIDE_W, SLIDE_H, fill=C_OFFWHITE)
    add_header_bar(slide, "Aim & Objectives", "Technical goals of the CarbonIQ ADBMS project")
    add_footer(slide)
    add_slide_number(slide, 4)

    # Aim box
    add_rect(slide, Inches(0.35), Inches(1.28), Inches(12.6), Inches(0.78),
             fill=C_DEEP)
    add_text(slide, "🎯  AIM:  Design, implement, verify, and document a production-grade carbon emissions tracking system "
             "demonstrating advanced database engineering — normalization, ACID transactions, triggers, views, stored functions, and query optimization.",
             Inches(0.55), Inches(1.33), Inches(12.2), Inches(0.7),
             font_size=Pt(13), color=C_WHITE, bold=False)

    objectives = [
        ("Obj 1", "3NF normalized PostgreSQL schema — 13 tables with UUID PKs and cascaded FK constraints"),
        ("Obj 2", "Domain CHECK constraints enforcing positive quantities and workspace exclusivity"),
        ("Obj 3", "ACID transaction atomicity — multi-table writes with automatic rollback protection"),
        ("Obj 4", "Active JSONB audit triggers capturing INSERT / UPDATE / DELETE state changes"),
        ("Obj 5", "Analytical SQL views and stored PL/pgSQL functions for aggregation pipelines"),
        ("Obj 6", "31 B-tree indexes benchmarked via EXPLAIN ANALYZE — query in under 0.6 ms"),
        ("Obj 7", "Secure Express REST API with bcrypt, JWT, and workspace scoping middleware"),
        ("Obj 8", "Python FastAPI AI microservice with Google Gemini and offline heuristic fallback"),
        ("Obj 9", "React 18 SPA with Recharts analytics, live calculation preview, and CSV export"),
        ("Obj 10", "54 automated test assertions across 5 suites — 100% pass rate verified"),
    ]
    for i, (num, desc) in enumerate(objectives):
        col = i % 2
        row = i // 2
        x = Inches(0.35) + col * Inches(6.32)
        y = Inches(2.2) + row * Inches(0.97)
        add_rect(slide, x, y, Inches(6.15), Inches(0.85),
                 fill=C_ACCENT, line=C_MINT_MED, line_w=Pt(1))
        add_rect(slide, x, y, Inches(0.75), Inches(0.85), fill=C_GREEN)
        add_text(slide, num, x + Inches(0.02), y + Inches(0.2), Inches(0.72), Inches(0.42),
                 font_size=Pt(11), bold=True, color=C_WHITE, align=PP_ALIGN.CENTER)
        add_text(slide, desc, x + Inches(0.85), y + Inches(0.12), Inches(5.18), Inches(0.65),
                 font_size=Pt(11.5), color=C_CHARCOAL)

    return slide


# ═══════════════════════════════════════════════════════════════════════════════
# SLIDE 5 – LITERATURE REVIEW / RESEARCH GAP
# ═══════════════════════════════════════════════════════════════════════════════
def slide_05_lit_review():
    slide = prs.slides.add_slide(BLANK)
    add_rect(slide, 0, 0, SLIDE_W, SLIDE_H, fill=C_OFFWHITE)
    add_header_bar(slide, "Existing Systems & Research Gap", "Literature review and competitive analysis")
    add_footer(slide)
    add_slide_number(slide, 5)

    cols = [
        ("💼 Enterprise Platforms\n(Persefoni, Watershed)", [
            "Require expensive SaaS subscriptions",
            "Proprietary closed-source calculations",
            "No individual / SME-level tracking",
            "No on-premise data sovereignty",
        ], C_ACCENT),
        ("🖩 Spreadsheet Tools\n(Excel / Google Sheets)", [
            "No referential integrity",
            "Vulnerable to formula overwrites",
            "Zero concurrency control",
            "No ACID guarantees",
        ], C_ACCENT),
        ("🌐 Web Calculators\n(EPA, WWF footprint tools)", [
            "Single-use — no activity history",
            "No organizational multi-tenancy",
            "Black-box factor provenance",
            "No audit trail or verification",
        ], C_ACCENT),
        ("✅ CarbonIQ Addresses", [
            "Open-source local-first architecture",
            "3NF relational DB with ACID guarantees",
            "Transparent, cited emission factors",
            "Multi-tenant organizational workspace",
            "JSONB audit trail & stored functions",
        ], C_MINT),
    ]
    for i, (title, pts, bg) in enumerate(cols):
        x = Inches(0.35) + i * Inches(3.22)
        add_rect(slide, x, Inches(1.28), Inches(3.08), Inches(5.85),
                 fill=bg, line=C_MINT_MED, line_w=Pt(1))
        add_text(slide, title, x + Inches(0.12), Inches(1.38), Inches(2.84), Inches(0.7),
                 font_size=Pt(12.5), bold=True, color=C_DEEP)
        for j, p in enumerate(pts):
            add_rect(slide, x + Inches(0.12), Inches(2.22) + j * Inches(0.78),
                     Inches(2.84), Inches(0.68),
                     fill=C_WHITE, line=C_MINT_MED, line_w=Pt(0.5))
            add_text(slide, f"  {p}", x + Inches(0.14), Inches(2.28) + j * Inches(0.78),
                     Inches(2.78), Inches(0.6), font_size=Pt(11.5), color=C_CHARCOAL)

    return slide


# ═══════════════════════════════════════════════════════════════════════════════
# SLIDE 6 – PROPOSED SOLUTION
# ═══════════════════════════════════════════════════════════════════════════════
def slide_06_solution():
    slide = prs.slides.add_slide(BLANK)
    add_rect(slide, 0, 0, SLIDE_W, SLIDE_H, fill=C_OFFWHITE)
    add_header_bar(slide, "CarbonIQ — Proposed Solution", "A holistic carbon accounting platform")
    add_footer(slide)
    add_slide_number(slide, 6)

    modules = [
        ("🔐", "Dual Workspace\nArchitecture", "Personal & Org\nworkspaces with RBAC"),
        ("📝", "5-Category\nActivity Tracking", "Electricity, Transport,\nFuel, LPG, Waste"),
        ("🔢", "Deterministic\nCalculations", "quantity × factor\n(CEA / DEFRA / EPA)"),
        ("📊", "Interactive\nAnalytics", "Monthly trends,\ncategory breakdowns"),
        ("🎯", "Reduction\nGoals", "Set targets, track\nlive progress"),
        ("🤖", "AI Advisory\n(FastAPI)", "Personalised recs +\noffline fallback"),
    ]
    for i, (icon, title, desc) in enumerate(modules):
        col = i % 3
        row = i // 3
        x = Inches(0.4) + col * Inches(4.3)
        y = Inches(1.35) + row * Inches(2.8)
        add_rect(slide, x, y, Inches(4.0), Inches(2.55), fill=C_WHITE,
                 line=C_MINT_MED, line_w=Pt(1.5))
        add_rect(slide, x, y, Inches(4.0), Inches(0.55), fill=C_GREEN)
        add_text(slide, f"{icon}  {title}", x + Inches(0.12), y + Inches(0.08),
                 Inches(3.76), Inches(0.45), font_size=Pt(14), bold=True, color=C_WHITE)
        add_text(slide, desc, x + Inches(0.2), y + Inches(0.7),
                 Inches(3.6), Inches(1.7), font_size=Pt(14), color=C_CHARCOAL)

    return slide


# ═══════════════════════════════════════════════════════════════════════════════
# SLIDE 7 – SYSTEM ARCHITECTURE
# ═══════════════════════════════════════════════════════════════════════════════
def slide_07_architecture():
    slide = prs.slides.add_slide(BLANK)
    add_rect(slide, 0, 0, SLIDE_W, SLIDE_H, fill=C_OFFWHITE)
    add_header_bar(slide, "System Architecture", "Four-tier decoupled local-first architecture")
    add_footer(slide)
    add_slide_number(slide, 7)

    # Embed architecture diagram
    fig_path = os.path.join(FIGS_DIR, 'fig3_1_system_architecture.png')
    if os.path.exists(fig_path):
        add_image(slide, fig_path, Inches(0.3), Inches(1.25), Inches(8.3), Inches(5.9))

    # Tier cards on right
    tiers = [
        ("Tier 1", "React 18 SPA", "Vite 5 · Tailwind CSS\nRecharts · Lucide React", C_GREEN),
        ("Tier 2", "Express REST API", "Node.js · JWT · Zod\nbcryptjs · pg Pool", C_DEEP),
        ("Tier 3", "PostgreSQL 18.6", "13 Tables · 4 Views\n5 Functions · 10 Triggers", RGBColor(0x1A, 0x68, 0xA0)),
        ("Tier 4", "FastAPI AI Service", "Python 3.14 · Pydantic\nGoogle Gemini + Fallback", RGBColor(0x76, 0x44, 0xAB)),
    ]
    for i, (tier, name, stack, bg) in enumerate(tiers):
        yy = Inches(1.3) + i * Inches(1.48)
        add_rect(slide, Inches(8.75), yy, Inches(4.2), Inches(1.32), fill=bg)
        add_text(slide, tier, Inches(8.9), yy + Inches(0.06), Inches(1.2), Inches(0.32),
                 font_size=Pt(10), bold=True, color=C_MINT)
        add_text(slide, name, Inches(8.9), yy + Inches(0.3), Inches(4.0), Inches(0.38),
                 font_size=Pt(14), bold=True, color=C_WHITE)
        add_text(slide, stack, Inches(8.9), yy + Inches(0.72), Inches(4.0), Inches(0.55),
                 font_size=Pt(11), color=C_MINT)

    return slide


# ═══════════════════════════════════════════════════════════════════════════════
# SLIDE 8 – TECHNOLOGY STACK
# ═══════════════════════════════════════════════════════════════════════════════
def slide_08_tech_stack():
    slide = prs.slides.add_slide(BLANK)
    add_rect(slide, 0, 0, SLIDE_W, SLIDE_H, fill=C_OFFWHITE)
    add_header_bar(slide, "Technology Stack", "Verified from package.json, requirements.txt and source code")
    add_footer(slide)
    add_slide_number(slide, 8)

    stacks = [
        ("🎨  Frontend", C_GREEN, [
            "React 18.2  +  React Router 6.22",
            "Vite 5.1  (build tool / dev server)",
            "Tailwind CSS 3.4  (utility-first styling)",
            "Recharts 2.12  (AreaChart, PieChart)",
            "Lucide React 0.359  (icon library)",
        ]),
        ("⚙️  Backend API", C_DEEP, [
            "Node.js 20.11.1  +  Express 4.19",
            "bcryptjs 2.4  (12-round password hashing)",
            "jsonwebtoken 9.0  (JWT auth tokens)",
            "pg 8.11  (PostgreSQL connection pool)",
            "Zod 3.22  (runtime schema validation)",
        ]),
        ("🤖  AI Microservice", RGBColor(0x76, 0x44, 0xAB), [
            "Python 3.14.3  +  FastAPI 0.110",
            "Uvicorn 0.28  (ASGI server)",
            "Pydantic 2.6  (request / response models)",
            "google-genai 0.1  (Gemini API client)",
            "Offline heuristic fallback engine",
        ]),
        ("🗄️  Database", RGBColor(0x1A, 0x68, 0xA0), [
            "PostgreSQL 18.6  (local — port 5432)",
            "UUID v4 primary keys (gen_random_uuid)",
            "NUMERIC(14,4) / (16,4) precision types",
            "TIMESTAMPTZ — UTC storage, UI localised",
            "pgcrypto extension for UUID fallback",
        ]),
    ]
    for i, (title, bg, items) in enumerate(stacks):
        col = i % 2
        row = i // 2
        x = Inches(0.35) + col * Inches(6.5)
        y = Inches(1.3) + row * Inches(2.95)
        add_rect(slide, x, y, Inches(6.3), Inches(2.8), fill=bg)
        add_text(slide, title, x + Inches(0.18), y + Inches(0.1), Inches(5.9), Inches(0.42),
                 font_size=Pt(15), bold=True, color=C_WHITE)
        for j, item in enumerate(items):
            add_rect(slide, x + Inches(0.15), y + Inches(0.62) + j * Inches(0.42),
                     Inches(5.98), Inches(0.38),
                     fill=RGBColor(0xFF, 0xFF, 0xFF) if j % 2 == 0 else C_ACCENT)
            add_text(slide, f"  {item}", x + Inches(0.18),
                     y + Inches(0.64) + j * Inches(0.42),
                     Inches(5.9), Inches(0.35), font_size=Pt(12), color=C_CHARCOAL)

    return slide


# ═══════════════════════════════════════════════════════════════════════════════
# SLIDE 9 – APPLICATION MODULES
# ═══════════════════════════════════════════════════════════════════════════════
def slide_09_modules():
    slide = prs.slides.add_slide(BLANK)
    add_rect(slide, 0, 0, SLIDE_W, SLIDE_H, fill=C_OFFWHITE)
    add_header_bar(slide, "Application Modules", "Complete feature set implemented in CarbonIQ")
    add_footer(slide)
    add_slide_number(slide, 9)

    mods = [
        ("🔐", "Authentication", ["Register / Login", "bcrypt + JWT", "Demo quick-fill"]),
        ("👤", "Personal Workspace", ["Individual tracking", "Activity history", "Personal analytics"]),
        ("🏢", "Organization Mgmt", ["Create orgs & depts", "Invite members", "Role-based access (Admin / Analyst / Member)"]),
        ("📝", "Activity Management", ["5 emission categories", "Live calculation preview", "ACID atomic persistence"]),
        ("📊", "Emissions Analytics", ["Monthly trend chart", "Category breakdown", "Dept comparisons"]),
        ("🎯", "Goals & Insights", ["Set reduction targets", "Live % progress", "AI recommendations"]),
        ("📤", "Reports & Export", ["CSV export (RFC-4180)", "Audit trail access", "Factor citations"]),
    ]
    for i, (icon, name, items) in enumerate(mods):
        col = i % 4
        row = i // 4
        x = Inches(0.3) + col * Inches(3.25)
        y = Inches(1.32) + row * Inches(2.9)
        w, h = Inches(3.05), Inches(2.68)
        add_rect(slide, x, y, w, h, fill=C_WHITE, line=C_MINT_MED, line_w=Pt(1))
        add_rect(slide, x, y, w, Inches(0.65), fill=C_GREEN)
        add_text(slide, f"{icon}  {name}", x + Inches(0.1), y + Inches(0.1),
                 w - Inches(0.2), Inches(0.5), font_size=Pt(13.5), bold=True, color=C_WHITE)
        for j, it in enumerate(items):
            add_text(slide, f"  ✔  {it}", x + Inches(0.1), y + Inches(0.78) + j * Inches(0.58),
                     w - Inches(0.2), Inches(0.52), font_size=Pt(12), color=C_CHARCOAL)

    return slide


# ═══════════════════════════════════════════════════════════════════════════════
# SLIDE 10 – DATABASE DESIGN
# ═══════════════════════════════════════════════════════════════════════════════
def slide_10_db_design():
    slide = prs.slides.add_slide(BLANK)
    add_rect(slide, 0, 0, SLIDE_W, SLIDE_H, fill=C_OFFWHITE)
    add_header_bar(slide, "Database Design — ER Diagram", "13 tables in Third Normal Form (3NF) — PostgreSQL 18.6")
    add_footer(slide)
    add_slide_number(slide, 10)

    er_path = os.path.join(FIGS_DIR, 'fig3_3_entity_relationship_diagram.png')
    if os.path.exists(er_path):
        add_image(slide, er_path, Inches(0.25), Inches(1.2), Inches(8.6), Inches(5.95))

    # Sidebar entity list
    add_rect(slide, Inches(9.0), Inches(1.25), Inches(4.0), Inches(5.9), fill=C_DEEP)
    add_text(slide, "13 Tables — Verified Inventory",
             Inches(9.1), Inches(1.35), Inches(3.8), Inches(0.4),
             font_size=Pt(13), bold=True, color=C_MINT)
    tables = [
        "users", "organizations", "organization_members",
        "departments", "activity_categories", "activity_types",
        "emission_factor_sources", "emission_factors",
        "activities", "emission_records",
        "goals", "recommendations", "audit_logs",
    ]
    for i, t in enumerate(tables):
        add_rect(slide, Inches(9.1), Inches(1.85) + i * Inches(0.38),
                 Inches(3.8), Inches(0.34),
                 fill=RGBColor(0x1C, 0x52, 0x3B) if i % 2 == 0 else C_DEEP)
        add_text(slide, f"  {t}", Inches(9.12), Inches(1.87) + i * Inches(0.38),
                 Inches(3.75), Inches(0.32), font_size=Pt(11), color=C_WHITE)

    return slide


# ═══════════════════════════════════════════════════════════════════════════════
# SLIDE 11 – ADBMS CONCEPTS
# ═══════════════════════════════════════════════════════════════════════════════
def slide_11_adbms():
    slide = prs.slides.add_slide(BLANK)
    add_rect(slide, 0, 0, SLIDE_W, SLIDE_H, fill=C_OFFWHITE)
    add_header_bar(slide, "ADBMS Concepts Implemented", "Advanced database features demonstrated in CarbonIQ")
    add_footer(slide)
    add_slide_number(slide, 11)

    concepts = [
        ("📐  Normalization (1NF–3NF)", [
            "13 tables decomposed to single-theme entities",
            "UUID primary keys — no composite natural keys",
            "Zero transitive dependencies across all relations",
        ], C_GREEN),
        ("🔗  Referential Integrity", [
            "FK cascades: ON DELETE CASCADE / SET NULL / RESTRICT",
            "CHECK constraints: chk_positive_quantity, chk_activity_workspace_scope",
            "UNIQUE constraints on user emails, org slugs",
        ], C_DEEP),
        ("⚡  ACID Transactions", [
            "Multi-table BEGIN … COMMIT with auto-ROLLBACK",
            "Verified: 0 orphan rows on mid-transaction failure",
            "READ COMMITTED isolation; MVCC concurrency",
        ], RGBColor(0xC0, 0x39, 0x2B)),
        ("🔔  Triggers & Audit Logging", [
            "10 active triggers on activities, factors, users, goals",
            "JSONB before/after state snapshots → audit_logs",
            "Automatic updated_at maintenance on all tables",
        ], RGBColor(0x1A, 0x68, 0xA0)),
        ("📋  Views & Stored Functions", [
            "4 analytical views: v_monthly_emissions, v_category_emissions…",
            "sp_record_activity_with_emissions — atomic PL/pgSQL function",
            "fn_get_workspace_summary — table-valued KPI aggregator",
        ], RGBColor(0x76, 0x44, 0xAB)),
        ("⚡  Index Optimization", [
            "31 B-tree indexes on primary keys + composite filter paths",
            "idx_activities_user_date: Bitmap Index Scan confirmed",
            "EXPLAIN ANALYZE: execution in 0.58 ms (shared cache hits)",
        ], RGBColor(0x27, 0x6B, 0x8A)),
    ]
    for i, (title, pts, bg) in enumerate(concepts):
        col = i % 2
        row = i // 2
        x = Inches(0.3) + col * Inches(6.5)
        y = Inches(1.28) + row * Inches(1.98)
        add_rect(slide, x, y, Inches(6.3), Inches(1.85), fill=bg)
        add_text(slide, title, x + Inches(0.15), y + Inches(0.08),
                 Inches(6.0), Inches(0.42), font_size=Pt(14), bold=True, color=C_WHITE)
        for j, p in enumerate(pts):
            add_text(slide, f"  • {p}", x + Inches(0.15),
                     y + Inches(0.55) + j * Inches(0.42),
                     Inches(6.0), Inches(0.4), font_size=Pt(11.5), color=C_MINT)

    return slide


# ═══════════════════════════════════════════════════════════════════════════════
# SLIDE 12 – EMISSION CALCULATION METHODOLOGY
# ═══════════════════════════════════════════════════════════════════════════════
def slide_12_calculation():
    slide = prs.slides.add_slide(BLANK)
    add_rect(slide, 0, 0, SLIDE_W, SLIDE_H, fill=C_OFFWHITE)
    add_header_bar(slide, "Emission Calculation Methodology", "Deterministic, reproducible, factor-snapshotted arithmetic")
    add_footer(slide)
    add_slide_number(slide, 12)

    # Formula box
    add_rect(slide, Inches(0.35), Inches(1.28), Inches(12.6), Inches(1.05), fill=C_GREEN)
    add_text(slide, "Fundamental Equation:    E (kg CO₂e)  =  Q (activity quantity)  ×  EF (emission factor)",
             Inches(0.55), Inches(1.38), Inches(12.2), Inches(0.45),
             font_size=Pt(18), bold=True, color=C_WHITE, align=PP_ALIGN.CENTER)
    add_text(slide, "E_tonnes = E / 1000      •      Category % = (E_cat / E_total) × 100",
             Inches(0.55), Inches(1.86), Inches(12.2), Inches(0.35),
             font_size=Pt(14), color=C_MINT, align=PP_ALIGN.CENTER)

    # Verified example
    add_rect(slide, Inches(0.35), Inches(2.5), Inches(7.5), Inches(2.7), fill=C_WHITE,
             line=C_GREEN, line_w=Pt(2))
    add_text(slide, "✅  Verified Live Calculation Example",
             Inches(0.55), Inches(2.58), Inches(7.2), Inches(0.4),
             font_size=Pt(14), bold=True, color=C_GREEN)
    example = [
        ("Activity:", "100 kWh of grid electricity consumed"),
        ("Emission Factor:", "0.7160 kg CO₂e / kWh   (CEA India 2023 — v2023.1)"),
        ("Calculation:", "100 × 0.7160  =  71.60 kg CO₂e"),
        ("Result:", "0.0716 metric tonnes CO₂e"),
        ("Verified by:", "ADBMS test suite (Test 6) — exact output confirmed"),
    ]
    for i, (label, val) in enumerate(example):
        yy = Inches(3.05) + i * Inches(0.41)
        add_text(slide, label, Inches(0.55), yy, Inches(1.8), Inches(0.38),
                 font_size=Pt(12.5), bold=True, color=C_DEEP)
        add_text(slide, val, Inches(2.4), yy, Inches(5.3), Inches(0.38),
                 font_size=Pt(12.5), color=C_CHARCOAL)

    # Factor provenance
    add_rect(slide, Inches(8.1), Inches(2.5), Inches(4.85), Inches(2.7), fill=C_DEEP)
    add_text(slide, "Factor Provenance & Snapshot Immutability",
             Inches(8.25), Inches(2.6), Inches(4.6), Inches(0.52),
             font_size=Pt(13), bold=True, color=C_MINT)
    prov = [
        "CEA India 2023 → 0.7160 kg CO₂e/kWh (Electricity)",
        "UK DEFRA 2023 → 0.1705 kg CO₂e/km (Petrol car)",
        "UK DEFRA 2023 → 2.6865 kg CO₂e/litre (Diesel)",
        "UK DEFRA 2023 → 2.9392 kg CO₂e/kg (LPG)",
        "UK DEFRA 2023 → 0.4462 kg CO₂e/kg (Landfill waste)",
    ]
    for i, p in enumerate(prov):
        add_text(slide, f"  • {p}", Inches(8.25), Inches(3.2) + i * Inches(0.4),
                 Inches(4.55), Inches(0.38), font_size=Pt(11.5), color=C_WHITE)

    add_rect(slide, Inches(0.35), Inches(5.35), Inches(12.6), Inches(0.75), fill=C_ACCENT,
             line=C_MINT_MED, line_w=Pt(1))
    add_text(slide, "🔒  Factor Snapshot Immutability:  When an activity is recorded, the exact factor value and source citation string are "
             "frozen inside emission_records. Future factor revisions by authorities do NOT alter historical emission data.",
             Inches(0.55), Inches(5.42), Inches(12.2), Inches(0.65),
             font_size=Pt(12), color=C_CHARCOAL)

    return slide


# ═══════════════════════════════════════════════════════════════════════════════
# SLIDE 13 – AI ADVISORY MICROSERVICE
# ═══════════════════════════════════════════════════════════════════════════════
def slide_13_ai():
    slide = prs.slides.add_slide(BLANK)
    add_rect(slide, 0, 0, SLIDE_W, SLIDE_H, fill=C_OFFWHITE)
    add_header_bar(slide, "AI Advisory Microservice", "Privacy-preserving recommendation engine with offline fallback")
    add_footer(slide)
    add_slide_number(slide, 13)

    # Architecture image
    ai_path = os.path.join(FIGS_DIR, 'fig3_5_ai_workflow.png')
    if os.path.exists(ai_path):
        add_image(slide, ai_path, Inches(0.3), Inches(1.25), Inches(7.8), Inches(5.9))

    # Right panel
    add_rect(slide, Inches(8.3), Inches(1.25), Inches(4.7), Inches(5.9), fill=C_DEEP)
    add_text(slide, "🤖  FastAPI AI Service",
             Inches(8.45), Inches(1.38), Inches(4.4), Inches(0.45),
             font_size=Pt(15), bold=True, color=C_MINT)
    ai_pts = [
        ("Privacy by Design", "Only aggregated category totals sent — zero PII, no user names or raw notes"),
        ("Gemini Integration", "google-genai 0.1 client with strict JSON schema enforcement and 3-sec timeout"),
        ("Offline Fallback", "Autonomous rule-based heuristic targeting highest-emission category — executes in <20 ms"),
        ("Structured Output", "Pydantic RecommendationItem: title, priority (high/medium/low), impact %, reasoning"),
        ("DB Persistence", "Recommendations saved to PostgreSQL recommendations table with full status lifecycle"),
    ]
    for i, (t, d) in enumerate(ai_pts):
        yy = Inches(1.95) + i * Inches(0.98)
        add_rect(slide, Inches(8.45), yy, Inches(4.4), Inches(0.85),
                 fill=RGBColor(0x1C, 0x52, 0x3B))
        add_text(slide, t, Inches(8.6), yy + Inches(0.05), Inches(4.2), Inches(0.3),
                 font_size=Pt(12.5), bold=True, color=C_MINT)
        add_text(slide, d, Inches(8.6), yy + Inches(0.38), Inches(4.2), Inches(0.45),
                 font_size=Pt(11), color=C_WHITE)

    return slide


# ═══════════════════════════════════════════════════════════════════════════════
# SLIDE 14 – APPLICATION SCREENSHOTS
# ═══════════════════════════════════════════════════════════════════════════════
def slide_14_screenshots():
    slide = prs.slides.add_slide(BLANK)
    add_rect(slide, 0, 0, SLIDE_W, SLIDE_H, fill=C_OFFWHITE)
    add_header_bar(slide, "Application UI — Interface Walkthroughs", "Illustrative schematics of the implemented React 18 SPA")
    add_footer(slide)
    add_slide_number(slide, 14)

    screens = [
        ('fig4_1_ui_landing_auth.png', "Landing Page & Auth"),
        ('fig4_2_ui_dashboard.png', "Executive Dashboard"),
        ('fig4_3_ui_activity_modal.png', "Add Activity Wizard"),
        ('fig4_4_ui_analytics.png', "Emissions Analytics"),
        ('fig4_5_ui_goals_insights.png', "Goals & AI Insights"),
    ]
    for i, (fname, label) in enumerate(screens):
        col = i % 3
        row = i // 3
        x = Inches(0.3) + col * Inches(4.36)
        if i < 3:
            y = Inches(1.28)
            h = Inches(2.7)
        else:
            x = Inches(1.7) + (i - 3) * Inches(4.7)
            y = Inches(4.2)
            h = Inches(2.95)
        w = Inches(4.1)
        img_path = os.path.join(FIGS_DIR, fname)
        if os.path.exists(img_path):
            add_image(slide, img_path, x, y, w, h)
        # Label
        add_rect(slide, x, y + h - Inches(0.32), w, Inches(0.32), fill=C_GREEN)
        add_text(slide, label, x + Inches(0.08), y + h - Inches(0.3), w, Inches(0.28),
                 font_size=Pt(11), bold=True, color=C_WHITE)

    return slide


# ═══════════════════════════════════════════════════════════════════════════════
# SLIDE 15 – TESTING AND RESULTS
# ═══════════════════════════════════════════════════════════════════════════════
def slide_15_testing():
    slide = prs.slides.add_slide(BLANK)
    add_rect(slide, 0, 0, SLIDE_W, SLIDE_H, fill=C_OFFWHITE)
    add_header_bar(slide, "Testing & Verification Results", "54 automated assertions — 100% pass rate")
    add_footer(slide)
    add_slide_number(slide, 15)

    # KPI row
    kpis = [
        ("54 / 54", "Total Assertions Passed"),
        ("100%", "Overall Pass Rate"),
        ("0.58 ms", "Index Query Time\n(EXPLAIN ANALYZE)"),
        ("274 ms", "10 Concurrent\nTransactions"),
        ("0", "Deadlocks &\nOrphan Rows"),
    ]
    for i, (val, lbl) in enumerate(kpis):
        x = Inches(0.25) + i * Inches(2.58)
        add_rect(slide, x, Inches(1.28), Inches(2.42), Inches(1.0), fill=C_GREEN)
        add_text(slide, val, x, Inches(1.34), Inches(2.42), Inches(0.52),
                 font_size=Pt(26), bold=True, color=C_WHITE, align=PP_ALIGN.CENTER)
        add_text(slide, lbl, x, Inches(1.84), Inches(2.42), Inches(0.42),
                 font_size=Pt(10.5), color=C_MINT, align=PP_ALIGN.CENTER)

    # Test suites
    suites = [
        ("npm run test:db", "database/scripts/verify.js", "7 / 7", [
            "13 tables, 4 views, 5 functions, 10 triggers, 31 indexes confirmed",
            "CHECK constraint rejection (SQLSTATE 23514) verified",
            "All foreign key cascades validated",
        ]),
        ("npm run test:api", "tests/backend_api_test.js", "25 / 25", [
            "Auth: register, login, JWT verification, 409 duplicate rejection",
            "Workspace 403 cross-tenant isolation enforced",
            "Atomic activity+emission insert with factor snapshot",
        ]),
        ("npm run test:adbms", "database/scripts/run_adbms_suite.js", "8 / 8", [
            "ACID rollback: 0 orphan rows on induced mid-transaction failure",
            "Stored function: 100 kWh → exactly 71.6000 kg CO₂e",
            "JSONB trigger audit log entry confirmed after INSERT",
        ]),
        ("npm run test:ai", "tests/ai_service_test.py", "4 / 4", [
            "Health check, schema validation (422 rejection verified)",
            "Insights generated with correct priority ordering",
            "Offline fallback produces valid recommendations",
        ]),
    ]
    for i, (cmd, file, result, pts) in enumerate(suites):
        col = i % 2
        row = i // 2
        x = Inches(0.3) + col * Inches(6.5)
        y = Inches(2.45) + row * Inches(2.45)
        add_rect(slide, x, y, Inches(6.3), Inches(2.3), fill=C_WHITE,
                 line=C_MINT_MED, line_w=Pt(1))
        add_rect(slide, x, y, Inches(6.3), Inches(0.52), fill=C_DEEP)
        add_text(slide, cmd, x + Inches(0.12), y + Inches(0.06),
                 Inches(4.8), Inches(0.38), font_size=Pt(13), bold=True, color=C_MINT,
                 font_name='Courier New')
        add_rect(slide, x + Inches(4.8), y + Inches(0.1), Inches(1.3), Inches(0.35),
                 fill=RGBColor(0x27, 0xAE, 0x60))
        add_text(slide, result, x + Inches(4.8), y + Inches(0.1), Inches(1.3), Inches(0.35),
                 font_size=Pt(12), bold=True, color=C_WHITE, align=PP_ALIGN.CENTER)
        add_text(slide, file, x + Inches(0.12), y + Inches(0.55),
                 Inches(6.0), Inches(0.25), font_size=Pt(10), color=C_GRAY,
                 font_name='Courier New')
        for j, pt in enumerate(pts):
            add_text(slide, f"  ✔  {pt}", x + Inches(0.12),
                     y + Inches(0.82) + j * Inches(0.47),
                     Inches(6.0), Inches(0.44), font_size=Pt(11.5), color=C_CHARCOAL)

    return slide


# ═══════════════════════════════════════════════════════════════════════════════
# SLIDE 16 – LIMITATIONS AND FUTURE SCOPE
# ═══════════════════════════════════════════════════════════════════════════════
def slide_16_future():
    slide = prs.slides.add_slide(BLANK)
    add_rect(slide, 0, 0, SLIDE_W, SLIDE_H, fill=C_OFFWHITE)
    add_header_bar(slide, "Limitations & Future Scope", "Current boundaries and forward-looking enhancements")
    add_footer(slide)
    add_slide_number(slide, 16)

    # Limitations
    add_rect(slide, Inches(0.3), Inches(1.28), Inches(5.85), Inches(5.85),
             fill=C_WHITE, line=RGBColor(0xE8, 0xB4, 0xB8), line_w=Pt(2))
    add_rect(slide, Inches(0.3), Inches(1.28), Inches(5.85), Inches(0.52), fill=RGBColor(0xC0, 0x39, 0x2B))
    add_text(slide, "⚠️  Current Limitations",
             Inches(0.45), Inches(1.34), Inches(5.5), Inches(0.42),
             font_size=Pt(15), bold=True, color=C_WHITE)
    limits = [
        "Manual data entry — no IoT/smart-meter telemetry ingestion",
        "Scope 3 coverage limited to Category 5 (municipal waste only)",
        "Static national-level emission factors — no sub-regional or real-time marginal grid updates",
        "No multi-currency cost analytics for carbon offset pricing",
        "No blockchain provenance ledger for tamper-proof audit records",
    ]
    for i, lim in enumerate(limits):
        add_rect(slide, Inches(0.45), Inches(1.95) + i * Inches(0.85),
                 Inches(5.55), Inches(0.78), fill=RGBColor(0xFF, 0xF5, 0xF5))
        add_text(slide, f"  ✗  {lim}", Inches(0.5), Inches(2.0) + i * Inches(0.85),
                 Inches(5.45), Inches(0.7), font_size=Pt(12), color=C_CHARCOAL)

    # Future Scope
    add_rect(slide, Inches(6.45), Inches(1.28), Inches(6.55), Inches(5.85),
             fill=C_WHITE, line=C_MINT_MED, line_w=Pt(2))
    add_rect(slide, Inches(6.45), Inches(1.28), Inches(6.55), Inches(0.52), fill=C_GREEN)
    add_text(slide, "🚀  Future Enhancements",
             Inches(6.6), Inches(1.34), Inches(6.2), Inches(0.42),
             font_size=Pt(15), bold=True, color=C_WHITE)
    futures = [
        ("IoT Smart Meter Integration", "MQTT/Kafka streaming from energy meters and OBD-II vehicle trackers"),
        ("Full Scope 3 Expansion", "EIO-LCA factors for supply chain, purchased goods, and employee commuting"),
        ("PostGIS Geospatial Analytics", "Map fleet carbon densities and regional emission corridors"),
        ("Blockchain Provenance", "SHA-256 immutable audit ledger across completed emission periods"),
        ("Multi-Currency Carbon Pricing", "Carbon credit offset cost calculations and market integration"),
    ]
    for i, (title, desc) in enumerate(futures):
        yy = Inches(1.95) + i * Inches(0.96)
        add_rect(slide, Inches(6.6), yy, Inches(6.2), Inches(0.85), fill=C_ACCENT)
        add_text(slide, f"  🔮  {title}", Inches(6.7), yy + Inches(0.04),
                 Inches(6.0), Inches(0.34), font_size=Pt(13), bold=True, color=C_DEEP)
        add_text(slide, f"  {desc}", Inches(6.7), yy + Inches(0.4),
                 Inches(6.0), Inches(0.4), font_size=Pt(11.5), color=C_CHARCOAL)

    return slide


# ═══════════════════════════════════════════════════════════════════════════════
# SLIDE 17 – CONCLUSION
# ═══════════════════════════════════════════════════════════════════════════════
def slide_17_conclusion():
    slide = prs.slides.add_slide(BLANK)
    add_rect(slide, 0, 0, SLIDE_W, SLIDE_H, fill=C_OFFWHITE)
    add_header_bar(slide, "Conclusion", "What we built, demonstrated, and learned")
    add_footer(slide)
    add_slide_number(slide, 17)

    built = [
        "Production-grade full-stack application with real PostgreSQL persistence",
        "Complete 13-table 3NF relational schema with UUID PKs and FK cascades",
        "ACID-guaranteed transactions with verified zero orphan row rollbacks",
        "JSONB audit trigger trail capturing all data changes with before/after states",
        "5 PL/pgSQL stored functions and 4 analytical SQL views",
        "31 B-tree indexes achieving 0.58 ms query execution under load",
        "25-endpoint REST API with bcrypt auth, JWT, and workspace scoping",
        "Python FastAPI AI microservice with Google Gemini and offline fallback",
        "React 18 SPA with live emission preview, Recharts analytics, CSV export",
        "54/54 automated test assertions — 100% pass rate across all suites",
    ]
    add_rect(slide, Inches(0.3), Inches(1.28), Inches(8.2), Inches(5.85), fill=C_WHITE,
             line=C_MINT_MED, line_w=Pt(1))
    add_rect(slide, Inches(0.3), Inches(1.28), Inches(8.2), Inches(0.5), fill=C_GREEN)
    add_text(slide, "🏆  What We Built & Verified",
             Inches(0.45), Inches(1.33), Inches(8.0), Inches(0.42),
             font_size=Pt(15), bold=True, color=C_WHITE)
    for i, b in enumerate(built):
        add_text(slide, f"  ✔  {b}", Inches(0.42), Inches(1.9) + i * Inches(0.51),
                 Inches(8.0), Inches(0.48), font_size=Pt(12), color=C_CHARCOAL)

    # Learned
    add_rect(slide, Inches(8.7), Inches(1.28), Inches(4.3), Inches(5.85), fill=C_DEEP)
    add_text(slide, "📚  ADBMS Concepts Demonstrated",
             Inches(8.85), Inches(1.38), Inches(4.1), Inches(0.55),
             font_size=Pt(14), bold=True, color=C_MINT)
    learned = [
        "Relational Normalization (1NF → 3NF)",
        "ACID Transaction Atomicity & Rollback",
        "PL/pgSQL Stored Functions",
        "Active Trigger-Based Audit Logging",
        "Analytical SQL Views",
        "B-tree Index Optimization",
        "EXPLAIN ANALYZE Query Tuning",
        "Multi-Tenant Data Architecture",
        "Concurrency via MVCC + READ COMMITTED",
    ]
    for i, l in enumerate(learned):
        add_rect(slide, Inches(8.85), Inches(2.05) + i * Inches(0.54),
                 Inches(4.1), Inches(0.48),
                 fill=RGBColor(0x1C, 0x52, 0x3B) if i % 2 == 0 else C_DEEP)
        add_text(slide, f"  ▸  {l}", Inches(8.9), Inches(2.09) + i * Inches(0.54),
                 Inches(4.0), Inches(0.42), font_size=Pt(12), color=C_WHITE)

    return slide


# ═══════════════════════════════════════════════════════════════════════════════
# SLIDE 18 – THANK YOU
# ═══════════════════════════════════════════════════════════════════════════════
def slide_18_thankyou():
    slide = prs.slides.add_slide(BLANK)
    add_rect(slide, 0, 0, SLIDE_W, SLIDE_H, fill=C_DEEP)
    add_rect(slide, 0, 0, SLIDE_W, Inches(0.18), fill=C_GREEN)
    add_rect(slide, 0, SLIDE_H - Inches(0.18), SLIDE_W, Inches(0.18), fill=C_GREEN)

    # Decorative elements
    add_rect(slide, SLIDE_W - Inches(3.5), Inches(0.2), Inches(3.2), Inches(3.2),
             fill=RGBColor(0x1A, 0x5E, 0x42))
    add_rect(slide, Inches(0), Inches(4.5), Inches(3), Inches(3), fill=RGBColor(0x1A, 0x5E, 0x42))

    add_text(slide, "🌿 CarbonIQ",
             Inches(1.5), Inches(1.0), Inches(10), Inches(1.1),
             font_size=Pt(56), bold=True, color=C_WHITE, align=PP_ALIGN.CENTER)

    add_text(slide, "Thank You!",
             Inches(1.5), Inches(2.2), Inches(10), Inches(0.75),
             font_size=Pt(38), bold=True, color=C_MINT, align=PP_ALIGN.CENTER)

    add_rect(slide, Inches(3.5), Inches(3.1), Inches(6.3), Inches(0.05), fill=C_GREEN)

    add_text(slide, "Questions & Discussion Welcome",
             Inches(1.5), Inches(3.3), Inches(10), Inches(0.45),
             font_size=Pt(18), color=C_MINT_MED, align=PP_ALIGN.CENTER)

    add_rect(slide, Inches(2.5), Inches(4.0), Inches(8.3), Inches(1.85), fill=RGBColor(0x1C, 0x52, 0x3B))
    add_text(slide, "Piyush Khatwa  •  E23CSEU0853",
             Inches(2.6), Inches(4.12), Inches(8.1), Inches(0.48),
             font_size=Pt(18), color=C_WHITE, align=PP_ALIGN.CENTER)
    add_text(slide, "Shobhit Tiwari  •  E23CSEU0891",
             Inches(2.6), Inches(4.62), Inches(8.1), Inches(0.48),
             font_size=Pt(18), color=C_WHITE, align=PP_ALIGN.CENTER)
    add_text(slide, "Advanced Database Management Systems  •  Bennett University  •  November 2026",
             Inches(2.6), Inches(5.15), Inches(8.1), Inches(0.4),
             font_size=Pt(13), color=C_MINT_MED, align=PP_ALIGN.CENTER)

    add_rect(slide, Inches(0.5), Inches(6.0), Inches(12.3), Inches(0.85), fill=C_GREEN)
    badges = [
        "PostgreSQL 18.6", "React 18", "FastAPI", "Node.js + Express",
        "13 Tables • 3NF", "54/54 Tests Passed", "100% ACID Verified",
    ]
    add_text(slide, "  •  ".join(badges),
             Inches(0.6), Inches(6.07), Inches(12.1), Inches(0.72),
             font_size=Pt(11.5), color=C_WHITE, align=PP_ALIGN.CENTER)

    add_slide_number(slide, 18)
    return slide


# ═══════════════════════════════════════════════════════════════════════════════
# BUILD ALL SLIDES
# ═══════════════════════════════════════════════════════════════════════════════
print("Building CarbonIQ presentation slides...")
slide_01_title()
print("  [OK] Slide 1: Title")
slide_02_intro()
print("  [OK] Slide 2: Introduction")
slide_03_problem()
print("  [OK] Slide 3: Problem Statement")
slide_04_objectives()
print("  [OK] Slide 4: Aim & Objectives")
slide_05_lit_review()
print("  [OK] Slide 5: Literature Review")
slide_06_solution()
print("  [OK] Slide 6: Proposed Solution")
slide_07_architecture()
print("  [OK] Slide 7: System Architecture")
slide_08_tech_stack()
print("  [OK] Slide 8: Technology Stack")
slide_09_modules()
print("  [OK] Slide 9: Application Modules")
slide_10_db_design()
print("  [OK] Slide 10: Database Design")
slide_11_adbms()
print("  [OK] Slide 11: ADBMS Concepts")
slide_12_calculation()
print("  [OK] Slide 12: Emission Calculation")
slide_13_ai()
print("  [OK] Slide 13: AI Microservice")
slide_14_screenshots()
print("  [OK] Slide 14: Screenshots")
slide_15_testing()
print("  [OK] Slide 15: Testing & Results")
slide_16_future()
print("  [OK] Slide 16: Limitations & Future")
slide_17_conclusion()
print("  [OK] Slide 17: Conclusion")
slide_18_thankyou()
print("  [OK] Slide 18: Thank You")

os.makedirs(DOCS_DIR, exist_ok=True)

# Embed speaker notes in all slides
print("Embedding speaker notes into all slides...")
for idx, slide in enumerate(prs.slides, 1):
    if idx in SLIDE_SPEAKER_NOTES:
        add_speaker_notes(slide, SLIDE_SPEAKER_NOTES[idx])
print("  [OK] Successfully embedded speaker notes for all 18 slides.")

prs.save(PPTX_PATH)
print(f"\n[SAVED] {PPTX_PATH}")
print(f"  File size: {os.path.getsize(PPTX_PATH):,} bytes ({os.path.getsize(PPTX_PATH)/1024/1024:.2f} MB)")
print(f"  Slides: {len(prs.slides)}")

