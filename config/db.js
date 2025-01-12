// // config/db.js
// const { Pool } = require("pg");
// require("dotenv").config();

// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_DATABASE,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
// });

// module.exports = pool;
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Check the database connection
const checkDbConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("Database connected successfully!");
    client.release(); // Release the client back to the pool
  } catch (err) {
    console.error("Database connection error:", err.stack);
  }
};

// Test the connection when the application starts
checkDbConnection();

module.exports = pool;
