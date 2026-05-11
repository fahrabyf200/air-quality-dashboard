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

  console.log("🔧 Migrasi Sistem Langganan (Subscription)...\n");

  // 1. Tambah kolom subscription_status
  try {
    await db.query("ALTER TABLE users ADD COLUMN subscription_status VARCHAR(20) NOT NULL DEFAULT 'free'");
    console.log("✅ Kolom 'subscription_status' berhasil ditambahkan (default: 'free')");
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') console.log("✅ Kolom 'subscription_status' sudah ada");
    else console.error("❌ Gagal tambah kolom subscription_status:", e.message);
  }

  // 2. Tambah kolom subscription_end_date
  try {
    await db.query("ALTER TABLE users ADD COLUMN subscription_end_date DATETIME NULL DEFAULT NULL");
    console.log("✅ Kolom 'subscription_end_date' berhasil ditambahkan");
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') console.log("✅ Kolom 'subscription_end_date' sudah ada");
    else console.error("❌ Gagal tambah kolom subscription_end_date:", e.message);
  }

  // 3. Set semua akun admin menjadi premium aktif secara otomatis
  try {
    await db.query("UPDATE users SET subscription_status = 'active' WHERE role = 'admin'");
    console.log("✅ Semua akun Admin otomatis diset ke 'active'");
  } catch (e) {
    console.error("❌ Gagal update status admin:", e.message);
  }

  console.log("\n✨ Migrasi selesai!");
  console.log("📌 Status default pengguna baru: 'free'");
  console.log("📌 Admin aktifkan premium lewat: /admin/users");
  process.exit(0);
}

main();
