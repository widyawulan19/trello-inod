import React, { useEffect, useState } from 'react'
import '../style/components/Navbar.css'
import logo from '../assets/logo2.png';
import logo1 from '../assets/whiteLogo.png'
import { HiMiniCalendarDateRange,HiOutlineMagnifyingGlass,HiOutlineClipboardDocumentList,HiMiniLanguage,HiMiniBellAlert,HiOutlineUserCircle,HiOutlineChevronDown } from "react-icons/hi2";
import { Tooltip, tooltipClasses } from '@mui/material';
import {styled} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getProfileByUserId, getUserTotalNotificationUnread } from '../services/ApiServices';
import FullNewCalendar from '../fitur/FullNewCalendar';
import NotificationPage from '../UI/NotificationPage';
import NavbarNotification from '../UI/NavbarNotification';
import NotificationIcon from '../UI/NotificationIcon';
import SearchGlobalCard from '../fitur/SearchGlobalCard';
import PersonalNotes from '../modules/PersonalNotes';

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

const Navbar=()=> {
    //state
    // const navigate = useNavigate();
    const [active, setActive] = useState(false);
    const navigate = useNavigate();
    const [profilUser, setProfilUser] = useState(null);
    const {user} = useUser();
    const userId = user.id;
    // const userId = 12;
    const [showCalendar, setShowCalendar] = useState(false);
    const [showNotif, setShowNotif] = useState(false);
    const [showNotes, setShowNotes] = useState(false);
    
    //unread total
    const [unreadCount, setUnreadCount] = useState(0);

    //debug
    console.log('NAVBAR ini menerima data user dan userId:', user, userId);

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
        navigate(`/`)
    }

    const navigateToProfile =()=>{
        navigate(`/user-profile`)
    }

    const navigateToChat = () =>{
        navigate(`/chat`)
    }

   const handleShowCalendar = () =>{
        setShowCalendar(!showCalendar)
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
 
  return (
    <div className='navbar-container'>
        <div className="logo" >
            <img src={logo1} alt={logo1} onClick={handleToHome}/>
        </div>
        <div className="more-fiture">
            <SearchGlobalCard userId={userId}/>
            <div className="more-action">
                <BootstrapTooltip title="Calendar">
                    <div 
                        className={`icon-wrapper ${active === 'calendar' ? 'active' : ''}`} 
                        onClick={() => handleActive('calendar')}
                    >
                        <HiMiniCalendarDateRange   
                            className='icon-icon' 
                            onClick={handleShowCalendar}
                    />
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
                    //   onClick={() => handleActive('notes')}
                    onClick={handleShowNotes}
                    >
                        <HiOutlineClipboardDocumentList className='icon-icon' />
                    </div>
                </BootstrapTooltip>
                <div className="translate">
                    <BootstrapTooltip title="Translate">
                        <HiMiniLanguage  className='icon-icon' />
                    </BootstrapTooltip>
                </div>
                
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
                        <PersonalNotes userId={userId}/>
                    </div>
                )}
            </div>
            <div className="profil">
                <BootstrapTooltip title="Profile">
                    {profilUser && (
                        <div className='icon-wrapper' onClick={navigateToProfile}>
                                <img src={profilUser.photo_url} alt={profilUser.username} />
                        </div>
                    )}
                </BootstrapTooltip>
            </div>
        </div>
    </div>
  )
}

export default Navbar