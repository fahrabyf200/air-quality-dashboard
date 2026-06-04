# LAPORAN AKHIR
# PROJECT BASED LEARNING (PBL)
# SKYWATCH: SISTEM MONITORING KUALITAS UDARA REAL-TIME BERBASIS INTERNET OF THINGS (IOT) DENGAN INTEGRASI WHATSAPP ALERTS

**Disusun Oleh:**
1. [Nama Anggota 1] / [NIM 1]
2. [Nama Anggota 2] / [NIM 2]
3. [Nama Anggota 3] / [NIM 3]
4. [Nama Anggota 4] / [NIM 4]
5. [Nama Anggota 5] / [NIM 5]

**Jurusan Teknologi Informasi**  
**Program Studi D4 Teknik Informatika**  
**Politeknik Negeri Malang**  
**2026**

---

## LEMBAR PENGESAHAN LAPORAN AKHIR PBL
**SKYWATCH: SISTEM MONITORING KUALITAS UDARA REAL-TIME BERBASIS IOT DENGAN INTEGRASI WHATSAPP ALERTS**

Telah diseminasikan pada tanggal [Tanggal] [Bulan] 2026  
Dengan Penguji:
1. **[Nama Mata Kuliah 1]** : [Nama Dosen Pengampu 1] (NIP. [NIP 1])  
2. **[Nama Mata Kuliah 2]** : [Nama Dosen Pengampu 2] (NIP. [NIP 2])  
3. **[Nama Mata Kuliah 3]** : [Nama Dosen Pengampu 3] (NIP. [NIP 3])  
4. **[Nama Mata Kuliah 4]** : [Nama Dosen Pengampu 4] (NIP. [NIP 4])  

Mengetahui,

**Ketua Jurusan Teknologi Informasi**  
Politeknik Negeri Malang  
[Nama Ketua Jurusan]  
NIP. [NIP Ketua Jurusan]  

**Ketua Program Studi D4 Teknik Informatika**  
Politeknik Negeri Malang  
[Nama Kaprodi]  
NIP. [NIP Kaprodi]  

---

## 1. RINGKASAN EKSEKUTIF
Proyek **SkyWatch** adalah sistem monitoring kualitas udara area dapur/ruangan secara real-time berbasis IoT dan aplikasi web. Latar belakang proyek ini adalah tingginya risiko kebocoran gas LPG (VOC) dan akumulasi karbon dioksida (CO₂) di ruang tertutup yang dapat membahayakan kesehatan serta memicu kebakaran. Solusi yang ditawarkan berupa integrasi sensor fisik ESP32 (MQ-135 untuk deteksi gas dan DHT22 untuk suhu & kelembapan) dengan sistem dashboard Next.js dan database MySQL (Aiven Cloud). Ketika kualitas udara memburuk melewati batas aman (threshold), sistem otomatis membunyikan buzzer, mengaktifkan exhaust fan (relay), mengirimkan peringatan visual ke dashboard web, serta mengirimkan pesan peringatan instan (alert) via WhatsApp menggunakan gateway Fonnte secara real-time kepada pengguna. Dampak dari proyek ini adalah meningkatnya keamanan sirkulasi udara domestik dan pencegahan dini bahaya keracunan atau kebakaran dapur.

---

## 2. PENDAHULUAN

### Latar Belakang
Kualitas udara dalam ruangan, terutama di area dapur, sering kali luput dari perhatian. Aktivitas memasak menggunakan gas LPG berpotensi mengalami kebocoran gas metana/butana (VOC) serta menghasilkan akumulasi gas CO₂ dan suhu panas berlebih. Tanpa adanya sistem monitoring yang peka dan sirkulasi udara yang baik, kondisi ini sangat membahayakan penghuni rumah. Oleh karena itu, diperlukan sebuah alat pemantau otomatis yang terintegrasi dengan dashboard digital serta mampu mengirimkan notifikasi darurat secara instan langsung ke perangkat seluler pengguna saat mereka berada di luar ruangan.

### Rumusan Masalah
1. Bagaimana merancang perangkat IoT yang dapat membaca parameter CO₂, NH₃, VOC, suhu, dan kelembapan secara akurat di dapur?
2. Bagaimana menampilkan data sensor tersebut secara real-time pada dashboard web interaktif?
3. Bagaimana mendesain sistem notifikasi darurat berbasis WhatsApp yang andal dan anti-spam saat kondisi kritis terjadi?

### Tujuan Proyek
1. Mengembangkan alat sensor berbasis ESP32 menggunakan MQ-135 dan DHT22.
2. Membangun aplikasi web dashboard menggunakan Next.js untuk visualisasi data sensor dan grafik tren kualitas udara.
3. Mengintegrasikan API gateway WhatsApp Fonnte untuk notifikasi peringatan darurat.

### Ruang Lingkup Proyek
* **Hardware:** ESP32, MQ-135, DHT22, LCD I2C 16x2, Relay 5V (Exhaust Fan), Buzzer, dan LED (Merah & Hijau).
* **Software/Web:** Framework Next.js (React/TypeScript), Tailwind CSS, Recharts (untuk grafik tren), MySQL (Aiven Cloud), dan API Fonnte.
* Notifikasi WhatsApp dikirimkan saat terjadi transisi status dari Aman ke Bahaya, dan sebaliknya (recovery message).

---

## 3. SPESIFIKASI KEBUTUHAN PERANGKAT LUNAK (SKPL)

### Kebutuhan Fungsional (Functional Requirements)
1. **RF-01:** Sistem harus dapat menerima data sensor (CO2, NH3, VOC, suhu, kelembapan) yang dikirim oleh ESP32 melalui HTTP POST request.
2. **RF-02:** Web dashboard harus menampilkan data kualitas udara secara real-time dengan grafik tren interaktif.
3. **RF-03:** Pengguna harus dapat mendaftarkan dan memperbarui nomor WhatsApp mereka melalui halaman profil untuk menerima alert.
4. **RF-04:** Admin harus dapat memperbarui ambang batas aman (*threshold*) parameter sensor secara global di database.
5. **RF-05:** Sistem harus mengirim notifikasi darurat WhatsApp otomatis ketika nilai sensor melebihi threshold.

### Kebutuhan Non-Fungsional (Non-Functional Requirements)
1. **Keandalan (Reliability):** API penerima sensor harus memiliki ketersediaan tinggi (high availability) karena ESP32 mengirim data setiap 2-5 detik.
2. **Keamanan (Security):** Endpoint diagnosis WA dibatasi atau token Fonnte disembunyikan menggunakan environment variables (`FONNTE_TOKEN`).
3. **Usabilitas (Usability):** Tampilan antarmuka dashboard harus responsif dan mendukung mode gelap (dark mode) agar nyaman dibaca.

### Diagram Arsitektur & ERD
#### ERD Tabel Utama:
* `users` (id, name, email, password, phone, device_id)
* `sensor_data` (id, user_id, device_id, co2, nh3, voc, temp, hum, is_unhealthy, created_at)
* `notifications` (id, user_id, title, message, type, created_at)
* `global_settings` (setting_key, setting_value)

---

## 4. PERENCANAAN PROYEK

### Jadwal Proyek & Pembagian Tugas
* **Minggu 1-2:** Analisis kebutuhan, perancangan skema hardware ESP32, dan instalasi awal Next.js.
* **Minggu 3-4:** Perakitan perangkat keras, kalibrasi awal sensor MQ-135, pembuatan database MySQL, dan pengembangan API endpoints.
* **Minggu 5-6:** Pembuatan UI Dashboard, halaman registrasi/login, dan integrasi visualisasi grafik Recharts.
* **Minggu 7-8:** Implementasi gateway WhatsApp Fonnte, sinkronisasi zona waktu database Aiven, serta pengujian sistem secara end-to-end.

---

## 5. IMPLEMENTASI PROYEK

### Skema Hardware ESP32
* **MQ-135 (Sensor Gas):** Dihubungkan ke Analog Pin `34` ESP32.
* **DHT22 (Suhu & Lembap):** Dihubungkan ke Digital Pin `27` ESP32.
* **Relay (Kipas Exhaust):** Dihubungkan ke Digital Pin `13` ESP32.
* **Buzzer (Alarm Suara):** Dihubungkan ke Digital Pin `22` ESP32.
* **LED Indicator:** LED Hijau ke Pin `26` (Aman), LED Merah ke Pin `25` (Bahaya).
* **LCD I2C 16x2:** SDA ke Pin `32` dan SCL ke Pin `14`.

### Langkah Pelaksanaan SDLC (Software Development Life Cycle)
Kami menerapkan metode **Agile/Scrum** dengan tahapan:
1. **Requirement Analysis:** Mendefinisikan batas threshold aman parameter gas dan suhu.
2. **System Design:** Mendesain UI dashboard modern (gelap/glassmorphism) dan skema database MySQL.
3. **Coding & Implementation:** Menulis program C++ di Arduino IDE untuk ESP32 dan TypeScript untuk aplikasi Next.js.
4. **Testing:** Melakukan uji coba pengiriman data lokal dan simulasi kebocoran gas.

---

## 6. DOKUMEN HASIL PENGUJIAN

### Metode Pengujian
Pengujian dilakukan menggunakan metode **Black-Box Testing** pada API, verifikasi database, serta uji fungsionalitas hardware secara langsung:

| Kasus Uji | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|
| Uji Kirim Data ESP32 | ESP32 dinyalakan dan dihubungkan ke WiFi. | Data masuk ke database Aiven MySQL secara berkala (~5s). | **Lolos** |
| Uji Batas Threshold | Nilai CO2 buatan dikirim > 250 PPM. | Alarm lokal aktif (Buzzer & Relay Kipas menyala). | **Lolos** |
| Notifikasi WhatsApp | Menguji transisi status dari Aman ➔ Bahaya. | WhatsApp Gateway mengirim pesan WhatsApp peringatan instan. | **Lolos** |
| Update Profil WA | Mengisi/mengosongkan nomor WA di profil. | Perubahan nomor tersimpan di database dan pesan WA menyesuaikan. | **Lolos** |
