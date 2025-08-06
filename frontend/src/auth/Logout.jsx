import React from 'react'
import { useNavigate } from 'react-router-dom'
import { IoMdLogOut } from "react-icons/io";

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
      onClick={handleLogout}
      style={{
        color:'red',
        fontSize: 16,
        fontWeight:'bold',
        padding: '10px 20px',
        border:'1px solid red',
        borderRadius:'8px',
        cursor:'pointer',
        backgroundColor:'#f7bfbf',
        display:'flex',
        alignItems:'center',
        justifyContent:'center'
      }}
    >
      <IoMdLogOut size={20} style={{marginRight: 10}} />
      Logout
    </button>
  )
}

export default Logout