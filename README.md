# Inod Trello Management 🗂️

Sebuah aplikasi **Trello-like** yang dibuat untuk **Inod Studio** untuk membantu manajemen proyek, mengatur alur pemesanan hingga project selesai, dan kolaborasi tim secara efisien.

## 🎯 Tujuan Project
Project ini dibuat untuk memenuhi kebutuhan manajemen proyek internal untuk Inod Studio, agar tim dapat mengatur, memantau, dan menyelesaikan proyek dengan lebih terstruktur dan cepat.

---

## 🚀 Fitur

- **Workspace & Boards:** Buat workspace dan board untuk tiap tim/proyek.
- **Lists & Cards:** Organisasi tugas dengan lists dan cards seperti Trello.
- **Card Details:** Tambahkan deskripsi, file, label, deadline, dan komentar.
- **Drag & Drop:** Pindahkan cards antar lists dengan mudah.
- **Login & Member Management:** Otentikasi pengguna dan manajemen anggota board.
- **Labeling System:** Beri warna dan nama untuk tiap label agar mudah diidentifikasi.
- **Responsive UI:** Bisa diakses dengan nyaman dari desktop maupun mobile.

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


- **Deployment:** Railway (backend) dan Vercel (frontend)

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
