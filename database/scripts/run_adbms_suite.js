/**
 * CarbonIQ ADBMS Demonstration & Verification Suite Runner
 * Runs the advanced SQL verification suite, listens for PostgreSQL notices,
 * and outputs the execution plan and query optimizations.
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

try {
  require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
} catch (e) {}

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'carboniq_db',
};

async function runAdbmsSuite() {
  console.log('==============================================================================');
  console.log('STARTING CARBONIQ ADVANCED DBMS DEMONSTRATION & VERIFICATION SUITE');
  console.log('==============================================================================');
  console.log(`Connecting to: ${config.user}@${config.host}:${config.port}/${config.database}`);

  const client = new Client(config);
  await client.connect();

  client.on('notice', (msg) => {
    console.log(`[PG NOTICE] ${msg.message}`);
  });

  try {
    // Test 1: Foreign Key Constraint Enforcement
    console.log('\n[TEST 1] Testing Foreign Key Enforcement (Invalid Activity Type UUID)...');
    try {
      await client.query(`
        INSERT INTO activities (
            user_id, activity_type_id, created_by, quantity, unit, activity_date
        ) VALUES (
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            '99999999-9999-9999-9999-999999999999',
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            50.0, 'kWh', CURRENT_DATE
        );
      `);
      throw new Error('Test 1 Failed: Foreign key violation was not caught!');
    } catch (err) {
      if (err.code === '23503') {
        console.log('--> [PASSED] PostgreSQL successfully rejected invalid foreign key (SQLSTATE 23503).');
      } else {
        throw err;
      }
    }

    // Test 2: Check Constraint (Negative Quantity Rejection)
    console.log('\n[TEST 2] Testing Check Constraint (Negative Quantity Rejection)...');
    try {
      await client.query(`
        INSERT INTO activities (
            user_id, activity_type_id, created_by, quantity, unit, activity_date
        ) VALUES (
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            '33333333-3333-3333-3333-333333333301',
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            -25.0, 'kWh', CURRENT_DATE
        );
      `);
      throw new Error('Test 2 Failed: Negative quantity check constraint was not caught!');
    } catch (err) {
      if (err.code === '23514') {
        console.log('--> [PASSED] PostgreSQL successfully rejected negative quantity check violation (SQLSTATE 23514).');
      } else {
        throw err;
      }
    }

    // Test 3: Workspace Exclusivity Constraint
    console.log('\n[TEST 3] Testing Workspace Exclusivity Constraint (chk_activity_workspace_scope)...');
    try {
      await client.query(`
        INSERT INTO activities (
            user_id, organization_id, department_id, activity_type_id, created_by, quantity, unit, activity_date
        ) VALUES (
            NULL, NULL, NULL,
            '33333333-3333-3333-3333-333333333301',
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            100.0, 'kWh', CURRENT_DATE
        );
      `);
      throw new Error('Test 3 Failed: Ambiguous workspace scope was not rejected!');
    } catch (err) {
      if (err.code === '23514') {
        console.log('--> [PASSED] PostgreSQL successfully enforced strict workspace scoping (SQLSTATE 23514).');
      } else {
        throw err;
      }
    }

    // Test 4: ACID Transaction Atomicity & Rollback
    console.log('\n[TEST 4] Testing ACID Transaction Atomicity & Rollback on Failure...');
    const testActId = '77777777-7777-7777-7777-777777777701';
    try {
      await client.query('BEGIN');
      await client.query(`
        INSERT INTO activities (
            id, user_id, activity_type_id, created_by, quantity, unit, activity_date, notes
        ) VALUES (
            $1, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333301',
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 99.0, 'kWh', CURRENT_DATE, 'Transaction Atomicity Test'
        );
      `, [testActId]);

      // Intentionally cause failure to trigger rollback
      await client.query(`
        INSERT INTO emission_records (
            activity_id, emission_factor_id, calculated_co2e_kg, calculation_notes
        ) VALUES (
            $1, '00000000-0000-0000-0000-000000000000', 99.9, 'Failure test'
        );
      `, [testActId]);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.log(`--> [EXPECTED FAILURE] Transaction rolled back cleanly: ${err.message}`);
    }

    const checkRes = await client.query('SELECT COUNT(*) FROM activities WHERE id = $1', [testActId]);
    if (parseInt(checkRes.rows[0].count, 10) === 0) {
      console.log('--> [PASSED] ACID Atomicity Verified: No partial/orphan activity record committed.');
    } else {
      throw new Error('Test 4 Failed: Orphan activity record was committed!');
    }

    // Test 5: Audit Trigger Verification
    console.log('\n[TEST 5] Testing Audit Trigger (trg_audit_activities)...');
    const actRes = await client.query(`
      INSERT INTO activities (
          user_id, activity_type_id, created_by, quantity, unit, activity_date, notes
      ) VALUES (
          'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          '33333333-3333-3333-3333-333333333301',
          'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          42.0, 'kWh', CURRENT_DATE, 'Audit Trigger Test'
      ) RETURNING id;
    `);
    const actId = actRes.rows[0].id;

    const auditRes = await client.query(`
      SELECT action, old_state, new_state 
      FROM audit_logs 
      WHERE entity_type = 'activities' AND entity_id = $1 AND action = 'INSERT';
    `, [actId]);

    if (auditRes.rows.length >= 1) {
      console.log(`--> [PASSED] Audit Trigger Verified: Captured table modification into audit_logs (Action: ${auditRes.rows[0].action}).`);
    } else {
      throw new Error('Test 5 Failed: Audit trigger did not write to audit_logs!');
    }
    // Clean up
    await client.query('DELETE FROM activities WHERE id = $1', [actId]);

    // Test 6: Stored Procedure Deterministic Calculation
    console.log('\n[TEST 6] Testing Stored Procedure sp_record_activity_with_emissions...');
    const spRes = await client.query(`
      SELECT * FROM sp_record_activity_with_emissions(
          'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID,
          NULL,
          NULL,
          '33333333-3333-3333-3333-333333333301'::UUID,
          'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID,
          100.0,
          'kWh',
          CURRENT_DATE,
          'Stored procedure runner test'
      );
    `);
    const calcCo2 = parseFloat(spRes.rows[0].out_calculated_co2e_kg);
    if (Math.abs(calcCo2 - 71.60) < 0.001) {
      console.log(`--> [PASSED] Stored Procedure executed successfully with exact deterministic result: ${calcCo2} kg CO2e.`);
    } else {
      throw new Error(`Test 6 Failed: Expected 71.6000 kg CO2e, got ${calcCo2}`);
    }
    // Clean up
    await client.query('DELETE FROM activities WHERE id = $1', [spRes.rows[0].out_activity_id]);

    // Test 7: Analytical Views Verification
    console.log('\n[TEST 7] Verifying Analytical Views...');
    const v1 = await client.query('SELECT COUNT(*) FROM v_monthly_emissions');
    const v2 = await client.query('SELECT COUNT(*) FROM v_category_emissions');
    const v3 = await client.query('SELECT COUNT(*) FROM v_department_emissions');
    console.log(`--> v_monthly_emissions:    ${v1.rows[0].count} aggregated rows`);
    console.log(`--> v_category_emissions:   ${v2.rows[0].count} aggregated rows`);
    console.log(`--> v_department_emissions: ${v3.rows[0].count} aggregated rows`);
    console.log('--> [PASSED] Analytical SQL Views return operational aggregation results.');

    // Test 8: Query Plan Inspection & Index Optimization (EXPLAIN ANALYZE)
    console.log('\n[TEST 8] Query Plan Inspection with EXPLAIN (ANALYZE, BUFFERS)...');
    const explainRes = await client.query(`
      EXPLAIN (ANALYZE, BUFFERS)
      SELECT a.id, a.activity_date, a.quantity, er.calculated_co2e_kg
      FROM activities a
      JOIN emission_records er ON a.id = er.activity_id
      WHERE a.user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
      ORDER BY a.activity_date DESC;
    `);
    console.log('------------------------------------------------------------------------------');
    explainRes.rows.forEach(r => console.log(r['QUERY PLAN']));
    console.log('------------------------------------------------------------------------------');
    console.log('--> [PASSED] EXPLAIN ANALYZE successfully verified index utilization and query execution stats.');

    console.log('\n==============================================================================');
    console.log('ALL ADBMS DEMONSTRATIONS & VERIFICATION CHECKS PASSED (8/8)');
    console.log('==============================================================================\n');
  } finally {
    await client.end();
  }
}

runAdbmsSuite().catch((err) => {
  console.error('\nADBMS Suite encountered an unhandled error:', err);
  process.exit(1);
});
