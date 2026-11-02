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
    origin: env.corsOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (env.env !== 'test') {
  app.use(morgan('dev'));
}

// System Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'CarbonIQ Backend API',
    timestamp: new Date().toISOString(),
  });
});

// Mount API v1 Routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/workspaces', workspacesRoutes);
app.use('/api/v1/organizations', organizationsRoutes);
app.use('/api/v1/taxonomy', taxonomyRoutes);
app.use('/api/v1/activities', activitiesRoutes);
app.use('/api/v1/emissions', emissionsRoutes);
app.use('/api/v1/goals', goalsRoutes);
app.use('/api/v1/recommendations', recommendationsRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

