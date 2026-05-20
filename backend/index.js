const express = require('express');
const { Pool } = require('pg');

const app = express();

const pool = new Pool({
  host: process.env.DB_HOST || 'aws-0-us-west-2.pooler.supabase.com',
  port: parseInt(process.env.DB_PORT || '6543', 10),
  user: process.env.DB_USER || 'postgres.cwlrardjyfxneexevlmm',
  password: process.env.DB_PASSWORD || 'DevSecOps21',
  database: process.env.DB_NAME || 'postgres',
  ssl: { rejectUnauthorized: false }
});

const PORT = process.env.PORT || 3000;

pool.connect()
  .then(() => {
    console.log('Connected to Database');
    app.get('/health', (_req, res) => res.json({ status: 'ok' }));
    app.listen(PORT, () => console.log('Server running on port ' + PORT));
  })
  .catch(err => {
    console.error('Database connection error', err);
    process.exit(1);
  });
