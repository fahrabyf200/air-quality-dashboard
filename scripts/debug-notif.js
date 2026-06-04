require('dotenv').config();
const mysql = require('mysql2/promise');

async function main() {
  const db = await mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
    timezone: 'Z'
  });

  // Check threshold raw value
  const [tRows] = await db.execute("SELECT setting_value FROM global_settings WHERE setting_key = 'thresholds'");
  console.log('RAW threshold rows:', JSON.stringify(tRows));
  console.log('Type of setting_value:', typeof tRows[0]?.setting_value);
  console.log('Value:', tRows[0]?.setting_value);

  // Try parsing
  let T = {co2:250, nh3:30, voc:70, temp:32};
  if (tRows.length > 0) {
    const val = tRows[0].setting_value;
    if (typeof val === 'string') {
      T = JSON.parse(val);
    } else if (typeof val === 'object') {
      T = val;
    }
  }
  console.log('Parsed threshold:', T);

  // 5 data sensor terbaru user 1
  const [rows] = await db.execute(
    'SELECT co2, nh3, voc, temp, is_unhealthy, created_at FROM sensor_data WHERE user_id = 1 ORDER BY created_at DESC LIMIT 5'
  );
  console.log('\n--- 5 Data Terbaru User 1 ---');
  rows.forEach((r, i) => {
    const isDanger = r.is_unhealthy === 1 || r.co2 > T.co2 || r.nh3 > T.nh3 || r.voc > T.voc || r.temp > T.temp;
    const diff = Math.round((new Date() - new Date(r.created_at)) / 1000);
    console.log(
      i === 0 ? 'TERBARU:' : '        ',
      'co2:', Number(r.co2).toFixed(0),
      '| nh3:', Number(r.nh3).toFixed(2),
      '| voc:', Number(r.voc||0).toFixed(2),
      '| temp:', Number(r.temp).toFixed(1),
      '| unhealthy:', r.is_unhealthy,
      '| BAHAYA?', isDanger ? 'YA' : 'TIDAK',
      '| diff:', diff + 's'
    );
  });

  if (rows.length >= 2) {
    const prev = rows[1];
    const curr = rows[0];
    const wasDanger = prev.is_unhealthy === 1 || prev.co2 > T.co2 || prev.nh3 > T.nh3 || prev.voc > T.voc || prev.temp > T.temp;
    const isDanger = curr.is_unhealthy === 1 || curr.co2 > T.co2 || curr.nh3 > T.nh3 || curr.voc > T.voc || curr.temp > T.temp;
    console.log('\n--- State Transition ---');
    console.log('Sebelumnya bahaya?', wasDanger ? 'YA' : 'TIDAK');
    console.log('Sekarang bahaya?  ', isDanger ? 'YA' : 'TIDAK');
    if (isDanger && !wasDanger) console.log('HASIL: WA SEHARUSNYA TERKIRIM (Aman -> Bahaya)');
    else if (!isDanger && wasDanger) console.log('HASIL: WA SEHARUSNYA TERKIRIM (Bahaya -> Aman)');
    else if (isDanger && wasDanger) console.log('HASIL: WA TIDAK DIKIRIM - sudah dalam kondisi bahaya (anti-spam) -- PERLU RESET STATE');
    else console.log('HASIL: WA TIDAK DIKIRIM - kondisi aman terus');
  }

  // Notifikasi terakhir
  const [notifs] = await db.execute(
    'SELECT title, type, created_at FROM notifications WHERE user_id = 1 ORDER BY created_at DESC LIMIT 5'
  );
  console.log('\n--- 5 Notifikasi Terakhir ---');
  if (notifs.length === 0) {
    console.log('TIDAK ADA notifikasi sama sekali!');
  } else {
    notifs.forEach(n => console.log(n.type, '|', n.title, '|', new Date(n.created_at).toISOString()));
  }

  await db.end();
}
main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
