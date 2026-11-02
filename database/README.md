# CarbonIQ PostgreSQL Database Guide

This guide documents the design, setup, migration, seeding, inspection, and ADBMS evaluation procedures for the `carboniq_db` database.

---

## Database Architecture Overview

- **Database Name:** `carboniq_db`
- **Default Engine:** PostgreSQL 14+ (Recommended: PostgreSQL 16)
- **Port:** `5432`
- **Primary Key:** `UUID v4` (`gen_random_uuid()`)
- **Decimal Precision:** `NUMERIC(14, 4)` for quantities and emission factors; `NUMERIC(16, 4)` for calculated CO2e emissions.

---

## Directory Organization

```text
database/
├── migrations/
│   ├── 001_initial_schema.sql       # Tables, foreign keys, CHECK constraints, indexes
│   ├── 002_triggers_and_audit.sql   # JSONB audit trail trigger & updated_at trigger
│   ├── 003_analytical_views.sql     # Monthly, category, and department views
│   └── 004_stored_procedures.sql   # Deterministic calculation & summary procedures
├── seeds/
│   ├── 001_taxonomies_and_factors.sql # Verifiable emission categories, types & factors
│   └── 002_demo_workspace_data.sql    # Clearly labelled sample users, orgs & footprints
├── tests/
│   └── adbms_verification_suite.sql # Test suite verifying FKs, checks, rollback, triggers
├── scripts/
│   ├── migrate.js                   # Automated Node.js migration runner
│   └── verify.js                    # Automated SQL assertion runner
└── README.md                        # This document
```

---

## 1. Initial Database Setup

### Step 1.1: Verify PostgreSQL Service is Running
Check if PostgreSQL is running on Windows:
```powershell
Get-Service *postgres*
```

### Step 1.2: Create the `carboniq_db` Database
Using `psql` (or pgAdmin 4):
```bash
psql -U postgres -c "CREATE DATABASE carboniq_db;"
```

---

## 2. Running Migrations & Seeding Data

You can execute the migrations in order using `psql` or our automated runner:

### Option A: Using `psql` Command Line
```bash
# Apply schema migrations
psql -U postgres -d carboniq_db -f database/migrations/001_initial_schema.sql
psql -U postgres -d carboniq_db -f database/migrations/002_triggers_and_audit.sql
psql -U postgres -d carboniq_db -f database/migrations/003_analytical_views.sql
psql -U postgres -d carboniq_db -f database/migrations/004_stored_procedures.sql

# Apply seed data
psql -U postgres -d carboniq_db -f database/seeds/001_taxonomies_and_factors.sql
psql -U postgres -d carboniq_db -f database/seeds/002_demo_workspace_data.sql
```

### Option B: Using pgAdmin 4
1. Open **pgAdmin 4**.
2. Connect to your PostgreSQL server.
3. Right-click **Databases** -> **Create** -> **Database...** -> Name it `carboniq_db`.
4. Right-click `carboniq_db` -> Select **Query Tool**.
5. Open and execute the SQL files in the order listed above.

---

## 3. Visual Inspection in pgAdmin 4

After running migrations, navigate through the pgAdmin object browser:
- **Tables** (`Schemas` -> `public` -> `Tables`):
  - `users`, `organizations`, `organization_members`, `departments`
  - `activity_categories`, `activity_types`, `emission_factor_sources`, `emission_factors`
  - `activities`, `emission_records`, `goals`, `recommendations`, `audit_logs`
- **Views** (`Schemas` -> `public` -> `Views`):
  - `v_activities_detailed`
  - `v_monthly_emissions`
  - `v_category_emissions`
  - `v_department_emissions`
- **Trigger Functions** (`Schemas` -> `public` -> `Trigger Functions`):
  - `fn_audit_activity_changes`
  - `fn_audit_factor_changes`
  - `fn_update_timestamp`
- **Functions / Stored Procedures** (`Schemas` -> `public` -> `Functions`):
  - `sp_record_activity_with_emissions`
  - `fn_get_workspace_summary`

---

## 4. Running the ADBMS Verification Suite

Execute the test suite to demonstrate advanced database concepts:
```bash
psql -U postgres -d carboniq_db -f database/tests/adbms_verification_suite.sql
```

The suite validates:
1. **Referential Integrity:** Rejection of non-existent foreign keys (Error `23503`).
2. **Check Constraints:** Rejection of negative activity quantities (Error `23514`).
3. **Workspace Isolation:** Rejection of ambiguous multi-tenant scope.
4. **ACID Rollback:** Demonstration that simulated failures leave no orphan records.
5. **Active Triggers:** Inspection of automated JSONB audit trail in `audit_logs`.
6. **Stored Procedures:** Execution of `sp_record_activity_with_emissions`.
7. **Analytical Views:** Querying real-time aggregated metrics.
8. **Index Optimization:** `EXPLAIN (ANALYZE, BUFFERS)` query plan examination.

---

## 5. Resetting the Database (Caution)

> [!CAUTION]
> Never reset or drop an existing database in production without explicit approval.

To perform a clean reset during development:
```sql
DROP DATABASE IF EXISTS carboniq_db;
CREATE DATABASE carboniq_db;
```
Then re-apply the migrations and seeds in order.

