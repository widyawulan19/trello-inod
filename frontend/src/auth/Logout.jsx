import React from 'react'
import { useNavigate } from 'react-router-dom'
import { IoMdLogOut } from "react-icons/io";
import '../style/pages/Profile.css'

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
    <button 
      className='logout-button'
      onClick={handleLogout}>
      <IoMdLogOut size={20} style={{marginRight: 10}} />
      Logout
    </button>
  )
}

export default Logout