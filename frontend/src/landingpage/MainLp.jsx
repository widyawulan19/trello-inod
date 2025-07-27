import React from 'react'
import '../style/landingpage/MainLp.css'
import heroPic from '../assets/hero1.jpg'
import iconPic from '../assets/lpicon.png'
import DATALP from '../landingpage/DATALP'
import { IoSwapVerticalSharp, IoPeople , IoBarChart, IoCogOutline, IoPhonePortrait} from "react-icons/io5";


const MainLp=()=> {
  //STATE

  //FUNCTION 
  const icons = {
    IoSwapVerticalSharp: <IoSwapVerticalSharp/>,
    IoPeople: <IoPeople/>,
    IoBarChart: <IoBarChart/>,
    IoCogOutline: <IoCogOutline/>,
    IoPhonePortrait: <IoPhonePortrait/>,
  }


  return (
    <div className='lp-container'>

      {/* header  */}
        <div className="lp-header">
            <div className="lp-logo">
              <h2>Logo Here</h2>
                {/* <h2>InodStudio Management</h2> */}
            </div>
            <div className="lp-btn">
                <button>Features</button>
                <button>Testimonials</button>
                <button className='start-btn'>Get Started</button>
            </div>
        </div>

      {/* CONTEN  */}
        <div className="lp-content">

          {/* SECTION 1  */}
            <div className="section1">
              <div className="hero-left">
                <h1 class="headline">
                  Streamline Your Team's <span class="gradient-text">Productivity</span>
                </h1>
                <p class="subheading">
                  Transform chaos into clarity with TaskFlow's intuitive task management platform. Collaborate seamlessly, track progress effortlessly, and achieve more together.
                </p>
                <div className="hero-btn">
                  <button className='start-btn'>Get Started</button>
                  <button>View Documentation</button>
                </div>
              </div>
              <div className="hero-right">
                <img src={heroPic} alt="hero pic section 1" />
              </div>
            </div>
          {/* END SECTION 1  */}

          {/* SECTION 2  */}
          <div className="section2">
            <div className="sec-top">
              <h2>Everything You Need to Stay Organized</h2>
              <p class="subheading">Powerful features designed to help teams of all sizes work more efficiently and achieve their goals faster.</p>
            </div>
            <div className="sec-btm">
              {DATALP.map((data)=>{
                const icon = icons[data.icon];
                return(
                  <div key={data.id} className="feature-item">
                    <div className="feature-icon" style={{ backgroundColor: data.color, border:`1px solid ${data.color}` }}>
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
            <div className="section3">
              <div className="sec3-left">
                <h1 class="headline">
                  Satu Platform untuk Kelola Pesanan Musik & Data Karyawan dengan Mudah
                </h1>
                <h2 class="subheading">Website manajemen berbasis Trello untuk kontrol penuh pada penjualan, produksi, dan tim Anda.</h2>
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
        </div>
    </div>
  )
}

export default MainLp