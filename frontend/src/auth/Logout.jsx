import React from 'react'
import { useNavigate } from 'react-router-dom'

const Logout=()=> {
    const navigate = useNavigate();

    const handleLogout = () => {
    const confirmLogout = window.confirm("Apakah kamu yakin ingin logout?");

    if (confirmLogout) {
      // Hapus token/user dari localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userId');

      // Redirect ke halaman login
      navigate('/login');
    }
  };
  
  return (
    <button onClick={handleLogout} className="logout-button">
      Logout
    </button>
  )
}

export default Logout