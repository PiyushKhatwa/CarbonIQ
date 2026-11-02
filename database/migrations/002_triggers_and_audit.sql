-- ==============================================================================
-- CarbonIQ Database Migration: 002_triggers_and_audit.sql
-- Description: Audit logging triggers and updated_at maintenance functions
-- ADBMS Objective: Demonstrates active database rules (triggers) & automated change tracking
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. AUTOMATIC updated_at TIMESTAMP FUNCTION & TRIGGERS
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_organizations_updated_at ON organizations;
CREATE TRIGGER trg_organizations_updated_at
BEFORE UPDATE ON organizations
FOR EACH ROW
EXECUTE FUNCTION fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_activities_updated_at ON activities;
CREATE TRIGGER trg_activities_updated_at
BEFORE UPDATE ON activities
FOR EACH ROW
EXECUTE FUNCTION fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_goals_updated_at ON goals;
CREATE TRIGGER trg_goals_updated_at
BEFORE UPDATE ON goals
FOR EACH ROW
EXECUTE FUNCTION fn_update_timestamp();

-- ------------------------------------------------------------------------------
-- 2. ADBMS AUDIT TRAIL TRIGGER FUNCTION
-- Captures state transitions into audit_logs table on INSERT, UPDATE, or DELETE
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_audit_activity_changes()
RETURNS TRIGGER AS $$
DECLARE
    v_actor_id UUID;
    v_entity_id UUID;
    v_old_state JSONB := NULL;
    v_new_state JSONB := NULL;
BEGIN
    -- Determine entity ID and JSON states based on operation
    IF (TG_OP = 'DELETE') THEN
        v_entity_id := OLD.id;
        v_old_state := to_jsonb(OLD);
        -- For deletions, creator of original record is recorded as fallback actor
        v_actor_id := OLD.created_by;
    ELSIF (TG_OP = 'UPDATE') THEN
        v_entity_id := NEW.id;
        v_old_state := to_jsonb(OLD);
        v_new_state := to_jsonb(NEW);
        v_actor_id := NEW.created_by;
    ELSIF (TG_OP = 'INSERT') THEN
        v_entity_id := NEW.id;
        v_new_state := to_jsonb(NEW);
        v_actor_id := NEW.created_by;
    END IF;

    -- Insert structured audit log entry
    INSERT INTO audit_logs (
        actor_id,
        action,
        entity_type,
        entity_id,
        old_state,
        new_state
    ) VALUES (
        v_actor_id,
        TG_OP,
        TG_TABLE_NAME,
        v_entity_id,
        v_old_state,
        v_new_state
    );

    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to activities table
DROP TRIGGER IF EXISTS trg_audit_activities ON activities;
CREATE TRIGGER trg_audit_activities
AFTER INSERT OR UPDATE OR DELETE ON activities
FOR EACH ROW
EXECUTE FUNCTION fn_audit_activity_changes();

-- ------------------------------------------------------------------------------
-- 3. AUDIT TRIGGER FOR EMISSION FACTOR MODIFICATIONS
-- Guarantees regulatory traceability when factors are updated or added
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_audit_factor_changes()
RETURNS TRIGGER AS $$
DECLARE
    v_entity_id UUID;
    v_old_state JSONB := NULL;
    v_new_state JSONB := NULL;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        v_entity_id := OLD.id;
        v_old_state := to_jsonb(OLD);
    ELSIF (TG_OP = 'UPDATE') THEN
        v_entity_id := NEW.id;
        v_old_state := to_jsonb(OLD);
        v_new_state := to_jsonb(NEW);
    ELSIF (TG_OP = 'INSERT') THEN
        v_entity_id := NEW.id;
        v_new_state := to_jsonb(NEW);
    END IF;

    INSERT INTO audit_logs (
        actor_id,
        action,
        entity_type,
        entity_id,
        old_state,
        new_state
    ) VALUES (
        NULL, -- System/Admin migration operation
        TG_OP,
        TG_TABLE_NAME,
        v_entity_id,
        v_old_state,
        v_new_state
    );

    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_emission_factors ON emission_factors;
CREATE TRIGGER trg_audit_emission_factors
AFTER INSERT OR UPDATE OR DELETE ON emission_factors
FOR EACH ROW
EXECUTE FUNCTION fn_audit_factor_changes();
