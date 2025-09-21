import React, { useEffect, useState } from 'react'
import { deleteNotificationById, getNotificationForUser, getPathToCardId, patchReadNotification, viewChatFromNotification } from '../services/ApiServices';
import { HiBell, HiCheck, HiMiniTrash } from 'react-icons/hi2';
import { HiOutlineExclamationCircle } from "react-icons/hi2";
import '../style/UI/NotificationPage.css'
import { GoBell } from "react-icons/go";
import BootstrapTooltip from '../components/Tooltip';
import { useNavigate } from 'react-router-dom';

const NotificationPage=({
    userId,
    notifications,
    setNotifications,
  })=> {
  //STATE
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  //DEBUG
  console.log('File notification menerima userId:', userId);
  console.log('file ini menerima data notifications:', notifications);

  const COLOR_NOTIF = {
    mention:'#5D12EB',
    reply:'#2575fc',
  } 

  //FUNCTION
  useEffect(() => {
      if (notifications && notifications.length >= 0) {
        setLoading(false);
      }
    }, [notifications]);
  

  //1. fungsi mark notification
  const handleMarkAsRead = async (id) =>{
    try{
      await patchReadNotification(id);
      setNotifications((prev) =>
        prev.map((notif)=>
          notif.id === id ? { ...notif, is_read: true} : notif
        )
      );
    } catch (error){
      console.error('Error markeing as read:', error);
    }
  }

  //2. fungsi menghapus notifikasi
  const handleDeleteNotification = async(id) =>{
    try{
      await deleteNotificationById(id);
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    }catch(error){
      console.error('Error deleting notification:', error);
    }
  };

  useEffect(() => {
  console.log('Notifikasi yang diterima:', notifications);
}, [notifications]);



//4. fungsi untuk pergi ke card 
const handleNavigateToCard = async (chatId, notificationId) => {
  console.log('Trying to navigate to card with chatId:', chatId);

  try {
    const response = await getPathToCardId(chatId);
    console.log('Response from getPathToCardId:', response.data);

    //mark as read
    handleMarkAsRead(notificationId);

    const { workspaceId, boardId, listId, cardId } = response.data;
    navigate(`/layout/workspaces/${workspaceId}/board/${boardId}/lists/${listId}/cards/${cardId}`);
  } catch (error) {
    console.error('Failed to navigate to card details:', error);
  }
};


  return (
    <div className='notif-container'>
      {/* <div className="notif-header">
        <div className="notif-left">
          <h2>
            <GoBell size={18}/> Notifications Chat
          </h2>
          <p>Stay update on your tasks and mention</p> 
        </div>
      </div> */}
     
     <div className="notif-body">
      {notifications.length === 0 ? (
        <div class="empty-mess">
          <h3>You're all caught up 🎉</h3>
          <p>We’ll notify you when there’s something new.</p>
        </div>
        ):(
          <div className='notif-box'>
            <ul>
              {notifications.map((notif)=>(
                // <li key={notif.id} style={{backgroundColor: COLOR_NOTIF[notif.type] || '#fff'}}>
                <li key={notif.id} style={{borderLeft: `3px solid ${COLOR_NOTIF[notif.type] || '#ddd'}`, backgroundColor: notif.is_read ? '#eee' : '#fff'}}>
                  <div className="notif-content">
                    <div className="nc-header">
                      <div className="nch-left">
                        <p className="font-medium">
                          {notif.type === 'mention'
                            ? '📢 Kamu dimention:'
                            : notif.type === 'reply'
                            ? '💬 Balasan untukmu:'
                            : '🔔 New Message'}
                        </p>
                        <p  className='nch-p'>{notif.message}</p>
                      </div>
                      <div className="nch-right">
                        <p className="text-xs text-gray-500" >
                          {new Date(notif.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* BODY  */}
                    <div className="nc-btn">
                      {!notif.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                        >
                          Mark as Read
                        </button>
                      )}
                      
                      <BootstrapTooltip title='Delete Notif' placement='top'>
                        <button 
                          className='nc-delete-btn'
                          onClick={()=> handleDeleteNotification(notif.id)}
                        > 
                          <HiMiniTrash/>
                        </button>
                      </BootstrapTooltip>
                      <button onClick={() => handleNavigateToCard(notif.chat_id, notif.id)}>
                        View
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationPage