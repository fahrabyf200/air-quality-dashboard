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
    const [rows] = await db.query("SELECT setting_value FROM global_settings WHERE setting_key = 'thresholds'");
    if (rows.length > 0) {
      let parsed = rows[0].setting_value;
      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
      }
      parsed.temp = 45;
      const updatedString = JSON.stringify(parsed);
      await db.query("UPDATE global_settings SET setting_value = ? WHERE setting_key = 'thresholds'", [updatedString]);
      console.log("Database thresholds updated successfully to:", parsed);
    } else {
      const defaultString = JSON.stringify({ co2: 800, nh3: 4, voc: 10, temp: 45, hum: 80 });
      await db.query("INSERT INTO global_settings (setting_key, setting_value) VALUES ('thresholds', ?)", [defaultString]);
      console.log("Database thresholds initialized to default with temp 45");
    }
  } catch (error) {
    console.error("Database update error:", error);
  } finally {
    await db.end();
  }
}

run();
