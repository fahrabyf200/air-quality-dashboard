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
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const [rows] = await db.query('DESCRIBE sensor_data');
    const hasVoc = rows.some(r => r.Field === 'voc');
    console.log('Has VOC column:', hasVoc);
    if (!hasVoc) {
      console.log('Adding voc column...');
      await db.query('ALTER TABLE sensor_data ADD COLUMN voc FLOAT DEFAULT 0');
      console.log('Column voc added!');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    db.end();
  }
}
run();
