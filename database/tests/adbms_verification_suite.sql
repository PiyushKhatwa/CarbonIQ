-- ==============================================================================
-- CarbonIQ ADBMS Demonstration & Verification Suite
-- Description: Interactive and scriptable SQL test cases validating core ADBMS requirements
-- Usage: Run via psql or execute individual blocks in pgAdmin 4 Query Tool
-- ==============================================================================

\echo '------------------------------------------------------------------------------'
\echo 'CARBONIQ ADBMS EVALUATION SUITE'
\echo '------------------------------------------------------------------------------'

-- ------------------------------------------------------------------------------
-- TEST 1: REFERENTIAL INTEGRITY (FOREIGN KEY CONSTRAINT ENFORCEMENT)
-- Attempt to insert an activity referencing a non-existent activity_type UUID
-- EXPECTED RESULT: ERROR 23503 (foreign_key_violation)
-- ------------------------------------------------------------------------------
\echo '--> [TEST 1] Testing Foreign Key Enforcement (Invalid Activity Type UUID)...'
DO $$
BEGIN
    INSERT INTO activities (
        user_id,
        activity_type_id,
        created_by,
        quantity,
        unit,
        activity_date
    ) VALUES (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '99999999-9999-9999-9999-999999999999', -- Non-existent FK
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        50.0,
        'kWh',
        CURRENT_DATE
    );
    RAISE EXCEPTION 'TEST 1 FAILED: Foreign key violation was not caught!';
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE '--> [TEST 1 PASSED] PostgreSQL successfully rejected invalid foreign key (SQLSTATE 23503).';
END $$;

-- ------------------------------------------------------------------------------
-- TEST 2: DOMAIN INTEGRITY & CHECK CONSTRAINTS (NEGATIVE QUANTITY REJECTION)
-- Attempt to insert an activity with quantity = -25.0
-- EXPECTED RESULT: ERROR 23514 (check_violation)
-- ------------------------------------------------------------------------------
\echo '--> [TEST 2] Testing Check Constraint (Negative Quantity Rejection)...'
DO $$
BEGIN
    INSERT INTO activities (
        user_id,
        activity_type_id,
        created_by,
        quantity,
        unit,
        activity_date
    ) VALUES (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '33333333-3333-3333-3333-333333333301',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        -25.0, -- Violates chk_positive_quantity
        'kWh',
        CURRENT_DATE
    );
    RAISE EXCEPTION 'TEST 2 FAILED: Negative quantity check constraint was not caught!';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE '--> [TEST 2 PASSED] PostgreSQL successfully rejected negative quantity check violation.';
END $$;

-- ------------------------------------------------------------------------------
-- TEST 3: WORKSPACE EXCLUSIVITY CHECK CONSTRAINT
-- Attempt to insert an activity with BOTH a user_id AND an organization_id AND a department_id
-- or with BOTH null.
-- EXPECTED RESULT: ERROR 23514 (check_violation)
-- ------------------------------------------------------------------------------
\echo '--> [TEST 3] Testing Workspace Exclusivity Constraint (chk_activity_workspace_scope)...'
DO $$
BEGIN
    INSERT INTO activities (
        user_id,
        organization_id,
        department_id,
        activity_type_id,
        created_by,
        quantity,
        unit,
        activity_date
    ) VALUES (
        NULL,
        NULL, -- Both NULL violates exclusivity rule
        NULL,
        '33333333-3333-3333-3333-333333333301',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        100.0,
        'kWh',
        CURRENT_DATE
    );
    RAISE EXCEPTION 'TEST 3 FAILED: Ambiguous workspace scope was not rejected!';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE '--> [TEST 3 PASSED] PostgreSQL successfully enforced strict workspace scoping.';
END $$;

-- ------------------------------------------------------------------------------
-- TEST 4: ACID TRANSACTION ATOMICITY & ROLLBACK VERIFICATION
-- Simulate a 2-step atomic creation where step 1 succeeds (activity inserted),
-- but step 2 fails (e.g. invalid emission factor UUID).
-- Demonstrate that ROLLBACK leaves NO partial activity row in the database.
-- ------------------------------------------------------------------------------
\echo '--> [TEST 4] Testing ACID Transaction Rollback on Failure...'
DO $$
DECLARE
    v_test_act_id UUID := '77777777-7777-7777-7777-777777777701';
    v_found_count INT;
BEGIN
    BEGIN
        -- Step 1: Insert activity
        INSERT INTO activities (
            id,
            user_id,
            activity_type_id,
            created_by,
            quantity,
            unit,
            activity_date,
            notes
        ) VALUES (
            v_test_act_id,
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            '33333333-3333-3333-3333-333333333301',
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            99.0,
            'kWh',
            CURRENT_DATE,
            'Transaction Atomicity Induced Failure Test'
        );

        -- Step 2: Induce intentional crash / constraint failure
        RAISE EXCEPTION 'Intentional simulated crash between activity insert and emission record insert!'
            USING ERRCODE = 'user_condition_action_error';
            
    EXCEPTION
        WHEN OTHERS THEN
            -- In real transactions, client/driver issues ROLLBACK; in PL/pgSQL block, subtransaction rolls back automatically
            RAISE NOTICE '--> Handled expected error: %', SQLERRM;
    END;

    -- Verify that NO orphan record was left in activities
    SELECT COUNT(*) INTO v_found_count FROM activities WHERE id = v_test_act_id;
    IF v_found_count = 0 THEN
        RAISE NOTICE '--> [TEST 4 PASSED] ACID Transaction Atomicity Verified: No partial activity record remained.';
    ELSE
        RAISE EXCEPTION 'TEST 4 FAILED: Partial activity record was committed!';
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- TEST 5: ACTIVE DATABASE TRIGGER & AUDIT TRAIL VERIFICATION
-- Insert a new activity and verify that trg_audit_activities inserted a matching
-- row into audit_logs containing operation 'INSERT' and valid JSONB state.
-- ------------------------------------------------------------------------------
\echo '--> [TEST 5] Testing Audit Trigger (trg_audit_activities)...'
DO $$
DECLARE
    v_trigger_act_id UUID;
    v_audit_count INT;
BEGIN
    -- 1. Insert a temporary activity
    INSERT INTO activities (
        user_id,
        activity_type_id,
        created_by,
        quantity,
        unit,
        activity_date,
        notes
    ) VALUES (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '33333333-3333-3333-3333-333333333301',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        42.0,
        'kWh',
        CURRENT_DATE,
        'Audit Trigger Verification'
    ) RETURNING id INTO v_trigger_act_id;

    -- 2. Verify audit log entry
    SELECT COUNT(*) INTO v_audit_count 
    FROM audit_logs 
    WHERE entity_type = 'activities' 
      AND entity_id = v_trigger_act_id 
      AND action = 'INSERT';

    IF v_audit_count >= 1 THEN
        RAISE NOTICE '--> [TEST 5 PASSED] Audit Trigger Verified: Captured table modification into audit_logs automatically.';
    ELSE
        RAISE EXCEPTION 'TEST 5 FAILED: Audit trigger did not write to audit_logs!';
    END IF;

    -- Clean up test activity (will trigger DELETE audit record)
    DELETE FROM activities WHERE id = v_trigger_act_id;
END $$;

-- ------------------------------------------------------------------------------
-- TEST 6: STORED PROCEDURE INVOCATION
-- Call sp_record_activity_with_emissions and check deterministic calculation
-- ------------------------------------------------------------------------------
\echo '--> [TEST 6] Testing Stored Procedure sp_record_activity_with_emissions...'
DO $$
DECLARE
    v_result RECORD;
BEGIN
    SELECT * INTO v_result FROM sp_record_activity_with_emissions(
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID,
        NULL,
        NULL,
        '33333333-3333-3333-3333-333333333301'::UUID, -- Grid electricity (0.716 kg/kWh)
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID,
        100.0,
        'kWh',
        CURRENT_DATE,
        'Stored procedure invocation test'
    );

    IF v_result.out_calculated_co2e_kg = 71.6000 THEN
        RAISE NOTICE '--> [TEST 6 PASSED] Stored Procedure executed successfully with exact deterministic result: % kg CO2e.', v_result.out_calculated_co2e_kg;
    ELSE
        RAISE EXCEPTION 'TEST 6 FAILED: Expected 71.6000 kg CO2e, got %', v_result.out_calculated_co2e_kg;
    END IF;

    -- Clean up test record
    DELETE FROM activities WHERE id = v_result.out_activity_id;
END $$;

-- ------------------------------------------------------------------------------
-- TEST 7: ANALYTICAL VIEWS VERIFICATION
-- Check that views return valid aggregated metrics from the demo data
-- ------------------------------------------------------------------------------
\echo '--> [TEST 7] Verifying Analytical Views...'
SELECT 'v_monthly_emissions' AS view_name, COUNT(*) AS row_count FROM v_monthly_emissions;
SELECT 'v_category_emissions' AS view_name, COUNT(*) AS row_count FROM v_category_emissions;
SELECT 'v_department_emissions' AS view_name, COUNT(*) AS row_count FROM v_department_emissions;

-- ------------------------------------------------------------------------------
-- TEST 8: QUERY OPTIMIZATION & EXPLAIN ANALYZE
-- Compare index scan utilization for personal activity feed
-- ------------------------------------------------------------------------------
\echo '--> [TEST 8] Query Plan Inspection with EXPLAIN (ANALYZE, BUFFERS)...'
EXPLAIN (ANALYZE, BUFFERS)
SELECT a.id, a.activity_date, a.quantity, er.calculated_co2e_kg
FROM activities a
JOIN emission_records er ON a.id = er.activity_id
WHERE a.user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
ORDER BY a.activity_date DESC;

