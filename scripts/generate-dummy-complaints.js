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

  console.log("🧹 Membersihkan data pengaduan lama di database...");
  try {
    await db.query("DELETE FROM complaints");
    console.log("✅ Data pengaduan lama berhasil dibersihkan.");
  } catch (err) {
    console.error("❌ Gagal membersihkan data lama:", err.message);
  }

  const dummyComplaints = [
    {
      user_id: 2,
      name: 'Nana Eunola',
      email: 'agnaputra2321@gmail.com',
      subject: 'Sensor CO2 tidak terbaca',
      message: 'Halo admin, sensor CO2 di device saya sudah 2 hari ini nilainya selalu 0. Apakah sensornya rusak atau ada masalah jaringan? Mohon bantuannya.',
      status: 'pending',
      created_at: '2026-06-05 10:30:00'
    },
    {
      user_id: 4,
      name: 'Fahreiza Taura',
      email: 'rey@gmail.com',
      subject: 'Notifikasi Telegram tidak masuk',
      message: 'Selamat siang, saya sudah mengaktifkan alert bahaya ke Telegram tapi tidak pernah menerima notifikasi saat CO2 melebihi batas. Mohon bantuannya.',
      status: 'in_progress',
      created_at: '2026-06-06 14:15:00'
    },
    {
      user_id: 6,
      name: 'Yoyok bas',
      email: 'picce21@gmail.com',
      subject: 'Metode pembayaran perpanjangan premium',
      message: 'Apakah bisa bayar menggunakan QRIS selain transfer bank? Di menu perpanjangan saya tidak melihat opsi QRIS.',
      status: 'resolved',
      created_at: '2026-06-01 09:45:00'
    },
    {
      user_id: 9,
      name: 'Yuma Akhunza',
      email: 'yum@gmail.com',
      subject: 'Aplikasi lambat saat memuat riwayat sensor',
      message: 'Saat membuka tab riwayat sensor bulanan, halamannya sangat lambat dimuat. Kadang malah crash. Mohon dioptimalkan.',
      status: 'pending',
      created_at: '2026-06-07 16:20:00'
    },
    {
      user_id: 5,
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Kalibrasi sensor VOC',
      message: 'Bagaimana cara melakukan kalibrasi ulang untuk sensor VOC MQ-135? Nilainya terus menerus menunjukkan kategori bahaya padahal ventilasi ruangan bagus.',
      status: 'resolved',
      created_at: '2026-06-02 11:10:00'
    },
    {
      user_id: 2,
      name: 'Nana Eunola',
      email: 'agnaputra2321@gmail.com',
      subject: 'Pertanyaan mengenai limitasi akun Free',
      message: 'Apa perbedaan limit data sensor yang disimpan antara akun Free dan Premium? Terima kasih.',
      status: 'resolved',
      created_at: '2026-06-03 13:05:00'
    },
    {
      user_id: 4,
      name: 'Fahreiza Taura',
      email: 'rey@gmail.com',
      subject: 'Device sering offline sendiri',
      message: 'ESP32 yang terhubung ke dashboard ini sering sekali diskonek dari Wi-Fi dan statusnya offline di web. Apakah ada firmware update terbaru?',
      status: 'in_progress',
      created_at: '2026-06-04 15:50:00'
    },
    {
      user_id: 6,
      name: 'Yoyok bas',
      email: 'picce21@gmail.com',
      subject: 'Ekspor data ke Excel error',
      message: 'Setiap kali saya mencoba ekspor data sensor mingguan ke Excel, file yang didownload korup dan tidak bisa dibuka.',
      status: 'pending',
      created_at: '2026-06-08 08:30:00'
    }
  ];

  console.log(`🚀 Memasukkan ${dummyComplaints.length} pengaduan dummy ke database...`);
  
  let successCount = 0;
  for (const comp of dummyComplaints) {
    try {
      await db.query(
        `INSERT INTO complaints (user_id, name, email, subject, message, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [comp.user_id, comp.name, comp.email, comp.subject, comp.message, comp.status, comp.created_at, comp.created_at]
      );
      successCount++;
    } catch (e) {
      console.error(`❌ Gagal memasukkan pengaduan "${comp.subject}":`, e.message);
    }
  }

  console.log(`✨ Selesai! Berhasil memasukkan ${successCount}/${dummyComplaints.length} data dummy pengaduan.`);
  process.exit(0);
}

main();
