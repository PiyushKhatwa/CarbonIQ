const { Pool } = require('pg');
const env = require('./env');

const pool = new Pool(env.db);

pool.on('error', (err) => {
  console.error('[PostgreSQL Pool Error]: Unexpected idle client error', err.message);
});

/**
 * Execute a single query against the database
 */
async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (env.env === 'development' && duration > 100) {
    console.log('[Slow Query Warning]', { text: text.trim().substring(0, 100), duration, rows: res.rowCount });
  }
  return res;
}

/**
 * Helper to execute multi-step database operations in an ACID transaction
 * @param {Function} callback async function(client)
 */
async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Verify connectivity to PostgreSQL
 */
async function checkConnection() {
  const res = await query('SELECT current_database(), version();');
  return res.rows[0];
}

module.exports = {
  pool,
  query,
  withTransaction,
  checkConnection,
};
