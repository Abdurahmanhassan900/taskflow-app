require('dotenv/config');

const express = require('express');
const { Pool } = require('pg');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

// ==========================================
// 1. SECURITY LAYER CONFIGURATION
// ==========================================
app.use(helmet());
app.use(express.json());

const allowedFrontendURL = process.env.ALLOWED_ORIGIN || 'https://taskflow-app-blush.vercel.app';
app.use(cors({ origin: allowedFrontendURL, credentials: true }));

const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });

app.use(globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ==========================================
// 2. DATABASE & INFRASTRUCTURE
// ==========================================

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ==========================================
// 3. SERVER STARTUP
// ==========================================

pool.connect()
  .then(() => {
    console.log('Connected to Database and Prisma initialized');

    app.get('/health', (req, res) => res.json({ status: 'ok' }));

    // Example Prisma usage
    app.get('/api/tasks', async (req, res) => {
      const tasks = await prisma.task.findMany({
        where: { deletedAt: null },
      });
      res.json(tasks);
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log('Server running on port ' + PORT));
  })
  .catch(err => {
    console.error('Database connection error', err);
    process.exit(1);
  });
