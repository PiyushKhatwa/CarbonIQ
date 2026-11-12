const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');

const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

// Routes
const authRoutes = require('./modules/auth/auth.routes');
const workspacesRoutes = require('./modules/workspaces/workspaces.routes');
const organizationsRoutes = require('./modules/organizations/organizations.routes');
const taxonomyRoutes = require('./modules/taxonomy/taxonomy.routes');
const activitiesRoutes = require('./modules/activities/activities.routes');
const emissionsRoutes = require('./modules/emissions/emissions.routes');
const goalsRoutes = require('./modules/goals/goals.routes');
const recommendationsRoutes = require('./modules/recommendations/recommendations.routes');

const app = express();

// Security & Parsing Middleware
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. server-to-server, curl, health checks)
      if (!origin) return callback(null, true);
      if (env.corsOrigin === '*') return callback(null, true);
      const allowed = env.corsOrigin.split(',').map((o) => o.trim());
      if (allowed.includes(origin) || allowed.includes('*')) {
        return callback(null, true);
      }
      // Dynamically allow Vercel production and preview deployments
      if (/^https:\/\/.*\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }
      // Fallback: allow to avoid breaking free preview environments
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (env.env !== 'test') {
  app.use(morgan('dev'));
}

// System Health Check & Root Info
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'CarbonIQ Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'CarbonIQ Backend REST API',
    endpoints: '/api/v1',
    health: '/health',
  });
});

// Mount API v1 Routers (Canonical)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/workspaces', workspacesRoutes);
app.use('/api/v1/organizations', organizationsRoutes);
app.use('/api/v1/taxonomy', taxonomyRoutes);
app.use('/api/v1/activities', activitiesRoutes);
app.use('/api/v1/emissions', emissionsRoutes);
app.use('/api/v1/goals', goalsRoutes);
app.use('/api/v1/recommendations', recommendationsRoutes);

// Mount API Routers alias (for clients calling /api/...)
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspacesRoutes);
app.use('/api/organizations', organizationsRoutes);
app.use('/api/taxonomy', taxonomyRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/emissions', emissionsRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/recommendations', recommendationsRoutes);

// Direct root route alias for authentication
app.use('/auth', authRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

