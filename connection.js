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
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  try {
    console.log("Trying to connect to Postgres...");
    await client.connect();
    console.log("✅ Connected to Railway Postgres");
  } catch (err) {
    console.error("❌ Connection error", err);
    process.exit(1); // stop container kalau DB ga connect
  }
})();

module.exports = client;


// require('dotenv').config();
// const { Client } = require('pg');

// // Buat client pakai DATABASE_URL
// const client = new Client({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false,
//   },
// });

// (async () => {
//   try {
//     console.log("Trying to connect to Postgres...");
//     await client.connect();
//     console.log("✅ Connected to Railway Postgres");
//   } catch (err) {
//     console.error("❌ Connection error", err);
//     process.exit(1); // stop container kalau DB ga connect
//   }
// })();

// console.log('Trying to connect to Postgres...');
// client.connect()
//   .then(() => console.log('Connected to Railway Postgres'))
//   .catch(err => {
//     console.error('Connection error', err.stack);
//     process.exit(1); // supaya container fail fast kalau DB ga connect
//   });
// module.exports = client;



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
