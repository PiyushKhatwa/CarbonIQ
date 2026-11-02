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

## 4. Advanced Database Features for ADBMS Demonstration

1. **ACID Transaction Guarantee & Rollback:**
   An atomic multi-table transaction inserts an `activity` and its corresponding `emission_record`. If calculation fails or an invalid foreign key / constraint violation occurs mid-transaction, an automatic `ROLLBACK` prevents orphan activity rows.
2. **PostgreSQL Trigger (`fn_audit_log_trigger`):**
   Fires automatically `AFTER INSERT OR UPDATE OR DELETE` on `activities` and `emission_factors` to record timestamp, action, and JSONB state into `audit_logs`.
3. **Stored Procedure / Function (`fn_record_activity_with_emissions`):**
   Demonstrates in-database procedural logic for factor lookup, arithmetic verification, and atomic persistence.
4. **Analytical SQL Views:**
   - `v_monthly_emissions`: Monthly aggregation partitioned by workspace.
   - `v_category_breakdown`: Category-wise sum and percentage share.
   - `v_department_emissions`: Department-level aggregates for organizations.
5. **Query Plan Benchmarking (`EXPLAIN ANALYZE`):**
   Comparison of sequential scans vs index scans using compound indexes on `(user_id, activity_date DESC)` and `(organization_id, department_id, activity_date DESC)`.

---

## 4. Local Setup & Environment Variables

- `.env.example` provides the baseline for `backend/`, `frontend/`, and `ai-service/`.
- Local services:
  - Frontend: `http://localhost:5173`
  - Backend: `http://localhost:5000`
  - AI Service: `http://localhost:8000`
  - PostgreSQL: `localhost:5432` (`carboniq_db`)

