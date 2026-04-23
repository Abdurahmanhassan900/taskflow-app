const express = require('express');
const { Pool } = require('pg');

const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://taskuser:taskpass@db:5432/taskdb'
});

pool.connect()
  .then(() => {
    console.log('Connected to Database');
    app.listen(3000, () => console.log('Server running on port 3000'));
  })
  .catch(err => {
    console.error('Database connection error', err);
    process.exit(1); // <-- this is critical
  });