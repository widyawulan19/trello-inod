import React, { useEffect, useState } from 'react'
import { getChecklistItemChecked, getChecklistItemUnchecked, getTotalChecklistItemByCardId, getTotalMessageInCard } from '../services/ApiServices'
import { HiOutlineChatBubbleLeftRight,HiOutlineCheckCircle, HiOutlinePaperClip } from 'react-icons/hi2'
import '../style/modules/CardFooter.css'
import BootstrapTooltip from '../components/Tooltip'

const CardFooter=({cardId, totalFile, unreadCount,hasNewChat, notifications, handleMarkAsRead, checklistTotal,checkChecklist})=> {
    //STATE
    const [stats, setStats] = useState({total:0, checked:0, unchecked:0})

    //SHOW TOTAL CHATS
    const [messageCount, setMessageCount] = useState(null);

    //debug
    console.log('total file berhasil diteruksan ke card footer:', totalFile);
    
    //FUNCTION
    //1. fetch checklist stats
    const fetchChecklistStats = async(cardId) =>{
        try{
            const [totalRes, checkedRes, uncheckedRes] = await Promise.all([
                getTotalChecklistItemByCardId(cardId),
                getChecklistItemChecked(cardId),
                getChecklistItemUnchecked(cardId)
            ]);
            return {
                total: totalRes.data.total,
                checked: checkedRes.data.checked,
                unchecked: uncheckedRes.data.unchecked
            }
        }catch(error){
            console.error('Error Fetching checklist stats:', error)
            return {total:0, checked:0, unchecked:0}
        }
    }

    //2. fetch stats summary
    useEffect(()=>{
        const loadStats = async () =>{
            const data = await fetchChecklistStats(cardId)
            setStats(data)
        }
        loadStats()
    },[cardId])


    //3. FUNCTION GET TOTAL CHAT 
useEffect(() => {
    const fetchMessageCount = async () => {
  try {
    const response = await getTotalMessageInCard(cardId);
    console.log('Fetched total chat response:', response); // 👈 tambahkan ini
    if (response && response.data && typeof response.data.messageCount !== 'undefined') {
      setMessageCount(response.data.messageCount);
    } else {
      console.warn('Unexpected response format:', response);
    }
  } catch (error) {
    console.error('Failed to fetch message count:', error);
  }
};

    if (cardId) {
      fetchMessageCount();
    }
}, [cardId]);

//DEBUG
//   console.log('file ini menerima total message count:', messageCount);
  console.log('file ini menerima data cardId:', cardId);

  return (
    <div className='cfoot-container'>
        <BootstrapTooltip title='Chat' placement='top'>
            <button>
                <HiOutlineChatBubbleLeftRight className='cf-icon'/>
                {messageCount} 
                {hasNewChat && (
                    <span style={{ color: "red", marginLeft: "8px" }}>★</span>
                )}
            </button>
        </BootstrapTooltip>
       
        <BootstrapTooltip title='Attachment' placement='top'>
            <button>
                <HiOutlinePaperClip className='cf-icon'/>
                {totalFile}
            </button>
        </BootstrapTooltip>
       
        <BootstrapTooltip title='Total checklist' placement='top'>
            <button>
                <HiOutlineCheckCircle className='cf-icon'/> 
                {/* {stats.checked}/{stats.total} */}
                <p>{checkChecklist?.checked} / {checklistTotal?.total} </p>
            </button>
        </BootstrapTooltip>
    </div>
  )
}

export default CardFooter

{/* <div>
            <p>Total Items: {stats.total}</p>
            <p>Checked: {stats.checked}</p>
            <p>Unchecked: {stats.unchecked}</p>
    </div> */}