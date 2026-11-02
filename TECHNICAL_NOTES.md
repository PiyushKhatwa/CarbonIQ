# CarbonIQ Technical Notes & Architecture Decisions

## 1. System Architecture & Decisions

### Architectural Principles
- **Local-First & Production-Grade:** All state is persisted in local PostgreSQL; no mock data or hardcoded stats in production execution paths.
- **Academic ADBMS Integrity:** Clear demonstration of 1NF–3NF relational normalization, ACID transactions, atomic multi-table writes with rollbacks, JSONB audit triggers, stored procedures, analytical SQL views, and indexed query optimizations.
- **Deterministic Emission Arithmetic:** Emission calculations take place exclusively on the backend using decimal-safe logic (`emissions_kg_co2e = quantity * factor_value`). Every emission record stores a snapshot of the exact factor value and source reference ID to preserve historical reproducibility.
- **Strict Data Scoping & Multi-Tenancy:** Workspaces are either Individual (`user_id` populated) or Organizational (`organization_id` populated). A PostgreSQL table-level `CHECK` constraint strictly enforces this exclusivity at the database engine level.
- **Privacy-Preserving AI Integration:** The Python FastAPI AI service never receives raw user identities, credentials, or unstructured freeform text notes. Only aggregated category metrics and comparative periods are provided. A deterministic rule-based fallback executes automatically if external AI APIs fail or API keys are absent.

---

## 2. PostgreSQL Database Specifications & Verified Inventory

- **Database Name:** `carboniq_db`
- **Connected Engine:** PostgreSQL 18.6 on x86_64-windows (msvc-19.44.35229, 64-bit)
- **Host / Port:** `localhost:5432`
- **Primary Key Convention:** `UUID v4` generated via native `gen_random_uuid()`
- **Numeric Precision:** `NUMERIC(14, 4)` for quantities and emission factors; `NUMERIC(16, 4)` for calculated CO2e kilograms.
- **Timezone Standard:** `TIMESTAMPTZ` (UTC storage, localized in UI).

### Verified Database Object Count (Post-Migration & Post-Seed)
- **Base Tables (13):**
  `activities`, `activity_categories`, `activity_types`, `audit_logs`, `departments`, `emission_factor_sources`, `emission_factors`, `emission_records`, `goals`, `organization_members`, `organizations`, `recommendations`, `users`.
- **Views (4):**
  `v_activities_detailed`, `v_category_emissions`, `v_department_emissions`, `v_monthly_emissions`.
- **Custom Application Routines (5):**
  1. `sp_record_activity_with_emissions` (Procedural atomic calculator & recorder)
  2. `fn_get_workspace_summary` (Table-valued comparative KPI aggregator)
  3. `fn_audit_activity_changes` (Active trigger function for activity logging)
  4. `fn_audit_factor_changes` (Active trigger function for factor provenance)
  5. `fn_update_timestamp` (Automated `updated_at` maintenance)
- **Active Triggers (10):**
  Attached to `activities` (`trg_audit_activities`, `trg_activities_updated_at`), `emission_factors` (`trg_audit_emission_factors`), `users`, `organizations`, and `goals`.
- **Indexes (31):**
  Covering primary keys, unique constraints, foreign keys, and multi-tenant time-series filter paths (`idx_activities_user_date`, `idx_activities_org_date`, `idx_activities_dept_date`, `idx_factors_lookup`, `idx_audit_entity`).

---

## 3. Backend REST Architecture & API Implementation (Phase 3 Verified)

### Layered Separation of Concerns
- **Routes (`modules/*/*.routes.js`):** Request mapping, authentication requirement, workspace resolution, and schema validation.
- **Middleware:**
  - `requireAuth`: JWT validation against secret, user verification from `users` table.
  - `resolveWorkspaceScope`: Multi-tenancy guard verifying whether caller is authorized for the active personal or organization workspace. Rejects cross-tenant access with 403.
  - `validate`: Zod validation on `body`, `query`, and `params`.
  - `errorHandler`: PostgreSQL error code translation (23505 duplicate, 23503 foreign key, 23514 check constraint) to clean client JSON.
- **Controllers (`modules/*/*.controller.js`):** HTTP request extraction and standardized response delivery (`sendSuccess`, `sendCreated`, `sendPaginated`, `sendError`).
- **Services (`modules/*/*.service.js`):** Business logic, deterministic arithmetic (`calculateEmissions`), and permission assertions.
- **Repositories (`modules/*/*.repository.js`):** Parameterized SQL queries and ACID transaction management (`db.withTransaction`).

### Verified API Test Results
Executed via `npm run test:api` (`tests/backend_api_test.js`):
- **25 / 25 automated tests passed (100% success rate)**
- Validated:
  1. Health check (`/health`)
  2. Taxonomy queries (categories, types, factors)
  3. Authentication (registration, duplicate email rejection 409, login success, invalid password rejection 401, `/auth/me`)
  4. Workspaces discovery (`/workspaces`)
  5. Organization & department creation
  6. Multi-tenant workspace scoping (unauthorized org query rejected with 403 `WORKSPACE_ACCESS_DENIED`)
  7. Deterministic live calculation preview (`/emissions/preview`)
  8. Atomic activity + emission record insertion with frozen snapshot
  9. Database check constraint rejection (negative quantity rejected with 400)
  10. Activity history pagination and detail retrieval
  11. Atomic update and recalculation
  12. Analytical summary KPIs, monthly trends, and category breakdown
  13. Goals creation and progress tracking against actual footprints
  14. Recommendation listing, refresh, and status lifecycle
  15. Cascaded deletion of activity and emission record

---

## 4. Frontend UI/UX Architecture & Design System (Phase 4 Verified)

### Design Direction & Color Tokens
- **Theme:** Modern environmental SaaS identity (`#176B4D` primary forest green, `#104B38` deep forest, `#DDF3E8` accent mint, `#F7F9F7` surface off-white, `#18231E` charcoal text).
- **Typography:** Inter sans-serif with readable weights and generous component spacing.
- **Charts:** Interactive Recharts `AreaChart` (trajectory gradients) and `PieChart` (categorical donut breakdown).
- **Icons:** Lucide-React icons (`Zap`, `Car`, `Flame`, `Container`, `Trash2`, `Sparkles`, `Target`, `Building2`).

### Frontend Component Architecture
- **Context State Providers:**
  - `AuthContext`: Tracks JWT token in `localStorage`, user session, login/registration, and profile updates.
  - `WorkspaceContext`: Multi-tenant switcher managing `personal` vs `organization` workspaces. Automatically syncs `x-workspace-type` and `x-organization-id` headers for all API calls.
- **Interactive "Add Activity" Wizard (`AddActivityModal`):**
  - Category selector tabs with visual icons.
  - Activity type dynamic dropdown matching the active category.
  - Contextual unit hint (`kWh`, `km`, `litres`, `kg`).
  - Real-time debounced preview calling `POST /api/v1/emissions/preview` showing live footprint and factor citation before saving.
  - Atomic persistence in PostgreSQL upon submit.
- **Production Bundle Verification:**
  - `vite build` completed cleanly, bundling 2,303 modules without errors.

---

## 5. AI Recommendation Microservice (Phase 5 Verified)

### Architecture & Privacy
- **Microservice Framework:** FastAPI on Python 3.14 (`ai-service/app/main.py`), running on `http://localhost:8000`.
- **Validation:** Pydantic models for incoming payload (`InsightRequest`, `CategoryEmissionInput`, `PeriodComparisonInput`) and structured output (`InsightResponse`, `RecommendationItem`).
- **Privacy Assurance:** Zero user PII, email addresses, or unanonymized freeform activity descriptions are transmitted to the AI engine. Only aggregated numeric metrics (`category`, `total_emissions_kg`, `percentage`, `activity_count`) and temporal percentage changes are analyzed.
- **Resilient Fallback Engine:** If Google Gemini API is unavailable or `GEMINI_API_KEY` is not supplied, the microservice invokes an offline deterministic recommendation heuristic:
  - Dynamically targets the caller's highest-emission category.
  - Generates quantified, actionable recommendations across all 5 operational categories (`electricity`, `transportation`, `fuel`, `lpg`, `waste`).
  - Assigns priority (`high`, `medium`, `low`) and estimated impact percentage.
- **Automated AI Tests:** Executed via `npm run test:ai` (`tests/ai_service_test.py`):
  - 4 / 4 tests passed (Health check, valid insights generation, 422 schema validation rejection, priority ranking verification).

---

## 6. Advanced Database Features & Verification Results (Phase 6 ADBMS Demonstrations)

### Automated Test Suites
1. **`npm run test:db` (`database/scripts/verify.js`):** 7 / 7 checks passed.
2. **`npm run test:api` (`tests/backend_api_test.js`):** 25 / 25 checks passed.
3. **`npm run test:ai` (`tests/ai_service_test.py`):** 4 / 4 checks passed.
4. **`npm run test:adbms` (`database/scripts/run_adbms_suite.js`):** 8 / 8 checks passed.
5. **`npm run test:concurrency` (`tests/concurrency_test.js`):** 10 / 10 concurrent transactions committed.

### ADBMS Academic Criteria Evaluation

1. **Relational Normalization (1NF–3NF):**
   - Tables decomposed into single-theme entities (`users`, `organizations`, `organization_members`, `departments`, `activity_categories`, `activity_types`, `emission_factors`, `emission_factor_sources`, `activities`, `emission_records`, `goals`, `recommendations`, `audit_logs`).
   - Every column contains atomic values, records have UUID primary keys, and non-key attributes depend strictly and entirely on the primary key without transitive dependencies.

2. **ACID Transaction Guarantees & Rollback:**
   - Activities and emission calculations are written inside an explicit atomic transaction (`BEGIN` ... `COMMIT`).
   - Verified via `npm run test:adbms` (Test 4): Inducing an error midway cleanly rolls back the transaction, leaving exactly **0** orphan rows in `activities`.

3. **High-Concurrency Stress Testing:**
   - Verified via `npm run test:concurrency`: 10 simultaneous database connections recording activities and calculation snapshots concurrently completed in **274ms** with **0 deadlocks** and zero lost updates.

4. **Active Database Triggers & Audit Trail:**
   - Trigger `trg_audit_activities` intercepts `INSERT`, `UPDATE`, and `DELETE` operations on `activities` and populates `audit_logs` with before-and-after JSONB state snapshots.
   - Verified in Test 5 of the ADBMS test suite.

5. **Deterministic In-Database Stored Procedure:**
   - Routine `sp_record_activity_with_emissions` performs atomic factor lookup, multiplication (`quantity * factor`), and persistence.
   - Tested in Test 6: 100 kWh @ 0.7160 kg/kWh produced exactly `71.6000 kg CO2e`.

6. **Analytical SQL Views:**
   - `v_monthly_emissions`, `v_category_emissions`, and `v_department_emissions` provide clean reporting layers for dashboards without requiring multiple heavy ad-hoc queries.

7. **Index Optimization & Query Plan Inspection (`EXPLAIN ANALYZE`):**
   ```
   Sort  (cost=21.05..21.06 rows=1 width=56) (actual time=0.514..0.516 rows=3.00 loops=1)
     Sort Key: a.activity_date DESC
     Sort Method: quicksort  Memory: 25kB
     Buffers: shared hit=6
     ->  Hash Join  (cost=9.53..21.04 rows=1 width=56) (actual time=0.090..0.100 rows=3.00 loops=1)
           Hash Cond: (er.activity_id = a.id)
           Buffers: shared hit=3
           ->  Seq Scan on emission_records er  (cost=0.00..11.20 rows=120 width=34) (actual time=0.032..0.034 rows=5.00 loops=1)
                 Buffers: shared hit=1
           ->  Hash  (cost=9.50..9.50 rows=2 width=38) (actual time=0.046..0.047 rows=3.00 loops=1)
                 Buckets: 1024  Batches: 1  Memory Usage: 9kB
                 Buffers: shared hit=2
                 ->  Bitmap Heap Scan on activities a  (cost=4.16..9.50 rows=2 width=38) (actual time=0.033..0.035 rows=3.00 loops=1)
                       Recheck Cond: (user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid)
                       Heap Blocks: exact=1
                       Buffers: shared hit=2
                       ->  Bitmap Index Scan on idx_activities_user_date  (cost=0.00..4.16 rows=2 width=0) (actual time=0.012..0.012 rows=11.00 loops=1)
                             Index Cond: (user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid)
                             Index Searches: 1
                             Buffers: shared hit=1
   Planning Time: 0.446 ms
   Execution Time: 0.580 ms
   ```
   - Proves index `idx_activities_user_date` (`user_id, activity_date DESC`) is actively used by PostgreSQL's query optimizer, resulting in execution in under **0.6 ms** with 100% cache hits.

---

## 7. Local Setup & Production Startup Guide

- Backend: `npm run dev:backend` (port 5000)
- Frontend: `npm run dev:frontend` (port 5173)
- AI Service: `npm run dev:ai` (port 8000)
- PostgreSQL: `localhost:5432` (`carboniq_db`)


