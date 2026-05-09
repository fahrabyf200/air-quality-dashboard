About This Project
Baik! Berdasarkan struktur dan fitur dari aplikasi Air Quality Dashboard ini, berikut adalah penjelasan mengenai fungsi dari masing-masing halaman:

### 1. 📊 Dashboard (Beranda Utama)
**Fungsi:** Sebagai pusat kontrol dan ringkasan utama (overview) saat pengguna pertama kali masuk.
* **Yang ditampilkan:** Biasanya halaman ini menampilkan status udara saat ini (real-time) secara sekilas. Menampilkan indikator angka secara langsung (misalnya CO₂, NH₃, Suhu, Kelembapan terbaru), status alat apakah online/offline, dan mungkin grafik singkat atau notifikasi jika ada gas beracun yang bocor.
* **Tujuan:** Agar pengguna bisa langsung mengetahui "Apakah udara di dapur saat ini aman atau bahaya?" hanya dalam hitungan detik tanpa perlu membaca data yang rumit.

### 2. 📡 Monitoring (Pemantauan Data)
**Fungsi:** Sebagai buku log (catatan) yang berisi daftar riwayat seluruh data mentah yang masuk dari sensor.
* **Yang ditampilkan:** Halaman ini menampilkan **Tabel Data** yang sangat detail dan berurutan berdasarkan waktu (Timestamp). Setiap baris berisi data spesifik (Suhu, Kelembapan, CO₂, NH₃) dan statusnya (Safe/Danger). Halaman ini juga dilengkapi fitur *pagination* (halaman 1, 2, 3...) untuk melihat data lama.
* **Tujuan:** Digunakan untuk observasi mendalam, investigasi, atau melacak riwayat. Misalnya, jika Anda ingin tahu, *"Jam 14:00 kemarin suhu ruangannya berapa derajat ya?"*, Anda mencarinya di halaman ini.

### 3. 📈 Report (Laporan & Analisis)
**Fungsi:** Sebagai pusat analisis, statistik, dan rangkuman data untuk evaluasi performa lingkungan.
* **Yang ditampilkan:** Bukan lagi data per baris, melainkan hasil olahan data seperti: Rata-rata (Average), Nilai Tertinggi (Max), Persentase Keamanan (*Safe Rate*), dan perbandingan apakah rata-rata ruangan melebihi ambang batas (*Threshold*). Halaman ini juga dilengkapi dengan **Grafik Batang (Chart)** untuk melihat tren waktu ke waktu.
* **Tujuan:** Digunakan untuk pelaporan harian/mingguan/bulanan. Sangat berguna untuk mengambil keputusan. Misalnya dari grafik dan rata-rata, pengguna bisa menyimpulkan *"Ternyata setiap jam 12 siang sampai jam 2 siang, kadar CO₂ selalu naik drastis, mungkin ventilasi harus dibuka pada jam tersebut."*

### 4. 👤 Profile (Profil Pengguna)
**Fungsi:** Sebagai tempat pengaturan akun dan preferensi aplikasi bagi pengguna.
* **Yang ditampilkan:** Informasi data diri pengguna (seperti Nama, Email, Foto Profil), pengaturan keamanan (Ubah Password), dan juga pengaturan tampilan aplikasi (misalnya pengaturan *Dark Mode* atau *Light Mode*).
* **Tujuan:** Untuk mengelola identitas siapa yang sedang mengakses dashboard dan memberikan personalisasi pengalaman pengguna agar lebih nyaman saat menggunakan aplikasi.

Singkatnya:
* **Dashboard:** "Bagaimana kondisi saat ini?"
* **Monitoring:** "Apa saja data yang tercatat dari tadi?"
* **Report:** "Bagaimana kesimpulan dan tren datanya secara keseluruhan?"
* **Profile:** "Pengaturan akun saya."