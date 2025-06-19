require('dotenv').config();
const { Client } = require('pg');

// Buat client pakai DATABASE_URL
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Wajib untuk koneksi Railway
  },
});

client.connect()
  .then(() => console.log('Connected to Railway Postgres'))
  .catch(err => console.error('Connection error', err.stack));

module.exports = client;


// const {Client} = require('pg')

// const client = new Client({
//     host:'localhost',
//     user:'postgres',
//     database:'demo2',
//     password:'1234',
//     port: 5432,
// })

// client.connect()
// .then(() => console.log('Connected to Postgres'))
// .catch(err => console.error('Connection error', err.stack))

// module.exports = client