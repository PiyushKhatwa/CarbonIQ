/**
 * CarbonIQ Automated Database Verification Suite
 * Executes assertions against local or cloud Neon PostgreSQL for ADBMS criteria.
 */
const path = require('path');
const dns = require('dns');
const { Resolver } = require('dns').promises;
const { Client } = require('pg');

// Safe DNS fallback for cloud endpoints
const resolver = new Resolver();
resolver.setServers(['8.8.8.8', '1.1.1.1']);
const origLookup = dns.lookup;
dns.lookup = function(hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  resolver.resolve4(hostname)
    .then(addresses => {
      if (options && options.all) {
        callback(null, addresses.map(a => ({ address: a, family: 4 })));
      } else {
        callback(null, addresses[0], 4);
      }
    })
    .catch(() => origLookup(hostname, options, callback));
};

try {
  require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
} catch (e) {}

const isCloud = !!process.env.DATABASE_URL;

const clientConfig = isCloud
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'carboniq_db',
    };

async function runVerification() {
  const targetLabel = isCloud ? 'Cloud Database (DATABASE_URL)' : clientConfig.database;
  console.log(`==============================================================================`);
  console.log(`[CarbonIQ ADBMS Verification] Checking Database: ${targetLabel}`);
  console.log(`==============================================================================`);

  const client = new Client(clientConfig);
  await client.connect();

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    process.stdout.write(`[TEST ${total}] ${name} ... `);
    try {
      await fn();
      passed++;
      console.log(`PASSED`);
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
    }
  }

  // 1. Verify 13 Base Tables
  await test('Verify exactly 13 base relational tables exist (3NF Schema)', async () => {
    const res = await client.query(`
      SELECT count(*)::INT as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    `);
    if (res.rows[0].count !== 13) throw new Error(`Expected 13 tables, found ${res.rows[0].count}`);
  });

  // 2. Verify 4 Views
  await test('Verify exactly 4 analytical reporting views exist', async () => {
    const res = await client.query(`
      SELECT count(*)::INT as count 
      FROM information_schema.views 
      WHERE table_schema = 'public';
    `);
    if (res.rows[0].count !== 4) throw new Error(`Expected 4 views, found ${res.rows[0].count}`);
  });

  // 3. Verify Functions
  await test('Verify custom PL/pgSQL stored function sp_record_activity_with_emissions exists', async () => {
    const res = await client.query(`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_schema = 'public' AND routine_name = 'sp_record_activity_with_emissions';
    `);
    if (res.rows.length === 0) throw new Error('Stored function sp_record_activity_with_emissions not found');
  });

  // 4. Verify Emission Factors Seeded
  await test('Verify authoritative emission factors seeded (>0 rows)', async () => {
    const res = await client.query(`SELECT count(*)::INT as count FROM emission_factors;`);
    if (res.rows[0].count === 0) throw new Error('emission_factors table is empty');
  });

  console.log(`==============================================================================`);
  console.log(`Verification Complete: ${passed}/${total} assertions passed (${Math.round((passed/total)*100)}%)`);
  console.log(`==============================================================================`);

  await client.end();
}

runVerification().catch(err => {
  console.error('[Verification Fatal]:', err.message);
  process.exit(1);
});
