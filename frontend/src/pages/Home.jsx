import React,{useRef, useState, useEffect} from 'react'
import '../style/pages/Home.css'
import '../style/notes/Dummy.css'
import Greeting from '../utils/Greeting.jsx'
import BootstrapTooltip from '../components/Tooltip.jsx'
import { RxDragHandleDots2 } from "react-icons/rx";
import { HiMiniCalendarDateRange,HiOutlineHome,HiOutlineCog8Tooth, HiOutlineClock,HiOutlineArrowsPointingOut,HiOutlineEllipsisHorizontal,HiOutlineSquares2X2,HiOutlineArrowTopRightOnSquare ,HiLink, HiOutlineTrash, HiOutlineXMark, HiClipboardDocumentList, HiPlus, HiXMark} from "react-icons/hi2";
import { useNavigate } from 'react-router-dom';
import { HiFolder } from "react-icons/hi2";
import { GiMusicalScore } from "react-icons/gi";
import { BsArrowsAngleExpand } from "react-icons/bs";
import { FaChartLine, FaNoteSticky, FaPlus } from "react-icons/fa6";
import OutsideClick from '../hook/OutsideClick.jsx';
import { createWorkspace, createWorkspaceUser, getWorkspaceSummary } from '../services/ApiServices.js';
import { Alert } from '@mui/material';
import {AlertTitle} from '@mui/material';
import CustomAlert from '../hook/CustomAlert.jsx';
import { HiOutlinePlus } from 'react-icons/hi';
import { MdAddChart } from 'react-icons/md';
import WorkspaceSummary from '../UI/WorkspaceSummary.jsx';
import AgendaUser from '../UI/AgendaUser.jsx';
import { IoCalendar, IoChevronDown, IoFlash } from 'react-icons/io5';
import AksesCepat from '../modules/AksesCepat.jsx';
import PersonalNotes from '../modules/PersonalNotes.jsx';
import PersonalAgendas from '../modules/PersonalAgendas.jsx';
import { useUser } from '../context/UserContext.jsx';
import { useSnackbar } from '../context/Snackbar.jsx';
import Dummy from '../notes/Dummy.jsx';


const Home=()=> {
  //state
  const {user} = useUser();
  const userId = user?.id;
  const [isGreeting, setIsGreeting] = useState(true);
  const [showSetting, setShowSetting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // const settingRef = useRef(null);
  const settingRef = OutsideClick(()=> setShowSetting(false));
  const showRef = OutsideClick(()=> setShowForm(false));
  const navigate = useNavigate();
  const {showSnackbar} = useSnackbar();
  // DROPDWN 
  const [openDropdown, setOpenDropdown] = useState(false);
  const [selectedChart, setSelectedChart] = useState("both");
  //create workspace
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  //WORKSPACE SUMMARY 
    const [summaries, setSummaries] = useState([]);
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
    navigate(`recent`);
  }
  //5. navigate to workspace
  const navigateToWorkspace = () =>{
    navigate(`workspaces`)
  }
  //6. show form create workspace
  const handleShowForm = (e) =>{
    e.stopPropagation();
    setShowForm((prev) => !prev);
  }
  //7. fetch data Summary 
    useEffect(() => {
      fetchSummary();
    }, [userId]);

    const fetchSummary = async () => {
      if (!userId) return;
      try {
        const response = await getWorkspaceSummary(userId);
        setSummaries(response.data);
      } catch (err) {
        console.error("Gagal fetch summary:", err);
      } finally {
        setLoading(false);
      }
    };


  //7.1 create new workspace by user
  const handleNewSubmit = async(e)=>{
    e.preventDefault();
    setLoading(true);
    setError(null);

    const workspaceData = {
      name,
      description,
      userId,
      role:'admin',
    };

    try{
      await createWorkspaceUser(workspaceData);
      showSnackbar('Workspace created successfully!', 'success');
      //fetch workspace summary
      fetchSummary()
    }catch(error){
      showSnackbar('Failed to create new workspace', 'error')
    }finally{
      setLoading(false)
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
    navigate('agenda-page')
  }

  //10. navigate to note page
  const navigateToNotePage = () =>{
    navigate('note-page')
  }

  //11. dropdown select grafic
    const handleSelect = (value) =>{
    setSelectedChart(value);
    setOpenDropdown(false);
  }

  return (
    <div className="home-container">
        <div className="home-header">
          <div className='nav'>
            <Greeting/>
          </div>

          <div className="hh-btn" onClick={handleShowForm}>
              <FaPlus />
              CREATE WORKSPACE
          </div>
          {/* <div className="hh-btn" onClick={navigateToWorkspace}>
            <HiPlus/>
              CREATE WORKSPACE
          </div> */}
        
  
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
                  <div className='wf-icon'>
                    <MdAddChart/>
                  </div>
                  Create New Workspace
                </h5>
                <BootstrapTooltip title="Close Form" placement="top">
                  <HiXMark onClick={handleCancle} className='wf-close'/>
                </BootstrapTooltip>
              </div>
               <div className="wf-content">
                <div className="wf-input">
                  <label>Workspace Title <span style={{color:'red'}}>*</span></label>
                  <input 
                    type="text"
                    value={name}
                    placeholder='Enter workspace title'
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="wf-input">
                  <label>Descriptions <span style={{color:'red'}}>*</span></label>
                  <textarea 
                    type="text" 
                    value={description}
                    placeholder='Describe your workspace (optional)'
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
                <div className="wf-btn">
                  <div className='cancle-btn' onClick={handleCancle}>Cancle</div>
                  <div className='submit-btn' onClick={handleNewSubmit}>Create Workspace</div>
                </div>
               </div>
            </div>
          )}        
        </div>
       
        <div className="home-body">
          {/* RECENT SECTION  */}
          <div className="home-body-left">
            {/* CHART  */}
            <div className="home-notes">
              <div className="notes-header">
                <div className="nh-left">
                  <div className="nhl-icon">
                    <FaChartLine/>
                  </div>
                  <h4><span className='nhl-gradient'>Chart Daily Income</span></h4>
                </div>
                <div className="nh-right">
                  <div className="dummy-drop">
                    <button
                      onClick={() => setOpenDropdown(!openDropdown)}
                    >
                      {selectedChart === "both"
                        ? "Both"
                        : selectedChart === "design"
                        ? "Design Only"
                        : "Music Only"}
                      <IoChevronDown
                        size={12}
                        className={`transition-transform ${
                          openDropdown ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </button>
                    {/* DROPDOWN  */}
                    {openDropdown && (
                      <ul className="absolute right-0 z-20 w-40 mt-2 bg-white border border-gray-200 rounded-md shadow-lg">
                        <li
                          className={`px-3 py-2 text-sm cursor-pointer hover:bg-purple-50 ${
                            selectedChart === "both" ? "bg-purple-100" : ""
                          }`}
                          onClick={() => handleSelect("both")}
                        >
                          Both
                        </li>
                        <li
                          className={`px-3 py-2 text-sm cursor-pointer hover:bg-purple-50 ${
                            selectedChart === "design" ? "bg-purple-100" : ""
                          }`}
                          onClick={() => handleSelect("design")}
                        >
                          Design Only
                        </li>
                        <li
                          className={`px-3 py-2 text-sm cursor-pointer hover:bg-purple-50 ${
                            selectedChart === "music" ? "bg-purple-100" : ""
                          }`}
                          onClick={() => handleSelect("music")}
                        >
                          Music Only
                        </li>
                      </ul>
                    )}
                  </div>
                </div>
              </div>
                <Dummy selectedChart={selectedChart} setSelectedChart={setSelectedChart} handleSelect={handleSelect}/>
            </div>
            {/* SUMMARY  */}
            <div className="home-summary">
              <div className="summary-header">
                <div className="sh-left">
                  <div className="sh-icon">
                    <HiFolder/>
                  </div>
                  <h4><span className='sh-gradient'>Workspaces Summary</span></h4>
                </div>
                <BootstrapTooltip title='Show Workspaces' placement="top">
                  <div className="sh-right">
                    <BsArrowsAngleExpand onClick={navigateToWorkspace} className='sh-expand'/>
                  </div>
                </BootstrapTooltip>
                
              </div>
              <div className="body-s">
                {/* <GiMusicalScore size={50}/> */}
                <WorkspaceSummary userId={userId} summaries={summaries}/>
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