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

  console.log("🔧 Migrasi Tabel Sharing Alat (device_shares)...\n");

  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS device_shares (
        id INT AUTO_INCREMENT PRIMARY KEY,
        owner_id INT NOT NULL,
        member_email VARCHAR(150) NOT NULL,
        created_at DATETIME DEFAULT NOW(),
        UNIQUE KEY uq_owner_member (owner_id, member_email),
        INDEX idx_member_email (member_email)
      )
    `);
    console.log("✅ Tabel 'device_shares' berhasil dibuat/diverifikasi.");
  } catch (e) {
    console.error("❌ Gagal membuat tabel device_shares:", e.message);
  }

  process.exit(0);
}

main();
