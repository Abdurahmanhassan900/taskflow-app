cat << 'EOF' > backend/index.js
const express = require('express');
const { Pool } = require('pg');

const app = express();

// Student-style explicit config object to completely bypass URL string parsing bugs
const poolConfig = {
  host: process.env.DB_HOST || 'aws-0-us-west-2.pooler.supabase.com',
  port: parseInt(process.env.DB_PORT || '6543', 10),
  user: process.env.DB_USER || 'postgres.cwlrardjyfxneexevlmm',
  password: process.env.DB_PASSWORD || 'DevSecOps21',
  database: process.env.DB_NAME || 'postgres',
  ssl: {
    rejectUnauthorized: false
  }
};

const pool = new Pool(poolConfig);

const tempPort = process.env.PORT;
const finalPort = tempPort || 3000;

pool.connect()
  .then(() => {
    console.log('Connected to Database');
    app.listen(finalPort, () => {
      console.log('Server running on port ' + finalPort);
    });
  })
  .catch(err => {
    console.error('Database connection error', err);
    process.exit(1);
  });
EOF
