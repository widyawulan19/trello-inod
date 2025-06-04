const {Client} = require('pg')

const client = new Client({
    host:'localhost',
    user:'postgres',
    database:'demo2',
    password:'1234',
    port: 5432,
})

client.connect()
.then(() => console.log('Connected to Postgres'))
.catch(err => console.error('Connection error', err.stack))

module.exports = client