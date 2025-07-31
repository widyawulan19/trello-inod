import React from 'react'
import '../style/auth/ResetPass.css'
import { SiMusicbrainz } from "react-icons/si";
import { IoIosUnlock } from "react-icons/io";
import { HiArrowLeft, HiOutlineArrowLeft } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';

const RequestPass=()=> {
    //STATE
    const navigate = useNavigate()

    //FUNCTION
    const handleToLandingPage = () =>{
        navigate('/');
    }

    //untuk sementara (develop)
    const handleToReset = () =>{
        navigate('/reset-pass')
    }


  return (
    <div className='login-container'>
        <div className="login-content-left">
            <div className="h1">
                <div className="h1-icon">
                    <SiMusicbrainz/>
                </div>
                <h1>Hai, Kreator! <br />Selamat Datang di Indo Studio Management</h1>
            </div>
            
            <h4>Kelola Proyek Musik dan Produksi dengan Lebih Rapi dan Terorganisir</h4>
            <p>Satu tempat untuk ngatur project, revisi, deadline, dan kolaborasi tim — semua dalam satu papan website.</p>
            <div className="btn-lp" onClick={handleToLandingPage}>
                <HiArrowLeft/>
                <h3>Landing Page</h3>
            </div>
        </div>
        <div className="login-content-right">
            <div className="content-box">
                <div className="ress-logo">
                    <div className="logo-box">
                        <IoIosUnlock size={50}/>
                    </div>
                </div>
                <div className="box-title">
                    <h2>Lupa Password?</h2>
                    <p className='sub-p'>Masukkan email yang kamu gunakan saat mendaftar. Kami akan mengirimkan tautan untuk mengatur ulang passwordmu.</p>
                </div>
                <div className="box-input">
                    <label>Email <span style={{color:'red', marginLeft:'5px', fontSize:'15px'}}>*</span></label>
                    <input 
                        type="text" 
                        placeholder='Email Addres'
                    />
                </div>
                <div className="btn-login" onClick={handleToReset}>
                    Kirim Link Reset Password
                </div> 
            </div>
        </div>
    </div>
  )
}

export default RequestPass