import React,{useRef, useState, useEffect} from 'react'
import '../style/pages/Home.css'
import Greeting from '../utils/Greeting.jsx'
import BootstrapTooltip from '../components/Tooltip.jsx'
import { RxDragHandleDots2 } from "react-icons/rx";
import { HiMiniCalendarDateRange,HiOutlineHome,HiOutlineCog8Tooth, HiOutlineClock,HiOutlineArrowsPointingOut,HiOutlineEllipsisHorizontal,HiOutlineSquares2X2,HiOutlineArrowTopRightOnSquare ,HiLink, HiOutlineTrash, HiOutlineXMark, HiClipboardDocumentList, HiPlus} from "react-icons/hi2";
import { useNavigate } from 'react-router-dom';
import { HiFolder } from "react-icons/hi2";
import { GiMusicalScore } from "react-icons/gi";
import { BsArrowsAngleExpand } from "react-icons/bs";
import { FaNoteSticky } from "react-icons/fa6";
import OutsideClick from '../hook/OutsideClick.jsx';
import { createWorkspace } from '../services/ApiServices.js';
import { Alert } from '@mui/material';
import {AlertTitle} from '@mui/material';
import CustomAlert from '../hook/CustomAlert.jsx';
import { HiOutlinePlus } from 'react-icons/hi';
import { MdAddChart } from 'react-icons/md';
import WorkspaceSummary from '../UI/WorkspaceSummary.jsx';
import AgendaUser from '../UI/AgendaUser.jsx';
import { IoCalendar, IoFlash } from 'react-icons/io5';
import AksesCepat from '../modules/AksesCepat.jsx';
import PersonalNotes from '../modules/PersonalNotes.jsx';
import PersonalAgendas from '../modules/PersonalAgendas.jsx';

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

  //9. navigate to agenda page
  const navigateToAgendaPage = () =>{
    navigate('/agenda-page')
  }

  //10. navigate to note page
  const navigateToNotePage = () =>{
    navigate('/note-page')
  }

  return (
    <div className="home-container">
        <div className="home-header">
          <div className='nav'>
            <Greeting/>
          </div>

          <div className="hh-btn" onClick={handleShowForm}>
              <HiPlus/>
              CREATE WORKSPACE
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
        </div>
       
        <div className="home-body">
          {/* RECENT SECTION  */}
          <div className="home-body-left">
            {/* SUMMARY  */}
            <div className="home-summary">
              <div className="summary-header">
                <div className="sh-left">
                  <div className="sh-icon">
                    <HiFolder/>
                  </div>
                  <h4><span className='sh-gradient'>Workspaces Summary</span></h4>
                </div>
                <div className="sh-right">
                   {/* <BsArrowsAngleExpand className='sh-expand'/> */}
                </div>
                
              </div>
              <div className="body-s">
                {/* <GiMusicalScore size={50}/> */}
                <WorkspaceSummary userId={userId}/>
              </div>
            </div>
            
            <div className="home-notes">
              <div className="notes-header">
                <div className="nh-left">
                  <div className="nhl-icon">
                    <FaNoteSticky/>
                  </div>
                  <h4><span className='nhl-gradient'>Personal Notes</span></h4>
                </div>
                <div className="nh-right">
                  <BootstrapTooltip title='Open Note Page' placement='top'>
                  <div className="ah-right">
                    <BsArrowsAngleExpand className='sh-expand' onClick={navigateToNotePage}/>
                  </div>
                  </BootstrapTooltip>
                </div>
              </div>
              <div className="notes-body">
                <PersonalNotes userId={userId}/>
              </div>
            </div>
          </div>

          <div className="home-body-right">
            <div className="home-agenda">
              <div className="agenda-header">
                <div className="ah-left">
                  <div className="ahl-icon">
                    <IoCalendar/>
                  </div>
                  <h4>Your Agenda</h4>
                </div>

                <BootstrapTooltip title='Open Agenda Page' placement='top'>
                <div className="ah-right">
                  <BsArrowsAngleExpand className='sh-expand' onClick={navigateToAgendaPage}/>
                </div>
                </BootstrapTooltip>
              </div>
              <div className="agenda-body">
                {/* <PersonalAgenda/> */}
                <PersonalAgendas userId={userId}/>
              </div>
            </div>

            <div className="home-quick">
              <div className="quick-header">
                <div className="quick-left">
                  <div className="quick-icon">
                    <IoFlash/>
                  </div>
                  <h4>Quick Actions</h4>
                </div>
                <div className="quick-right">
                  {/* <BsArrowsAngleExpand className='sh-expand'/> */}
                </div>
              </div>

              <div className="quick-body">
                <AksesCepat userId={userId} handleShowForm={handleShowForm}/>
              </div>
            </div>
          </div>

        </div>
    </div>
  )
}

export default Home

//1. agenda -> buat 2 logika, jika ada agenda tampilkan jadwal agenda dalam bentuk tabel tanpa baris
// jika belum ada agenda buat tampilan default yang memanggil / menampilkan kalender.