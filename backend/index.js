const express = require('express');
const { Pool } = require('pg');

const app = express();

// Explicit configuration parameters to prevent string-parsing errors
const hostValue = process.env.DB_HOST || 'aws-0-us-west-2.pooler.supabase.com';
const portString = process.env.DB_PORT || '6543';
const portValue = parseInt(portString, 10);
const databaseValue = process.env.DB_NAME || 'postgres';
const passwordValue = process.env.DB_PASSWORD || 'DevSecOps21';

// FIX: Strip the project ID out of the user string so the parser doesn't break
const userValue = 'postgres'; 

const poolConfig = {
  host: hostValue,
  port: portValue,
  user: userValue,
  password: passwordValue,
  database: databaseValue,
  // This explicitly passes the tenant ID during the handshake packet instead of the username
  options: '-c project=cwlrardjyfxneexevlmm',
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
    app.listen(finalPort, () => {
      console.log('Server running on port ' + finalPort);
    });
  })
  .catch(err => {
    console.error('Database connection error', err);
    process.exit(1);
  });
