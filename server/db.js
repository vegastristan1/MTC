require('dotenv').config();
const sql = require('mssql');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: false, // set to true when required by your SQL Server
    trustServerCertificate: true,
  },
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    return pool;
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
    throw err;
  });

module.exports = { sql, poolPromise };
