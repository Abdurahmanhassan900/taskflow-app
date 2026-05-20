const express = require('express');
const { Pool } = require('pg');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

// ==========================================
// 1. SECURITY LAYER CONFIGURATION
// ==========================================

// Apply Helmet to protect against XSS, Clickjacking, and common vulnerabilities
app.use(helmet());

// Parse incoming JSON request bodies safely
app.use(express.json());

// Configure CORS for strict origin control using your Render dashboard variable
const allowedFrontendURL = process.env.ALLOWED_ORIGIN || 'https://taskflow-app-blush.vercel.app';

app.use(cors({
  origin: allowedFrontendURL,
  credentials: true
}));

// Global Rate Limiter: Prevent general spam (100 requests per 15 minutes)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
  max: 100, // Limit each IP to 100 requests per window
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true, // Return rate limit info in the RateLimit-* headers
  legacyHeaders: false,  // Disable the X-RateLimit-* headers
});

// Strict Auth Limiter: Prevent brute-force password guessing (5 attempts per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login/register attempts per window
  message: { error: 'Too many login attempts. Brute-force protection activated. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply the rate limiters explicitly to their matching logic boundaries
app.use(globalLimiter); 
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ==========================================
// 2. DATABASE & INFRASTRUCTURE ROUTING
// ==========================================

const hostValue = process.env.DB_HOST || 'aws-0-us-west-2.pooler.supabase.com';
const portString = process.env.DB_PORT || '6543';
const portValue = parseInt(portString, 10);
const databaseValue = process.env.DB_NAME || 'postgres';
const passwordValue = process.env.DB_PASSWORD || 'DevSecOps21';
const userValue = 'postgres.cwlrardjyfxneexevlmm'; 

const poolConfig = {
  host: hostValue,
  port: portValue,
  user: userValue,
  password: passwordValue,
  database: databaseValue,
  ssl: {
    rejectUnauthorized: false
  }
};

const pool = new Pool(poolConfig);

const fallbackPort = 3000;
const envPort = process.env.PORT;
let finalPort;

if (envPort) {
  finalPort = envPort;
} else {
  finalPort = fallbackPort;
}

pool.connect()
  .then(() => {
    console.log('Connected to Database');
    
    // Status Route
    app.get('/health', (req, res) => {
      res.json({ status: 'ok' });
    });
    
    app.listen(finalPort, () => {
      console.log('Server running on port ' + finalPort);
    });
  })
  .catch(err => {
    console.error('Database connection error', err);
    process.exit(1);
  });
