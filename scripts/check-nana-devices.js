const mysql = require('mysql2/promise');
const fs = require('fs');
const dotenv = require('dotenv');
const path = require('path');

try {
  const envPath = path.join(__dirname, '..', '.env');
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const k in envConfig) process.env[k] = envConfig[k];
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
    ssl: { rejectUnauthorized: false }
  });

  try {
    // 1. Find user named Nana Eunola
    const [users] = await db.query(
      "SELECT id, name, email, role, subscription_status FROM users WHERE LOWER(name) LIKE '%nana%' OR LOWER(email) LIKE '%nana%' OR LOWER(name) LIKE '%eunola%' OR LOWER(email) LIKE '%eunola%'"
    );

    if (users.length === 0) {
      console.log("❌ Tidak ada user bernama Nana / Eunola.");
      process.exit(0);
    }

    console.log("=== USER DETAILS ===");
    console.log(users);

    for (const user of users) {
      console.log(`\n=== DEVICES FOR: ${user.name} (${user.email}) ===`);
      
      // Owned devices
      const [owned] = await db.query(
        "SELECT id, device_id, device_name, device_type, created_at FROM user_devices WHERE user_id = ?",
        [user.id]
      );
      console.log("- PERANGKAT DIMILIKI (OWNED):");
      console.log(owned.length > 0 ? owned : "Tidak ada");

      // Shared devices (received)
      const [shares] = await db.query(
        `SELECT ds.id, ds.device_id, ds.owner_id, ud.device_name, u.email as owner_email 
         FROM device_shares ds 
         LEFT JOIN user_devices ud ON ds.device_id = ud.device_id AND ud.user_id = ds.owner_id
         LEFT JOIN users u ON ds.owner_id = u.id
         WHERE LOWER(ds.member_email) = ?`,
        [user.email.toLowerCase()]
      );
      console.log("- PERANGKAT DI-SHARE (DITUGASKAN):");
      console.log(shares.length > 0 ? shares : "Tidak ada");
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await db.end();
  }
}

main();
