import React, { useEffect, useState } from 'react'
import { useUser } from '../context/UserContext';
import { getNotificationForUser, getSystemNotificationByUser, getUserTotalNotificationUnread } from '../services/ApiServices';
import { HiXMark } from 'react-icons/hi2';
import { FaBell } from "react-icons/fa";
import '../style/UI/NavbarNotification.css'
import NavbarMessageNotif from './NavbarMessageNotif';
import NavbarSystemUi from './NavbarSystemUi';
import NavbarAllNotifications from './NavbarAllNotifications';


const NavbarNotification=({onClose, userId})=> {
    //STATE
    // const {user} = useUser();
    // const userId = user?.id;
    const [notifications, setNotifications] = useState([]);
    const [notificationSystem, setNotificationSystem] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeNotification, setActiveNotification] = useState('all');

    //STATE BADGE
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadCountSystem, setUnreadCountSystem] = useState(0);
    

    //DEBUG
    console.log('FIle Navbar notification menerima data userId:', userId);

    //FUNCTION
    //1. fetch total unread dari dua notifikasi
    const fetchTotalUnread = async () => {
      try {
            const result = await getUserTotalNotificationUnread(userId);
            const { unread_chat, unread_system } = result.data;

            setUnreadCount(unread_chat);
            setUnreadCountSystem(unread_system);
        } catch (error) {
            console.log('Failed to fetch total unread for this user:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(()=>{
        if(userId){
            fetchTotalUnread()
        }
    },[userId]);

    // MESSAGE NOTIFICATION
    //2. fetch notification chat 
    const fetchNotificationChat = async()=>{
        try{
            const result = await getNotificationForUser(userId);
            const sortedData = result.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setNotifications(sortedData);
            updateUnreadCountChat(notifications)

            //hitung notifikasi yang belum dibaca
            const unread = sortedData.filter((notif) => !notif.is_read).length;
            setUnreadCount(unread)
        }catch(error){
            console.log('Failed to fetch data notification message:', error);
        }finally{
            setLoading(false);
        }
    }

    useEffect(()=>{
        if(userId){
            fetchNotificationChat();
        }
    },[userId])

    //fungsi count unread chat 
    const updateUnreadCountChat = (notifications) => {
        const unread = notifications.filter((notif)=> !notif.is_read).length;
        setUnreadCount(unread);
    }

    

    // END MESSAGE NOTIFICATION 


    //NOTIFICATION SYSTEM
    // 1.fetch notification system
    const fetchNotificationSystem = async () =>{
        try{
            const result = await getSystemNotificationByUser(userId);
            const sortedData = result.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setNotificationSystem(sortedData);
            updateUnreadCountSystem(notificationSystem);

            //hitung jumlah notification yang belum dibaca
            const unread = sortedData.filter((notif)=> !notif.is_read).length;
            setUnreadCountSystem(unread)
        }catch(error){
            console.log('Failed to fetch notification system: ', error)
        }finally{
            setLoading(false);
        }
    }

    useEffect(()=>{
        if(userId){
            fetchNotificationSystem();
        }
    },[userId]);


    // fungsi count unread system 
    const updateUnreadCountSystem = (notificationSystem) => {
        const unread = notificationSystem.filter((notif) => !notif.is_read).length;
        setUnreadCountSystem(unread);
    };

    //END NOTIFICATION SYSTEM

    //function render notifications
    const renderNotifications = () =>{
        switch(activeNotification){
            case 'all':
                return (
                    <div className='show'>
                       <NavbarAllNotifications userId={userId}/>
                    </div>
                );
            case 'chat':
                return (
                    <div className='show'>
                       {/* <h2>CHAT NOTIFICATION</h2> */}
                       <NavbarMessageNotif userId={userId} notifications={notifications} setNotifications={setNotifications}/>
                    </div>
                );
            case 'system':
                return (
                    <div className='show'>
                        {/* <h2>SYSTEM NOTIFICATION</h2> */}
                        <NavbarSystemUi 
                            userId={userId} 
                            notificationSystem={notificationSystem} 
                            setNotificationSystem={setNotificationSystem} 
                            fetchNotificationSystem={fetchNotificationSystem}
                            unreadCountSystem={unreadCountSystem}
                            setUnreadCountSystem={setUnreadCountSystem}
                        />
                    </div>
                );
            default:
                return <div>Personal information</div>
        }
    }

  return (
    <div className='navNotif-container'>
        {/* <p>Total unread is {notifications.total_unread}</p> */}
        <div className="navNotif-header">
            <div className="navNotif-left">
                <h4>
                    <div className="bel-icon">
                        <FaBell/>
                    </div>
                    
                    NOTIFICATION
                </h4>
                <p>Stay update on your tasks and mentions</p>
            </div>
            
            <HiXMark className='close-header' onClick={onClose}/>
        </div>

        <div className="btn-nav-notif">
            <button
                className={`navNotif-btn ${activeNotification === 'all' ? 'active' : ''}`}
                onClick={() => setActiveNotification('all')}
            >
                All
            </button>
             <button
                className={`navNotif-btn ${activeNotification === 'chat' ? 'active' : ''}`}
                onClick={() => setActiveNotification('chat')}
            >
                Chat
                {unreadCount > 0 && <span className='notif-badge'>{unreadCount}</span>}
            </button>
             <button
                className={`navNotif-btn ${activeNotification === 'system' ? 'active' : ''}`}
                onClick={() => setActiveNotification('system')}
            >
                Umum
                {unreadCountSystem > 0 && <span className='notif-badge'>{unreadCountSystem}</span>}
            </button>
        </div>

        <div className="navNotif-body">
            {renderNotifications()}
        </div>
    </div>
  )
}

export default NavbarNotification