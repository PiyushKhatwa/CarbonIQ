# CarbonIQ Master Implementation Plan & Progress Tracker

**Document Version:** 1.0  
**Last Updated:** Phase 0 & Sprint 1 Initiation  
**Status:** In Progress  

---

## Progress Overview

| Phase | Description | Status | Completion Date |
|---|---|---|---|
| **Phase 0** | Repository Initialization, Architecture & Plan Approval | **IN PROGRESS** | Current |
| **Phase 1** | ER Diagram, Data Dictionary & Normalized Database Schema | **IN PROGRESS** | Current |
| **Phase 2** | PostgreSQL Migrations, Seeds & Advanced ADBMS Features | **PENDING** | - |
| **Phase 3** | Express Backend, Auth, Workspace Guard & Deterministic Engine | **PENDING** | - |
| **Phase 4** | Python FastAPI AI Service & Local Rule-Based Fallback Engine | **PENDING** | - |
| **Phase 5** | React 18 + Tailwind SaaS Frontend & Activity Wizard | **PENDING** | - |
| **Phase 6** | E2E Integration, ADBMS Verification Suite & Academic Polish | **PENDING** | - |

---

## Detailed Task Breakdown

### Phase 0: Repository Scaffolding & Architecture
- [x] Read and internalize full Master PRD and Development Plan.
- [x] Inspect local tools (Node.js v20.11.1, Python 3.14.3, Git, PostgreSQL status).
- [x] Create comprehensive Implementation Plan & ER Architecture document.
- [x] Secure user review and approval of design document.
- [x] Initialize Git repository.
- [x] Create `.gitignore` and `.env.example`.
- [x] Create `TECHNICAL_NOTES.md` and initial `PLAN.md`.
- [x] Create monorepo directory scaffolding (`frontend/`, `backend/`, `ai-service/`, `database/`, `docs/`, `tests/`).

### Phase 1 & 2: Database Schema, Migrations & Advanced ADBMS Features
- [ ] Guide / confirm PostgreSQL installation and local service startup.
- [ ] Create `carboniq_db` database locally.
- [x] Author Migration `001_initial_schema.sql` (UUID, tables, foreign keys, CHECK constraints).
- [x] Author Migration `002_triggers_and_audit.sql` (JSONB audit logging trigger on activities and factors).
- [x] Author Migration `003_analytical_views.sql` (Monthly, category, and department aggregation views).
- [x] Author Migration `004_stored_procedures.sql` (Deterministic calculation procedure and summary helpers).
- [x] Author Seed `001_taxonomies_and_factors.sql` (Verifiable factors with source citations: CEA, DEFRA, EPA).
- [x] Author Seed `002_demo_workspace_data.sql` (Labelled demo individual and organization datasets).
- [ ] Execute migrations and seeds against local PostgreSQL `carboniq_db`.
- [ ] Verify all tables, constraints, triggers, and views with actual SQL test assertions.
- [ ] Create automated ADBMS demonstration scripts (Referential integrity, Check constraint, Transaction rollback, Concurrency, `EXPLAIN ANALYZE`).
- [x] Create `database/README.md` with visual inspection instructions (pgAdmin).

### Phase 3: Backend REST APIs, Auth & Scoping
- [ ] Initialize Express backend with modular architecture (`modules/auth`, `modules/activities`, `modules/emissions`, etc.).
- [ ] Configure PostgreSQL connection pool (`pg` / `pg-promise`) with health checks.
- [ ] Implement JWT authentication, bcrypt password hashing, and role checks.
- [ ] Implement strict workspace context middleware (`x-workspace-type`, `x-organization-id`).
- [ ] Implement atomic activity submission with decimal-safe CO2e calculation and factor snapshotting.
- [ ] Implement analytics aggregation endpoints leveraging database views.
- [ ] Implement goals and CSV reporting endpoints.
- [ ] Backend automated test suite (Jest/Supertest).

### Phase 4: AI Service & Local Rule-Based Engine
- [ ] Initialize FastAPI Python service (`ai-service/`).
- [ ] Define Pydantic request/response schemas for insight generation.
- [ ] Implement external AI client (Gemini / OpenAI API) with timeout and sanitization.
- [ ] Implement offline deterministic rule-based recommendation engine fallback.
- [ ] Test AI fallback under simulated network/API failure.

### Phase 5: Modern SaaS UI / UX
- [ ] Initialize Vite + React 18 + TailwindCSS frontend.
- [ ] Establish sustainability design system (Forest green `#176B4D`, emerald, clean typography).
- [ ] Implement persistent layout with sidebar, topbar workspace switcher, and user menu.
- [ ] Build Onboarding & Workspace selector (Personal vs Organization).
- [ ] Build Overview Dashboard (Metric cards, Recharts trends, category breakdowns, goal progress).
- [ ] Build intuitive "Add Activity" modal/page with dynamic inputs and real-time calculation preview.
- [ ] Build Activity History table with pagination, filtering, and delete/edit.
- [ ] Build Emissions Analytics and Goal tracking interfaces.
- [ ] Build AI Insights screen with actionable recommendation cards and feedback actions.
- [ ] Implement loading skeletons, empty states, and error handling.

### Phase 6: E2E Verification & ADBMS Academic Demonstrations
- [ ] Run full cross-stack integration verification.
- [ ] Run and document ACID transaction rollback test.
- [ ] Run and document concurrency multi-submission test.
- [ ] Capture query plans with `EXPLAIN (ANALYZE, BUFFERS)` for index optimization report.
- [ ] Final polish, zero console errors, zero dead buttons.
