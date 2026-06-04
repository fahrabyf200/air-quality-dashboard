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
  const [rows] = await db.query('SELECT id, name, email, phone, device_id FROM users');
  console.log('Users in database:');
  console.log(JSON.stringify(rows, null, 2));
  await db.end();
}
main().catch(console.error);
