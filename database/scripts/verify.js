/**
 * CarbonIQ Automated Database Verification Suite
 * Executes assertions against carboniq_db for ADBMS criteria.
 */
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

async function runVerification() {
  console.log(`==============================================================================`);
  console.log(`[CarbonIQ ADBMS Verification] Checking Database: ${config.database}`);
  console.log(`==============================================================================`);

  const client = new Client(config);
  await client.connect();

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    process.stdout.write(`[TEST ${total}] ${name} ... `);
    try {
      await fn();
      console.log(`PASSED \u2714`);
      passed++;
    } catch (err) {
      console.log(`FAILED \u2718`);
      console.error(`       Error: ${err.message}`);
    }
  }

  // 1. Check Tables Exist
  await test('Table Existence Verification', async () => {
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    `);
    const tables = res.rows.map((r) => r.table_name);
    const required = [
      'users', 'organizations', 'organization_members', 'departments',
      'activity_categories', 'activity_types', 'emission_factor_sources',
      'emission_factors', 'activities', 'emission_records', 'goals',
      'recommendations', 'audit_logs'
    ];
    for (const t of required) {
      if (!tables.includes(t)) throw new Error(`Missing expected table: ${t}`);
    }
  });

  // 2. Check Seed Data Populations
  await test('Emission Taxonomies & Factors Population', async () => {
    const cats = await client.query(`SELECT COUNT(*) FROM activity_categories;`);
    const types = await client.query(`SELECT COUNT(*) FROM activity_types;`);
    const factors = await client.query(`SELECT COUNT(*) FROM emission_factors;`);
    if (parseInt(cats.rows[0].count, 10) < 5) throw new Error('Expected at least 5 activity categories');
    if (parseInt(types.rows[0].count, 10) < 10) throw new Error('Expected at least 10 activity types');
    if (parseInt(factors.rows[0].count, 10) < 10) throw new Error('Expected at least 10 verified emission factors');
  });

  // 3. Referential Integrity Check
  await test('Referential Integrity (Rejection of Non-existent FK)', async () => {
    try {
      await client.query(`
        INSERT INTO activities (
          user_id, activity_type_id, created_by, quantity, unit, activity_date
        ) VALUES (
          'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          '99999999-9999-9999-9999-999999999999',
          'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          50, 'kWh', CURRENT_DATE
        );
      `);
      throw new Error('Foreign key violation was NOT rejected by database!');
    } catch (err) {
      if (err.code !== '23503') throw err; // 23503 = foreign_key_violation
    }
  });

  // 4. Check Constraint Verification (Negative Quantity)
  await test('Check Constraint (Rejection of Negative Quantity)', async () => {
    try {
      await client.query(`
        INSERT INTO activities (
          user_id, activity_type_id, created_by, quantity, unit, activity_date
        ) VALUES (
          'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          '33333333-3333-3333-3333-333333333301',
          'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          -100, 'kWh', CURRENT_DATE
        );
      `);
      throw new Error('Negative quantity was NOT rejected by database!');
    } catch (err) {
      if (err.code !== '23514') throw err; // 23514 = check_violation
    }
  });

  // 5. Stored Procedure Execution
  await test('Stored Procedure Deterministic Execution', async () => {
    const res = await client.query(`
      SELECT * FROM sp_record_activity_with_emissions(
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID,
        NULL,
        NULL,
        '33333333-3333-3333-3333-333333333301'::UUID,
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID,
        100.0,
        'kWh',
        CURRENT_DATE,
        'Automated node test run'
      );
    `);
    const row = res.rows[0];
    if (parseFloat(row.out_calculated_co2e_kg) !== 71.6) {
      throw new Error(`Expected 71.6 kg CO2e, received: ${row.out_calculated_co2e_kg}`);
    }
    // Clean up test row
    await client.query(`DELETE FROM activities WHERE id = $1`, [row.out_activity_id]);
  });

  // 6. Trigger Verification (Audit Trail)
  await test('Active Trigger (Automatic Audit Log Capture)', async () => {
    const res = await client.query(`
      SELECT COUNT(*) FROM audit_logs WHERE entity_type = 'activities';
    `);
    if (parseInt(res.rows[0].count, 10) === 0) {
      throw new Error('No audit log entries found for activities');
    }
  });

  // 7. Analytical Views
  await test('Analytical Views Integrity', async () => {
    const v1 = await client.query(`SELECT COUNT(*) FROM v_monthly_emissions;`);
    const v2 = await client.query(`SELECT COUNT(*) FROM v_category_emissions;`);
    const v3 = await client.query(`SELECT COUNT(*) FROM v_department_emissions;`);
    if (v1.rows.length === 0 || v2.rows.length === 0 || v3.rows.length === 0) {
      throw new Error('Analytical views returned no rows');
    }
  });

  console.log(`==============================================================================`);
  console.log(`[Verification Summary] Passed: ${passed} / ${total} Tests`);
  console.log(`==============================================================================`);

  await client.end();
  if (passed !== total) process.exit(1);
}

runVerification().catch((err) => {
  console.error(`[Fatal Verification Error]:`, err.message);
  process.exit(1);
});

