# CarbonIQ Data Dictionary & Schema Specification

**Subject:** Advanced Database Management Systems (ADBMS)  
**Database Name:** `carboniq_db`  
**Relational Normalization:** 1NF, 2NF, 3NF with documented historical snapshotting  
**Engine:** PostgreSQL 14+  

---

## 1. Table: `users`
Stores user credentials, primary profile details, and role access.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT `gen_random_uuid()` | Unique user identifier |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | User email address for authentication |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt hashed password (salt rounds >= 10) |
| `full_name` | VARCHAR(150) | NOT NULL | Display name |
| `system_role` | VARCHAR(50) | NOT NULL, DEFAULT `'user'`, CHECK in `('user', 'platform_admin')` | Global system authorization level |
| `default_workspace_type` | VARCHAR(20) | NOT NULL, DEFAULT `'personal'`, CHECK in `('personal', 'organization')` | Initial workspace selection |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `CURRENT_TIMESTAMP` | Account creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `CURRENT_TIMESTAMP` | Last profile update timestamp |

---

## 2. Table: `organizations`
Represents corporate or institutional entities managing organizational carbon footprints.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT `gen_random_uuid()` | Unique organization identifier |
| `name` | VARCHAR(200) | NOT NULL | Registered organization name |
| `slug` | VARCHAR(200) | NOT NULL, UNIQUE | URL/route-friendly identifier |
| `description` | TEXT | NULL | Mission or scope description |
| `industry` | VARCHAR(100) | NULL | Sector (e.g. IT, Manufacturing, Logistics) |
| `country` | VARCHAR(100) | DEFAULT `'India'` | Primary operational country |
| `created_by` | UUID | NOT NULL, FK -> `users(id)` ON DELETE RESTRICT | Founding administrator |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `CURRENT_TIMESTAMP` | Organization creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `CURRENT_TIMESTAMP` | Last update timestamp |

---

## 3. Table: `organization_members`
Junction table mapping multi-tenant membership and departmental access roles.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT `gen_random_uuid()` | Membership record ID |
| `organization_id` | UUID | NOT NULL, FK -> `organizations(id)` ON DELETE CASCADE | Associated organization |
| `user_id` | UUID | NOT NULL, FK -> `users(id)` ON DELETE CASCADE | Member user ID |
| `role` | VARCHAR(50) | NOT NULL, DEFAULT `'member'`, CHECK in `('owner', 'admin', 'member')` | Organization role permissions |
| `joined_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `CURRENT_TIMESTAMP` | Membership start timestamp |

*Composite Unique Constraint:* `UNIQUE (organization_id, user_id)`

---

## 4. Table: `departments`
Functional operational units within an organization.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT `gen_random_uuid()` | Unique department ID |
| `organization_id` | UUID | NOT NULL, FK -> `organizations(id)` ON DELETE CASCADE | Owning organization |
| `name` | VARCHAR(120) | NOT NULL | Department name (e.g. Logistics, Engineering) |
| `code` | VARCHAR(50) | NULL | Short department code (e.g. `OPS-01`) |
| `description` | TEXT | NULL | Department scope description |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `CURRENT_TIMESTAMP` | Record creation timestamp |

*Composite Unique Constraint:* `UNIQUE (organization_id, name)`

---

## 5. Table: `activity_categories`
Taxonomy roots classifying sources of greenhouse gas emissions.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT `gen_random_uuid()` | Category identifier |
| `code` | VARCHAR(50) | NOT NULL, UNIQUE | Canonical machine code (`electricity`, `transportation`, etc.) |
| `name` | VARCHAR(100) | NOT NULL | Display name |
| `description` | TEXT | NULL | Category scope |
| `icon_name` | VARCHAR(50) | NULL | Lucide icon identifier |
| `display_order` | INT | DEFAULT `0` | UI sort order |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT `TRUE` | Category availability toggle |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `CURRENT_TIMESTAMP` | Record creation timestamp |

---

## 6. Table: `activity_types`
Concrete emission-generating activities with standardized measurement units.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT `gen_random_uuid()` | Activity type ID |
| `category_id` | UUID | NOT NULL, FK -> `activity_categories(id)` ON DELETE RESTRICT | Parent category |
| `code` | VARCHAR(80) | NOT NULL, UNIQUE | Canonical activity code |
| `name` | VARCHAR(150) | NOT NULL | Human-readable activity name |
| `standard_unit` | VARCHAR(30) | NOT NULL | Required input unit (`kWh`, `km`, `litres`, `kg`) |
| `description` | TEXT | NULL | Input instructions and examples |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT `TRUE` | Activity toggle |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `CURRENT_TIMESTAMP` | Record creation timestamp |

---

## 7. Table: `emission_factor_sources`
Traceable citations documenting the publishing bodies and studies for carbon calculations.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT `gen_random_uuid()` | Source citation ID |
| `short_name` | VARCHAR(100) | NOT NULL, UNIQUE | Citation tag (e.g. `'CEA India 2023'`, `'UK DEFRA 2023'`) |
| `publisher` | VARCHAR(200) | NOT NULL | Publishing institution or ministry |
| `source_title` | VARCHAR(300) | NOT NULL | Official document/dataset title |
| `reference_url` | VARCHAR(500) | NULL | Web citation link |
| `publication_year`| INT | NOT NULL, CHECK `(publication_year BETWEEN 1990 AND 2100)` | Publication year |
| `notes` | TEXT | NULL | Methodology notes |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `CURRENT_TIMESTAMP` | Record creation timestamp |

---

## 8. Table: `emission_factors`
Versioned, localized conversion coefficients mapping activity units to kilograms of CO2 equivalent.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT `gen_random_uuid()` | Factor ID |
| `activity_type_id`| UUID | NOT NULL, FK -> `activity_types(id)` ON DELETE RESTRICT | Activity to which factor applies |
| `source_id` | UUID | NOT NULL, FK -> `emission_factor_sources(id)` ON DELETE RESTRICT | Provenance reference |
| `factor_value` | NUMERIC(14, 6) | NOT NULL, CHECK `(factor_value >= 0)` | Multiplier: kg CO2e per standard unit |
| `unit` | VARCHAR(30) | NOT NULL | Factor denominator unit (e.g. `'kg CO2e/kWh'`) |
| `geography` | VARCHAR(100) | NOT NULL, DEFAULT `'India'` | Regional boundary |
| `valid_from` | DATE | NOT NULL | Start date of regulatory validity |
| `valid_to` | DATE | NULL, CHECK `(valid_to IS NULL OR valid_to >= valid_from)` | End date of validity |
| `version_tag` | VARCHAR(50) | NOT NULL, DEFAULT `'v1.0'` | Factor iteration tag |
| `is_verified` | BOOLEAN | NOT NULL, DEFAULT `TRUE` | Data verification flag |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `CURRENT_TIMESTAMP` | Record creation timestamp |

*Composite Unique Constraint:* `UNIQUE (activity_type_id, geography, version_tag)`

---

## 9. Table: `activities`
Primary transaction table recording discrete emissions-generating events.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT `gen_random_uuid()` | Activity event ID |
| `user_id` | UUID | NULL, FK -> `users(id)` ON DELETE CASCADE | Populated for personal workspace |
| `organization_id`| UUID | NULL, FK -> `organizations(id)` ON DELETE CASCADE | Populated for organization workspace |
| `department_id` | UUID | NULL, FK -> `departments(id)` ON DELETE SET NULL | Optional organizational department |
| `activity_type_id`| UUID | NOT NULL, FK -> `activity_types(id)` ON DELETE RESTRICT | Specific activity type recorded |
| `created_by` | UUID | NOT NULL, FK -> `users(id)` ON DELETE RESTRICT | Authenticated user submitting the entry |
| `quantity` | NUMERIC(14, 4)| NOT NULL, CHECK `(quantity > 0)` | Measured amount consumed/traveled |
| `unit` | VARCHAR(30) | NOT NULL | Unit matching activity standard unit |
| `activity_date` | DATE | NOT NULL | Calendar date activity took place |
| `notes` | TEXT | NULL | User notes or context |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `CURRENT_TIMESTAMP` | Row creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `CURRENT_TIMESTAMP` | Last modification timestamp |

*Workspace Scoping Constraint:*  
`CHECK ((user_id IS NOT NULL AND organization_id IS NULL AND department_id IS NULL) OR (organization_id IS NOT NULL))`

---

## 10. Table: `emission_records`
Exact deterministic carbon calculations, frozen with an immutable snapshot of the factor used.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT `gen_random_uuid()` | Emission record ID |
| `activity_id` | UUID | NOT NULL, UNIQUE, FK -> `activities(id)` ON DELETE CASCADE | 1-to-1 association with activity |
| `emission_factor_id`| UUID | NOT NULL, FK -> `emission_factors(id)` ON DELETE RESTRICT | Reference factor row |
| `emission_factor_snapshot`| NUMERIC(14, 6)| NOT NULL | Factor value frozen at calculation time |
| `factor_source_snapshot` | VARCHAR(200) | NOT NULL | Human-readable citation frozen at calculation time |
| `calculated_co2e_kg` | NUMERIC(16, 4)| NOT NULL, CHECK `(calculated_co2e_kg >= 0)` | `quantity * factor_snapshot` |
| `calculation_method` | VARCHAR(50) | NOT NULL, DEFAULT `'factor_multiplication'` | Applied methodology tag |
| `calculated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `CURRENT_TIMESTAMP` | Timestamp of calculation |

---

## 11. Table: `audit_logs`
Automated active database trigger-maintained record of table modifications.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT `gen_random_uuid()` | Audit log event ID |
| `actor_id` | UUID | NULL, FK -> `users(id)` ON DELETE SET NULL | User who initiated the operation |
| `action` | VARCHAR(50) | NOT NULL | `'INSERT'`, `'UPDATE'`, or `'DELETE'` |
| `entity_type` | VARCHAR(80) | NOT NULL | Database table name (`'activities'`, `'emission_factors'`) |
| `entity_id` | UUID | NOT NULL | Primary key of modified row |
| `old_state` | JSONB | NULL | Row contents prior to update/delete |
| `new_state` | JSONB | NULL | Row contents after insert/update |
| `ip_address` | VARCHAR(45) | NULL | Client IP if passed from application layer |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `CURRENT_TIMESTAMP` | Audit log creation timestamp |
