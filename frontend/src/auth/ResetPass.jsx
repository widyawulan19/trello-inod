import React, { useState } from 'react';
import '../style/auth/ResetPass.css';
import { SiMusicbrainz } from 'react-icons/si';
import { IoIosUnlock } from 'react-icons/io';
import { HiArrowLeft } from 'react-icons/hi2';
import { IoEye, IoEyeOff } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import BootstrapTooltip from '../components/Tooltip';
import { useSnackbar } from '../context/Snackbar';
import { resetNewPassword } from '../services/ApiServices';

const ResetPass = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const [email, setEmail] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleToLandingPage = () => navigate('/');

  const handleToLogin = () =>{
    navigate('/login')
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi input
    if (!email || !securityQuestion || !securityAnswer || !password || !confirmPassword) {
      showSnackbar('Mohon isi semua kolom yang diperlukan', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showSnackbar('Password dan konfirmasi tidak sama', 'error');
      return;
    }

    try {
      // Kirim permintaan reset ke backend
      await resetNewPassword({
        email,
        security_question: securityQuestion,
        security_answer: securityAnswer,
        new_password: password,
      });

      showSnackbar('Password berhasil direset!', 'success');
      navigate('/login');
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || err.response?.data?.message || 'Gagal reset password';
      showSnackbar(errorMsg, 'error');
    }
  };

  return (
    <div className='login-container'>
      <div className="login-content-left">
        <div className="h1">
          <div className="h1-icon">
            <SiMusicbrainz />
          </div>
          <h1>Hai, Kreator! <br />Selamat datang di Indo Studio Management</h1>
        </div>

        <h4>Kelola proyek musik dan produksi dengan lebih rapi dan terorganisir</h4>
        <p>Satu tempat untuk mengatur project, revisi, deadline, dan kolaborasi tim — semua dalam satu platform.</p>

        <div className="btn-lp" onClick={handleToLandingPage}>
          <HiArrowLeft />
          <h3>Landing Page</h3>
        </div>
      </div>

      <div className="reset-content-right">
        <form className="content-box" onSubmit={handleSubmit}>
          <div className="ress-logo">
            <div className="logo-box">
              <IoIosUnlock size={20} className='box-icon' />
            </div>
          </div>

          <div className="box-title">
            <h2>Reset Password</h2>
            <p className="sub-p">
              Masukkan password baru yang kuat dan pastikan kamu mengingatnya dengan baik.
            </p>
          </div>

          <div className="box-input">
            <div className="regis-input">
              <label>Email <span className="required">*</span></label>
              <input
                type="email"
                placeholder="Masukkan email kamu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="regis-input">
              <label>Pertanyaan Keamanan <span className="required">*</span></label>
              <input
                type="text"
                placeholder="Contoh: Apa nama hewan peliharaan pertamamu?"
                value={securityQuestion}
                onChange={(e) => setSecurityQuestion(e.target.value)}
              />
            </div>

            <div className="regis-input">
              <label>Jawaban Keamanan <span className="required">*</span></label>
              <input
                type="text"
                placeholder="Jawaban dari pertanyaan keamanan"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
              />
            </div>

            <div className="regis-input-pass">
              <label>Password Baru <span className="required">*</span></label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password baru"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ margin: '0px' }}
                />
                <BootstrapTooltip
                  title={showPassword ? 'Sembunyikan Password' : 'Tampilkan Password'}
                  placement="top"
                >
                  <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <IoEyeOff /> : <IoEye />}
                  </span>
                </BootstrapTooltip>
              </div>
            </div>

            <div className="regis-input-pass">
              <label>Konfirmasi Password <span className="required">*</span></label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ulangi password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <BootstrapTooltip
                  title={showPassword ? 'Sembunyikan Password' : 'Tampilkan Password'}
                  placement="top"
                >
                  <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <IoEyeOff /> : <IoEye />}
                  </span>
                </BootstrapTooltip>
              </div>
            </div>
          </div>

          <button type="submit" className="btn-reset">
            Reset Password
          </button>

          <p>Back to <span className='span' onClick={handleToLogin}>Login</span></p>
        </form>
      </div>
    </div>
  );
};

export default ResetPass;
