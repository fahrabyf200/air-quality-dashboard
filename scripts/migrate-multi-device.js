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

  console.log("🔧 Menjalankan migrasi Multi-Device (Banyak Sensor sekaligus)...\n");

  // 1. Buat tabel user_devices
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_devices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        device_id VARCHAR(100) NOT NULL,
        device_name VARCHAR(100) NOT NULL,
        created_at DATETIME DEFAULT NOW(),
        UNIQUE KEY uq_user_device (user_id, device_id),
        INDEX idx_device_id (device_id)
      )
    `);
    console.log("✅ Tabel 'user_devices' berhasil dibuat/diverifikasi.");
  } catch (e) {
    console.error("❌ Gagal membuat tabel user_devices:", e.message);
  }

  // 2. Tambah kolom device_id ke sensor_data
  try {
    await db.query(`
      ALTER TABLE sensor_data ADD COLUMN device_id VARCHAR(100) NULL DEFAULT NULL
    `);
    console.log("✅ Kolom 'device_id' ditambahkan ke tabel 'sensor_data'.");
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') console.log("✅ Kolom 'device_id' sudah ada di tabel 'sensor_data'.");
    else console.error("❌ Gagal menambah kolom device_id ke sensor_data:", e.message);
  }

  // 3. Migrasikan data device_id lama dari users ke user_devices
  try {
    const [result] = await db.query(`
      INSERT IGNORE INTO user_devices (user_id, device_id, device_name)
      SELECT id, device_id, 'Sensor Utama' FROM users WHERE device_id IS NOT NULL AND device_id != ''
    `);
    console.log(`✅ Berhasil memigrasi ${result.affectedRows} perangkat lama ke tabel 'user_devices'.`);
  } catch (e) {
    console.error("❌ Gagal memigrasi perangkat lama:", e.message);
  }

  console.log("\n✨ Migrasi Multi-Device selesai!");
  process.exit(0);
}

main();
