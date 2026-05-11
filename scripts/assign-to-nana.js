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

  console.log("🔍 Mencari akun bernama 'Nana' di database...");

  try {
    // Cari user bernama nana atau email mengandung nana
    const [users] = await db.query(
      "SELECT id, name, email FROM users WHERE LOWER(name) LIKE '%nana%' OR LOWER(email) LIKE '%nana%' LIMIT 1"
    );

    if (users.length === 0) {
      console.log("❌ Akun dengan nama/email 'Nana' tidak ditemukan!");
      console.log("Silakan buat akun Nana terlebih dahulu di register atau admin panel.");
      process.exit(1);
    }

    const nana = users[0];
    console.log(`✅ Ditemukan akun: ${nana.name} (ID: ${nana.id}, Email: ${nana.email})`);

    console.log("⚙ Memindahkan semua data sensor lama ke akun Nana...");
    const [result] = await db.query(
      "UPDATE sensor_data SET user_id = ? WHERE user_id IS NULL",
      [nana.id]
    );

    console.log(`✨ Sukses! Sebanyak ${result.affectedRows} baris data sensor lama sekarang telah menjadi milik Nana.`);
  } catch (error) {
    console.error("❌ Terjadi kesalahan:", error.message);
  }

  process.exit(0);
}

main();
