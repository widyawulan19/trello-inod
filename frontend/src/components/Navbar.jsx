import React, { useEffect, useState } from 'react'
import '../style/components/Navbar.css'
import defaultPic from '../assets/manuser.png';
import logo1 from '../assets/whiteLogo.png'
import { HiMiniCalendarDateRange,HiOutlineMagnifyingGlass,HiOutlineClipboardDocumentList,HiMiniLanguage,HiMiniBellAlert,HiOutlineUserCircle,HiOutlineChevronDown } from "react-icons/hi2";
import { Tooltip, tooltipClasses } from '@mui/material';
import {styled} from '@mui/material';
import { useNavigate, useNavigation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getProfileByUserId, getUnfinishAgenda, getUserTotalNotificationUnread } from '../services/ApiServices';
import FullNewCalendar from '../fitur/FullNewCalendar';
import NotificationPage from '../UI/NotificationPage';
import NavbarNotification from '../UI/NavbarNotification';
import NotificationIcon from '../UI/NotificationIcon';
import SearchGlobalCard from '../fitur/SearchGlobalCard';
import PersonalNotes from '../modules/PersonalNotes';
import PersonalAgendas from '../modules/PersonalAgendas';
import AgendaUser from '../UI/AgendaUser';
import { IoCalendar, IoColorPalette, IoColorPaletteSharp } from 'react-icons/io5';
import { LuLayoutDashboard } from "react-icons/lu";
import useTheme from '../utils/useTheme';
import { IoIosMoon, IoMdSunny } from "react-icons/io";
import { RiDashboardHorizontalFill, RiDashboardHorizontalLine } from 'react-icons/ri';
import { FaCircle } from 'react-icons/fa';

//tooltip
const BootstrapTooltip = styled(({className, ...props}) =>(
    <Tooltip {...props} arrow classes={{popper: className}}/>
    ))(({theme}) => ({
      [`& .${tooltipClasses.arrow}`]: {
        color: theme.palette.common.black,
      },
      [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: theme.palette.common.black,
      },
}));

const Navbar=({onToggleTheme, theme})=> {
    //state
    // const navigate = useNavigate();
    const [active, setActive] = useState(false);
    const navigate = useNavigate();
    const [profilUser, setProfilUser] = useState(null);
    const {user} = useUser();
    const userId = user?.id;
    // const userId = 12;
    const [showCalendar, setShowCalendar] = useState(false);
    const [showNotif, setShowNotif] = useState(false);
    const [showNotes, setShowNotes] = useState(false);
    const [showAgenda, setShowAgenda] = useState(false);
    
    //unread total
    const [unreadCount, setUnreadCount] = useState(0);
    const [unfinishedCount, setUnfinishedCount] = useState(0);
    const [unfinishedAgendas, setUnfinishedAgendas] = useState([]);

    //theme
    // const {theme, toggleTheme } = useTheme();

    //debug
    console.log('NAVBAR ini menerima data user dan userId:', user, userId);

    //function fetch total unread notif
    const fetchTotalUnreadNotif = async () => {
        try {
            const response = await getUserTotalNotificationUnread(userId);
            console.log('API response:', response);
            
            setUnreadCount(response.data.total_unread); // <- ini penting!
        } catch (error) {
            console.log('Failed to fetch unread notification:', error);
        }
    };


    useEffect(()=>{
        if(userId){
            fetchTotalUnreadNotif()
        }
    }, [userId])

    //function fetch unfinished agenda
    const fetchUnfinishedAgenda = async()=>{
        try{
            const response = await getUnfinishAgenda(userId);
            console.log('API response:', response);

            setUnfinishedCount(response.data.count)
            setUnfinishedAgendas(response.data.data)
        }catch(error){
            console.log('Error to fetch unfinished count agenda', error);
        }
    }

    useEffect(()=>{
        if(userId){
            fetchUnfinishedAgenda()
        }
    },[userId])

    //FUNGSI
    const fetchUserProfile = async() =>{
        try{
            const response = await getProfileByUserId(userId);
            setProfilUser(response.data)
        }catch(error){
            console.log('Error fetching profil user:', error)
        }
    }
    useEffect(()=>{
        if(userId){
            fetchUserProfile()
        }
    },[userId]);


    const handleActive = (icon) => {
        setActive(icon); // Menetapkan icon yang dipilih
      };

    const handleToHome = () =>{
        navigate(`/layout`)
    }

    const navigateToProfile =()=>{
        navigate(`user-profile`)
    }

    const navigateToChat = () =>{
        navigate(`chat`)
    }

   const handleShowCalendar = () =>{
        setShowCalendar(!showCalendar)
   }

   const handleToNote = () =>{
    navigate('note-page');
   }

   //SHOW NITIFICATION
   const handleShowNotif = () =>{
    setShowNotif(!showNotif)
   };

   const handleCloseNotif = () =>{
    setShowNotif(false)
   }

   //SHOW NOTES
   const handleShowNotes = () =>{
    setShowNotes(!showNotes)
   }

   const handleCloseNotes = () =>{
    setShowNotes(false)
   }

   //SHOW AGENDA
   const handleShowAgenda = () =>{
    setShowAgenda(!showAgenda)
   }

   const handleCloseAgenda = () =>{
    setShowAgenda(false)
   }

   const handleClickAgenda = () => {
        handleShowAgenda();           // Fungsi pertama
        handleActive('calendar');     // Fungsi kedua dengan parameter
    };

 
  return (
    <div className='navbar-container'>
        <div className="logo" >
            <div className="mini-logo">
                <LuLayoutDashboard className='logo-logo'/>
            </div>
            <h4>
                Dashboard    
            </h4>
        </div>
        <div className="more-fiture">
            <SearchGlobalCard userId={userId}/>
            <div className="more-action">
                <BootstrapTooltip title="Agenda">
                    <div 
                        className={`icon-wrapper ${active === 'calendar' ? 'active' : ''}`} 
                        onClick={handleClickAgenda}
                    >
                        <div style={{display:'inline-box', position:'relative'}}>
                            <IoCalendar className='icon-icon' />
                            <div style={{
                                position: 'absolute',
                                top: '0px',
                                right:'0px',
                                backgroundColor: 'red',
                                color: 'white',
                                fontSize: '8px',
                                padding: '2px 5px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '10px',
                                // width:'15px',
                                height: '10px',
                                }}>
                                {unfinishedCount}
                            </div>
                        </div>

                    
                    </div>
                    {showCalendar && (
                        <div className='calender-modal'>
                            <FullNewCalendar/>
                        </div>
                    )}
                </BootstrapTooltip>
                <BootstrapTooltip title="Notes">
                    <div 
                      className={`icon-wrapper ${active === 'notes' ? 'active' : ''}`} 
                    onClick={handleToNote}
                    >
                        <HiOutlineClipboardDocumentList className='icon-icon' />
                    </div>
                </BootstrapTooltip>
                
                <BootstrapTooltip title="Notify">
                    <div 
                      className={`icon-wrapper ${active === 'notify' ? 'active' : ''}`} 
                    //   onClick={() => handleActive('notify')}
                    onClick={handleShowNotif}
                    >
                        <div style={{ display:'inline-box',position:'relative'}}>
                            <HiMiniBellAlert className='icon-icon' style={{margin:'0px'}}/>
                            <div style={{
                                position: 'absolute',
                                top: '0px',
                                right:'0px',
                                backgroundColor: 'red',
                                color: 'white',
                                fontSize: '8px',
                                padding: '2px 5px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '10px',
                                // width:'15px',
                                height: '10px',
                                }}>
                                {unreadCount}
                            </div>
                        </div>
                    </div>
                </BootstrapTooltip>

                <BootstrapTooltip>
                     <div className={`switch ${theme === "dark" ? "active" : ""}`} onClick={onToggleTheme}>
                        <div className="switch-circle">
                            {theme === "light" ? <IoIosMoon/> : <IoMdSunny/>}
                        </div>
                    </div>
                </BootstrapTooltip>

                {/* SHOW NOTIF MODAL  */}
                {showNotif && (
                    <div className='notif-modal'>
                        <NavbarNotification userId={userId} onClose={handleCloseNotif}/>
                        {/* <NotificationPage userId={userId}/> */}
                    </div>
                )}

                {/* SHOW NOTES  */}
                {showNotes && (
                    <div className="notes-modal">

                        {/* <PersonalNotes userId={userId}/> */}
                    </div>
                )}

                {/* SHOW AGENDA */}
                {showAgenda && (
                    <div className="agenda-modal">
                        <AgendaUser userId={userId} onClose={handleCloseAgenda}/>
                    </div>
                )}
            </div>
           <div className="profil">
                <BootstrapTooltip title="Profile">
                    <div className='icon-wrapper' onClick={navigateToProfile}>
                        <img
                            src={profilUser?.photo_url || defaultPic}
                            alt={profilUser?.username || user?.username || 'User'}
                            style={{
                            width: '35px',
                            height: '35px',
                            borderRadius: '60%',
                            objectFit: 'cover',
                            backgroundColor:'white'                        
                            }}
                        />
                        <FaCircle className='status-online'/>
                    </div>
                    
                </BootstrapTooltip>
            </div>

        </div>
    </div>
  )
}

export default Navbar