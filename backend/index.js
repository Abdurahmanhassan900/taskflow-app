const express = require('express');
const { Pool } = require('pg');

const app = express();

const hostValue = process.env.DB_HOST || 'aws-0-us-west-2.pooler.supabase.com';
const portString = process.env.DB_PORT || '6543';
const portValue = parseInt(portString, 10);
const databaseValue = process.env.DB_NAME || 'postgres';
const passwordValue = process.env.DB_PASSWORD || 'DevSecOps21';

// We put the project ID back in the username BUT we wrap the config 
// so the parser treats it as an explicit structural property, not a string token.
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
    app.listen(finalPort, () => {
      console.log('Server running on port ' + finalPort);
    });
  })
  .catch(err => {
    console.error('Database connection error', err);
    process.exit(1);
  });
