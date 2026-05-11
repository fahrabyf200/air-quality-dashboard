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

  console.log("🔧 Menjalankan migrasi kolom device_id...");

  try {
    await db.query("ALTER TABLE users ADD COLUMN device_id VARCHAR(50) NULL DEFAULT NULL");
    console.log("✅ Kolom 'device_id' berhasil ditambahkan ke tabel users");
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') console.log("✅ Kolom 'device_id' sudah ada");
    else console.error("❌ Gagal tambah kolom device_id:", e.message);
  }

  console.log("\n✨ Selesai!");
  process.exit(0);
}

main();
