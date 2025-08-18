# Inod Trello Management 🗂️

Sebuah aplikasi **Trello-like** yang dibuat untuk **Inod Studio** untuk membantu manajemen proyek, mengatur alur pemesanan hingga project selesai, dan kolaborasi tim secara efisien.

## 🎯 Tujuan Project
Project ini dibuat untuk memenuhi kebutuhan manajemen proyek internal untuk Inod Studio, agar tim dapat mengatur, memantau, dan menyelesaikan proyek dengan lebih terstruktur dan cepat.

---

## 🚀 Fitur Unggulan

- **Workspace & Boards:** Buat workspace dan board untuk tiap tim/proyek.
- **Lists & Cards:** Organisasi tugas dengan lists dan cards seperti Trello.
- **Drag & Drop:** Geser cards antar lists dengan mudah.
- **Card Details:** Tambah deskripsi, file, label, deadline, dan komentar.
- **Login & Member Management:** Otentikasi pengguna & manajemen anggota board.
- **Labeling System:** Warna dan nama label untuk memudahkan identifikasi.
- **Responsive UI:** Bisa diakses dengan nyaman di desktop dan mobile.
- **Log Aktivitas Pengguna:** Catat aktivitas setiap pengguna untuk audit dan monitoring.
- **Data Pemesanan:** Tabel khusus untuk menyimpan semua data pemesanan/project order.
- **Jadwal Karyawan:** Fitur untuk mengatur jadwal shift dan tugas karyawan.
- **Daftar Karyawan:** Tabel yang menampilkan seluruh daftar karyawan lengkap dengan informasi penting.


---

## 🛠️ Teknologi

### Frontend
- **React.js** + **Tailwind CSS** untuk UI modern dan responsive.
- **Redux & Context API:** Mengelola state global untuk lists, cards, labels, dan user authentication secara efisien.
- **React Icons** untuk ikon-ikon interaktif.

### Backend
- **Node.js & Express:** Menyediakan RESTful API untuk CRUD operations.
- **PostgreSQL:** Menyimpan data workspace, boards, lists, cards, labels, dan komentar.
- **CORS & Middleware:** Mengatur komunikasi antara frontend dan backend dengan aman.

### Deployment

- **Railway:** Backend -> https://inod-backend.up.railway.app
- **Vercel:** Frontend -> https://inodstudiomanagement.vercel.app

---

## ⚡ Instalasi & Running

```bash
# Clone repository
git clone https://github.com/username/inod-trello.git
cd inod-trello

# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
npm install
npm run dev

```

---


