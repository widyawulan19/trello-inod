import React from 'react'
import '../style/landingpage/MainLp.css'
import heroPic from '../assets/hero1.jpg'
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
                    <icon size={32} />
                    <h3>{data.title}</h3>
                    <p>{data.description}</p>
                  </div>
                )
              })}

            </div>
          </div>
          {/* END SECTION 2  */}
        </div>
    </div>
  )
}

export default MainLp