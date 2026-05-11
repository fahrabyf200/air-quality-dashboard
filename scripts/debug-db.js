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
    console.log("--- DAFTAR SEMUA USER ---");
    const [users] = await db.query("SELECT id, name, email, device_id FROM users");
    console.table(users);

    console.log("\\n--- 10 DATA SENSOR TERAKHIR ---");
    const [sensors] = await db.query("SELECT id, user_id, co2, temp, created_at FROM sensor_data ORDER BY created_at DESC LIMIT 10");
    console.table(sensors);

  } catch (error) {
    console.error("Terjadi kesalahan:", error.message);
  }
  process.exit(0);
}

main();
