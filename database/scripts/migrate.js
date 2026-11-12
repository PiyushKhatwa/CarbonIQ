/**
 * CarbonIQ Database Migration Runner
 * Connects to PostgreSQL (local or cloud Neon via DATABASE_URL),
 * verifies schema readiness, and applies migrations in order.
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

async function ensureDatabaseExists() {
  if (isCloud) {
    // Cloud databases (Neon, etc.) are pre-provisioned
    return;
  }
  const rootClient = new Client({
    host: clientConfig.host,
    port: clientConfig.port,
    user: clientConfig.user,
    password: clientConfig.password,
    database: 'postgres',
  });

  try {
    await rootClient.connect();
    const res = await rootClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1;`,
      [clientConfig.database]
    );

    if (res.rowCount === 0) {
      console.log(`[CarbonIQ DB] Database '${clientConfig.database}' does not exist. Creating...`);
      await rootClient.query(`CREATE DATABASE "${clientConfig.database}";`);
      console.log(`[CarbonIQ DB] Database '${clientConfig.database}' created successfully.`);
    } else {
      console.log(`[CarbonIQ DB] Database '${clientConfig.database}' already exists.`);
    }
  } catch (err) {
    console.error(`[CarbonIQ DB Error] Failed to verify/create database:`, err.message);
    throw err;
  } finally {
    await rootClient.end();
  }
}

async function runMigrations() {
  const targetLabel = isCloud ? 'Cloud Database (DATABASE_URL)' : `${clientConfig.host}:${clientConfig.port}/${clientConfig.database}`;
  console.log(`==============================================================================`);
  console.log(`[CarbonIQ DB] Starting Migration Execution on ${targetLabel}`);
  console.log(`==============================================================================`);

  await ensureDatabaseExists();

  const client = new Client(clientConfig);
  await client.connect();

  const migrationsDir = path.resolve(__dirname, '../migrations');
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');

    console.log(`[Migration] Executing: ${file}...`);
    const startTime = Date.now();
    try {
      await client.query(sql);
      const elapsed = Date.now() - startTime;
      console.log(`[Migration] Completed: ${file} (${elapsed}ms)`);
    } catch (err) {
      console.error(`[Migration Error] Failed in ${file}:`, err.message);
      await client.end();
      process.exit(1);
    }
  }

  console.log(`==============================================================================`);
  console.log(`[CarbonIQ DB] All migrations executed successfully!`);
  console.log(`==============================================================================`);
  await client.end();
}

runMigrations().catch((err) => {
  console.error(`[Fatal Migration Error]:`, err);
  process.exit(1);
});
