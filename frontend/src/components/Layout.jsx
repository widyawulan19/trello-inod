import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import '../style/components/Layout.css';
import { Outlet } from 'react-router-dom';
import { HiAdjustmentsHorizontal, HiArrowLeftCircle, HiArrowRightCircle } from 'react-icons/hi2';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  //theme
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  //FUNCTION THEME
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  //FUNCTION RESPONSIVE SIDEBAR
  useEffect(() => {
    const handleResize = () => {
      // Cek apakah layar masuk ke ukuran mobile
      setIsMobile(window.innerWidth >= 375 && window.innerWidth <= 667);
      if (window.innerWidth >= 375 && window.innerWidth <= 667) {
        setIsSidebarOpen(false); // otomatis hide
      } else {
        setIsSidebarOpen(true); // desktop view
      }
    };

    handleResize(); // panggil saat mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className='layout-container'>
      {/* <Navbar className="navbar" onToggleTheme={toggleTheme} theme={theme}/> */}

      {/* Tombol toggle di mobile */}
      {isMobile && (
        <button className="sidebar-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <HiAdjustmentsHorizontal/>
        </button>
      )}

      <div className="main">
        {isSidebarOpen && (
          <Sidebar className="sidebar" isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        )}
        <div
          style={{
            flex: 1,
            transition: 'margin-left 0.3s',
            minWidth: '80vw',
            maxWidth: '100vw',
            // border:'1px solid red',
            // background: 'linear-gradient(to bottom, #042787, #3927ab)',
          }}
        >
          {/* {children} */}
          <Navbar className="navbar" onToggleTheme={toggleTheme} theme={theme}/>
          <Outlet/>
        </div>
      </div>
    </div>
  );
};

export default Layout;


// import React ,{useState}from 'react'
// import Sidebar from './Sidebar';
// import Navbar from './Navbar';
// import '../style/components/Layout.css'

// const Layout = ({ children }) => {
//   const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

//   return (
//     <div style={{ display: "flex", flexDirection: "column", height: "100vh" , padding:'0'}}>
//       {/* Navbar Sticky di Atas */}
//       <Navbar className='navbar'/>

//       {/* Container Sidebar dan Main */}
//       <div className='main'>
//         <Sidebar className='sidebar' isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

//         {/* Main menyesuaikan Sidebar */}
//         <div style={{ flex: 1, transition: "margin-left 0.3s", minWidth:'80vw',maxWidth:'100vw', background:'linear-gradient(to bottom, #042787, #3927ab)' }}>
//           {children}
//         </div>
//       </div>
//     </div>
//   );
//   };

// export default Layout