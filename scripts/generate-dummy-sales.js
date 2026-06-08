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

  console.log("🧹 Membersihkan data transaksi penjualan lama di database...");
  try {
    await db.query("DELETE FROM sales_transactions");
    console.log("✅ Data lama berhasil dibersihkan.");
  } catch (err) {
    console.error("❌ Gagal membersihkan data lama:", err.message);
  }

  // List of active users to match transactions
  const dummyTransactions = [
    {
      user_id: 2,
      user_name: 'Nana Eunola',
      user_email: 'agnaputra2321@gmail.com',
      package_name: '1 Bulan',
      amount: 349000,
      payment_method: 'GoPay',
      notes: 'Pembayaran langganan bulanan pertama',
      created_at: '2025-06-15 10:30:00'
    },
    {
      user_id: 4,
      user_name: 'Fahreiza Taura',
      user_email: 'rey@gmail.com',
      package_name: '1 Tahun',
      amount: 599000,
      payment_method: 'Transfer Bank',
      notes: 'Langganan tahunan hemat',
      created_at: '2025-07-12 14:15:00'
    },
    {
      user_id: 6,
      user_name: 'Yoyok bas',
      user_email: 'picce21@gmail.com',
      package_name: '1 Bulan',
      amount: 349000,
      payment_method: 'OVO',
      notes: 'Pembayaran bulan pertama',
      created_at: '2025-08-20 09:45:00'
    },
    {
      user_id: 9,
      user_name: 'Yuma Akhunza',
      user_email: 'yum@gmail.com',
      package_name: '1 Bulan',
      amount: 349000,
      payment_method: 'Dana',
      notes: 'Mencoba berlangganan',
      created_at: '2025-09-05 16:20:00'
    },
    {
      user_id: 2,
      user_name: 'Nana Eunola',
      user_email: 'agnaputra2321@gmail.com',
      package_name: '1 Bulan',
      amount: 349000,
      payment_method: 'GoPay',
      notes: 'Perpanjangan bulan kedua',
      created_at: '2025-10-18 11:10:00'
    },
    {
      user_id: 5,
      user_name: 'Test User',
      user_email: 'test@example.com',
      package_name: '1 Tahun',
      amount: 599000,
      payment_method: 'QRIS',
      notes: 'Langganan paket tahunan instan',
      created_at: '2025-11-22 13:05:00'
    },
    {
      user_id: 6,
      user_name: 'Yoyok bas',
      user_email: 'picce21@gmail.com',
      package_name: '1 Bulan',
      amount: 349000,
      payment_method: 'OVO',
      notes: 'Perpanjangan bulanan',
      created_at: '2025-12-08 15:50:00'
    },
    {
      user_id: 9,
      user_name: 'Yuma Akhunza',
      user_email: 'yum@gmail.com',
      package_name: '1 Bulan',
      amount: 349000,
      payment_method: 'Dana',
      notes: 'Perpanjangan bulanan',
      created_at: '2025-12-25 10:00:00'
    },
    {
      user_id: 7,
      user_name: 'Test User',
      user_email: 'test@user.com',
      package_name: '1 Bulan',
      amount: 349000,
      payment_method: 'QRIS',
      notes: 'Langganan pertama user uji coba',
      created_at: '2026-01-14 08:30:00'
    },
    {
      user_id: 2,
      user_name: 'Nana Eunola',
      user_email: 'agnaputra2321@gmail.com',
      package_name: '1 Bulan',
      amount: 349000,
      payment_method: 'GoPay',
      notes: 'Langganan bulanan dilanjutkan',
      created_at: '2026-02-05 17:15:00'
    },
    {
      user_id: 6,
      user_name: 'Yoyok bas',
      user_email: 'picce21@gmail.com',
      package_name: '1 Tahun',
      amount: 599000,
      payment_method: 'Transfer Bank',
      notes: 'Upgrade ke langganan tahunan',
      created_at: '2026-02-18 12:40:00'
    },
    {
      user_id: 9,
      user_name: 'Yuma Akhunza',
      user_email: 'yum@gmail.com',
      package_name: '1 Bulan',
      amount: 349000,
      payment_method: 'Dana',
      notes: 'Perpanjangan bulanan',
      created_at: '2026-03-21 14:22:00'
    },
    {
      user_id: 7,
      user_name: 'Test User',
      user_email: 'test@user.com',
      package_name: '1 Bulan',
      amount: 349000,
      payment_method: 'QRIS',
      notes: 'Bulan kedua user uji coba',
      created_at: '2026-04-10 11:35:00'
    },
    {
      user_id: 2,
      user_name: 'Nana Eunola',
      user_email: 'agnaputra2321@gmail.com',
      package_name: '1 Tahun',
      amount: 599000,
      payment_method: 'Transfer Bank',
      notes: 'Upgrade ke tahunan',
      created_at: '2026-04-28 16:50:00'
    },
    {
      user_id: 9,
      user_name: 'Yuma Akhunza',
      user_email: 'yum@gmail.com',
      package_name: '1 Bulan',
      amount: 349000,
      payment_method: 'Dana',
      notes: 'Perpanjangan bulanan',
      created_at: '2026-05-12 09:15:00'
    },
    {
      user_id: 5,
      user_name: 'Test User',
      user_email: 'test@example.com',
      package_name: '1 Bulan',
      amount: 349000,
      payment_method: 'QRIS',
      notes: 'Pembelian paket bulanan tambahan',
      created_at: '2026-05-27 15:30:00'
    },
    {
      user_id: 7,
      user_name: 'Test User',
      user_email: 'test@user.com',
      package_name: '1 Bulan',
      amount: 349000,
      payment_method: 'QRIS',
      notes: 'Langganan bulan ketiga',
      created_at: '2026-06-02 10:45:00'
    },
    {
      user_id: 9,
      user_name: 'Yuma Akhunza',
      user_email: 'yum@gmail.com',
      package_name: '1 Bulan',
      amount: 349000,
      payment_method: 'Dana',
      notes: 'Perpanjangan bulanan',
      created_at: '2026-06-07 14:20:00'
    }
  ];

  console.log(`🚀 Memasukkan ${dummyTransactions.length} transaksi dummy ke database...`);
  
  let successCount = 0;
  for (const tx of dummyTransactions) {
    try {
      await db.query(
        `INSERT INTO sales_transactions (user_id, user_name, user_email, package_name, amount, payment_method, notes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [tx.user_id, tx.user_name, tx.user_email, tx.package_name, tx.amount, tx.payment_method, tx.notes, tx.created_at]
      );
      successCount++;
    } catch (e) {
      console.error(`❌ Gagal memasukkan transaksi untuk ${tx.user_name}:`, e.message);
    }
  }

  console.log(`✨ Selesai! Berhasil memasukkan ${successCount}/${dummyTransactions.length} data dummy.`);
  process.exit(0);
}

main();
