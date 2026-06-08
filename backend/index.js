const express = require('express');
const { Pool } = require('pg');
const { PrismaClient } = require('@prisma/client'); // New
const { PrismaPg } = require('@prisma/adapter-pg'); // New
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

const poolConfig = {
  host: process.env.DB_HOST || 'aws-0-us-west-2.pooler.supabase.com',
  port: parseInt(process.env.DB_PORT || '6543', 10),
  user: 'postgres.cwlrardjyfxneexevlmm',
  password: process.env.DB_PASSWORD || 'DevSecOps21',
  database: process.env.DB_NAME || 'postgres',
  ssl: { rejectUnauthorized: false }
};

const pool = new Pool(poolConfig);
const adapter = new PrismaPg(pool); // Create the adapter
const prisma = new PrismaClient({ adapter }); // Pass adapter here

// ==========================================
// 3. SERVER STARTUP
// ==========================================

pool.connect()
  .then(() => {
    console.log('Connected to Database and Prisma initialized');
    
    app.get('/health', (req, res) => res.json({ status: 'ok' }));
    
    // Example Prisma usage
    app.get('/api/tasks', async (req, res) => {
        const tasks = await prisma.task.findMany();
        res.json(tasks);
    });
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log('Server running on port ' + PORT));
  })
  .catch(err => {
    console.error('Database connection error', err);
    process.exit(1);
  });
