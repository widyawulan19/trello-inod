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



// connection.js
require('dotenv').config();
const { Client } = require('pg');

// Gunakan internal URL Railway
const client = new Client({
  connectionString: process.env.DATABASE_URL, // internal URL
  ssl: {
    rejectUnauthorized: false // Wajib true/object ini untuk koneksi publik
  }
});

client.connect()
  .then(() => console.log('✅ Connected to Railway Postgres (internal)'))
  .catch(err => {
    console.error('❌ Connection error:', err.stack);
    process.exit(1); // stop server kalau DB gagal connect
  });

module.exports = client;
