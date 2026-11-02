/**
 * CarbonIQ Database Seed Runner
 * Applies authoritative taxonomies, verified emission factors, and demo datasets.
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

async function runSeeds() {
  console.log(`==============================================================================`);
  console.log(`[CarbonIQ DB] Seeding Reference & Demo Data on ${config.database}`);
  console.log(`==============================================================================`);

  const client = new Client(config);
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
