import React ,{useState}from 'react'
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import '../style/components/Layout.css'

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" , padding:'0'}}>
      {/* Navbar Sticky di Atas */}
      <Navbar className='navbar'/>

      {/* Container Sidebar dan Main */}
      <div className='main'>
        <Sidebar className='sidebar' isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

        {/* Main menyesuaikan Sidebar */}
        <div style={{ flex: 1, transition: "margin-left 0.3s", minWidth:'80vw',maxWidth:'100vw', background:'linear-gradient(to bottom, #042787, #3927ab)' }}>
          {children}
        </div>
      </div>
    </div>
  );
  };

export default Layout