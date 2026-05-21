require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
  const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const targetThresholds = { co2: 250, nh3: 30, voc: 70, temp: 32, hum: 80 };
    const thresholdString = JSON.stringify(targetThresholds);
    
    // Update atau Insert ke database
    await db.query(
      `INSERT INTO global_settings (setting_key, setting_value) VALUES ('thresholds', ?)
       ON DUPLICATE KEY UPDATE setting_value = ?`,
      [thresholdString, thresholdString]
    );
    console.log("Database thresholds updated successfully to:", targetThresholds);
  } catch (error) {
    console.error("Database update error:", error);
  } finally {
    await db.end();
  }
}

run();
