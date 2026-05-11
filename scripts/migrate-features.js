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

  console.log("🔧 Migrasi Tabel Pengaduan & Penjualan...\n");

  // 1. Tabel complaints
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS complaints (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL,
        subject VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at DATETIME DEFAULT NOW(),
        updated_at DATETIME DEFAULT NOW() ON UPDATE NOW(),
        INDEX idx_status (status),
        INDEX idx_user_id (user_id)
      )
    `);
    console.log("✅ Tabel 'complaints' berhasil dibuat");
  } catch (e) {
    if (e.code === 'ER_TABLE_EXISTS_ERROR') console.log("✅ Tabel 'complaints' sudah ada");
    else console.error("❌ Gagal buat tabel complaints:", e.message);
  }

  // 2. Tabel sales_transactions
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS sales_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        user_name VARCHAR(100) NULL,
        user_email VARCHAR(150) NULL,
        package_name VARCHAR(50) NOT NULL,
        amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        payment_method VARCHAR(50) NOT NULL DEFAULT 'Transfer Bank',
        notes TEXT NULL,
        created_at DATETIME DEFAULT NOW(),
        INDEX idx_user_id (user_id),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log("✅ Tabel 'sales_transactions' berhasil dibuat");
  } catch (e) {
    if (e.code === 'ER_TABLE_EXISTS_ERROR') console.log("✅ Tabel 'sales_transactions' sudah ada");
    else console.error("❌ Gagal buat tabel sales_transactions:", e.message);
  }

  // 3. Tabel notifications
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(30) NOT NULL DEFAULT 'alert',
        is_read TINYINT(1) NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT NOW(),
        INDEX idx_user_id_read (user_id, is_read)
      )
    `);
    console.log("✅ Tabel 'notifications' berhasil dibuat");
  } catch (e) {
    if (e.code === 'ER_TABLE_EXISTS_ERROR') console.log("✅ Tabel 'notifications' sudah ada");
    else console.error("❌ Gagal buat tabel notifications:", e.message);
  }

  console.log("\n✨ Migrasi selesai!");
  process.exit(0);
}

main();
