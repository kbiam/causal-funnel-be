const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
});

// Override both query methods to ensure timezone is set
const originalQuery = pool.query.bind(pool);
const originalExecute = pool.execute.bind(pool);

pool.query = async function(sql, params) {
  const connection = await pool.getConnection();
  try {
    await connection.query("SET time_zone = '+05:30'");
    const result = params ? await connection.query(sql, params) : await connection.query(sql);
    return result;
  } finally {
    connection.release();
  }
};

pool.execute = async function(sql, params) {
  const connection = await pool.getConnection();
  try {
    await connection.query("SET time_zone = '+05:30'");
    const result = params ? await connection.execute(sql, params) : await connection.execute(sql);
    return result;
  } finally {
    connection.release();
  }
};

module.exports = pool;