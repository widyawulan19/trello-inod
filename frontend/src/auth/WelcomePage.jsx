import React from 'react'
import { useNavigate } from 'react-router-dom';
import '../style/auth/Welcome.css';
import { SiMusicbrainz } from "react-icons/si";
import { HiArrowLeft } from 'react-icons/hi2';

const WelcomePage=()=> {

    const navigate = useNavigate();

    const handleToLandingPage = () => {
        navigate('/');
    };

    const handleToLogin = () =>{
        navigate('/login')
    }

  return (
    <div className="welcome-container">
        <div className="welcome-content-left">
            <div className="h1">
                <div className="h1-icon">
                    <SiMusicbrainz />
                </div>
                <h1>Hai, Bestie! <br />Selamat Datang di Indo Studio Management</h1>
            </div>
            <h4>Kelola Proyek Musik dan Produksi dengan Lebih Rapi dan Terorganisir</h4>
            <p>Satu tempat untuk ngatur project, revisi, deadline, dan kolaborasi tim — semua dalam satu papan website.</p>
            
            <div className="btn-welcome" >
                <div className="btn-login" onClick={handleToLandingPage}>
                    <HiArrowLeft />
                    <h3>Landing Page</h3>
                </div>
                <div className="btn-start" onClick={handleToLogin}>
                    <h3>Get Started</h3>
                </div>
            </div>
        </div>
    </div>
  )
}

export default WelcomePage