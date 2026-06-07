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
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  console.log("🔧 Menjalankan migrasi V2 untuk Multi-Device (Real vs Sim) & Share Pegawai...");

  // 1. Tambah kolom device_type ke user_devices
  try {
    await db.query(`
      ALTER TABLE user_devices ADD COLUMN device_type VARCHAR(20) NOT NULL DEFAULT 'real'
    `);
    console.log("✅ Kolom 'device_type' ditambahkan ke tabel 'user_devices'.");
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') console.log("✅ Kolom 'device_type' sudah ada di tabel 'user_devices'.");
    else console.error("❌ Gagal menambah kolom device_type ke user_devices:", e.message);
  }

  // 2. Tambah kolom device_id ke device_shares
  try {
    await db.query(`
      ALTER TABLE device_shares ADD COLUMN device_id VARCHAR(100) NULL DEFAULT NULL
    `);
    console.log("✅ Kolom 'device_id' ditambahkan ke tabel 'device_shares'.");
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') console.log("✅ Kolom 'device_id' sudah ada di tabel 'device_shares'.");
    else console.error("❌ Gagal menambah kolom device_id ke device_shares:", e.message);
  }

  // 3. Modifikasi unique constraint di device_shares agar unik per (owner_id, member_email, device_id)
  try {
    // Drop key lama jika ada
    try {
      await db.query(`ALTER TABLE device_shares DROP INDEX uq_owner_member`);
      console.log("✅ UQ constraint 'uq_owner_member' berhasil dihapus.");
    } catch (err) {
      // Index might not exist or have a different name
    }
    
    // Tambah constraint baru
    await db.query(`
      ALTER TABLE device_shares ADD CONSTRAINT uq_owner_member_device UNIQUE (owner_id, member_email, device_id)
    `);
    console.log("✅ UQ constraint 'uq_owner_member_device' ditambahkan ke tabel 'device_shares'.");
  } catch (e) {
    if (e.code === 'ER_DUP_KEY' || e.code === 'ER_DUP_ENTRY' || e.message.includes('Multiple primary key') || e.message.includes('already exists')) {
      console.log("✅ UQ constraint 'uq_owner_member_device' sudah ada.");
    } else {
      console.error("❌ Gagal merubah unique constraint:", e.message);
    }
  }

  console.log("✨ Migrasi V2 selesai!");
  process.exit(0);
}

main().catch(console.error);
