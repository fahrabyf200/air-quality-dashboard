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
  const [rows] = await db.query('DESCRIBE users');
  console.log('Columns in users table:');
  console.log(rows.map(r => ({ Field: r.Field, Type: r.Type, Null: r.Null })));
  await db.end();
}
main().catch(console.error);
