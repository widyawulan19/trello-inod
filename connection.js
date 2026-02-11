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



const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

(async () => {
  try {
    console.log("Trying to connect to Postgres...");
    await client.connect();
    console.log("✅ Connected to Railway Postgres (internal)");
  } catch (err) {
    console.error("❌ Connection error:", err);
    process.exit(1);
  }
})();

module.exports = client;
