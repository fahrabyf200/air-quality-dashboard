require('dotenv').config();
const mysql = require('mysql2/promise');

async function main() {
  const db = await mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  const [rows] = await db.query(
    "SELECT * FROM sensor_data WHERE created_at >= '2026-06-02 13:17:00' AND created_at <= '2026-06-02 13:18:30' ORDER BY id DESC"
  );
  console.log('Sensor data around 20:17:50:');
  console.log(JSON.stringify(rows, null, 2));
  await db.end();
}
main().catch(console.error);
