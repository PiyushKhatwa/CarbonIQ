# CarbonIQ Technical Notes & Architecture Decisions

## 1. System Architecture & Decisions

### Architectural Principles
- **Local-First & Production-Grade:** All state is persisted in local PostgreSQL; no mock data or hardcoded stats in production execution paths.
- **Academic ADBMS Integrity:** Clear demonstration of 1NF–3NF relational normalization, ACID transactions, atomic multi-table writes with rollbacks, JSONB audit triggers, stored procedures, analytical SQL views, and indexed query optimizations.
- **Deterministic Emission Arithmetic:** Emission calculations take place exclusively on the backend using decimal-safe logic (`emissions_kg_co2e = quantity * factor_value`). Every emission record stores a snapshot of the exact factor value and source reference ID to preserve historical reproducibility.
- **Strict Data Scoping & Multi-Tenancy:** Workspaces are either Individual (`user_id` populated) or Organizational (`organization_id` populated). A PostgreSQL table-level `CHECK` constraint strictly enforces this exclusivity at the database engine level.
- **Privacy-Preserving AI Integration:** The Python FastAPI AI service never receives raw user identities, credentials, or unstructured freeform text notes. Only aggregated category metrics and comparative periods are provided. A deterministic rule-based fallback executes automatically if external AI APIs fail or API keys are absent.

---

## 2. PostgreSQL Database Specifications

- **Database Name:** `carboniq_db`
- **Default Port:** `5432`
- **Primary Key Convention:** `UUID v4` generated via `gen_random_uuid()` (native in PostgreSQL 13+)
- **Numeric Precision:** `NUMERIC(14, 4)` for quantities and emission factors; `NUMERIC(16, 4)` for calculated CO2e kilograms.
- **Timezone Standard:** `TIMESTAMPTZ` (UTC storage, localized in UI).

### Core Relations
1. `users`: Credentials, profiles, global role.
2. `organizations`: Managed entities with slug and owner.
3. `organization_members`: Junction table enforcing `UNIQUE(organization_id, user_id)` and member roles (`owner`, `admin`, `member`).
4. `departments`: Functional units within an organization for department-level analytics.
5. `activity_categories`: Master emission categories (`electricity`, `transportation`, `fuel`, `lpg`, `waste`).
6. `activity_types`: Concrete activities with standard measurement units (e.g. `grid_electricity` -> `kWh`, `passenger_car_petrol` -> `km`).
7. `emission_factor_sources`: Authoritative source citations (CEA, DEFRA, US EPA, IPCC) with publication years and reference URLs.
8. `emission_factors`: Versioned factor records with validity date windows (`valid_from`, `valid_to`), geography, and status.
9. `activities`: Recorded user/organization activities.
10. `emission_records`: Exactly one record per activity; stores computed CO2e kg and the factor snapshot used.
11. `goals`: Target reductions against historical baseline windows.
12. `recommendations`: AI-generated and rule-based reduction recommendations with priority and category.
13. `audit_logs`: Trigger-maintained record of table modifications including actor ID, operation (`INSERT`, `UPDATE`, `DELETE`), and before/after JSONB payloads.

---

## 3. Advanced Database Features for ADBMS Demonstration

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
