require('dotenv/config');

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const { pool } = require('./lib/prisma');
const { requestId } = require('./middleware/requestId');
const authRoutes = require('./routes/authRoutes');
const tasksRoutes = require('./routes/tasksRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { logger } = require('./utils/logger');

const app = express();
const API_PREFIX = '/api/v1';

app.use(requestId);
app.use(helmet());

const allowedFrontendURL = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: allowedFrontendURL, credentials: true }));

app.use(express.json());
app.use(cookieParser());

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 10_000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', requestId: req.requestId });
});

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/tasks`, tasksRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await pool.connect();
    logger.info('Connected to database and Prisma initialized');

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`, { apiPrefix: API_PREFIX });
    });
  } catch (err) {
    logger.error('Database connection error', { error: err.message });
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
