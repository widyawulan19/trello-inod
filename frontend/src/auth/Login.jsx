import React, { useState } from 'react'
import '../style/auth/Login.css'
import { SiMusicbrainz } from "react-icons/si";
import { FcGoogle } from "react-icons/fc";
import { IoLogoApple } from "react-icons/io5";
import { HiArrowLeft, HiOutlineArrowLeft } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/ApiServices';
import { useUser } from '../context/UserContext';

const Login=()=> {
    //STATE
    const navigate = useNavigate()
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const {setUser} = useUser() 

    //FUNCTION
    const handleToLandingPage = () =>{
        navigate('/landing-page');
    }

    const handleToRegister = () =>{
        navigate('/register')
    }

    const handleToReqRes = () =>{
        navigate('/req-reset')
    }

    const handleLogin = async () => {
        try {
            const response = await loginUser({ email, password });
            console.log('Login success:', response.data);

            // Simpan token dan user ke localStorage (atau state management)
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));


            setUser(response.data.user);

            // Navigasi ke halaman utama/dashboard
            navigate('/'); // ganti sesuai rute utama kamu
        } catch (error) {
            console.error('Login failed:', error.response?.data?.message || error.message);
            alert(error.response?.data?.message || 'Login gagal. Coba lagi.');
        }
    };



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
                <div className="box-title">
                    <h2>Welcome Back</h2>
                    <p className='sub-p'>Silakan login untuk melanjutkan produktivitasmu!</p>
                </div>
                <div className="box-input">
                    <input 
                        type="text" 
                        placeholder='Email'
                        value={email}
                        onChange={(e)=> setEmail(e.target.value)}
                    />
                    <input 
                        type="text" 
                        placeholder='Password'
                        value={password}
                        onChange={(e)=> setPassword(e.target.value)}
                    />
                    <p onClick={handleToReqRes}>Forgot Password ?</p>
                    <div className="btn-login" onClick={handleLogin}>
                        Login
                    </div>
                </div>
                <div className="another-login">
                    <div className="google">
                        <FcGoogle/>
                        Google
                    </div>
                    <div className="ios">
                        <IoLogoApple/>
                        Apple ID
                    </div>
                </div>
                <div className="box-footer">
                    <h5>Don't have an account? <span onClick={handleToRegister}>Sign Up</span></h5>
                </div>
                
            </div>

        </div>
    </div>
  )
}

export default Login