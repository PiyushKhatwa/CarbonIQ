/**
 * CarbonIQ Database Migration Runner
 * Connects to PostgreSQL, checks/creates database, and applies migrations in order.
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Attempt loading .env or fallback
try {
  require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
} catch (e) {
  // dotenv optional if passed via env
}

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'carboniq_db',
};

async function ensureDatabaseExists() {
  const rootClient = new Client({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: 'postgres',
  });

  try {
    await rootClient.connect();
    const res = await rootClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1;`,
      [config.database]
    );

    if (res.rowCount === 0) {
      console.log(`[CarbonIQ DB] Database '${config.database}' does not exist. Creating...`);
      await rootClient.query(`CREATE DATABASE "${config.database}";`);
      console.log(`[CarbonIQ DB] Database '${config.database}' created successfully.`);
    } else {
      console.log(`[CarbonIQ DB] Database '${config.database}' already exists.`);
    }
  } catch (err) {
    console.error(`[CarbonIQ DB Error] Failed to verify/create database:`, err.message);
    throw err;
  } finally {
    await rootClient.end();
  }
}

async function runMigrations() {
  console.log(`==============================================================================`);
  console.log(`[CarbonIQ DB] Starting Migration Execution on ${config.host}:${config.port}/${config.database}`);
  console.log(`==============================================================================`);

  await ensureDatabaseExists();

  const client = new Client(config);
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

