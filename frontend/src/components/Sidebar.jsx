

import React, { useState } from 'react';
import '../style/components/Sidebar.css';
import { HiOutlineCircleStack, HiOutlineUsers, HiOutlineArrowLeftCircle, HiOutlineArrowRightCircle, HiOutlineSquaresPlus, HiOutlineFolder, HiOutlineCog8Tooth, HiAdjustmentsHorizontal,HiOutlineCalendarDateRange, HiOutlineArchiveBoxArrowDown, HiOutlineChartBar, HiOutlineTrash } from "react-icons/hi2";
import { Tooltip, tooltipClasses } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { MdDeveloperMode } from 'react-icons/md';
import logo from '../assets/LOGO1.png';
import logo2 from '../assets/LOGO12.png';
import { LuLayoutDashboard } from "react-icons/lu";

// Tooltip
const BootstrapTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.black,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.black,
  },
}));

const Sidebar = () => {
  // State
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [itemActive, setItemActive] = useState('');
  const navigate = useNavigate();  // Hook untuk navigasi

  const handleOpenSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const handleItemActive = (itemName) => {
    setItemActive(itemName);
  };

  const handleStopPropagation = (e) => {
    e.stopPropagation();
  };

  const handleNavigation = (to) => {
    navigate(to);  // Navigasi menggunakan useNavigate
  };

  return (
    <div className='sidebar-layout-container'>
      <div
        className={`sidebar-container ${sidebarVisible ? 'show-sidebar' : 'close-sidebar'}`}
        onClick={handleOpenSidebar}
      >
        <div className="logo-sidebar">
          <img 
            src={sidebarVisible ? logo : logo2} 
            alt="Logo" 
            className="logo-image" 
            />
        </div>
        <div className="sidebar-menu" onClick={handleStopPropagation}>
          {
          [
             { to: '/layout', icon: <LuLayoutDashboard className='sidebar-icon' />, label: 'Dashboard', name: 'Dashboard' },
            { to: 'workspaces', icon: <HiOutlineSquaresPlus className='sidebar-icon' />, label: 'Workspace', name: 'workspace' },
            { to: 'data-member', icon: <HiOutlineUsers className='sidebar-icon' />, label: 'Inod Member', name: 'member' },
            { to: 'new-employee-schedules', icon: <HiOutlineCalendarDateRange className='sidebar-icon' />, label: 'Member Schedule', name: 'schedule' },
            // { to: '/employee-data', icon: <HiOutlineCalendarDateRange className='icon' />, label: 'Member Schedule', name: 'schedule' },
            { to: 'data-marketing', icon: <HiOutlineCircleStack className='sidebar-icon' />, label: 'Data Marketing', name: 'marketing' },
            { to: 'marketing-design', icon: <HiOutlineChartBar className='sidebar-icon' />, label: 'Marketing Design', name: 'marketing-design' },
            { to: 'archive', icon: <HiOutlineArchiveBoxArrowDown className='sidebar-icon' />, label: 'Archive Data', name: 'archive' },
            // { to: 'archive-data', icon: <HiOutlineArchiveBoxArrowDown className='sidebar-icon' />, label: 'Archive Data', name: 'archive' },
            { to: 'activity', icon: <HiOutlineCog8Tooth className='sidebar-icon' />, label: 'User Activity', name: 'User Activity' },
            { to: 'faq', icon: <HiAdjustmentsHorizontal className='sidebar-icon' />, label: 'FaQ', name: 'faq' },
            { to: 'data-delete-example', icon: <HiOutlineTrash className='sidebar-icon' />, label: 'Trash', name: 'Trash' },
            // { to: 'marketing-chart', icon: <MdDeveloperMode className='icon' />, label: 'Testing Fitur', name: 'Testing Fitur' },


            // { to: 'data-delete-example', icon: <MdDeveloperMode className='sidebar-icon' />, label: 'Trash', name: 'Trash Page' },
            // { to: 'loading-test', icon: <MdDeveloperMode className='sidebar-icon' />, label: 'Testing Fitur', name: 'Testing Fitur' },
            // { to: 'archive', icon: <MdDeveloperMode className='sidebar-icon' />, label: 'Testing Fitur', name: 'Testing Fitur' },
          ].map((item) => (
            <div
            // style={{border:'1px solid red'}}
              key={item.name}
              className={`sidebar-main ${itemActive === item.name ? 'active' : ''} ${sidebarVisible ? 'expanded' : 'collapsed'}`}
              onClick={() => handleItemActive(item.name)}
              >

              <Link to={item.to} className="sidebar-link">
                <BootstrapTooltip title={!sidebarVisible ? item.label : ''} placement="right">
                  <div className="sidebar-icon">{item.icon}</div>
                </BootstrapTooltip>
                {sidebarVisible && <h5 className="sidebar-label">{item.label}</h5>}
              </Link>
            </div>
          ))}
          <div className="btn-arr">
            <button onClick={handleOpenSidebar} className='btn-arrow'>
              {sidebarVisible ? <HiOutlineArrowLeftCircle /> : <HiOutlineArrowRightCircle  />}
            </button>
          </div>
          
          <div className="btn">
            {/* <button className="toggle-btn" onClick={handleOpenSidebar}>
              {sidebarVisible ? <HiOutlineArrowLeftCircle className='icon' /> : <HiOutlineArrowRightCircle className='icon' />}
            </button> */}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
