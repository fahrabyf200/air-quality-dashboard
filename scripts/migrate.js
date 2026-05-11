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

  console.log("🔧 Menjalankan migrasi database...\n");

  // 1. Tambah role ke users
  try {
    await db.query("ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user'");
    console.log("✅ Kolom 'role' berhasil ditambahkan ke tabel users");
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') console.log("✅ Kolom 'role' sudah ada");
    else console.error("❌ Gagal tambah kolom role:", e.message);
  }

  // 2. Tambah user_id ke sensor_data
  try {
    await db.query("ALTER TABLE sensor_data ADD COLUMN user_id INT NULL DEFAULT NULL");
    console.log("✅ Kolom 'user_id' berhasil ditambahkan ke tabel sensor_data");
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') console.log("✅ Kolom 'user_id' sudah ada");
    else console.error("❌ Gagal tambah kolom user_id:", e.message);
  }

  // 3. Tambah foreign key (opsional, skip jika gagal)
  try {
    await db.query("ALTER TABLE sensor_data ADD CONSTRAINT fk_sensor_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL");
    console.log("✅ Foreign key sensor_data -> users berhasil dibuat");
  } catch (e) {
    console.log("⚠️  Foreign key sudah ada atau gagal (tidak masalah):", e.message);
  }

  // 4. Cek admin berdasarkan argumen
  const adminEmail = process.argv[2];
  if (adminEmail) {
    try {
      const [result] = await db.query("UPDATE users SET role = 'admin' WHERE email = ?", [adminEmail]);
      if (result.affectedRows > 0) {
        console.log(`\n🎉 Akun ${adminEmail} berhasil dijadikan Admin!`);
      } else {
        console.log(`\n⚠️ Email ${adminEmail} tidak ditemukan. Pastikan sudah register terlebih dahulu.`);
      }
    } catch (e) { console.error("❌ Gagal update role:", e.message); }
  }

  // 5. Tabel global_settings untuk menyimpan Threshold secara global
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS global_settings (
        setting_key VARCHAR(50) PRIMARY KEY,
        setting_value JSON NOT NULL
      )
    `);
    
    // Set default threshold jika belum ada
    const defaultThresholds = { co2: 800, nh3: 4, voc: 10, temp: 35, hum: 80 };
    await db.query(
      `INSERT IGNORE INTO global_settings (setting_key, setting_value) VALUES ('thresholds', ?)`,
      [JSON.stringify(defaultThresholds)]
    );
    console.log("✅ Tabel 'global_settings' berhasil dibuat dan default threshold di-set");
  } catch (e) {
    console.error("❌ Gagal membuat tabel global_settings:", e.message);
  }

  console.log("\n✨ Migrasi selesai! Jalankan: node scripts/migrate.js email@anda.com");
  process.exit(0);
}

main();
