import React,{useRef, useState, useEffect} from 'react'
import '../style/pages/Home.css'
import Greeting from '../utils/Greeting.jsx'
import BootstrapTooltip from '../components/Tooltip.jsx'
import { RxDragHandleDots2 } from "react-icons/rx";
import { HiMiniCalendarDateRange,HiOutlineHome,HiOutlineCog8Tooth, HiOutlineClock,HiOutlineArrowsPointingOut,HiOutlineEllipsisHorizontal,HiOutlineSquares2X2,HiOutlineArrowTopRightOnSquare ,HiLink, HiOutlineTrash, HiOutlineXMark, HiClipboardDocumentList} from "react-icons/hi2";
import { useNavigate } from 'react-router-dom';
import OutsideClick from '../hook/OutsideClick.jsx';
import { createWorkspace } from '../services/ApiServices.js';
import { Alert } from '@mui/material';
import {AlertTitle} from '@mui/material';
import CustomAlert from '../hook/CustomAlert.jsx';
import { HiOutlinePlus } from 'react-icons/hi';
import { MdAddChart } from 'react-icons/md';
import WorkspaceSummary from '../UI/WorkspaceSummary.jsx';
import AgendaUser from '../UI/AgendaUser.jsx';

const Home=()=> {
  //state
  const userId = 3; //buat ketika pengguna login userIdnya sesuai database
  const [isGreeting, setIsGreeting] = useState(true);
  const [showSetting, setShowSetting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  // const settingRef = useRef(null);
  const settingRef = OutsideClick(()=> setShowSetting(false));
  const showRef = OutsideClick(()=> setShowForm(false));
  const navigate = useNavigate();
  //create workspace
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  //alert
  const [alertInfo, setAlertInfo] = useState({
    severity: '',
    title: '',
    message: '',
    showAlert: false,
  });

  
  //FUNCTION
  //1. greeting 
  const handleGreeting = () =>{
    setIsGreeting(!isGreeting);
  }

  //2. show setting
  const handleShowSetting = (e) =>{
    e.stopPropagation();
    setShowSetting((prev) => !prev);
  };

  //4. navigate to recent
  const navigateToRecent = () =>{
    navigate(`/recent`);
  }
  //5. navigate to workspace
  const navigateToWorkspace = () =>{
    navigate(`/workspaces`)
  }
  //6. show form create workspace
  const handleShowForm = (e) =>{
    e.stopPropagation();
    setShowForm((prev) => !prev);
  }
  //7. create a new workspace
  const handleSubmit = async(e) =>{
    e.preventDefault();

    try{
      const response = await createWorkspace({name, description});
      setName('');
      setDescription('');
      setAlertInfo({
        severity: 'success',
        title: 'Success',
        message: 'successfully create a new workspace!',
        showAlert: true,
      }); 
      //ke halaman workspace berdasarkan id yang baru dibuat
      const workspaceId = response.data.id;
      navigate(`/workspaces/${workspaceId}`)
      console.log('Workspace created:', response.data);
    }catch(error){
      setAlertInfo({
        severity: 'error',
        title: 'error',
        message: 'Error to create a new workspace!',
        showAlert: true,
      });
    }
  }

  //8. close alert
  const handleCloseAlert = () => {
    setAlertInfo({ ...alertInfo, showAlert: false });
  };

  const handleCancle = () =>{
    setShowForm(false)
  }

  return (
    <div className="home-container">
        <div className="home-header">
        <div className='nav'>
          <div className="nav-title">
            🏠 Home
          </div>
          <p className="nav-subtext">Overview & Quick Access</p>
        </div>
        
        <div className="home-btn" >
          <button onClick={handleShowForm}>
            <HiOutlinePlus className='btn-icon'/>
              CREATE A WORKSPACE
          </button>
          <p>
            | <HiOutlineCog8Tooth 
                className='nav-icon' 
                style={{marginLeft:'5px'}}
                onClick={handleGreeting}
              />
          </p>
        </div>
  
          {/* CREATE WORKSPACE FORM  */}
          <CustomAlert
             severity={alertInfo.severity}
             title={alertInfo.title}
             message={alertInfo.message}
             showAlert={alertInfo.showAlert}
             onClose={handleCloseAlert}
          />
          {showForm && (
            <div className='wf-create' ref={showRef}>
              <div className="wf-header">
                <h5>
                  <MdAddChart className='wf-icon'/>
                  CREATE A WORKSPACE 
                </h5>
                <BootstrapTooltip title="Close Form" placement="top">
                  <HiOutlineXMark onClick={handleCancle} className='wf-close'/>
                </BootstrapTooltip>
              </div>
               <div className="wf-content">
                <div className="wf-input">
                  <label>Workspace Title</label>
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="wf-input">
                  <label>Descriptions</label>
                  <input 
                    type="text" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
                <button onClick={handleSubmit}>Create Workspace</button>
                {/* <button className='cancle-btn'>Cancle</button> */}
               </div>
            </div>
          )}
          {/* END CREATE WORKSPACE FORM  */}
          {/* 1. buat satu button bisa handle (navigate to workspace page, set alert) */}
          
        </div>
        <div className="greeting">
          {isGreeting && (
            <Greeting/>
          )}
        </div>
        <div className="home-body">
          {/* RECENT SECTION  */}
          <div className="section-body">
            <div className="sb-header">
              <div className="sbh-left">
                <HiClipboardDocumentList/>
                <h4>WORKSPACE SUMMARY</h4>
              </div>
              <div className="sbh-right">
                <BootstrapTooltip title='View in full screen' placement='top'>
                    <button onClick={navigateToRecent}>
                      <HiOutlineArrowsPointingOut/>
                    </button>
                </BootstrapTooltip>

                <BootstrapTooltip title='More setting' placement='top'>
                   <button onClick={handleShowSetting}>
                    <HiOutlineEllipsisHorizontal/>
                  </button>
                </BootstrapTooltip>
                
                {showSetting && (
                  <div className="setting-icon" ref={settingRef}>
                    <button>
                      <HiOutlineTrash/>
                      <p>Remove Card</p>
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="sb-body">
              <WorkspaceSummary userId={userId}/>
            </div>
          </div>

          {/* AGENDA SECTION  */}
          <div className="section-body">
            <div className="sb-header">
              <div className="sbh-left">
                <HiMiniCalendarDateRange/>
                <h4>YOUR AGENDA</h4>
              </div>
              <div className="sbh-right">
                <BootstrapTooltip title='View in full screen' placement='top'>
                    <button onClick={navigateToRecent}>
                      <HiOutlineArrowsPointingOut/>
                    </button>
                </BootstrapTooltip>

                <BootstrapTooltip title='More setting' placement='top'>
                   <button onClick={handleShowSetting}>
                    <HiOutlineEllipsisHorizontal/>
                  </button>
                </BootstrapTooltip>
                
                {showSetting && (
                  <div className="setting-icon" ref={settingRef}>
                    <button>
                      <HiOutlineTrash/>
                      <p>Remove Card</p>
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="sb-body">
              <AgendaUser/>
            </div>
          </div>

          {/* NOTE SECTION  */}
          <div className="section-body">
            <div className="sb-header">
              <div className="sbh-left">
                <HiMiniCalendarDateRange/>
                <h4>PERSONAL NOTE</h4>
              </div>
              <div className="sbh-right">
                <BootstrapTooltip title='View in full screen' placement='top'>
                    <button onClick={navigateToRecent}>
                      <HiOutlineArrowsPointingOut/>
                    </button>
                </BootstrapTooltip>

                <BootstrapTooltip title='More setting' placement='top'>
                   <button onClick={handleShowSetting}>
                    <HiOutlineEllipsisHorizontal/>
                  </button>
                </BootstrapTooltip>
                
                {showSetting && (
                  <div className="setting-icon" ref={settingRef}>
                    <button>
                      <HiOutlineTrash/>
                      <p>Remove Card</p>
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="sb-body">
              <AgendaUser/>
            </div>
          </div>

        </div>
    </div>
  )
}

export default Home

//1. agenda -> buat 2 logika, jika ada agenda tampilkan jadwal agenda dalam bentuk tabel tanpa baris
// jika belum ada agenda buat tampilan default yang memanggil / menampilkan kalender.