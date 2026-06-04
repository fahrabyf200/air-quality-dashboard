# BUKU PANDUAN PENGGUNAAN & TROUBLESHOOTING
# SKYWATCH: SISTEM MONITORING KUALITAS UDARA REAL-TIME BERBASIS IOT

Buku panduan ini disusun untuk memudahkan pemasangan, penggunaan, dan penanganan masalah pada sistem **SkyWatch** (baik dari sisi perangkat keras/hardware IoT maupun dashboard web).

---

## 1. PETUNJUK INSTALASI

### A. Perakitan & Pemasangan Perangkat Keras (Hardware IoT)
1. **Daftar Komponen Utama:**
   * ESP32 Development Board (30 Pin)
   * Sensor Gas MQ-135 (dengan kalibrasi udara bebas terlebih dahulu)
   * Sensor Suhu & Kelembapan DHT22
   * Layar LCD I2C 16x2
   * Modul Relay 1-Channel (Kipas Exhaust 5V/220V)
   * Aktif Buzzer 5V
   * Lampu LED (Merah & Hijau) + Resistor 220 Ohm
   * Kabel Jumper & Breadboard/PCB Matrix
2. **Koneksi Pin Perangkat (Skema Pin):**
   * **LCD I2C:** VCC ➔ Vin, GND ➔ GND, SDA ➔ Pin 32, SCL ➔ Pin 14
   * **Sensor MQ-135:** VCC ➔ Vin, GND ➔ GND, AO (Analog Out) ➔ Pin 34
   * **Sensor DHT22:** VCC ➔ 3.3V, GND ➔ GND, DATA ➔ Pin 27
   * **Relay Kipas:** VCC ➔ Vin, GND ➔ GND, IN ➔ Pin 13
   * **Buzzer:** VCC ➔ Pin 22, GND ➔ GND
   * **LED Hijau:** Anoda ➔ Pin 26 (melalui resistor), Katoda ➔ GND
   * **LED Merah:** Anoda ➔ Pin 25 (melalui resistor), Katoda ➔ GND
3. **Penyambungan Daya:**
   * Hubungkan ESP32 menggunakan kabel Micro-USB ke adaptor daya 5V minimal 1.5A agar suplai daya ke sensor dan relay stabil.

### B. Petunjuk Instalasi Dashboard Web (Deployment Lokal)
1. **Prasyarat:**
   * Pastikan laptop Anda telah terinstal Node.js (versi 18+) dan MySQL (misal Laragon atau XAMPP).
2. **Langkah Pemasangan:**
   * Clone repositori dari GitHub.
   * Salin file `.env.example` menjadi `.env` lalu lengkapi detail database Anda:
     ```env
     DB_HOST=localhost
     DB_PORT=3306
     DB_USER=root
     DB_PASSWORD=
     DB_NAME=air_quality
     FONNTE_TOKEN=isi_token_fonnte_anda
     ```
   * Instal dependensi proyek dengan menjalankan perintah berikut di terminal:
     ```bash
     npm install
     ```
   * Jalankan migrasi database (jika ada skrip migrasi):
     ```bash
     node scripts/migrate.js
     ```
   * Jalankan server development lokal:
     ```bash
     npm run dev
     ```
   * Aplikasi web Anda sekarang dapat diakses secara lokal melalui browser di `http://localhost:3000`.

---

## 2. CARA PENGGUNAAN DASHBOARD WEB

### A. Registrasi & Login Akun
1. Buka halaman utama web. Jika belum memiliki akun, klik **Daftar Akun** (Register).
2. Masukkan Nama Lengkap, Email, Password, serta nomor WhatsApp Anda.
3. Setelah berhasil mendaftar, lakukan **Login** menggunakan email dan password terdaftar.

### B. Menghubungkan Perangkat Sensor (Device Binding)
1. Masuk ke halaman **Profile** Anda setelah melakukan login.
2. Di accordion **Edit Profil (Nama & WhatsApp)**, pastikan **ID Perangkat / Device ID** Anda diisi sesuai dengan kode di ESP32 Anda (default: `ESP32_AGNA`).
3. Klik **Simpan Perubahan**.
4. Buka menu **Monitoring** atau halaman utama. Jika ESP32 Anda menyala dan terhubung ke internet, status koneksi akan berubah menjadi **ESP32 Network: Aktif** dan data kualitas udara dapur Anda akan ter-update secara otomatis setiap 2-5 detik.

### C. Mengatur Ambang Batas (Threshold) - Akun Admin
1. Jika masuk sebagai akun Admin, Anda dapat mengakses menu **Settings / Thresholds**.
2. Anda dapat mengubah nilai ambang batas aman untuk CO₂ (PPM), VOC (PPM), NH₃ (PPM), dan Suhu (°C).
3. Klik **Simpan Threshold**. Nilai batas baru akan langsung digunakan oleh server untuk memicu alarm darurat WhatsApp.

---

## 3. TROUBLESHOOTING (PEMECAHAN MASALAH)

### A. Masalah pada Perangkat Keras (Hardware IoT)
1. **Layar LCD Kosong atau Hanya Kotak Hitam:**
   * *Solusi:* Putar sekrup potensiometer (warna biru) di bagian belakang modul backpack I2C LCD menggunakan obeng kecil untuk mengatur kecerahan kontras layar.
2. **Sensor MQ-135 Mengirim Nilai 0 Terus Menerus atau Tidak Konsisten:**
   * *Solusi:* Sensor MQ membutuhkan waktu pemanasan (*warming up*) sekitar 1-2 menit setelah dinyalakan sebelum dapat membaca data gas secara stabil. Jika nilai tetap 0 setelah 5 menit, periksa apakah kabel VCC/GND sensor terputus.
3. **Kipas Kipas Exhaust Tidak Menyala Saat Status Bahaya:**
   * *Solusi:* Pastikan relay berbunyi "klik" saat lampu LED Merah menyala. Jika berbunyi klik tetapi kipas tidak menyala, periksa sambungan kabel daya eksternal kipas pada terminal NO (Normally Open) dan COM pada relay.

### B. Masalah pada Dashboard Web & Notifikasi WhatsApp
1. **Status Koneksi Selalu "Tidak Aktif" di Dashboard:**
   * *Solusi:* Periksa apakah ESP32 terhubung dengan benar ke jaringan WiFi hotspot HP Anda. Buka Serial Monitor di Arduino IDE untuk melihat apakah proses pengiriman HTTP POST mengembalikan kode status `200` atau `201`. Jika statusnya error `404` atau `-1`, pastikan variabel `serverUrl` di kode Arduino mengarah ke URL produksi atau terhubung ke internet.
2. **Notifikasi WhatsApp Tidak Masuk Sama Sekali saat Alat Bahaya:**
   * *Solusi 1:* Periksa kembali apakah token `FONNTE_TOKEN` di file `.env` proyek Anda (atau di pengaturan Vercel Environment Variables) sudah diisi dan sama persis dengan token di dashboard Fonnte.com.
   * *Solusi 2:* Buka dashboard Fonnte.com dan pastikan status HP Anda adalah **"Connected"**. Jika "Disconnected", lakukan scan ulang QR code.
   * *Solusi 3:* Pastikan nomor WhatsApp penerima pada halaman profil akun Anda sudah diisi dengan benar tanpa spasi atau tanda hubung (misal: `085792524863`).
