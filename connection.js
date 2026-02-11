require('dotenv').config();
const { Client } = require('pg');

// Buat client pakai DATABASE_URL
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  // ssl: {
  //   rejectUnauthorized: false, 
  // },
});

client.connect()
  .then(() => console.log('Connected to Railway Postgres'))
  .catch(err => console.error('Connection error', err.stack));

module.exports = client;


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
