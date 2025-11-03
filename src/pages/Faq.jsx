import React, { useState } from 'react';
import '../style/pages/Faq.css'
import { BsQuestionLg } from "react-icons/bs";

const faqs = [
  {
    question: "1. Apa itu aplikasi manajemen tugas ini?",
    answer: "Ini adalah aplikasi manajemen tugas mirip Trello yang memungkinkan Anda membuat papan, daftar, dan kartu untuk mengatur pekerjaan atau proyek Anda.",
  },
  {
    question: "2. Bagaimana cara membuat sebuah board?",
    answer: "Anda bisa klik tombol 'Buat Board' di halaman utama dan masukkan nama board serta detail lainnya.",
  },
  {
    question: "3. Apa itu List dan Card?",
    answer: "List digunakan untuk mengelompokkan tugas berdasarkan status atau kategori. Card merepresentasikan satu tugas atau item yang bisa dipindahkan antar list.",
  },
  {
    question: "4. Apakah saya bisa menambahkan anggota ke board?",
    answer: "Ya, Anda bisa menambahkan anggota ke dalam board untuk berkolaborasi dalam proyek.",
  },
  {
    question: "5. Bagaimana cara menetapkan tenggat waktu pada kartu?",
    answer: "Buka detail kartu, lalu isi kolom 'Deadline' untuk menetapkan tenggat waktu.",
  },
  {
    question: "6. Apakah saya bisa memberi label warna pada kartu?",
    answer: "Ya, Anda bisa menambahkan label berwarna dan teks untuk membantu mengkategorikan kartu.",
  },
  {
    question: "7. Bagaimana cara memindahkan kartu antar list?",
    answer: "Anda dapat menyeret (drag) dan menjatuhkan (drop) kartu ke list yang diinginkan.",
  },
  {
    question: "8. Apakah aplikasi ini bisa digunakan di ponsel?",
    answer: "Aplikasi ini responsif dan bisa diakses melalui browser ponsel.",
  },
  {
    question: "9. Bagaimana menyimpan perubahan pada kartu?",
    answer: "Setiap perubahan akan disimpan secara otomatis atau setelah menekan tombol 'Simpan'.",
  },
  {
    question: "10. Apakah data saya aman?",
    answer: "Kami menjaga keamanan data dengan standar enkripsi dan autentikasi pengguna.",
  },
];

const Faq = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="faq-container">
        <div className="faq-header">
            <div className="faq-left">
                <div className="header-icon">
                    <BsQuestionLg/>
                </div>
                <h2> Frequently Asked Questions (FAQ)</h2>
            </div>
            <p>Kami bantu kamu lebih cepat memahami fitur, kendala umum, hingga tips produktivitas terbaik 💼🚀</p>
        </div>
        
        <div className="faq-main-content">
            {faqs.map((faq, index) => (
                <div key={index} className="faq-item">
                    <button onClick={() => toggleFAQ(index)}>
                        {faq.question}
                    </button>
                {activeIndex === index && (
                    <p className='answer-box'>{faq.answer}</p>
                )}
                </div>
            ))}
        </div>
    </div>
  );
};

export default Faq;
