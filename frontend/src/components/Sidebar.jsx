

import React, { useState } from 'react';
import '../style/components/Sidebar.css';
import { HiOutlineCircleStack, HiOutlineUsers, HiOutlineArrowLeftCircle, HiOutlineArrowRightCircle, HiOutlineSquaresPlus, HiOutlineFolder, HiOutlineCog8Tooth, HiAdjustmentsHorizontal,HiOutlineCalendarDateRange, HiOutlineArchiveBoxArrowDown, HiOutlineChartBar } from "react-icons/hi2";
import { Tooltip, tooltipClasses } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

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
        <div className="sidebar-menu" onClick={handleStopPropagation}>
          {[
            { to: '/workspaces', icon: <HiOutlineSquaresPlus className='icon' />, label: 'Workspace', name: 'workspace' },
            { to: '/data-member', icon: <HiOutlineUsers className='icon' />, label: 'Inod Member', name: 'member' },
            { to: '/employee-schedule', icon: <HiOutlineCalendarDateRange className='icon' />, label: 'Member Schedule', name: 'schedule' },
            // { to: '/employee-data', icon: <HiOutlineCalendarDateRange className='icon' />, label: 'Member Schedule', name: 'schedule' },
            { to: '/data-marketing', icon: <HiOutlineCircleStack className='icon' />, label: 'Data Marketing', name: 'marketing' },
            { to: '/marketing-design', icon: <HiOutlineChartBar className='icon' />, label: 'Marketing Design', name: 'marketing-design' },
            { to: '/archive-data', icon: <HiOutlineArchiveBoxArrowDown className='icon' />, label: 'Archive Data', name: 'archive' },
            { to: '/notif-icon', icon: <HiOutlineCog8Tooth className='icon' />, label: 'Setting', name: 'setting' },
            { to: '/activity', icon: <HiAdjustmentsHorizontal className='icon' />, label: 'FaQ', name: 'faq' },
          ].map((item) => (
            <div
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
