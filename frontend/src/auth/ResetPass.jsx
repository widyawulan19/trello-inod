import React, { useState } from 'react';
import '../style/auth/ResetPass.css';
import { SiMusicbrainz } from 'react-icons/si';
import { IoIosUnlock } from 'react-icons/io';
import { HiArrowLeft } from 'react-icons/hi2';
import { IoEye, IoEyeOff } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import BootstrapTooltip from '../components/Tooltip';
import { useSnackbar } from '../context/Snackbar';

const ResetPass = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const {showSnackbar} = useSnackbar();

  const handleToLandingPage = () => {
    navigate('/');
  };

//   const handleToLogin = () => {
//     navigate('/login');
//   };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simple validation (can be expanded later)
    if (!password || !confirmPassword) {
    //   alert('Mohon isi semua kolom password.');
      showSnackbar('Mohon isi semua kolom password', 'error');
      return;
    }

    if (password !== confirmPassword) {
    //   alert('Password dan konfirmasi tidak sama.');
      showSnackbar('Password dan konfirmasi tidak sama', 'error')
      return;
    }

    // TODO: Call API to reset password here

    // alert('Password berhasil direset!');
    showSnackbar('Password berhasil direset!', 'success')
    navigate('/login');
  };

  return (
    <div className="login-container">
      <div className="login-content-left">
        <div className="h1">
          <div className="h1-icon">
            <SiMusicbrainz />
          </div>
          <h1>Hai, Kreator! <br />Selamat datang di Indo Studio Management</h1>
        </div>

        <h4>Kelola proyek musik dan produksi dengan lebih rapi dan terorganisir</h4>
        <p>
          Satu tempat untuk mengatur project, revisi, deadline, dan kolaborasi tim — semua dalam satu platform.
        </p>

        <div className="btn-lp" onClick={handleToLandingPage}>
          <HiArrowLeft />
          <h3>Landing Page</h3>
        </div>
      </div>

      <div className="login-content-right">
        <form className="content-box" onSubmit={handleSubmit}>
          <div className="ress-logo">
            <div className="logo-box">
              <IoIosUnlock size={50} />
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
              <label>
                Password Baru
                <span className="required">*</span>
              </label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password baru"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  name="newPassword"
                />
                <BootstrapTooltip title={showPassword ? 'Sembunyikan Password' : 'Tampilkan Password'} placement="top">
                  <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <IoEyeOff /> : <IoEye />}
                  </span>
                </BootstrapTooltip>
              </div>
            </div>

            <div className="regis-input">
              <label>
                Konfirmasi Password
                <span className="required">*</span>
              </label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ulangi password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  name="confirmPassword"
                />
                <BootstrapTooltip title={showPassword ? 'Sembunyikan Password' : 'Tampilkan Password'} placement="top">
                  <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <IoEyeOff /> : <IoEye />}
                  </span>
                </BootstrapTooltip>
              </div>
            </div>
          </div>

          <button type="submit" className="btn-login">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPass;
