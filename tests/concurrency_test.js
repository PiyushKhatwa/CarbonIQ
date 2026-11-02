/**
 * CarbonIQ Concurrency & ACID Multi-Client Stress Test
 * Simulates multiple concurrent user requests committing transactions simultaneously.
 */
const path = require('path');
const { Pool } = require('pg');

try {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
} catch (e) {}

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'carboniq_db',
  max: 10,
});

async function runConcurrencyTest() {
  console.log('==============================================================================');
  console.log('STARTING CARBONIQ CONCURRENCY & MULTI-CLIENT TRANSACTION TEST');
  console.log('==============================================================================');

  const CONCURRENT_CLIENTS = 10;
  console.log(`Dispatching ${CONCURRENT_CLIENTS} simultaneous atomic activity recording transactions...`);

  const createdIds = [];
  const start = Date.now();

  const tasks = Array.from({ length: CONCURRENT_CLIENTS }).map(async (_, idx) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const actRes = await client.query(`
        INSERT INTO activities (
          user_id, activity_type_id, created_by, quantity, unit, activity_date, notes
        ) VALUES (
          'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          '33333333-3333-3333-3333-333333333301',
          'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          $1, 'kWh', CURRENT_DATE, $2
        ) RETURNING id;
      `, [10 + idx, `Concurrent transaction #${idx + 1}`]);

      const actId = actRes.rows[0].id;
      createdIds.push(actId);

      await client.query(`
        INSERT INTO emission_records (
          activity_id, emission_factor_id, calculated_co2e_kg, emission_factor_snapshot, factor_source_snapshot
        ) VALUES (
          $1,
          '44444444-4444-4444-4444-444444444401',
          $2,
          0.7160,
          'CEA India Baseline 2023'
        );
      `, [actId, (10 + idx) * 0.716]);

      await client.query('COMMIT');
      return { success: true, id: actId, idx: idx + 1 };
    } catch (err) {
      await client.query('ROLLBACK');
      return { success: false, error: err.message, idx: idx + 1 };
    } finally {
      client.release();
    }
  });

  const results = await Promise.all(tasks);
  const duration = Date.now() - start;

  const succeeded = results.filter(r => r.success).length;
  console.log(`Finished ${CONCURRENT_CLIENTS} transactions in ${duration}ms: ${succeeded}/${CONCURRENT_CLIENTS} succeeded.`);

  if (succeeded === CONCURRENT_CLIENTS) {
    console.log('--> [PASSED] High-concurrency atomic commits completed with zero deadlocks or lost updates.');
  } else {
    throw new Error(`Concurrency test had failures: ${JSON.stringify(results.filter(r => !r.success))}`);
  }

  // Cleanup created records
  console.log(`Cleaning up ${createdIds.length} benchmark test activities...`);
  await pool.query('DELETE FROM activities WHERE id = ANY($1::uuid[])', [createdIds]);
  console.log('Cleaned up benchmark records.');

  console.log('==============================================================================');
  console.log('CONCURRENCY SUITE PASSED (10/10 CONCURRENT TRANSACTIONS COMMITTED)');
  console.log('==============================================================================\n');

  await pool.end();
}

runConcurrencyTest().catch(err => {
  console.error('Concurrency test failed:', err);
  process.exit(1);
});
