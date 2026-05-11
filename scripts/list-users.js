const mysql = require('mysql2/promise');
const fs = require('fs');
const dotenv = require('dotenv');
const path = require('path');

try {
  const envPath = path.join(__dirname, '..', '.env');
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
} catch (e) {
  console.log("Gagal membaca .env");
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
    const [rows] = await db.query("SELECT id, name, email, role FROM users");
    console.log("\n📋 DAFTAR PENGGUNA (USERS):");
    console.table(rows);
  } catch (err) {
    if (err.code === 'ER_BAD_FIELD_ERROR' && err.message.includes('role')) {
      console.log("\n⚠️ KOLOM 'role' BELUM ADA DI DATABASE.");
      console.log("Silakan jalankan perintah berikut terlebih dahulu untuk menambahkan kolom role:");
      console.log("\x1b[36mnode scripts/setup-admin.js\x1b[0m");
      console.log("\nMencoba menampilkan user tanpa kolom role...");
      try {
        const [rowsWithoutRole] = await db.query("SELECT id, name, email FROM users");
        console.log("\n📋 DAFTAR PENGGUNA (USERS) - Tanpa Role:");
        console.table(rowsWithoutRole);
      } catch (innerErr) {
        console.error("❌ Gagal mengambil data user:", innerErr.message);
      }
    } else if (err.code === 'ER_BAD_TABLE_ERROR') {
      console.log("❌ Tabel users belum dibuat!");
    } else {
      console.error("❌ Gagal mengambil data:", err.message);
    }
  }

  process.exit(0);
}

main();
