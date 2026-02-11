// require('dotenv').config();
// const { Client } = require('pg');

// // Buat client pakai DATABASE_URL
// const client = new Client({
//   connectionString: process.env.DATABASE_URL,
//   // ssl: {
//   //   rejectUnauthorized: false, 
//   // },
// });

// client.connect()
//   .then(() => console.log('Connected to Railway Postgres'))
//   .catch(err => console.error('Connection error', err.stack));

// module.exports = client;


require('dotenv').config();
const express = require('express');
const { Client } = require('pg');

const app = express();
const PORT = process.env.PORT || 8080;

// =====================
// PostgreSQL Client
// =====================
const client = new Client({
  connectionString: process.env.DATABASE_URL, // pakai internal link Railway
  // jangan pakai ssl untuk internal network
});

client.connect()
  .then(() => console.log('✅ Connected to Railway Postgres'))
  .catch(err => console.error('❌ DB connection error:', err));

// =====================
// Express Routes
// =====================
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// =====================
// Start Server dengan error handling
// =====================
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
  } else {
    console.error('❌ Server error:', err);
  }
});


// require('dotenv').config();
// const { Pool } = require('pg');

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false
//   }
// });

// pool.on('connect', () => {
//   console.log('✅ Connected to Postgres');
// });

// pool.on('error', (err) => {
//   console.error('❌ DB error:', err);
// });


// pool.connect()
//   .then(() => console.log('Connected to Railway Postgres'))
//   .catch(err => console.error('Connection error', err));


// module.exports = pool;
