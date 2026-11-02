-- ==============================================================================
-- CarbonIQ Database Migration: 004_stored_procedures.sql
-- Description: Stored procedures and functions for atomic calculation and analytics
-- ADBMS Objective: Demonstrates procedural SQL (PL/pgSQL), business logic in engine, transactions
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. STORED PROCEDURE: RECORD ACTIVITY WITH EMISSIONS (ATOMIC WORKFLOW)
-- Performs factor resolution, arithmetic calculation, and dual-table insertion
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION sp_record_activity_with_emissions(
    p_user_id UUID,
    p_organization_id UUID,
    p_department_id UUID,
    p_activity_type_id UUID,
    p_created_by UUID,
    p_quantity NUMERIC(14, 4),
    p_unit VARCHAR(30),
    p_activity_date DATE,
    p_notes TEXT,
    p_geography VARCHAR(100) DEFAULT 'India'
)
RETURNS TABLE (
    out_activity_id UUID,
    out_emission_record_id UUID,
    out_calculated_co2e_kg NUMERIC(16, 4),
    out_factor_snapshot NUMERIC(14, 6),
    out_source_name VARCHAR(200)
) AS $$
DECLARE
    v_factor_id UUID;
    v_factor_value NUMERIC(14, 6);
    v_factor_unit VARCHAR(30);
    v_source_name VARCHAR(200);
    v_calculated_co2e NUMERIC(16, 4);
    v_activity_id UUID;
    v_emission_id UUID;
BEGIN
    -- 1. Input validations
    IF p_quantity <= 0 THEN
        RAISE EXCEPTION 'Activity quantity must be strictly greater than zero. Received: %', p_quantity
            USING ERRCODE = 'check_violation';
    END IF;

    -- 2. Lookup matching emission factor based on type, geography, and date validity
    SELECT 
        ef.id, 
        ef.factor_value, 
        ef.unit, 
        efs.short_name
    INTO 
        v_factor_id, 
        v_factor_value, 
        v_factor_unit, 
        v_source_name
    FROM emission_factors ef
    JOIN emission_factor_sources efs ON ef.source_id = efs.id
    WHERE ef.activity_type_id = p_activity_type_id
      AND ef.geography = p_geography
      AND ef.valid_from <= p_activity_date
      AND (ef.valid_to IS NULL OR ef.valid_to >= p_activity_date)
      AND ef.is_verified = TRUE
    ORDER BY ef.valid_from DESC
    LIMIT 1;

    -- If no specific geography found, fallback to 'Global' or first valid factor
    IF v_factor_id IS NULL THEN
        SELECT 
            ef.id, 
            ef.factor_value, 
            ef.unit, 
            efs.short_name
        INTO 
            v_factor_id, 
            v_factor_value, 
            v_factor_unit, 
            v_source_name
        FROM emission_factors ef
        JOIN emission_factor_sources efs ON ef.source_id = efs.id
        WHERE ef.activity_type_id = p_activity_type_id
          AND ef.valid_from <= p_activity_date
          AND (ef.valid_to IS NULL OR ef.valid_to >= p_activity_date)
        ORDER BY ef.valid_from DESC
        LIMIT 1;
    END IF;

    -- If still no factor found, raise explanatory exception
    IF v_factor_id IS NULL THEN
        RAISE EXCEPTION 'No active emission factor found for activity type % on date %', 
            p_activity_type_id, p_activity_date
            USING ERRCODE = 'no_data_found';
    END IF;

    -- 3. Calculate deterministic emissions (quantity * factor)
    v_calculated_co2e := ROUND(p_quantity * v_factor_value, 4);

    -- 4. Insert into activities table
    INSERT INTO activities (
        user_id,
        organization_id,
        department_id,
        activity_type_id,
        created_by,
        quantity,
        unit,
        activity_date,
        notes
    ) VALUES (
        p_user_id,
        p_organization_id,
        p_department_id,
        p_activity_type_id,
        p_created_by,
        p_quantity,
        p_unit,
        p_activity_date,
        p_notes
    ) RETURNING id INTO v_activity_id;

    -- 5. Insert into emission_records table with immutable factor snapshot
    INSERT INTO emission_records (
        activity_id,
        emission_factor_id,
        emission_factor_snapshot,
        factor_source_snapshot,
        calculated_co2e_kg,
        calculation_method
    ) VALUES (
        v_activity_id,
        v_factor_id,
        v_factor_value,
        v_source_name,
        v_calculated_co2e,
        'stored_procedure_deterministic'
    ) RETURNING id INTO v_emission_id;

    -- 6. Return populated output table row
    RETURN QUERY SELECT 
        v_activity_id, 
        v_emission_id, 
        v_calculated_co2e, 
        v_factor_value, 
        v_source_name;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 2. TABLE-VALUED FUNCTION: WORKSPACE EMISSIONS SUMMARY COMPARISON
-- Computes current period vs prior period KPI aggregates in a single database call
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_get_workspace_summary(
    p_user_id UUID,
    p_organization_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    current_total_co2e NUMERIC(16, 4),
    current_activity_count BIGINT,
    previous_total_co2e NUMERIC(16, 4),
    previous_activity_count BIGINT,
    percentage_change NUMERIC(8, 2)
) AS $$
DECLARE
    v_period_days INT := (p_end_date - p_start_date) + 1;
    v_prev_start DATE := p_start_date - v_period_days;
    v_prev_end DATE := p_start_date - 1;
    v_curr_co2e NUMERIC(16, 4) := 0;
    v_curr_count BIGINT := 0;
    v_prev_co2e NUMERIC(16, 4) := 0;
    v_prev_count BIGINT := 0;
    v_change NUMERIC(8, 2) := 0.00;
BEGIN
    -- Current period aggregates
    SELECT 
        COALESCE(SUM(er.calculated_co2e_kg), 0),
        COUNT(a.id)
    INTO 
        v_curr_co2e, 
        v_curr_count
    FROM activities a
    JOIN emission_records er ON a.id = er.activity_id
    WHERE ((p_user_id IS NOT NULL AND a.user_id = p_user_id)
       OR (p_organization_id IS NOT NULL AND a.organization_id = p_organization_id))
      AND a.activity_date BETWEEN p_start_date AND p_end_date;

    -- Previous comparable period aggregates
    SELECT 
        COALESCE(SUM(er.calculated_co2e_kg), 0),
        COUNT(a.id)
    INTO 
        v_prev_co2e, 
        v_prev_count
    FROM activities a
    JOIN emission_records er ON a.id = er.activity_id
    WHERE ((p_user_id IS NOT NULL AND a.user_id = p_user_id)
       OR (p_organization_id IS NOT NULL AND a.organization_id = p_organization_id))
      AND a.activity_date BETWEEN v_prev_start AND v_prev_end;

    -- Calculate percentage change
    IF v_prev_co2e > 0 THEN
        v_change := ROUND(((v_curr_co2e - v_prev_co2e) / v_prev_co2e) * 100, 2);
    ELSE
        v_change := 0.00;
    END IF;

    RETURN QUERY SELECT 
        v_curr_co2e, 
        v_curr_count, 
        v_prev_co2e, 
        v_prev_count, 
        v_change;
END;
$$ LANGUAGE plpgsql;

