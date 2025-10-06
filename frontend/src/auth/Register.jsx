import React, { useState } from 'react';
import '../style/auth/Register.css';
import { SiMusicbrainz } from "react-icons/si";
import { IoEye, IoEyeOff, IoCreate } from "react-icons/io5";
import { HiArrowLeft } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import BootstrapTooltip from '../components/Tooltip';
import { registerUser } from '../services/ApiServices';
import { useSnackbar } from '../context/Snackbar';

const Register = () => {
  const navigate = useNavigate();
  const {showSnackbar} = useSnackbar();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleToLandingPage = () => navigate('/');
  const handleToLogin = () => navigate('/login');

  const handleRegister = async () => {
    try {
      const payload = {
        username,
        email,
        password,
        security_question: securityQuestion,
        security_answer: securityAnswer,
      };

      await registerUser(payload); // ✅ Pakai service API
      // alert('Registrasi berhasil!');
      showSnackbar('Registrasi berhasil bestie 🫡', 'success');
      navigate('/login');
    } catch (err) {
      // alert('Registrasi gagal. Coba lagi ya bestie.');
      showSnackbar('Registrasi gagal. Coba lagi ya bestie 🥲 ', 'error')
    }
  };

  return (
    <div className='register-container'>
      <div className="register-content-left">
        <div className="h1">
          <div className="h1-icon"><SiMusicbrainz /></div>
          <h1>Hai, Kreator! <br />Selamat Datang di Indo Studio Management</h1>
        </div>
        <h4>Kelola Proyek Musik dan Produksi dengan Lebih Rapi dan Terorganisir</h4>
        <p>Satu tempat untuk ngatur project, revisi, deadline, dan kolaborasi tim — semua dalam satu papan website.</p>
        <div className="btn-lp" onClick={handleToLandingPage}>
          <HiArrowLeft />
          <h3>Landing Page</h3>
        </div>
      </div>

      <div className="register-content-right">
        <div className="content-box">
          <div className="box-right">
            <div className="box-title">
              <div className="title-logo">
                <IoCreate className='logo-icon'/>
              </div>
              <h2 >Create an Account</h2>
              <p className='sub-p'>Bergabung dan Mulai Kolaborasi Lebih Mudah</p>
            </div>

            <div className="regis-box-input">
              <div className="regis-input">
                <label>Username <span style={{ color: 'red' }}>*</span></label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
              </div>

              <div className="regis-input">
                <label>Email <span style={{ color: 'red' }}>*</span></label>
                <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" />
              </div>

              <div className="regis-input">
                <label>Password <span style={{ color: 'red' }}>*</span></label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                  />
                  <BootstrapTooltip title={showPassword ? 'Hide Password' : 'Show Password'} placement='top'>
                    <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <IoEyeOff /> : <IoEye />}
                    </span>
                  </BootstrapTooltip>
                </div>
              </div>

              <div className="regis-input">
                <label>Pertanyaan Keamanan <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  value={securityQuestion}
                  onChange={(e) => setSecurityQuestion(e.target.value)}
                  placeholder="Contoh: Apa nama hewan peliharaan pertamamu?"
                />
              </div>

              <div className="regis-input">
                <label>Jawaban Keamanan <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  placeholder="Jawaban dari pertanyaan di atas"
                />
              </div>
          </div>
         

            <div className="regis-check-btn" style={{margin:'0px'}}>
              <div className="check-box">
                <input type="checkbox" />
                <p>
                  Saya menyetujui <span style={{ color: '#6a11cb', fontWeight: 'bold' }}>syarat & ketentuan</span>
                </p>
              </div>
              <div className="regs-btn" onClick={handleRegister}>
                Sign Up
              </div>
            </div>

          <div className="box-footer">
            <h5>Already have an account? <span onClick={handleToLogin}>Sign In</span></h5>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
