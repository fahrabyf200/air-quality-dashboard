const mysql = require('mysql2/promise');

(async () => {
  let conn;
  try {
    conn = await mysql.createConnection({
      host: 'db-cloud-pbl-air-quality.d.aivencloud.com',
      port: 10728,
      user: 'avnadmin',
      password: 'AVNS_z9ASkBC9T_161yIP9du',
      database: 'defaultdb',
      ssl: { rejectUnauthorized: false }
    });

    // Cek dulu apakah column sudah ada
    const [cols] = await conn.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='defaultdb' AND TABLE_NAME='users' AND COLUMN_NAME='profile_pic'"
    );

    if (cols.length > 0) {
      console.log('Column profile_pic sudah ada. Tidak perlu migrasi.');
    } else {
      await conn.execute('ALTER TABLE users ADD COLUMN profile_pic VARCHAR(255) DEFAULT NULL');
      console.log('Migration berhasil! Column profile_pic telah ditambahkan.');
    }
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    if (conn) await conn.end();
  }
})();
