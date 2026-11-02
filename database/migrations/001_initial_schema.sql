-- ==============================================================================
-- CarbonIQ Database Migration: 001_initial_schema.sql
-- Description: Core schema, tables, foreign keys, check constraints, and indexes
-- Target Engine: PostgreSQL 14+ (Compatible with pgAdmin 4)
-- ==============================================================================

-- Enable UUID extension (gen_random_uuid is native in PG 13+, pgcrypto provides fallback)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. USERS & IDENTITY
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    system_role VARCHAR(50) NOT NULL DEFAULT 'user', -- 'user', 'platform_admin'
    default_workspace_type VARCHAR(20) NOT NULL DEFAULT 'personal', -- 'personal', 'organization'
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT chk_users_system_role CHECK (system_role IN ('user', 'platform_admin')),
    CONSTRAINT chk_users_default_workspace CHECK (default_workspace_type IN ('personal', 'organization'))
);

-- ------------------------------------------------------------------------------
-- 2. ORGANIZATIONS & DEPARTMENTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    description TEXT,
    industry VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_organizations_slug UNIQUE (slug),
    CONSTRAINT fk_organizations_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'member'
    joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_org_members_pair UNIQUE (organization_id, user_id),
    CONSTRAINT fk_org_members_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_org_members_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_org_members_role CHECK (role IN ('owner', 'admin', 'member'))
);

CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name VARCHAR(120) NOT NULL,
    code VARCHAR(50),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_org_dept_name UNIQUE (organization_id, name),
    CONSTRAINT fk_departments_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------------------------
-- 3. ACTIVITY TAXONOMY & EMISSION FACTOR CITATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activity_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL, -- 'electricity', 'transportation', 'fuel', 'lpg', 'waste'
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_name VARCHAR(50),
    display_order INT DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_activity_categories_code UNIQUE (code)
);

CREATE TABLE IF NOT EXISTS activity_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL,
    code VARCHAR(80) NOT NULL, -- 'grid_electricity', 'petrol_car', 'diesel_generator', etc.
    name VARCHAR(150) NOT NULL,
    standard_unit VARCHAR(30) NOT NULL, -- 'kWh', 'km', 'litres', 'kg'
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_activity_types_code UNIQUE (code),
    CONSTRAINT fk_activity_types_category FOREIGN KEY (category_id) REFERENCES activity_categories(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS emission_factor_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    short_name VARCHAR(100) NOT NULL, -- 'CEA India 2023', 'UK DEFRA 2023', 'US EPA 2023'
    publisher VARCHAR(200) NOT NULL,
    source_title VARCHAR(300) NOT NULL,
    reference_url VARCHAR(500),
    publication_year INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_factor_sources_name UNIQUE (short_name),
    CONSTRAINT chk_publication_year CHECK (publication_year >= 1990 AND publication_year <= 2100)
);

CREATE TABLE IF NOT EXISTS emission_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_type_id UUID NOT NULL,
    source_id UUID NOT NULL,
    factor_value NUMERIC(14, 6) NOT NULL, -- kg CO2e per standard_unit
    unit VARCHAR(30) NOT NULL,
    geography VARCHAR(100) NOT NULL DEFAULT 'India', -- 'India', 'Global', 'US', 'UK'
    valid_from DATE NOT NULL,
    valid_to DATE,
    version_tag VARCHAR(50) NOT NULL DEFAULT 'v1.0',
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_factors_activity_type FOREIGN KEY (activity_type_id) REFERENCES activity_types(id) ON DELETE RESTRICT,
    CONSTRAINT fk_factors_source FOREIGN KEY (source_id) REFERENCES emission_factor_sources(id) ON DELETE RESTRICT,
    CONSTRAINT chk_positive_factor_value CHECK (factor_value >= 0),
    CONSTRAINT chk_factor_validity_window CHECK (valid_to IS NULL OR valid_to >= valid_from),
    CONSTRAINT uq_factor_versioning UNIQUE (activity_type_id, geography, version_tag)
);

-- ------------------------------------------------------------------------------
-- 4. ACTIVITIES & EMISSION RECORDS (CORE RELATIONS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,                     -- Populated for individual workspace activities
    organization_id UUID,             -- Populated for organization workspace activities
    department_id UUID,               -- Optional organizational department
    activity_type_id UUID NOT NULL,
    created_by UUID NOT NULL,         -- The authenticated user who recorded this entry
    quantity NUMERIC(14, 4) NOT NULL,
    unit VARCHAR(30) NOT NULL,
    activity_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_activities_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_activities_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_activities_dept FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    CONSTRAINT fk_activities_type FOREIGN KEY (activity_type_id) REFERENCES activity_types(id) ON DELETE RESTRICT,
    CONSTRAINT fk_activities_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT chk_positive_quantity CHECK (quantity > 0),
    -- Strict workspace scoping check: either personal (user_id IS NOT NULL, org & dept NULL)
    -- OR organizational (organization_id IS NOT NULL)
    CONSTRAINT chk_activity_workspace_scope CHECK (
        (user_id IS NOT NULL AND organization_id IS NULL AND department_id IS NULL)
        OR
        (organization_id IS NOT NULL)
    )
);

CREATE TABLE IF NOT EXISTS emission_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL,
    emission_factor_id UUID NOT NULL,
    emission_factor_snapshot NUMERIC(14, 6) NOT NULL, -- Factor value frozen at calculation time
    factor_source_snapshot VARCHAR(200) NOT NULL,     -- Human-readable source citation frozen
    calculated_co2e_kg NUMERIC(16, 4) NOT NULL,       -- quantity * factor snapshot
    calculation_method VARCHAR(50) NOT NULL DEFAULT 'factor_multiplication',
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_emission_records_activity UNIQUE (activity_id),
    CONSTRAINT fk_emission_records_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    CONSTRAINT fk_emission_records_factor FOREIGN KEY (emission_factor_id) REFERENCES emission_factors(id) ON DELETE RESTRICT,
    CONSTRAINT chk_positive_co2e CHECK (calculated_co2e_kg >= 0)
);

-- ------------------------------------------------------------------------------
-- 5. GOALS & REDUCTION TARGETS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    organization_id UUID,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category_id UUID,
    target_reduction_pct NUMERIC(6, 2),       -- e.g. 15.5%
    baseline_co2e_kg NUMERIC(16, 4) NOT NULL,
    target_co2e_kg NUMERIC(16, 4) NOT NULL,
    start_date DATE NOT NULL,
    target_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'active', -- 'active', 'achieved', 'missed', 'cancelled'
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_goals_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_goals_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_goals_category FOREIGN KEY (category_id) REFERENCES activity_categories(id) ON DELETE SET NULL,
    CONSTRAINT chk_goals_workspace CHECK (
        (user_id IS NOT NULL AND organization_id IS NULL)
        OR
        (organization_id IS NOT NULL)
    ),
    CONSTRAINT chk_goal_dates CHECK (target_date >= start_date),
    CONSTRAINT chk_goal_status CHECK (status IN ('active', 'achieved', 'missed', 'cancelled'))
);

-- ------------------------------------------------------------------------------
-- 6. RECOMMENDATIONS & INSIGHTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    organization_id UUID,
    category_code VARCHAR(50) NOT NULL,
    title VARCHAR(250) NOT NULL,
    explanation TEXT NOT NULL,
    action_text TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high'
    potential_reduction_co2e_kg NUMERIC(14, 4),
    source_type VARCHAR(30) NOT NULL DEFAULT 'rule_based', -- 'ai_gemini', 'rule_based'
    status VARCHAR(30) NOT NULL DEFAULT 'active', -- 'active', 'completed', 'dismissed'
    supporting_metric VARCHAR(150),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rec_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_rec_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT chk_rec_priority CHECK (priority IN ('low', 'medium', 'high')),
    CONSTRAINT chk_rec_status CHECK (status IN ('active', 'completed', 'dismissed'))
);

-- ------------------------------------------------------------------------------
-- 7. AUDIT TRAIL LOGGING TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID,
    action VARCHAR(50) NOT NULL,        -- 'INSERT', 'UPDATE', 'DELETE'
    entity_type VARCHAR(80) NOT NULL,   -- 'activities', 'emission_factors', 'users', etc.
    entity_id UUID NOT NULL,
    old_state JSONB,
    new_state JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_actor FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------------------------
-- 8. PERFORMANCE INDEXES
-- ------------------------------------------------------------------------------
-- Fast lookups for personal and organizational activity histories sorted by date
CREATE INDEX IF NOT EXISTS idx_activities_user_date ON activities (user_id, activity_date DESC) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activities_org_date ON activities (organization_id, activity_date DESC) WHERE organization_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activities_dept_date ON activities (department_id, activity_date DESC) WHERE department_id IS NOT NULL;

-- Fast joins between activities and calculated emission records
CREATE INDEX IF NOT EXISTS idx_emission_records_activity ON emission_records (activity_id);
CREATE INDEX IF NOT EXISTS idx_emission_records_factor ON emission_records (emission_factor_id);

-- Emission factor lookup by activity type, validity date, and geography
CREATE INDEX IF NOT EXISTS idx_factors_lookup ON emission_factors (activity_type_id, geography, valid_from, valid_to);

-- Membership and organization lookups
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members (user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members (organization_id);

-- Audit query optimization
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs (entity_type, entity_id, created_at DESC);
