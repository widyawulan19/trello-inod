import React, { useState } from 'react'
import '../style/auth/Register.css'
import { SiMusicbrainz } from "react-icons/si";
import { FcGoogle } from "react-icons/fc";
import { IoEye,IoEyeOff } from "react-icons/io5";
import { HiArrowLeft, HiOutlineArrowLeft } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import BootstrapTooltip from '../components/Tooltip';


const Register=()=> {
    //STATE
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)


    //FUNCTION
    const handleToLandingPage = () =>{
        navigate('/');
    }

    const handleToLogin = () =>{
        navigate('/login')
    }


  return (
    <div className='register-container'>
        <div className="register-content-left">
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
        <div className="register-content-right">
            <div className="content-box">
                <div className="box-title">
                    <h2>Create an Account</h2>
                    <p className='sub-p'>Bergabung dan Mulai Kolaborasi Lebih Mudah</p>
                </div>
                <div className="box-input">
                    <div className="regis-input">
                        <label>Username <span style={{color:'red', marginLeft:'5px', fontSize:'15px'}}>*</span></label>
                        <input 
                            type="text" 
                            placeholder='Username'
                        />
                    </div>
                    <div className="regis-input">
                        <label>Email <span style={{color:'red', marginLeft:'5px', fontSize:'15px'}}>*</span></label>
                        <input 
                            type="text" 
                            placeholder='Email Addres'
                        />
                    </div>
                    <div className="regis-input">
                        <label>
                            Password 
                            <span style={{color:'red', marginLeft:'5px', fontSize:'15px'}}>*</span>
                        </label>
                        <div className="password-wrapper">
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                placeholder='Password'
                            />
                            <BootstrapTooltip title= {showPassword? 'Hide Password' : 'Show Password'} placement='top'>
                            <span 
                                className="toggle-password" 
                                onClick={() => setShowPassword(!showPassword)}
                            >
                            {showPassword ? <IoEyeOff /> : <IoEye />}
                            </span>
                            </BootstrapTooltip>
                        </div>
                    </div>

                </div>

                <div className="regis-check-btn">
                    <div className="check-box">
                        <input type="checkbox" />
                        <p>
                            Saya menyetujui <span style={{color:'#6a11cb', fontWeight:'bold'}}> syarat & ketentuan </span> 
                        </p>
                    </div>
                    <div className="regs-btn">
                        Sign Up
                    </div>
                </div>

                <div className="box-footer">
                    <h5>Already have an account? <span onClick={handleToLogin}>Sign In</span></h5>
                </div>
                
            </div>

        </div>
    </div>
  )
}

export default Register