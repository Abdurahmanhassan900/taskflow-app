require('dotenv/config');

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const { pool } = require('./lib/prisma');
const authRoutes = require('./routes/authRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const API_PREFIX = '/api/v1';

// ==========================================
// 1. SECURITY LAYER CONFIGURATION
// ==========================================
app.use(helmet());

const allowedFrontendURL = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: allowedFrontendURL, credentials: true }));

app.use(express.json());
app.use(cookieParser());

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// ==========================================
// 2. ROUTES
// ==========================================
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use(`${API_PREFIX}/auth`, authRoutes);

// Temporary public task listing until auth middleware is added in the next task.
app.get(`${API_PREFIX}/tasks`, async (req, res, next) => {
  try {
    const { prisma } = require('./lib/prisma');
    const tasks = await prisma.task.findMany({
      where: { deletedAt: null },
    });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

app.use(notFound);
app.use(errorHandler);

// ==========================================
// 3. SERVER STARTUP
// ==========================================
const startServer = async () => {
  try {
    await pool.connect();
    console.log('Connected to Database and Prisma initialized');

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (API at ${API_PREFIX})`);
    });
  } catch (err) {
    console.error('Database connection error', err);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
