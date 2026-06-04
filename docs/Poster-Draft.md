# DRAF KONTEN & DESAIN POSTER (UKURAN A2)
# SKYWATCH: SMART KITCHEN AIR QUALITY MONITORING & ALERT SYSTEM

Poster ini dirancang untuk dicetak pada kertas ukuran A2 dengan orientasi Vertikal (Portrait). Berikut adalah pembagian tata letak (layout) dan teks konten poster:

---

## 1. HEADER (BAGIAN ATAS)
* **Logo Universitas & Jurusan:** Logo Politeknik Negeri Malang & Jurusan Teknologi Informasi (di sudut kiri/kanan).
* **Judul Utama:** 
  # SKYWATCH
  *Smart Kitchen Air Quality Monitoring & Alert System*
* **Sub-judul:** Solusi IoT & Web Pintar untuk Deteksi Kebocoran Gas LPG, Asap, dan Suhu Panas Secara Real-Time.

---

## 2. PENGANTAR & MASALAH (KIRI ATAS)
* **Judul Bagian:** Mengapa SkyWatch?
* **Poin Masalah:**
  * Bahaya kebocoran gas LPG (VOC) yang tidak terdeteksi sejak dini.
  * Akumulasi gas Karbon Dioksida (CO₂) di area dapur tertutup yang memicu sesak napas.
  * Kenaikan suhu kritis yang berpotensi menimbulkan bahaya kebakaran.
* **Solusi Kami:**
  SkyWatch hadir sebagai sistem pemantauan kualitas udara pintar yang menggabungkan sensor fisik berbasis IoT dan dashboard web untuk memberikan perlindungan dini secara otomatis dan real-time.

---

## 3. ARSITEKTUR SISTEM & CARA KERJA (TENGAH - BESAR)
* **Ilustrasi/Diagram Alur (Mermaid visual):**
  ```
  [ESP32 SENSOR NODE] ➔ [DATABASE CLOUD] ➔ [WEB DASHBOARD] & [WHATSAPP GATEWAY]
  ```
* **Poin Cara Kerja:**
  1. **Sensor Reading:** Sensor MQ-135 dan DHT22 mendeteksi kadar CO₂, VOC, NH₃, suhu, dan kelembapan dapur.
  2. **Local Defense:** Jika melewati batas aman, Buzzer berbunyi nyaring dan Relay menyalakan Exhaust Fan untuk membuang udara kotor.
  3. **Cloud Broadcast:** Data sensor dikirim ke cloud database setiap 5 detik secara aman.
  4. **WhatsApp Alerts:** Fonnte WhatsApp Gateway langsung mengirimkan notifikasi darurat secara instan ke nomor WhatsApp pemilik rumah.

---

## 4. FITUR UTAMA DASHBOARD WEB (KANAN ATAS)
* **Visualisasi Real-Time:** Grafik tren parameter sensor yang interaktif dan dinamis menggunakan Recharts.
* **Manajemen Perangkat:** Hubungkan banyak perangkat sensor (*multi-device*) hanya dengan memasukkan ID alat.
* **Notifikasi Instan:** Riwayat notifikasi peringatan darurat langsung di dalam web.
* **Konfigurasi Threshold:** Pengaturan ambang batas parameter sensor yang fleksibel untuk admin.

---

## 5. SPESIFIKASI TEKNOLOGI (KIRI BAWAH)
* **Hardware:** ESP32, Sensor MQ-135, Sensor DHT22, LCD I2C 16x2, Relay, Buzzer, Exhaust Fan.
* **Software:** Next.js (TypeScript), Tailwind CSS, MySQL (Aiven Cloud), API Fonnte.

---

## 6. FOOTER (BAGIAN BAWAH)
* **Foto Tim Penyusun & Dosen Pembimbing:**
  * Nama Anggota Tim 1 - 5 & NIM.
  * Nama Dosen Pembimbing & NIP.
* **Link Tautan Produk:**
  * QR Code menuju Link Landing Page: `https://air-quality-dashboard-sage.vercel.app`
  * Slogan penutup: *"Menjaga Kualitas Sirkulasi Udara Dapur Anda Tetap Aman dan Nyaman, Kapan Saja dan di Mana Saja."*
