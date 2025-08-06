import React, { useEffect, useState } from 'react'
import { deleteSystemNotification, getPathToCard, getPathToSystemNotif, marksNotificationSystem } from '../services/ApiServices';
import { GoBell } from 'react-icons/go';
import { HiCheck, HiEye, HiMiniTrash, HiOutlineExclamationCircle } from 'react-icons/hi2';
import { IoEyeSharp } from "react-icons/io5";
import { FaEyeSlash } from "react-icons/fa";
import BootstrapTooltip from '../components/Tooltip';
import '../style/UI/SystemNotification.css'
import { RiCheckDoubleFill, RiCheckFill } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from '../context/Snackbar';

const NavbarSystemUi=({
    userId,
    notificationSystem,
    setNotificationSystem,
    fetchNotificationSystem,
    unreadCountSystem,
    setUnreadCountSystem
})=> {

    //STATE
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate()
    const {showSnackbar} = useSnackbar();

    //DEBUG
    console.log('file navbar notification system ini menerima data userId:', userId);
    console.log('file navbar notification system ini menerima data notification Sytem:', notificationSystem);

    //FUNCTION
    //1. FUNCTION TYPE NOTIF
    const NOTIF_TYPE = {
      workspace_assigned:"#6a11cb",
      remove:"#bf2e2e",
      card_assigned:"#889E73",
      card_unassigned:"#A94A4A",
    }

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
                showSnackbar('Successfully delete notification','success');
            }catch(error){
                console.error('Failed to delete notification:', error)
                showSnackbar('Failed to delete notification','error');
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
            setUnreadCountSystem(0);
          } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
          }
        };


        useEffect(() => {
          if (notificationSystem && notificationSystem.length >= 0) {
            setLoading(false);
          }
        }, [notificationSystem]);

        

        //5. function navigate to system notification
        const handleNavigate = async (notif) => {
          const { type, workspace_id, card_id } = notif;

          if (type === 'workspace_assigned') {
            await handleMarkAsRead(notif.id);
            navigate(`workspaces/${workspace_id}`);
          }

          if (type === 'card_assigned') {
            try {
              const response = await getPathToCard(card_id);
              const data = response.data;

              // sebelum navigate tandai sudah dibaca
              await handleMarkAsRead(notif.id);

              navigate(`workspaces/${data.workspace_id}/board/${data.board_id}/lists/${data.list_id}/cards/${data.card_id}`);
            } catch (error) {
              console.error('Failed to get card path:', error);
            }
          }
        };

    
    
        if (loading) return <p>Loading notifications...</p>;
    
        if (notificationSystem.length === 0)
        return <p>No notifications available.</p>;

  return (
      <div className="notifBar-system-container">
  
        {/* BODY  */}
        <div className="nav-s-body">
          <ul>
            {notificationSystem.map((notif) => (
              <li key={notif.id} style={{borderLeft:`3px solid ${NOTIF_TYPE[notif.type] || '#fff'}` , backgroundColor: notif.is_read ? '#eee' : '#fff'}}>
                <div className='sn-text'>
                  <p style={{fontWeight:'bold', fontSize:'12px'}}>{notif.message}</p>
                   <p className='sn-date'>
                   {new Date(notif.created_at).toLocaleString()}
                  </p>
                </div>
  
                <div className='sn-btn'>
                  {!notif.is_read ? (
                    <BootstrapTooltip title='Mark As Read' placement='top'>
                        <button onClick={() => handleMarkAsRead(notif.id)}>
                            <RiCheckFill/>
                        </button>
                    </BootstrapTooltip>
                  ):
                   <BootstrapTooltip title='Mark As Read' placement='top'>
                        <button>
                            <RiCheckDoubleFill/>
                        </button>
                    </BootstrapTooltip>
                  }
                  <BootstrapTooltip title='View Chat' placement='top'>
                    <button onClick={()=> handleNavigate(notif)}>
                      <HiEye/>
                    </button>
                  </BootstrapTooltip>
                  <BootstrapTooltip title='Delete Notif' placement='top'>
                    <button onClick={() => handleDelete(notif.id)}>
                      <HiMiniTrash style={{color:'red', fontSize:'12px'}}/>
                    </button>
                  </BootstrapTooltip>
                </div>
                
              </li>
            ))}
          </ul>
        </div>
  
      </div>
    )
}

export default NavbarSystemUi