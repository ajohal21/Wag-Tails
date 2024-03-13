import path from "path";
import dotenv from "dotenv";
import pg from "pg";

const { Pool } = pg;
dotenv.config();


// Database connection configuration
const dbConfig = {
  user: process.env.USER,
  password: process.env.PASSWORD,
  host: process.env.HOST,
  port: process.env.PORT,
  database: process.env.DATABASE,
};

console.log(dbConfig);

// Create a new PostgreSQL client
const pool = new Pool(dbConfig);



(async () => {
  try {
    const { rows } = await pool.query("SELECT current_user");
    const currentUser = rows[0]["current_user"];
    console.log("Current user:", currentUser);
  } catch (err) {
    console.error("Error executing query", err);
  }
})();

export default pool;
