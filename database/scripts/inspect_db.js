const path = require('path');
const { Client } = require('pg');

try {
  require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
} catch (e) {}

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'carboniq_db',
});

async function inspect() {
  await client.connect();

  const tables = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE' 
    ORDER BY table_name;
  `);

  const views = await client.query(`
    SELECT table_name 
    FROM information_schema.views 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);

  const routines = await client.query(`
    SELECT routine_name, routine_type 
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    ORDER BY routine_name;
  `);

  const triggers = await client.query(`
    SELECT trigger_name, event_object_table 
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public' 
    ORDER BY trigger_name;
  `);

  const indexes = await client.query(`
    SELECT tablename, indexname 
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    ORDER BY tablename, indexname;
  `);

  console.log(`==============================================================================`);
  console.log(`CARBONIQ DATABASE OBJECT REPORT (Database: ${process.env.DB_NAME || 'carboniq_db'})`);
  console.log(`==============================================================================`);
  console.log(`Total Tables: ${tables.rowCount}`);
  tables.rows.forEach((r, i) => console.log(`  ${i + 1}. ${r.table_name}`));

  console.log(`\nTotal Views: ${views.rowCount}`);
  views.rows.forEach((r, i) => console.log(`  ${i + 1}. ${r.table_name}`));

  console.log(`\nTotal Routines (Functions/Procedures): ${routines.rowCount}`);
  routines.rows.forEach((r, i) => console.log(`  ${i + 1}. ${r.routine_name} (${r.routine_type})`));

  console.log(`\nTotal Triggers: ${triggers.rowCount}`);
  triggers.rows.forEach((r, i) => console.log(`  ${i + 1}. ${r.trigger_name} on table '${r.event_object_table}'`));

  console.log(`\nTotal Indexes: ${indexes.rowCount}`);
  indexes.rows.forEach((r, i) => console.log(`  ${i + 1}. ${r.indexname} on table '${r.tablename}'`));
  console.log(`==============================================================================`);

  await client.end();
}

inspect().catch(err => {
  console.error('Inspection Error:', err.message);
  process.exit(1);
});
