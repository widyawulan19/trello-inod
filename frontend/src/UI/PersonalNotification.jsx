import React, { useState, useEffect } from 'react'
import NotificationPage from './NotificationPage';
import SystemNotifications from './SystemNotifications';
import '../style/UI/NotificationPage.css'
import {GoBell} from 'react-icons/go';
import {getNotificationForUser, getSystemNotificationByUser} from '../services/ApiServices';


const PersonalNotification=({userId})=> {
    //STATE
    const [activeNotification, setActiveNotification] = useState('chat');
    //state notification system
    const [notificationSystem, setNotificationSystem] = useState([]);
    //state notification chat
    const [notifications, setNotifications] = useState([]);
    
    //state badge
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadCountMessage, setUnreadCountMessage] = useState(0);

    //state loading
    const [loading, setLoading] = useState(false);

    //DEBUG
    // console.log('File personal notification menerima userId:', userId);
    // console.log('File personal notification menerima menerima data notificationsystem:', notificationSystem)
     console.log('File personal notification menerima menerima data notification:', notifications)

    //FUNCTION
    // 1. function render notification 
    const renderNotification = () =>{
        switch (activeNotification){
            case 'chat':
                return <div className='show'>
                            <NotificationPage 
                                userId={userId}
                                notifications={notifications}
                                setNotifications={setNotifications}
                                unreadCountMessage={unreadCountMessage}
                                setUnreadCountMessage={setUnreadCountMessage}
                                fetchNotificationChat={fetchNotificationChat}
                            />
                        </div>;
            case 'system':
                return <div className='show'>
                        <SystemNotifications 
                            userId={userId}
                            notificationSystem={notificationSystem}
                            setNotificationSystem={setNotificationSystem}
                            fetchNotificationSystem={fetchNotificationSystem}
                            unreadCount={unreadCount}
                            setUnreadCount={setUnreadCount}
                        />
                    </div>;
            default:
                 return <div className="fade"><h3>Personal notification</h3></div>;  
        }
    }

    //2. fetch notification system 
    const fetchNotificationSystem =  async () =>{
        try{
            const result = await getSystemNotificationByUser(userId);
             const sortedData = result.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
             setNotificationSystem(sortedData); 
             updateUnreadCountSystem(notificationSystem)
             
             //hitung notifikasi yang belum dibaca
             const unread = sortedData.filter((notif) => !notif.is_read).length;
             setUnreadCount(unread)
        }catch(error){
            console.log('Failed to fetch data notification system:', error)
        }finally{
            setLoading(false);
        }
    }

    useEffect(()=>{
        if(userId){
            fetchNotificationSystem();
        }
    },[userId])


    const updateUnreadCountSystem = (notifications) => {
        const unread = notifications.filter((notif) => !notif.is_read).length;
        setUnreadCount(unread);
    };

    //4. function fetch notification chat
    const fetchNotificationChat = async () =>{
        try{
            const result = await getNotificationForUser(userId);
            const sortedData = result.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setNotifications(sortedData);
            updateUnreadCountChat(notifications)

            //menghitung notifikasi yang belum dibaca
            const unread = sortedData.filter((notif) => !notif.is_read).length;
            setUnreadCountMessage(unread);
        }catch(error){
            console.log('Failed to fetch data notification chat:', error)
        }finally{
            setLoading(false);
        }
    }

    useEffect(()=>{
        if(userId){
            fetchNotificationChat();
        }
    },[userId])
    
    const updateUnreadCountChat = (notifications) => {
        const unread = notifications.filter((notif) => !notif.is_read).length;
        setUnreadCountMessage(unread)
    }

  return (
    <div style={{ height:'70vh', overflowY:'auto'}}>
        <div className="notif-setting">
            <button 
                className={`notif-button ${activeNotification === 'chat' ? 'active' : ''}`}
                onClick={() => setActiveNotification('chat')}    
            >
                Notification Chat
                {unreadCountMessage > 0 && <span className='notif-badge'>{unreadCountMessage}</span>}
            </button>
           <button 
                className={`notif-button ${activeNotification === 'system' ? 'active' : ''}`}
                onClick={() => setActiveNotification('system')}    
            >
                Notification System
                {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </button>
        </div>

        <div className="notif-body">
            {renderNotification()}
        </div>
    </div>
  )
}

export default PersonalNotification