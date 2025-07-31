import React, { useState } from 'react';
import '../style/auth/Login.css';
import { SiMusicbrainz } from "react-icons/si";
import { FcGoogle } from "react-icons/fc";
import { IoLogoApple } from "react-icons/io5";
import { HiArrowLeft } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/ApiServices';
import { useUser } from '../context/UserContext';
import { useSnackbar } from '../context/Snackbar';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import BootstrapTooltip from '../components/Tooltip';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // ✅ Tambahkan state ini
    const { setUser } = useUser();
    const { showSnackbar } = useSnackbar();

    const handleToLandingPage = () => {
        navigate('/');
    };

    const handleToRegister = () => {
        navigate('/register');
    };

    const handleToReqRes = () => {
        navigate('/req-reset');
    };

    const handleLogin = async () => {
        try {
            const response = await loginUser({ email, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setUser(response.data.user);
            // showSnackbar('Login Success', 'success');
            navigate('/layout');
        } catch (error) {
            console.error('Login failed:', error.response?.data?.message || error.message);
            showSnackbar('Login gagal. Coba lagi', 'error');
        }
    };

    return (
        <div className='login-container'>
            <div className="login-content-left">
                <div className="h1">
                    <div className="h1-icon">
                        <SiMusicbrainz />
                    </div>
                    <h1>Hai, Kreator! <br />Selamat Datang di Indo Studio Management</h1>
                </div>
                <h4>Kelola Proyek Musik dan Produksi dengan Lebih Rapi dan Terorganisir</h4>
                <p>Satu tempat untuk ngatur project, revisi, deadline, dan kolaborasi tim — semua dalam satu papan website.</p>
                <div className="btn-lp" onClick={handleToLandingPage}>
                    <HiArrowLeft />
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
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <div className="password-wrapper">
                            <input
                                type={showPassword ? "text" : "password"} // ✅ Tipe dinamis
                                placeholder='Password'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <BootstrapTooltip title={showPassword ? 'Hide password': 'Show password'} placement='top'>
                            <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                            </span>
                            </BootstrapTooltip>
                        </div>

                        <p onClick={handleToReqRes}>Forgot Password ?</p>
                        <div className="btn-login" onClick={handleLogin}>Login</div>
                    </div>

                    <div className="another-login">
                        <div className="google">
                            <FcGoogle />
                            Google
                        </div>
                        <div className="ios">
                            <IoLogoApple />
                            Apple ID
                        </div>
                    </div>

                    <div className="box-footer">
                        <h5>Don't have an account? <span onClick={handleToRegister}>Sign Up</span></h5>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
