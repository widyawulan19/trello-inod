import React, { useEffect, useRef, useState } from 'react'
import '../style/landingpage/MainLp.css'
import heroPic from '../assets/hero1.jpg'
import iconPic from '../assets/lpicon.png'
import DATALP from '../landingpage/DATALP'
import { IoSwapVerticalSharp, IoPeople , IoBarChart, IoCogOutline, IoPhonePortrait, IoArrowUp} from "react-icons/io5";
import { AiFillCopyrightCircle } from "react-icons/ai";


const MainLp = () => {
  //STATE
  const [showScroll, setShowScroll] = useState(false);

  // Refs untuk navigasi
  const section1Ref = useRef(null);
  const section2Ref = useRef(null);
  const section3Ref = useRef(null);


  //FUNCTION 
  const icons = {
    IoSwapVerticalSharp: <IoSwapVerticalSharp />,
    IoPeople: <IoPeople />,
    IoBarChart: <IoBarChart />,
    IoCogOutline: <IoCogOutline />,
    IoPhonePortrait: <IoPhonePortrait />,
  }

  // Fungsi scroll ke section
  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fungsi scroll ke atas
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      if (section2Ref.current) {
        const section2Top = section2Ref.current.offsetTop;
        if (window.scrollY >= section2Top - 100) {
          setShowScroll(true);
        } else {
          setShowScroll(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className='lp-container'>
      {/* header  */}
      <div className="lp-header">
        <div className="header-container">
          <div className="lp-logo">
            <h2 onClick={()=> scrollToSection(section1Ref)}>InodStudio Management</h2>
          </div>
          <div className="lp-btn">
            <button onClick={() => scrollToSection(section2Ref)}>Features</button>
            <button onClick={() => scrollToSection(section3Ref)}>About</button>
            <button className='start-btn'>Get Started</button>
          </div>
        </div>
      </div>

      {/* CONTEN  */}
      <div className="lp-content">

        {/* SECTION 1  */}
        <div className="section1" ref={section1Ref}>
          <div className="hero-left">
            <h1 className="headline">
              Streamline Your Team's <span className="gradient-text">Productivity</span>
            </h1>
            <p className="subheading">
              Transform chaos into clarity with TaskFlow's intuitive task management platform. Collaborate seamlessly, track progress effortlessly, and achieve more together.
            </p>
            <div className="hero-btn">
              <button className='start-btn' onClick={() => scrollToSection(section3Ref)}>Get Started</button>
              <button onClick={() => scrollToSection(section2Ref)}>View Documentation</button>
            </div>
          </div>
          <div className="hero-right">
            <img src={heroPic} alt="hero pic section 1" />
          </div>
        </div>
        {/* END SECTION 1  */}

        {/* SECTION 2  */}
        <div className="section2" ref={section2Ref}>
          <div className="sec-top">
            <h2>Everything You Need to Stay Organized</h2>
            <p className="subheading">
              Powerful features designed to help teams of all sizes work more efficiently and achieve their goals faster.
            </p>
          </div>
          <div className="sec-btm">
            {DATALP.map((data) => {
              const icon = icons[data.icon];
              return (
                <div key={data.id} className="feature-item">
                  <div className="feature-icon" style={{ backgroundColor: data.color, border: `1px solid ${data.color}` }}>
                    {icon}
                  </div>
                  <h3>{data.title}</h3>
                  <p>{data.description}</p>
                </div>
              )
            })}
          </div>
        </div>
        {/* END SECTION 2  */}

        {/* SECTION 3  */}
        <div className="section3" ref={section3Ref}>
          <div className="sec3-left">
            <h1 className="headline">
              Satu Platform untuk Kelola Pesanan Musik & Data Karyawan dengan Mudah
            </h1>
            <h2 className="subheading">
              Website manajemen berbasis Trello untuk kontrol penuh pada penjualan, produksi, dan tim Anda.
            </h2>
            <p>
              Inod Studio tidak hanya menciptakan musik berkualitas, tetapi juga menghadirkan platform manajemen modern yang membantu Anda memantau seluruh pesanan musik, progres produksi, hingga laporan penjualan dalam satu dashboard intuitif.
            </p>
            <p>
              Dengan tampilan interaktif, website ini memudahkan pengaturan tugas, manajemen karyawan, serta komunikasi antar tim. Semua data tersusun rapi, transparan, dan siap mendukung kinerja perusahaan Anda dengan lebih efisien.
            </p>
            <div className="sec3-info">
              <div className='info-box'>
                <h1>100K</h1>
                <p>Music Sale Worldwide</p>
              </div>
              <div className='info-box'>
                <h1>5K</h1>
                <p>Design Sale Worldwide</p>
              </div>
              <div className='info-box'>
                <h1>150+</h1>
                <p>Talented Employees</p>
              </div>
            </div>
          </div>
          <div className="sec3-img">
            <img src={iconPic} alt="hero pic section 1" />
          </div>
        </div>
        {/* END SECTION 3  */}

        {/* FOOTER SECTION  */}
        <div className="footer">
          <div className="footer-container">
            <div className="fc-box">
              <h3>InodStudio Management</h3>
              <p>Streamline your team's productivity with the task management platform build for modern collaboration</p>
            </div>

            <div className="fc-box1">
              <div className="fc-box2">
                <h3>Product</h3>
                <div className="box-isi">
                  <p>Features</p>
                  <p>Pricing</p>
                  <p>Integrations</p>
                  <p>Mobile Apps</p>
                </div>
              </div>
              <div className="fc-box2">
                <h3>Company</h3>
                <div className="box-isi">
                  <p>About Us</p>
                  <p>Careers</p>
                  <p>Blog</p>
                  <p>Contact</p>
                </div>
              </div>
              <div className="fc-box2">
                <h3>Support</h3>
                <div className="box-isi">
                  <p>Help Center</p>
                  <p>Documentation</p>
                  <p>Community</p>
                  <p>Security</p>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-cr">
            <div className="fcr-left">
              <AiFillCopyrightCircle />
              2025 InodStudio. All rights reserved.
            </div>
            <div className="fcr-right">
              <p>Privacy Policy</p>
              <p>Terms Of Service</p>
            </div>
          </div>

          {/* SCROLL TO TOP BUTTON */}
          {showScroll && (
            <button className="scroll-top-btn" onClick={scrollToTop}>
              <IoArrowUp size={24} />
            </button>
          )}
        </div>
        {/* END FOOTER SECTION  */}
      </div>
    </div>
  )
}

export default MainLp
