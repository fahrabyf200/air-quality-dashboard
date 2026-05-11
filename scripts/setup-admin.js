const mysql = require('mysql2/promise');
const fs = require('fs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables dari .env
try {
  const envPath = path.join(__dirname, '..', '.env');
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
} catch (e) {
  console.log("Gagal membaca .env, menggunakan default / process.env");
}

async function main() {
  const db = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'air_quality',
  });

  try {
    console.log("Mengecek struktur database...");
    await db.query("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user'");
    console.log("✅ Kolom 'role' berhasil ditambahkan ke tabel users!");
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log("✅ Kolom 'role' sudah ada (Aman).");
    } else {
      console.error("❌ Gagal mengubah tabel:", err.message);
    }
  }

  const email = process.argv[2];
  if (email) {
    try {
      const [result] = await db.query("UPDATE users SET role = 'admin' WHERE email = ?", [email]);
      if (result.affectedRows > 0) {
        console.log(`🎉 BERHASIL! Akun ${email} sekarang resmi menjadi Admin.`);
      } else {
        console.log(`⚠️ GAGAL: Akun dengan email ${email} tidak ditemukan. Apakah Anda sudah register?`);
      }
    } catch (err) {
      console.error("❌ Gagal mengupdate akun:", err.message);
    }
  } else {
    console.log("\n💡 PETUNJUK PENGGUNAAN:");
    console.log("Untuk menjadikan akun Anda sebagai Admin, ketik di terminal:");
    console.log("node scripts/setup-admin.js email_anda@gmail.com");
  }

  process.exit(0);
}

main();
