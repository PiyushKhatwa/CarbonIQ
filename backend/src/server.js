const app = require('./app');
const env = require('./config/env');
const db = require('./config/db');

async function startServer() {
  try {
    // 1. Verify PostgreSQL database connection
    const dbInfo = await db.checkConnection();
    console.log(`[PostgreSQL Connected] Database: ${dbInfo.current_database}`);

    // 2. Start HTTP listener on 0.0.0.0
    const server = app.listen(env.port, '0.0.0.0', () => {
      console.log(`==============================================================================`);
      console.log(`CarbonIQ Backend API listening on 0.0.0.0:${env.port}`);
      console.log(`Environment: ${env.env}`);
      console.log(`API Base URL: /api/v1`);
      console.log(`==============================================================================`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log('\n[Shutdown] Closing HTTP server and PostgreSQL pool...');
      server.close(async () => {
        await db.pool.end();
        console.log('[Shutdown] Completed cleanly.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('[Fatal Startup Error]:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };

