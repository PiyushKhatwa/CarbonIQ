/**
 * CarbonIQ Database Seed Runner
 * Applies authoritative taxonomies, verified emission factors, and demo datasets
 * to local or cloud Neon PostgreSQL.
 */
const fs = require('fs');
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

async function runSeeds() {
  const targetLabel = isCloud ? 'Cloud Database (DATABASE_URL)' : clientConfig.database;
  console.log(`==============================================================================`);
  console.log(`[CarbonIQ DB] Seeding Reference & Demo Data on ${targetLabel}`);
  console.log(`==============================================================================`);

  const client = new Client(clientConfig);
  await client.connect();

  const seedsDir = path.resolve(__dirname, '../seeds');
  const files = fs.readdirSync(seedsDir).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    const filePath = path.join(seedsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');

    console.log(`[Seeding] Applying: ${file}...`);
    const startTime = Date.now();
    try {
      await client.query(sql);
      const elapsed = Date.now() - startTime;
      console.log(`[Seeding] Completed: ${file} (${elapsed}ms)`);
    } catch (err) {
      console.error(`[Seeding Error] Failed in ${file}:`, err.message);
      await client.end();
      process.exit(1);
    }
  }

  console.log(`==============================================================================`);
  console.log(`[CarbonIQ DB] All seeds applied successfully!`);
  console.log(`==============================================================================`);
  await client.end();
}

runSeeds().catch((err) => {
  console.error(`[Fatal Seed Error]:`, err);
  process.exit(1);
});
