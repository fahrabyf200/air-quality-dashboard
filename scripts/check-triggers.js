const mysql = require('mysql2/promise');
const fs = require('fs');
const dotenv = require('dotenv');
const path = require('path');

try {
  const envPath = path.join(__dirname, '..', '.env');
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const k in envConfig) process.env[k] = envConfig[k];
} catch (e) { console.log("Gagal membaca .env"); }

async function main() {
  const db = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'air_quality',
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("--- SCHEMA TABLE SENSOR_DATA ---");
    const [schema] = await db.query("DESCRIBE sensor_data");
    console.table(schema);

    console.log("\\n--- LIST OF TRIGGERS ---");
    const [triggers] = await db.query("SHOW TRIGGERS");
    console.table(triggers);
  } catch (error) {
    console.error("Error:", error.message);
  }
  process.exit(0);
}

main();
