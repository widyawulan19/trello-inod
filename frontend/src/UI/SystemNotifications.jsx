import React, { useEffect, useState } from 'react'
import '../style/UI/SystemNotification.css';
import {GoBell} from "react-icons/go";
import { HiCheck, HiMiniTrash } from 'react-icons/hi2';
import { HiOutlineExclamationCircle } from "react-icons/hi2";
import { deleteSystemNotification, getSystemNotificationByUser, marksNotificationSystem } from '../services/ApiServices';

const SystemNotifications=({
    userId,
    notificationSystem, 
    setNotificationSystem, 
    fetchNotificationSystem,
    unreadCount,
    setUnreadCount
  })=> {
    //STATE
    // const [notificationSystem, setNotificationSystem] = useState([]);
    const [loading, setLoading] = useState(true);
    // const [unreadCount, setUnreadCount] = useState(0)


    //DEBUG
    // console.log('File system notification ini menerima data userId:', userId);
      console.log('File system notification ini menerima data notification:', notificationSystem);

    //TYPE NOTIF
    const NOTIF_TYPE = {
      workspace_assigned:"#6a11cb",
      remove:"#bf2e2e",
      card_assigned:"#889E73",
      card_unassigned:"#A94A4A",
    }

    //FUNCTION
    //2. fungsi untuk menandai notification telah dibawa
    const handleMarkAsRead = async (id) =>{
        try{
            await marksNotificationSystem(id);
            setNotificationSystem((prev) =>
              prev.map((notif) =>
                notif.id === id ? { ...notif, is_read: true } : notif
              )
            );
            fetchNotificationSystem();
        }catch(error){
            console.error('Failed to mark notification as read:', error)
        }
    }

    //3. fungsi delete notification 
    const handleDelete = async(id) =>{
        try{
            await deleteSystemNotification(id);
            setNotificationSystem((prev)=> prev.filter((notif) => notif.id !== id));
        }catch(error){
            console.error('Failed to delete notification:', error)
        }
    }

    //4. mark all notification as read
    const handleMarkAllAsRead = async () => {
      try {
        // Tandai semua sebagai read di backend
        for (const notif of notificationSystem) {
          if (!notif.is_read) {
            await marksNotificationSystem(notif.id);
          }
        }

        // Update state lokal
        const updated = notificationSystem.map((notif) => ({
          ...notif,
          is_read: true,
        }));

        setNotificationSystem(updated);
        setUnreadCount(0);
      } catch (error) {
        console.error('Failed to mark all notifications as read:', error);
      }
    };


    // useEffect(()=>{
    //     if(userId){
    //         fetchNotificationSystem();
    //     }
    // },[userId]);

    useEffect(() => {
      if (notificationSystem && notificationSystem.length >= 0) {
        setLoading(false);
      }
    }, [notificationSystem]);


    if (loading) return <p>Loading notifications...</p>;

    if (notificationSystem.length === 0)
    return <p>No notifications available.</p>;

  return (
    <div className="notif-system-container">
      <div className="ns-header">
        <div className="ns-left">
            <h2>
              <GoBell size={18}/> Notifications System
            </h2>
            <p>Stay update on your activity </p>
        </div>
        <div className="ns-right">
            <button onClick={handleMarkAllAsRead}><HiCheck/>Mark all as Read</button>
            <button><HiOutlineExclamationCircle/>Notification setting</button>
        </div>
      </div>

      {/* BODY  */}
      <div className="ns-body">
        <ul>
          {notificationSystem.map((notif) => (
            <li key={notif.id} style={{borderLeft:`3px solid ${NOTIF_TYPE[notif.type] || '#fff'}` , backgroundColor: notif.is_read ? '#eee' : '#fff'}}>
              <div className='sn-text'>
                <p style={{fontWeight:'bold', fontSize:'14px'}}>{notif.message}</p>
                 <p className='sn-date'>
                 {new Date(notif.created_at).toLocaleString()}
                </p>
              </div>

              <div className='sn-btn'>
                {!notif.is_read && (
                  <button onClick={() => handleMarkAsRead(notif.id)}>
                    Mark
                  </button>
                )}
                <button onClick={() => handleDelete(notif.id)}>
                  <HiMiniTrash style={{color:'red', fontSize:'12px'}}/>
                </button>
              </div>
              
            </li>
          ))}
        </ul>
      </div>

    </div>
  )
}

export default SystemNotifications