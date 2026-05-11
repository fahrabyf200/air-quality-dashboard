const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
  const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });
  try {
    const [rows] = await db.query('SELECT * FROM sensor_data ORDER BY created_at DESC LIMIT 5');
    console.log(rows);
  } catch (err) { console.error(err); } finally { db.end(); }
}
run();
