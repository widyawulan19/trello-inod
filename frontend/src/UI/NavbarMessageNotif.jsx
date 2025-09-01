import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { deleteNotificationById, getPathToCardId, patchReadNotification } from '../services/ApiServices';
import { GoBell } from 'react-icons/go';
import { HiCheck, HiEye, HiMiniTrash, HiOutlineExclamationCircle } from 'react-icons/hi2';
import BootstrapTooltip from '../components/Tooltip';
import { RiCheckDoubleFill, RiCheckFill } from "react-icons/ri";
import '../style/UI/NotificationPage.css'
import { useSnackbar } from '../context/Snackbar';

const NavbarMessageNotif=({
    userId,
    notifications = [],
    setNotifications
})=> {

    //STATE
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const {showSnackbar} = useSnackbar();

    //DEBUG
    console.log('Halaman navbar notif message menerima data userId:', userId);
    console.log('Halaman navbar notif message menerima data notifications:', notifications);

    //FUNCTION
    //1. function color
    const COLOR_NOTIF = {
         mention:'#5D12EB',
         reply:'#2575fc',
     } 

    //2. mark notification
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

    //3. delete notification
    const handleDeleteNotification = async(id) =>{
        try{
          await deleteNotificationById(id);
          setNotifications((prev) => prev.filter((notif) => notif.id !== id));
          showSnackbar('Succesfully delete notification', 'success');
        }catch(error){
          console.error('Error deleting notification:', error);
          showSnackbar('Failed deleting notification:', 'error');
        }
    };
    
    useEffect(() => {
      console.log('Notifikasi yang diterima:', notifications);
    }, [notifications]);

    //4. function navigate to card
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
      <div className='notif-mess-container'>
       <div className="nav-notif-body">
        {notifications.length === 0 ? (
          <p>Tidak ada notifikasi</p>
          ):(
            <div className='notif-box'>
              <ul>
                {notifications.map((notif)=>(
                  // <li key={notif.id} style={{backgroundColor: COLOR_NOTIF[notif.type] || '#fff'}}>
                  <li key={notif.id} style={{borderLeft: `3px solid ${COLOR_NOTIF[notif.type] || 'red'}`, backgroundColor: notif.is_read ? '#eee' : '#fff'}}>
                    <div className="notif-content">
                      <div className="nc-header">
                        <div className="nch-left">
                          <p className="font-medium" style={{fontSize:'12px'}}>
                            {notif.type === 'mention'
                              ? '📢 Kamu dimention:'
                              : notif.type === 'reply'
                              ? '💬 Balasan untukmu:'
                              : '🔔 Notifikasi'}
                          </p>
                          <p style={{color:'#5e5e5e', fontSize:'12px'}}>{notif.message}</p>
                        </div>
                        {/* <div className="nch-right">
                          <p style={{fontSize:'10px', color:'grey'}}>
                            {new Date(notif.created_at).toLocaleString()}
                          </p>
                        </div> */}
                      </div>
  
                      {/* BODY  */}
                      <div
                       className="nc-btn"
                       style={{
                        // border:'1px solid red',
                        display:'flex',
                        alignItems:'end',
                        justifyContent:'space-between'
                       }}
                        >
                        <div className="nc-date">
                            <p style={{fontSize:'10px', color:'grey'}}>
                              {new Date(notif.created_at).toLocaleString()}
                            </p>
                        </div>
                        <div className="nc-btn-right">
                            {!notif.is_read ? (
                                <BootstrapTooltip title='Mark As Read' placement='top'>
                                    <button
                                        onClick={() => handleMarkAsRead(notif.id)}
                                    >
                                        <RiCheckFill/>
                                    </button>
                                </BootstrapTooltip>
                            ):(
                                <BootstrapTooltip>
                                    <button>
                                        <RiCheckDoubleFill/>
                                    </button>
                                </BootstrapTooltip>
                            )}

                            <BootstrapTooltip title='View Chat' placement='top'>
                                <button onClick={() => handleNavigateToCard(notif.chat_id, notif.id)}>
                                        <HiEye/>
                                </button>
                            </BootstrapTooltip>

                            <BootstrapTooltip title='Delete Notif' placement='top'>
                                <button 
                                    style={{color:'red'}}
                                    onClick={()=> handleDeleteNotification(notif.id)}
                                > 
                                    <HiMiniTrash/>
                                </button>
                            </BootstrapTooltip>
                                
                        </div>
                        
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

export default NavbarMessageNotif