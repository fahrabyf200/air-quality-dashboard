const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

try {
  const envPath = path.join(__dirname, '..', '.env');
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const k in envConfig) process.env[k] = envConfig[k];
} catch (e) {
  console.log("⚠️ Gagal membaca .env");
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

  const targetEmails = [
    'budi@gmail.com', 'citra@gmail.com', 'dedi@gmail.com', 'eka@gmail.com', 'fitri@gmail.com',
    'guntur@gmail.com', 'hesti@gmail.com', 'indra@gmail.com', 'julia@gmail.com',
    'kartika@gmail.com', 'lukman@gmail.com', 'mega@gmail.com', 'nanda@gmail.com', 'olivia@gmail.com',
    'panji@gmail.com', 'qori@gmail.com', 'rian@gmail.com', 'susi@gmail.com', 'tio@gmail.com', 'umi@gmail.com'
  ];

  console.log("🧹 Membersihkan data user dummy lama...");
  try {
    // Cari user ID lama agar bisa membersihkan transaksi dan shares terkait
    const [existingUsers] = await db.query("SELECT id FROM users WHERE email IN (?)", [targetEmails]);
    const existingIds = existingUsers.map(u => u.id);

    if (existingIds.length > 0) {
      await db.query("DELETE FROM sales_transactions WHERE user_id IN (?)", [existingIds]);
      await db.query("DELETE FROM device_shares WHERE owner_id IN (?) OR member_email IN (?)", [existingIds, targetEmails]);
      await db.query("DELETE FROM users WHERE id IN (?)", [existingIds]);
      console.log(`✅ Berhasil membersihkan ${existingIds.length} user dummy lama beserta relasinya.`);
    }
  } catch (err) {
    console.log("⚠️ Info pembersihan: belum ada data lama untuk dibersihkan atau table relasi kosong.");
  }

  console.log("🔑 Menyiapkan password hash...");
  const hashedPassword = await bcrypt.hash('password123', 10);

  // List of new users to create
  const usersToCreate = [
    // 1. Langganan 1 Bulan (Active + 1 Bulan)
    { name: 'Budi Santoso', email: 'budi@gmail.com', status: 'active', end_date: '2027-06-08 00:00:00', cat: '1 Bulan' },
    { name: 'Citra Lestari', email: 'citra@gmail.com', status: 'active', end_date: '2027-06-08 00:00:00', cat: '1 Bulan' },
    { name: 'Dedi Wijaya', email: 'dedi@gmail.com', status: 'active', end_date: '2027-06-08 00:00:00', cat: '1 Bulan' },
    { name: 'Eka Saputra', email: 'eka@gmail.com', status: 'active', end_date: '2027-06-08 00:00:00', cat: '1 Bulan' },
    { name: 'Fitri Handayani', email: 'fitri@gmail.com', status: 'active', end_date: '2027-06-08 00:00:00', cat: '1 Bulan' },

    // 2. Langganan 1 Tahun (Active + 1 Tahun)
    { name: 'Guntur Wibowo', email: 'guntur@gmail.com', status: 'active', end_date: '2027-06-08 00:00:00', cat: '1 Tahun' },
    { name: 'Hesti Wulandari', email: 'hesti@gmail.com', status: 'active', end_date: '2027-06-08 00:00:00', cat: '1 Tahun' },
    { name: 'Indra Hermawan', email: 'indra@gmail.com', status: 'active', end_date: '2027-06-08 00:00:00', cat: '1 Tahun' },
    { name: 'Julia Perez', email: 'julia@gmail.com', status: 'active', end_date: '2027-06-08 00:00:00', cat: '1 Tahun' },

    // 3. Lewat Undangan
    { name: 'Kartika Sari', email: 'kartika@gmail.com', status: 'free', end_date: null, cat: 'Invited' },
    { name: 'Lukman Hakim', email: 'lukman@gmail.com', status: 'free', end_date: null, cat: 'Invited' },
    { name: 'Mega Utami', email: 'mega@gmail.com', status: 'free', end_date: null, cat: 'Invited' },
    { name: 'Nanda Pratama', email: 'nanda@gmail.com', status: 'free', end_date: null, cat: 'Invited' },
    { name: 'Olivia Zalianty', email: 'olivia@gmail.com', status: 'free', end_date: null, cat: 'Invited' },

    // 4. Belum Langganan / Belum Perpanjang
    { name: 'Panji Petualang', email: 'panji@gmail.com', status: 'free', end_date: null, cat: 'Free' },
    { name: 'Qori Sandioriva', email: 'qori@gmail.com', status: 'free', end_date: null, cat: 'Free' },
    { name: 'Rian Ekky', email: 'rian@gmail.com', status: 'free', end_date: null, cat: 'Free' },
    { name: 'Susi Pudjiastuti', email: 'susi@gmail.com', status: 'free', end_date: null, cat: 'Free' },
    { name: 'Tio Pakusadewo', email: 'tio@gmail.com', status: 'free', end_date: null, cat: 'Free' },
    { name: 'Umi Pipik', email: 'umi@gmail.com', status: 'free', end_date: null, cat: 'Free' }
  ];

  console.log(`🚀 Membuat ${usersToCreate.length} pengguna dummy baru...`);
  
  const createdUsers = [];
  for (const u of usersToCreate) {
    try {
      const [res] = await db.query(
        `INSERT INTO users (name, email, password, role, subscription_status, subscription_end_date)
         VALUES (?, ?, ?, 'user', ?, ?)`,
        [u.name, u.email, hashedPassword, u.status, u.end_date]
      );
      createdUsers.push({ id: res.insertId, ...u });
    } catch (e) {
      console.error(`❌ Gagal membuat user ${u.name}:`, e.message);
    }
  }

  console.log(`✅ Berhasil membuat ${createdUsers.length} user baru.`);

  // Find owner user to share with. Use ID 1 (admin) or ID 3 (admin) as default owner
  const ownerId = 1; 

  console.log("🔗 Menghubungkan user kategori 'Lewat Undangan' ke sharing device...");
  for (const u of createdUsers) {
    if (u.cat === 'Invited') {
      try {
        await db.query(
          `INSERT INTO device_shares (owner_id, member_email) VALUES (?, ?)
           ON DUPLICATE KEY UPDATE owner_id = owner_id`,
          [ownerId, u.email]
        );
      } catch (e) {
        console.error(`❌ Gagal membuat sharing device untuk ${u.email}:`, e.message);
      }
    }
  }

  // Generate sales transactions for Langganan 1 Bulan and Langganan 1 Tahun users
  // We distribute transactions over the last 12 months (Jun 2025 - Jun 2026) to add to the dashboard charts!
  const txList = [
    // Month-by-month distribution
    { email: 'budi@gmail.com', pkg: '1 Bulan', amt: 349000, date: '2025-07-05 10:00:00' },
    { email: 'budi@gmail.com', pkg: '1 Bulan', amt: 349000, date: '2025-08-05 10:00:00' },
    { email: 'citra@gmail.com', pkg: '1 Bulan', amt: 349000, date: '2025-09-12 11:30:00' },
    { email: 'guntur@gmail.com', pkg: '1 Tahun', amt: 599000, date: '2025-10-01 14:00:00' },
    { email: 'dedi@gmail.com', pkg: '1 Bulan', amt: 349000, date: '2025-11-20 09:15:00' },
    { email: 'hesti@gmail.com', pkg: '1 Tahun', amt: 599000, date: '2025-12-15 15:45:00' },
    { email: 'eka@gmail.com', pkg: '1 Bulan', amt: 349000, date: '2026-01-10 16:20:00' },
    { email: 'indra@gmail.com', pkg: '1 Tahun', amt: 599000, date: '2026-02-14 08:30:00' },
    { email: 'fitri@gmail.com', pkg: '1 Bulan', amt: 349000, date: '2026-03-22 13:40:00' },
    { email: 'julia@gmail.com', pkg: '1 Tahun', amt: 599000, date: '2026-04-18 10:50:00' },
    { email: 'budi@gmail.com', pkg: '1 Bulan', amt: 349000, date: '2026-05-05 12:15:00' },
    { email: 'citra@gmail.com', pkg: '1 Bulan', amt: 349000, date: '2026-05-15 09:30:00' },
    { email: 'dedi@gmail.com', pkg: '1 Bulan', amt: 349000, date: '2026-06-01 14:00:00' },
    { email: 'eka@gmail.com', pkg: '1 Bulan', amt: 349000, date: '2026-06-04 11:00:00' },
    { email: 'fitri@gmail.com', pkg: '1 Bulan', amt: 349000, date: '2026-06-07 16:30:00' }
  ];

  console.log("💰 Mencatat transaksi penjualan untuk pengguna berlangganan...");
  let txCount = 0;
  for (const tx of txList) {
    const user = createdUsers.find(u => u.email === tx.email);
    if (user) {
      try {
        await db.query(
          `INSERT INTO sales_transactions (user_id, user_name, user_email, package_name, amount, payment_method, notes, created_at)
           VALUES (?, ?, ?, ?, ?, 'Transfer Bank', 'Transaksi Dummy Seeding', ?)`,
          [user.id, user.name, user.email, tx.pkg, tx.amt, tx.date]
        );
        txCount++;
      } catch (e) {
        console.error(`❌ Gagal mencatat transaksi untuk ${tx.email}:`, e.message);
      }
    }
  }

  console.log(`✨ Selesai! Berhasil membuat ${createdUsers.length} user baru dan ${txCount} transaksi penjualan.`);
  console.log("\n📋 DAFTAR USER DUMMY:");
  console.log("Password untuk semua user: password123\n");
  usersToCreate.forEach(u => {
    console.log(`- Nama: ${u.name} | Email: ${u.email} | Kategori: ${u.cat}`);
  });
  
  process.exit(0);
}

main();
