Merdeka Exam Generator 🇮🇩

Aplikasi web modern untuk menghasilkan Soal Ujian (STS/SAS/SAT) dan Kuis Interaktif berbasis Kurikulum Merdeka untuk SD (Kelas 1-6).

Fitur Utama:

Generator Soal PDF: Menghasilkan soal Pilihan Ganda, Isian, dan Uraian secara acak lengkap dengan Kunci Jawaban.

Quiz Mode: Latihan interaktif untuk siswa dengan timer dan scoring otomatis.

Bank Soal: JSON schema yang mudah dikustomisasi.

100% Client-Side: Tidak perlu database backend, sangat cepat dan aman.

🛠️ Cara Menjalankan di Komputer Lokal

Pastikan Node.js terinstall: (Minimal versi 16+).

Download/Clone Folder ini.

Buka Terminal di dalam folder project.

Install Dependencies:

npm install


Jalankan Aplikasi:

npm run dev


Buka browser di alamat yang muncul (biasanya http://localhost:5173).

🚀 Cara Deploy ke Netlify (Gratis & Mudah)

Anda bisa meng-online-kan aplikasi ini dalam waktu kurang dari 5 menit.

Langkah 1: Push ke GitHub

Buat repository baru di GitHub.

Upload semua file project ini ke repository tersebut.

Langkah 2: Setup Netlify

Buka Netlify dan Login/Daftar.

Klik "Add new site" -> "Import from Git".

Pilih GitHub dan cari repository yang baru Anda buat.

Langkah 3: Konfigurasi Build (Penting!)

Netlify biasanya akan mendeteksi otomatis, tapi pastikan settingannya seperti ini:

Build Command: npm run build

Publish Directory: dist

Langkah 4: Deploy

Klik "Deploy Site".

Tunggu sekitar 1-2 menit. Netlify akan memberikan URL (misal: merdeka-exam.netlify.app).

Selesai! Aplikasi Anda sudah bisa diakses oleh guru-guru lain.

📚 Struktur Data Soal

Untuk menambah soal, edit file src/App.jsx pada bagian RAW_BANK_SOAL.
Format JSON:

{
  "id": "unik-id",
  "class": "1",
  "subject": "Matematika",
  "type": "pg", // opsi: pg, isian, uraian
  "question": "Pertanyaan...",
  "options": ["A", "B", "C", "D"], // hanya untuk pg
  "answer": "Kunci Jawaban",
  "competency": "Keterangan CP/TP"
}


Troubleshooting

Error saat build? Pastikan file package.json dan src/App.jsx sudah tersimpan dengan benar.

PDF Kosong? Aplikasi menggunakan jsPDF yang memproses font standar. Untuk karakter khusus (simbol matematika rumit), disarankan menggunakan gambar dalam soal atau deskripsi teks.