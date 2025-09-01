import React, { useEffect, useState } from 'react'
import { getAllNotif } from '../services/ApiServices';
import BootstrapTooltip from '../components/Tooltip';
import { IoEyeSharp } from 'react-icons/io5';
import { HiMiniTrash } from 'react-icons/hi2';
import '../style/UI/NavbarAllNotification.css';
import { RiCheckDoubleFill, RiCheckFill } from 'react-icons/ri';

const NavbarAllNotifications=({userId})=> {
    //STATE
    const [allNotif, setAllNotif] = useState([]);
    const [loading, setLoading] = useState(false);

    //DEBUG
    console.log('File all noti ini menerima data userId:', userId)

    //FUNCTION
    //1. FUNCTION TYPE NOTIF COLOR
    const ALL_BORDER = {
        workspace_assigned:"#6a11cb",
        remove:"#bf2e2e",
        card_assigned:"#889E73",
        card_unassigned:"#A94A4A",
        mention:'#5D12EB',
        reply:'#2575fc',
    }
    
    const fetchAllNotif = async() => {
        try{
            const result = await getAllNotif(userId);
             console.log("Hasil getAllNotif:", result);
            setAllNotif(result.data.data)
        }catch(error){
            console.log('Failed to fetch all notification:', error)
        }finally{
            setLoading(false);
        }
    }

    useEffect(()=>{
        if(userId) {
            fetchAllNotif();
        }
    },[userId])


    if (loading) return <p>Loading notifications...</p>;
    
    if (allNotif.length === 0)
    return <div class="empty-mess">
            <h3>You're all caught up 🎉</h3>
            <p>We’ll notify you when there’s something new.</p>
          </div>;
        
  return (
    <div className="allNotif-nav">
      <ul>
        {allNotif.map((notif) => (
          <li key={notif.id} style={{borderLeft:`3px solid ${ALL_BORDER[notif.type] || '#fff'}` , backgroundColor: notif.is_read ? '#eee' : '#fff'}}>
            <div className='sn-text'>
              <p style={{fontWeight:'bold', fontSize:'12px'}}>{notif.message}</p>
               <p className='sn-date'>
               {new Date(notif.created_at).toLocaleString()}
              </p>
            </div>

            {/* <div className="sn-btn">
              {!notif.is_read ? (
                <BootstrapTooltip>
                <button>
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
            </div> */}

    
          </li>
        ))}
      </ul>
    </div>
  )
}

export default NavbarAllNotifications