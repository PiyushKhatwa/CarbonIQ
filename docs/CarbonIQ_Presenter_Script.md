# CarbonIQ — Academic Project Presentation Script
## Advanced Database Management Systems (ADBMS) Mini-Project
**Bennett University | School of Computer Science Engineering and Technology**  
**Academic Year:** 2026–2027 | **Evaluation Date:** November 2026  

---

### Project & Presenter Details
- **Project Title:** CarbonIQ – AI-Powered Carbon Emissions Footprint Tracker
- **Presenter 1:** Piyush Khatwa | **Roll Number:** E23CSEU0853 | **Coverage:** Slides 1–9 (~6 mins)
- **Presenter 2:** Shobhit Tiwari | **Roll Number:** E23CSEU0891 | **Coverage:** Slides 10–17 (~5.5 mins)
- **Joint Conclusion & Viva:** Piyush Khatwa & Shobhit Tiwari | **Coverage:** Slide 18 & Q&A (~3–5 mins)
- **Total Presentation Duration:** 11–12 minutes (+ Q&A)
- **Presentation Deck:** `docs/CarbonIQ_Project_Presentation.pptx` (18 Widescreen 16:9 Slides)

---

## Presentation Overview & Timing Breakdown

| Slide | Title | Presenter | Duration | Cumulative |
| :---: | :--- | :---: | :---: | :---: |
| **01** | Title Slide & Team Introduction | Piyush Khatwa | 0:40 | 0:40 |
| **02** | Project Introduction & Vision | Piyush Khatwa | 0:45 | 1:25 |
| **03** | Problem Statement & Industry Gaps | Piyush Khatwa | 0:45 | 2:10 |
| **04** | Aim & 10 Technical Objectives | Piyush Khatwa | 0:45 | 2:55 |
| **05** | Literature Review & Research Gap | Piyush Khatwa | 0:40 | 3:35 |
| **06** | Proposed Solution & Capabilities | Piyush Khatwa | 0:40 | 4:15 |
| **07** | Four-Tier System Architecture | Piyush Khatwa | 0:45 | 5:00 |
| **08** | Production Technology Stack | Piyush Khatwa | 0:40 | 5:40 |
| **09** | Application Modules & Handover | Piyush Khatwa | 0:45 | 6:25 |
| **10** | Relational Database Design (3NF ER) | Shobhit Tiwari | 0:50 | 7:15 |
| **11** | Core ADBMS Concepts Implementation | Shobhit Tiwari | 0:55 | 8:10 |
| **12** | Deterministic Calculation Engine | Shobhit Tiwari | 0:45 | 8:55 |
| **13** | AI Advisory Microservice (FastAPI) | Shobhit Tiwari | 0:45 | 9:40 |
| **14** | Application UI & Interface Tour | Shobhit Tiwari | 0:40 | 10:20 |
| **15** | Testing, Concurrency & Verification | Shobhit Tiwari | 0:45 | 11:05 |
| **16** | Limitations & Future Roadmap | Shobhit Tiwari | 0:40 | 11:45 |
| **17** | Conclusion & Key Learnings | Shobhit Tiwari | 0:40 | 12:25 |
| **18** | Thank You & Viva Q&A Session | Joint | 0:35+ | 13:00+ |

---

## Slide-by-Slide Script & Delivery Guide

```
================================================================================
PART I: PROJECT OVERVIEW, ARCHITECTURE & FRONTEND (Presenter: Piyush Khatwa)
================================================================================
```

### Slide 1: Title Slide & Team Introduction
- **Presenter:** Piyush Khatwa (E23CSEU0853)
- **Target Timing:** 0:00 – 0:40 (40 seconds)
- **Visual Reference:** Deep forest green theme (#104B38) with mint branding, university credentials, and team roll numbers.

#### Verbatim Script:
> "Respected evaluators, faculty members, and colleagues, good morning.
> 
> I am **Piyush Khatwa**, University Roll Number **E23CSEU0853**, and alongside my project partner **Shobhit Tiwari**, Roll Number **E23CSEU0891**, from the School of Computer Science Engineering and Technology at Bennett University, we are pleased to present our Advanced Database Management Systems mini-project: **'CarbonIQ — AI-Powered Carbon Emissions Footprint Tracker'**.
> 
> CarbonIQ is an engineering-driven, local-first web application and relational database system designed to calculate, analyze, and mitigate greenhouse gas emissions across both individual and institutional workspaces. In this presentation, we will demonstrate our four-tier decoupled architecture, a 3NF relational schema in PostgreSQL 18.6, core ADBMS implementations including atomic transactions and B-tree indexing, our verified deterministic calculation engine, and a privacy-preserving AI advisory microservice.
> 
> Let us begin with the background and motivation behind CarbonIQ."

- **Evaluator Emphasis:** Emphasize that CarbonIQ is an *engineering-driven*, *local-first* system with a live PostgreSQL relational backend, not a conceptual mockup.
- **Transition Cue:** *Click to Slide 2.*

---

### Slide 2: Project Introduction & Vision
- **Presenter:** Piyush Khatwa
- **Target Timing:** 0:40 – 1:25 (45 seconds)
- **Visual Reference:** Mission statement banner, 3 core capability cards, and 5 category icons (Electricity, Transport, Fuel, LPG, Waste).

#### Verbatim Script:
> "To provide context, climate change mitigation requires precise, verifiable greenhouse gas accounting. As Lord Kelvin famously noted, *'If you cannot measure it, you cannot improve it.'*
> 
> CarbonIQ addresses this fundamental challenge by providing an end-to-end platform that tracks operational emissions across five major human and organizational categories: Grid Electricity, Road and Air Transportation, Stationary Fossil Fuel Combustion, Liquefied Petroleum Gas (LPG), and Municipal Solid Waste.
> 
> The application computes carbon dioxide equivalent emissions using nationally and internationally accredited emission factors from the Central Electricity Authority (CEA) of India, the UK DEFRA, and the US EPA.
> 
> Crucially, CarbonIQ is architected with a dual-workspace paradigm, seamlessly supporting individual personal tracking alongside multi-tenant institutional workspaces with role-based access control. All calculations are executed with exact decimal precision, and personalized reduction strategies are generated using an integrated AI advisory microservice.
> 
> Next, let us examine the critical gaps in existing carbon tracking approaches that prompted our design."

- **Evaluator Emphasis:** Emphasize the 5 operational categories and the dual personal/organization workspace model.
- **Transition Cue:** *Click to Slide 3.*

---

### Slide 3: Problem Statement & Industry Gaps
- **Presenter:** Piyush Khatwa
- **Target Timing:** 1:25 – 2:10 (45 seconds)
- **Visual Reference:** 5 structured gap cards (Data Fragmentation, Opaque Calculations, Scalability Bottlenecks, Lack of Actionable Intelligence, High Licensing Barriers).

#### Verbatim Script:
> "Before developing CarbonIQ, we analyzed why existing carbon tracking efforts fall short in educational institutions and small-to-medium enterprises. We identified five acute architectural deficiencies:
> 
> First, **Data Fragmentation**: most organizations track emissions using unstandardized spreadsheets that lack referential integrity, schema constraints, and concurrent access control, leading to frequent corruption and human error.
> 
> Second, **Opaque 'Black-Box' Calculations**: commercial tools frequently present aggregated footprint numbers without exposing the underlying emission factor edition, regional grid baseline, or mathematical methodology.
> 
> Third, **Scalability Bottlenecks**: analytical queries across multi-year historical logs suffer severe latency when executed on flat files or non-indexed databases.
> 
> Fourth, **Lack of Actionable Intelligence**: static dashboards present raw numerical data but fail to translate emissions into prioritized, cost-effective reduction roadmaps.
> 
> Finally, **High Licensing Barriers**: enterprise ESG solutions such as Persefoni or Watershed require substantial enterprise budgets, leaving university departments and individual users without viable tools.
> 
> To overcome these five gaps, we formulated a set of concrete, measurable technical objectives."

- **Evaluator Emphasis:** Highlight lack of referential integrity and concurrent write safety in spreadsheet-based accounting.
- **Transition Cue:** *Click to Slide 4.*

---

### Slide 4: Aim & 10 Technical Objectives
- **Presenter:** Piyush Khatwa
- **Target Timing:** 2:10 – 2:55 (45 seconds)
- **Visual Reference:** Aim banner and 10 numbered technical objective cards covering schema, NUMERIC precision, ACID, triggers, views, indexing, dual workspaces, React SPA, FastAPI AI, and test suites.

#### Verbatim Script:
> "Our overarching project aim was to design, implement, empirically verify, and rigorously document a production-grade, local-first carbon emissions tracking platform adhering to core ADBMS principles.
> 
> We formulated ten concrete, measurable technical objectives:
> 1. Engineer a Third Normal Form schema comprising 13 tables with UUID primary keys and cascaded foreign keys.
> 2. Ensure mathematical accuracy using NUMERIC(14,4) fixed-point arithmetic without IEEE 754 floating-point inaccuracies.
> 3. Guarantee ACID transactional safety through PL/pgSQL stored functions and zero-orphan rollback semantics.
> 4. Enforce automated audit trails via row-level database triggers.
> 5. Create parameterized analytical views for multi-dimensional reporting.
> 6. Optimize query performance below 1 ms using targeted multi-column B-tree composite indexes.
> 7. Implement dual-workspace support with structural ownership constraints.
> 8. Build a responsive React 18 single-page application with real-time interactive visual analytics.
> 9. Deploy a privacy-preserving FastAPI microservice powered by Google Gemini with an offline heuristic fallback.
> 10. Achieve 100% test coverage across database constraints, API endpoints, and concurrency workloads.
> 
> Let us now review the competitive landscape and academic literature."

- **Evaluator Emphasis:** Emphasize that all 10 objectives were not merely planned—they have all been fully implemented and verified.
- **Transition Cue:** *Click to Slide 5.*

---

### Slide 5: Literature Review & Research Gap
- **Presenter:** Piyush Khatwa
- **Target Timing:** 2:55 – 3:35 (40 seconds)
- **Visual Reference:** 3 comparative cards (Enterprise Platforms, Spreadsheets, Public Calculators) and the bottom CarbonIQ differentiator banner.

#### Verbatim Script:
> "We surveyed three primary categories of existing carbon accounting systems to establish our project baseline:
> 
> 1. **Enterprise Platforms like Persefoni and Watershed**: While robust, they are proprietary, cloud-locked, cost-prohibitive for academic settings, and do not provide individual or SME-tier granular tracking.
> 2. **Manual Spreadsheets**: Ubiquitous in universities, but completely lacking ACID transaction guarantees, referential integrity, concurrent write safety, and automated auditing.
> 3. **Public Web Calculators like Carbon Footprint or WWF**: These provide high-level one-off estimations without persistent relational storage, longitudinal tracking, or institutional organizational structures.
> 
> CarbonIQ closes this academic and technical gap: we deliver an open-source, local-first system combining enterprise-grade relational integrity and indexing with accessible, privacy-first AI advisory capabilities.
> 
> Now, let us explore the proposed solution and core capabilities of CarbonIQ."

- **Evaluator Emphasis:** Clearly contrast spreadsheet fragility against relational ACID guarantees.
- **Transition Cue:** *Click to Slide 6.*

---

### Slide 6: Proposed Solution & Core Capabilities
- **Presenter:** Piyush Khatwa
- **Target Timing:** 3:35 – 4:15 (40 seconds)
- **Visual Reference:** 6 feature cards arranged in a 2x3 grid: Dual Workspaces, 5 Categories, Deterministic Engine, Recharts Analytics, Privacy AI, and ADBMS Foundation.

#### Verbatim Script:
> "The proposed CarbonIQ platform addresses each identified limitation through six unified technical capabilities:
> 
> 1. **Dual-Workspace Architecture**: Users can toggle between a private personal space and multi-tenant organizational workspaces featuring Owner, Admin, Member, and Viewer role-based access.
> 2. **5-Category Activity Ingestion**: A guided, validated modal captures activities across Electricity, Transport, Fuel, LPG, and Waste with automatic unit conversions.
> 3. **Deterministic Calculation Engine**: Calculations pair verified baseline emission factors with activity quantities, snapshotting the active factor ID to maintain permanent historical auditability.
> 4. **Real-Time Interactive Visualizations**: Recharts-powered trend analysis, category breakdowns, and goal tracking provide immediate visual feedback.
> 5. **Privacy-Preserving AI Insights**: The AI engine processes exclusively aggregated category metrics—never personally identifiable information or raw notes.
> 6. **Enterprise-Grade ADBMS Foundation**: Built on PostgreSQL 18.6 with stored functions, audit triggers, and sub-millisecond indexed queries.
> 
> Let us look under the hood at the four-tier system architecture."

- **Evaluator Emphasis:** Point out factor snapshotting for immutable historical audits.
- **Transition Cue:** *Click to Slide 7.*

---

### Slide 7: Four-Tier System Architecture
- **Presenter:** Piyush Khatwa
- **Target Timing:** 4:15 – 5:00 (45 seconds)
- **Visual Reference:** Architecture diagram (`fig3_1_system_architecture.png`) and 4 layer description cards on the right (Presentation, Application, AI Advisory, Data Layer).

#### Verbatim Script:
> "Here we illustrate the four-tier decoupled architecture of CarbonIQ:
> 
> - **Tier 1 is the Presentation Layer**: A single-page application built on React 18, Vite 5, Tailwind CSS, and Recharts, communicating via standard REST over HTTP/JSON on port 5173.
> - **Tier 2 is the Application Layer**: A Node.js and Express 4.19 REST API running on port 5000, enforcing JWT authentication, Zod request validation, workspace isolation middleware, and database connection pooling.
> - **Tier 3 is the AI Advisory Layer**: An independent Python FastAPI microservice on port 8000, integrating Google Gemini 2.5 Flash with a robust offline heuristic fallback engine.
> - **Tier 4 is the Data Layer**: A PostgreSQL 18.6 relational database on port 5432 containing 13 normalized tables, 4 analytical views, 5 PL/pgSQL stored functions, 10 triggers, and 31 B-tree indexes.
> 
> This clean separation of concerns ensures horizontal scalability, local-first privacy, and minimal coupling between services."

- **Evaluator Emphasis:** Highlight ports (5173, 5000, 8000, 5432) and local-first execution.
- **Transition Cue:** *Click to Slide 8.*

---

### Slide 8: Production Technology Stack
- **Presenter:** Piyush Khatwa
- **Target Timing:** 5:00 – 5:40 (40 seconds)
- **Visual Reference:** 4 category cards: Frontend, Backend API, Database, and AI Microservice with verified version badges.

#### Verbatim Script:
> "Every component in our technology stack is verified directly from our project dependency manifests:
> 
> - **On the Frontend**: React 18.2 with React Router 6.22, bundled by Vite 5.1 in under 18 seconds across 2,303 modules, styled with Tailwind CSS 3.4, and visualized using Recharts 2.12 and Lucide React icons.
> - **On the Backend**: Node.js with Express 4.19, utilizing the node-postgres driver 8.11 with connection pooling, Zod 3.22 schema validation, bcryptjs 2.4 password hashing, and jsonwebtoken 9.0 for stateless session authorization.
> - **On the Database**: PostgreSQL 18.6, selected for its ACID reliability, PL/pgSQL procedural engine, JSONB support, and advanced B-tree indexing capabilities.
> - **In the AI Service**: Python 3.14 with FastAPI 0.110, Uvicorn 0.28 ASGI server, Pydantic 2.6 schema validation, and the official Google GenAI SDK 0.1.1.
> - **In Testing**: Custom automated suites using Supertest and Jest patterns, validating all 54 assertions in under 2 seconds.
> 
> Next, let us review how these technologies are structured into application modules."

- **Evaluator Emphasis:** State that versions are from actual package manifests, not generic textbook listings.
- **Transition Cue:** *Click to Slide 9.*

---

### Slide 9: Modular Application Structure & Handover
- **Presenter:** Piyush Khatwa
- **Target Timing:** 5:40 – 6:25 (45 seconds)
- **Visual Reference:** 7 module cards (Authentication, Workspaces, Activities, Calculation, Analytics, AI Recommendations, Audit Logs) and presenter handover banner.

#### Verbatim Script:
> "CarbonIQ is organized into seven modular feature subsystems:
> 
> 1. **Authentication Module**: Secure registration, login, bcrypt password hashing with salt rounds, JWT issuance, and quick-fill demo credentials for seamless evaluation.
> 2. **Workspace & Organization Module**: Workspace switching, multi-tenant organization creation, invitation workflows, and four-tier RBAC enforcement.
> 3. **Activity Tracking Module**: Validated multi-category data entry forms with category-specific units and real-time validation.
> 4. **Calculation Engine Module**: Synchronous emission calculation via database stored function, factoring in snapshotted emission factor coefficients.
> 5. **Analytics & Reporting Module**: Time-series aggregations, category breakdowns, departmental comparisons, and printable PDF export.
> 6. **AI Recommendation Module**: Context-aware reduction recommendations with estimated kg CO₂e savings and implementation feasibility ratings.
> 7. **Audit & Administration Module**: Complete immutable audit logs capturing activity creation, modifications, and deletions with pre- and post-state snapshots.
> 
> I would now like to hand over to my partner, **Shobhit Tiwari**, who will present our database design, ADBMS concepts, and empirical verification results."

- **Evaluator Emphasis:** Smooth physical and verbal transition to Shobhit Tiwari.
- **Transition Cue:** *Hand over microphone to Shobhit Tiwari; click to Slide 10.*

---

```
================================================================================
PART II: DATABASE DESIGN, ADBMS CONCEPTS & RESULTS (Presenter: Shobhit Tiwari)
================================================================================
```

### Slide 10: Relational Database Design (3NF ER Model)
- **Presenter:** Shobhit Tiwari (E23CSEU0891)
- **Target Timing:** 6:25 – 7:15 (50 seconds)
- **Visual Reference:** Entity-Relationship Diagram (`fig3_3_entity_relationship_diagram.png`) showing all 13 PostgreSQL tables, and verified table list on the left.

#### Verbatim Script:
> "Thank you, Piyush. Good morning everyone. I am **Shobhit Tiwari**, and I will walk you through our database architecture and ADBMS engineering implementations.
> 
> Slide 10 presents our Entity-Relationship model, fully normalized into Third Normal Form (3NF) across 13 PostgreSQL tables:
> - The core identity tables are `users`, `organizations`, `organization_members`, and `departments`.
> - The metadata and configuration tables include `categories`, `emission_factors`, and `reduction_tips`.
> - The primary transactional table is `activities`, which records every individual emission event.
> - Supporting tracking tables include `activity_tags`, `reduction_goals`, `audit_logs`, and `ai_recommendations`.
> 
> Key structural design decisions include:
> First, all primary keys utilize cryptographically random **UUIDv4** via `pgcrypto`, preventing enumeration attacks and enabling distributed key generation.
> Second, all foreign keys enforce explicit referential integrity with `ON DELETE CASCADE` or `ON DELETE RESTRICT` where audit trails must be preserved.
> Third, we enforce strict domain constraints, such as `chk_activity_workspace_scope`, which ensures an activity is owned either by an individual user or by an organization workspace, never an orphaned state.
> 
> Let us now examine the specific ADBMS concepts implemented across these relations."

- **Evaluator Emphasis:** Emphasize UUIDv4 keys, 3NF decomposition, and `chk_activity_workspace_scope` CHECK constraint.
- **Transition Cue:** *Click to Slide 11.*

---

### Slide 11: Core ADBMS Concepts Implementation
- **Presenter:** Shobhit Tiwari
- **Target Timing:** 7:15 – 8:10 (55 seconds)
- **Visual Reference:** 6 concept cards arranged in 2 columns: Normalization, ACID Transactions, Stored Functions, Database Triggers, Analytical Views, and Indexing & Query Optimization.

#### Verbatim Script:
> "This slide highlights the six advanced database management concepts implemented in CarbonIQ:
> 
> 1. **Normalization**: Strict 3NF decomposition eliminates all insertion, update, and deletion anomalies. Zero transitive functional dependencies exist in our schema.
> 2. **ACID Transactions**: Multi-statement atomic operations ensure that creating an activity and its corresponding audit log succeeds completely or rolls back entirely, verified with zero orphan rows.
> 3. **PL/pgSQL Stored Functions**: We authored 5 stored functions, including `sp_record_activity_with_emissions`, which performs factor lookup, emission arithmetic, activity insertion, and audit recording inside a single atomic database execution context.
> 4. **Triggers**: 10 database triggers, such as `trg_audit_activities`, execute automatically on INSERT, UPDATE, or DELETE to capture before-and-after JSONB state snapshots into `audit_logs`.
> 5. **Views**: 4 analytical views—including `v_user_monthly_summary` and `v_org_department_emissions`—abstract complex multi-table joins and aggregations for reporting.
> 6. **Indexing & Optimization**: 31 B-tree indexes, including composite indexes like `idx_activities_user_date` on `(user_id, activity_date)`, achieve a 0.58 ms EXPLAIN ANALYZE execution time, representing an 85% query acceleration over sequential scans.
> 
> Next, let us delve into the emission calculation engine and mathematical validation."

- **Evaluator Emphasis:** Use the exact terminology: **PL/pgSQL stored functions** (not stored procedures), **JSONB snapshots**, and **0.58 ms indexed query time**.
- **Transition Cue:** *Click to Slide 12.*

---

### Slide 12: Deterministic Emission Calculation Engine
- **Presenter:** Shobhit Tiwari
- **Target Timing:** 8:10 – 8:55 (45 seconds)
- **Visual Reference:** Mathematical equation cards, live verified calculation example card (100 kWh = 71.60 kg CO₂e), and GHG Scopes classification card.

#### Verbatim Script:
> "Our emission calculation follows deterministic, reproducible, and verifiable arithmetic grounded in the GHG Protocol corporate standard:
> 
> The core equation is: **Emissions in kilograms of CO₂ equivalent equals Activity Quantity multiplied by the snapshotted Emission Factor.**
> To prevent rounding drift inherent in IEEE 754 floating-point numbers, all emissions and quantities are stored as PostgreSQL `NUMERIC(14,4)` fixed-point data types.
> 
> Let us examine our verified live calculation example:
> When a user records 100 kWh of grid electricity in India:
> - The active factor from the Central Electricity Authority (CEA 2023) is exactly **0.7160 kg CO₂e per kWh**.
> - The stored function computes: **100 × 0.7160 = exactly 71.6000 kg CO₂e**, or 0.0716 metric tonnes.
> - The exact emission factor ID is snapshotted in the activity row. If national grid emission factors are updated next year, historical calculations remain permanently auditable and invariant.
> 
> In terms of GHG Scopes: Purchased electricity represents **Scope 2**; direct vehicle fuel and LPG represent **Scope 1**; and municipal waste treatment represents **Scope 3 Category 5**.
> 
> Now, let us see how these calculations feed into our AI Advisory Microservice."

- **Evaluator Emphasis:** Emphasize `NUMERIC(14,4)` fixed precision to avoid floating-point drift, and accurate GHG Scopes classification.
- **Transition Cue:** *Click to Slide 13.*

---

### Slide 13: Privacy-Preserving AI Advisory Microservice
- **Presenter:** Shobhit Tiwari
- **Target Timing:** 8:55 – 9:40 (45 seconds)
- **Visual Reference:** AI workflow diagram (`fig3_5_ai_workflow.png`) and architectural feature cards on the right (FastAPI, Privacy by Design, Gemini Integration, Offline Heuristic Engine).

#### Verbatim Script:
> "Moving to our AI Advisory Microservice, CarbonIQ pairs deterministic data with intelligent, personalized recommendations:
> 
> - The service is implemented in Python FastAPI with Pydantic schema validation.
> - **Privacy-by-Design**: The service receives exclusively aggregated category summaries and top emission drivers. It never receives user names, email addresses, passwords, or raw user notes.
> - **Dual-Mode Engine**: Under normal conditions, it queries Google Gemini 2.5 Flash via structured JSON prompting, returning prioritized recommendations with estimated percentage and kilogram reductions.
> - **Offline Heuristic Fallback**: If network connectivity is unavailable, the API key is not configured, or rate limits are reached, CarbonIQ automatically switches in under 20 milliseconds to an internal rule-based heuristic engine, generating contextual reduction tips derived directly from our database seeds.
> 
> This ensures 100% service uptime even in completely offline local deployment environments."

- **Evaluator Emphasis:** Stress that PII is never transmitted to LLM, and offline heuristic fallback responds in <20ms.
- **Transition Cue:** *Click to Slide 14.*

---

### Slide 14: Application UI & Interface Walkthrough
- **Presenter:** Shobhit Tiwari
- **Target Timing:** 9:40 – 10:20 (40 seconds)
- **Visual Reference:** 4 schematic cards showcasing the React SPA UI (Landing & Auth, Executive Dashboard, Add Activity Modal, Emissions Analytics).

#### Verbatim Script:
> "Slide 14 showcases illustrative architectural schematics representing the responsive React 18 single-page application interface, fully accessible at `localhost:5173`:
> 
> - The **Landing and Authentication** interface features clean emerald branding, role-based onboarding, and quick-fill buttons for immediate evaluation.
> - The **Executive Dashboard** displays four summary metric cards: Total Emissions, Monthly Trend with delta percentage, Active Reduction Goals, and AI Insight count, accompanied by Recharts area and bar charts.
> - The **Add Activity Modal** provides an intuitive 3-step wizard with category icons, automatic unit labeling, dynamic previews, and instant validation.
> - The **Emissions Analytics** view offers multi-dimensional filtering by date range, category, and workspace, alongside departmental distribution charts.
> - Finally, the **Goals and Insights** screen presents active reduction progress bars and structured AI recommendation cards with one-click adoption.
> 
> Now, let us examine our empirical test verification and system performance results."

- **Evaluator Emphasis:** Note that the frontend is a fully responsive React SPA communicating with backend REST endpoints in real time.
- **Transition Cue:** *Click to Slide 15.*

---

### Slide 15: Testing, Concurrency & Verification Results
- **Presenter:** Shobhit Tiwari
- **Target Timing:** 10:20 – 11:05 (45 seconds)
- **Visual Reference:** Big KPI stat cards (54/54 passed, 100% pass rate, 274 ms concurrency, 0.58 ms index query), and 5 suite breakdown cards.

#### Verbatim Script:
> "To validate system reliability, we implemented and executed a comprehensive automated test harness comprising 54 assertions across 5 specialized test suites, achieving a 100% pass rate:
> 
> 1. **Database Integrity Suite (7 tests)**: Validated UUID generation, CHECK constraints, foreign key cascades, and trigger execution.
> 2. **REST API Integration Suite (25 tests)**: Validated all endpoints for authentication, activities, organizations, analytics, and error handling.
> 3. **AI Microservice Suite (4 tests)**: Validated health checks, Pydantic request validation, Gemini prompt generation, and heuristic fallback.
> 4. **ADBMS Advanced Feature Suite (8 tests)**: Validated NUMERIC(14,4) precision (Test 6: 100 kWh × 0.7160 = 71.6000 kg CO₂e), transaction rollback with zero orphan rows (Test 7), and EXPLAIN ANALYZE index execution at 0.58 ms (Test 8).
> 5. **Concurrency & Stress Suite (10 tests)**: Executed 10 concurrent activity creation transactions in 274 milliseconds, resulting in zero deadlocks, zero lock timeouts, and perfect serializable consistency.
> 
> Next, let us discuss our identified limitations and roadmap for future research."

- **Evaluator Emphasis:** Highlight the zero orphan rows on rollback and the concurrency results (10 concurrent transactions in 274 ms with zero deadlocks).
- **Transition Cue:** *Click to Slide 16.*

---

### Slide 16: Limitations & Future Development Scope
- **Presenter:** Shobhit Tiwari
- **Target Timing:** 11:05 – 11:45 (40 seconds)
- **Visual Reference:** 2 structured panels: Current Limitations on the left and Future Research Roadmap on the right.

#### Verbatim Script:
> "In the interest of scientific rigor and academic honesty, we have explicitly documented the current limitations of CarbonIQ and our roadmap for future development:
> 
> **Current Boundaries:**
> 1. Data Ingestion: Activity entries currently rely on manual form input rather than automated IoT smart-meter or utility API integrations.
> 2. Scope 3 Coverage: In accordance with our project boundaries, Scope 3 is limited to Category 5 (waste disposal), omitting upstream supply chains and purchased goods.
> 3. Emission Factor Granularity: Emission factors represent national averages (CEA/DEFRA) rather than real-time regional marginal grid variations.
> 
> **Future Research & Roadmap:**
> - Ingesting real-time IoT smart plug telemetry via MQTT or WebSockets.
> - Expanding Scope 3 upstream supply chain calculations using open LCA databases.
> - Implementing automated OCR utility bill ingestion using multimodal computer vision.
> - Enabling verifiable blockchain hashing for tamper-proof regulatory ESG audits.
> 
> Let us now summarize the key achievements and conclusions of this project."

- **Evaluator Emphasis:** Emphasize that documenting real-world limitations demonstrates academic honesty and engineering maturity.
- **Transition Cue:** *Click to Slide 17.*

---

### Slide 17: Project Conclusion & Key Learnings
- **Presenter:** Shobhit Tiwari
- **Target Timing:** 11:45 – 12:25 (40 seconds)
- **Visual Reference:** 2 achievement and learning panels: What We Built & Verified on the left, Key Academic Learnings on the right.

#### Verbatim Script:
> "To conclude our presentation, CarbonIQ successfully bridges database theory and practical environmental software engineering:
> 
> **Key Achievements:**
> - We delivered a production-ready, local-first carbon footprint tracker across 5 major emission categories.
> - We proved all 10 technical ADBMS objectives, demonstrating 3NF relational normalization, atomic ACID transactions, automated audit triggers, analytical views, and sub-millisecond B-tree indexing.
> - We verified all 54 test assertions with a 100% pass rate, zero deadlocks under concurrency, and zero orphan rows on rollback.
> - We combined deterministic mathematical precision with a privacy-preserving, fault-tolerant AI advisory microservice.
> 
> **Key Learnings:**
> - The paramount importance of fixed-point NUMERIC types in financial and environmental accounting.
> - How database triggers and stored functions guarantee data integrity at the lowest layer, independent of application bugs.
> - How decoupled microservice architecture enables robust offline fallbacks and strong privacy guarantees.
> 
> We will now conclude and invite questions."

- **Evaluator Emphasis:** Connect database theory (normalization, ACID, indexing) directly with real software outcomes.
- **Transition Cue:** *Piyush steps back up beside Shobhit; click to Slide 18.*

---

### Slide 18: Thank You & Viva Q&A Session
- **Presenter:** Joint (Piyush Khatwa & Shobhit Tiwari)
- **Target Timing:** 12:25 – 13:00+ (35 seconds + Q&A)
- **Visual Reference:** Title card with presenter names, roll numbers, Bennett University credentials, and key tech badges.

#### Verbatim Script:
> **Piyush Khatwa & Shobhit Tiwari:**
> "Thank you very much for your time, attention, and guidance throughout this project.
> 
> We would like to express our sincere gratitude to our course instructor, faculty advisors, and the School of Computer Science Engineering and Technology at Bennett University.
> 
> We are now open and eager to take your questions, feedback, and discussion on our database schema, ACID verification, index optimization, or application architecture."

---

## Comprehensive Viva & Evaluator Q&A Preparation

Below are anticipated examiner questions categorized by technical domain, along with authoritative, mathematically and architecturally accurate answers based directly on CarbonIQ source code and empirical tests.

### Category 1: Relational Schema & Database Design

#### Q1: "Why did you choose UUIDv4 for primary keys instead of standard auto-incrementing integers (SERIAL)?"
- **Answer:**
  > "We chose UUIDv4 generated via PostgreSQL's `pgcrypto` extension for three principal reasons:
  > 1. **Security & Anti-Enumeration:** Auto-incrementing integer IDs leak entity counts and allow trivial ID-enumeration attacks over REST APIs (e.g., guessing `/api/activities/101`). UUIDs are 128-bit cryptographically random values with $2^{122}$ collision resistance.
  > 2. **Distributed & Client-Side Key Generation:** In distributed or offline-first scenarios, client applications or microservices can generate primary keys independently without querying the database sequence first.
  > 3. **Multi-Tenant Sharding Readiness:** If organizations are partitioned or migrated across databases in the future, UUID primary keys guarantee global uniqueness without sequence ID collisions."

#### Q2: "Can you prove that your database schema satisfies Third Normal Form (3NF)?"
- **Answer:**
  > "Yes. A relation is in 3NF if it is in 2NF and every non-prime attribute is non-transitively dependent on the primary key:
  > 1. **1NF:** Every column contains atomic values (scalar types), and each record has a unique UUID primary key.
  > 2. **2NF:** All non-key attributes are fully functionally dependent on the primary key. Since every table uses a single-column UUID primary key rather than a composite natural key, partial key dependencies are mathematically impossible.
  > 3. **3NF:** We eliminated all transitive dependencies by decomposing entities. For instance, rather than storing category descriptions or emission factors directly inside the `activities` table (which would create a transitive dependency $Activity \to Factor \to Rate$), factors are isolated in `emission_factors`, departments in `departments`, and organizations in `organizations`. The `activities` table references foreign keys `category_id` and `emission_factor_id` directly."

#### Q3: "How does `chk_activity_workspace_scope` work? Does it enforce Row-Level Security?"
- **Answer:**
  > "No, it does NOT enforce PostgreSQL Row-Level Security (RLS). We explicitly distinguish between database-level structural constraints and application-level authorization.
  > `chk_activity_workspace_scope` is a PostgreSQL `CHECK` constraint defined on the `activities` table:
  > ```sql
  > CHECK (
  >   (organization_id IS NULL AND department_id IS NULL) OR
  >   (organization_id IS NOT NULL)
  > )
  > ```
  > This enforces structural ownership exclusivity: an activity is either a personal entry (where `organization_id` and `department_id` must both be NULL) or an organizational entry (where `organization_id` must be present). It prevents orphaned department references. Workspace data isolation (ensuring User A cannot read User B's activities) is enforced in our Express middleware layer (`resolveWorkspaceScope`) via parameterized queries filtering by `user_id` or `organization_id`."

---

### Category 2: ADBMS Concepts & PL/pgSQL Routines

#### Q4: "Why did you implement `sp_record_activity_with_emissions` as a stored function rather than doing the calculation in Node.js?"
- **Answer:**
  > "Executing the calculation inside a PL/pgSQL stored function (`CREATE OR REPLACE FUNCTION`) offers three major advantages:
  > 1. **Atomic Transactional Encapsulation:** In a single network round-trip, the database verifies the active emission factor, executes fixed-point multiplication, inserts the activity record, and writes an audit log. If any step fails, the entire transaction rolls back atomically.
  > 2. **Data Integrity Guarantee:** Even if a developer bypasses the Node.js API (for example via a direct SQL client, CLI script, or ETL pipeline), the emission calculation and factor snapshotting cannot be circumvented or miscalculated.
  > 3. **Reduced Network Latency:** Instead of three separate queries (lookup factor $\to$ compute in Node $\to$ insert activity), all operations execute in sub-millisecond memory within the PostgreSQL engine."

#### Q5: "What triggers did you create, and how do they capture audit history?"
- **Answer:**
  > "We implemented 10 triggers, notably `trg_audit_activities` and `trg_update_timestamp`.
  > `trg_audit_activities` is an `AFTER INSERT OR UPDATE OR DELETE` trigger on the `activities` table executing the trigger function `fn_audit_log()`.
  > Inside this function, PostgreSQL inspects `TG_OP`. For inserts, it serializes `to_jsonb(NEW)` into the `new_state` column of the `audit_logs` table. For updates, it captures both `to_jsonb(OLD)` and `to_jsonb(NEW)`. For deletes, it captures `to_jsonb(OLD)`. It also records the triggering user UUID, action type, entity name, and timestamp, providing an immutable, tamper-evident historical audit trail."

#### Q6: "How did you verify ACID transaction rollback and zero orphan rows?"
- **Answer:**
  > "In Test Suite 4 (Test 7), we executed an intentional mid-transaction failure. We started a transaction (`BEGIN`), inserted a valid activity row, and then issued a secondary insert with an invalid foreign key reference that violates referential integrity.
  > PostgreSQL aborted the transaction and executed `ROLLBACK`.
  > We immediately queried the `activities` table and the `audit_logs` table. Both queries returned zero rows corresponding to that transaction ID. This empirically proved the Atomicity and Consistency properties of our PostgreSQL engine—no partially committed orphan rows remained."

---

### Category 3: Indexing & Query Performance

#### Q7: "How did your composite B-tree index optimize analytical queries?"
- **Answer:**
  > "Our primary analytical dashboard queries filter activities by `user_id` and sort or slice by `activity_date`.
  > Without an index, PostgreSQL must execute a Sequential Scan (`Seq Scan`) across the entire heap, evaluating filter predicates on every block.
  > We engineered a composite B-tree index:
  > ```sql
  > CREATE INDEX idx_activities_user_date ON activities (user_id, activity_date DESC);
  > ```
  > Using `EXPLAIN (ANALYZE, BUFFERS)` in Test 8, we observed that PostgreSQL switched from a sequential scan to a targeted `Bitmap Index Scan` followed by `Bitmap Heap Scan`.
  > The execution time dropped to **0.58 milliseconds**, reading only 3 buffer pages instead of scanning the full table heap. This represents an 85% query acceleration."

#### Q8: "How does PostgreSQL handle concurrent writes in CarbonIQ?"
- **Answer:**
  > "In Test Suite 5, we tested concurrency by firing 10 simultaneous asynchronous activity insertions using `Promise.all` across independent database connections in our connection pool.
  > All 10 transactions completed in **274 milliseconds**.
  > Because each activity insert generates a unique UUID primary key and appends to the table, PostgreSQL applies row-level write locks (`RowExclusiveLock`) rather than table-level locks. Consequently, the transactions proceeded concurrently with zero deadlocks, zero lock waits, and zero transaction serialization anomalies."

---

### Category 4: Environmental Accounting & AI Microservice

#### Q9: "Why is NUMERIC(14,4) preferred over DOUBLE PRECISION / FLOAT in carbon accounting?"
- **Answer:**
  > "Floating-point types like `FLOAT` or `DOUBLE PRECISION` follow the IEEE 754 standard, which represents numbers in binary fractions ($1/2, 1/4, 1/8\dots$). Many common decimal numbers—such as $0.7160$ or $0.1$—cannot be represented exactly in binary floating-point, leading to minute rounding artifacts (e.g., $71.60000000000001$).
  > In regulatory carbon compliance and emissions trading, cumulative rounding errors across millions of transactions produce non-reproducible totals.
  > PostgreSQL's `NUMERIC(14,4)` stores exact decimal digits as base-10,000 arrays. It guarantees 10 integer digits and exactly 4 fractional decimal places with zero rounding drift."

#### Q10: "How does the AI microservice preserve user privacy while providing reduction tips?"
- **Answer:**
  > "The AI service is decoupled into an independent FastAPI microservice running on port 8000.
  > When the Express backend requests AI recommendations, it does not send raw activity logs or user profile data. Instead, it computes an aggregated JSON summary containing only:
  > - Total emissions in kg CO₂e
  > - Category breakdown percentages (e.g., Electricity 62%, Transport 28%)
  > - Top 2 highest-emitting categories
  > - Active reduction goal percentage
  > No user names, email addresses, geographical locations, IP addresses, or raw activity notes are ever transmitted to the LLM. Furthermore, if Google Gemini is offline or unreachable, our local rule-based heuristic engine generates domain-specific recommendations in under 20 ms with zero external network transmission."

---

## Technical Fact Sheet (Quick Reference Card)

| Parameter | Implemented Value | Source File / Verification |
| :--- | :--- | :--- |
| **Relational Database** | PostgreSQL 18.6 (x64) | `TECHNICAL_NOTES.md` |
| **Schema Normalization** | Third Normal Form (3NF) | 13 Tables, 0 transitive dependencies |
| **Total DB Objects** | 13 Tables, 4 Views, 5 Functions, 10 Triggers, 31 Indexes | Verified via `information_schema` |
| **Numeric Precision** | `NUMERIC(14,4)` | Exact decimal, no IEEE 754 drift |
| **Primary Key Strategy** | `UUIDv4` via `pgcrypto` | Cryptographically random, anti-enumeration |
| **Frontend Stack** | React 18.2, Vite 5.1, Tailwind 3.4, Recharts 2.12 | `frontend/package.json` (2,303 modules) |
| **Backend API Stack** | Node.js, Express 4.19, pg 8.11, Zod 3.22, JWT 9.0 | `backend/package.json` |
| **AI Microservice** | Python 3.14, FastAPI 0.110, Uvicorn 0.28, Pydantic 2.6 | `ai-service/requirements.txt` |
| **LLM Integration** | Google Gemini 2.5 Flash + Heuristic Fallback (<20ms) | `ai-service/app/services/` |
| **Grid Electricity Factor** | 0.7160 kg CO₂e / kWh | CEA 2023 (India National Baseline) |
| **Verified Test Result** | 100 kWh × 0.7160 = 71.6000 kg CO₂e | Automated Test 6 |
| **Index Query Latency** | 0.58 ms | `EXPLAIN ANALYZE` on `idx_activities_user_date` |
| **Concurrency Benchmark** | 10 transactions in 274 ms (0 deadlocks) | Automated Test Suite 5 |
| **Total Test Assertions** | 54 / 54 Passed (100% Pass Rate) | All 5 automated suites |

---
*Document prepared for Bennett University ADBMS Mini-Project Examination, November 2026.*

