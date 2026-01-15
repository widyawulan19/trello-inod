import React, { useEffect, useState } from 'react'
import { getCardPriority } from '../services/ApiServices'
import { HiMiniLightBulb } from 'react-icons/hi2'
import '../style/modules/BoxStatus.css'

const CardSelectedProperties=({cardId})=> {
    //STATE
    const [priorities, setPriorities] = useState([])
    console.log('file card selected properties menerima cardId:', cardId)

    const fetchSelectedPriorities = async (cardId) =>{
          try{
            const response = await getCardPriority(cardId);
            setPriorities(response.data)
          }catch(error){
            console.error('Error fetching priority card', error)
          }
        }
    
        useEffect(()=>{
          if(cardId){
            fetchSelectedPriorities(cardId);
          }
        },[cardId])

    /* =========================
    PRIORITY THEME MAPPING
    ========================= */
    const PRIORITY_THEME = {
      low: 'status-confirmed',
      medium: 'status-confirmed',
      high: 'status-rejected',
      no: 'status-unknown',
    };
    
    /* =========================
      NORMALIZER (WAJIB)
    ========================= */
    const normalizePriority = (name = '') => {
      return name
        .toLowerCase()
        .replace('priority', '')
        .trim();
    };

    /* =========================
      STYLE HELPER
    ========================= */
    const getPriorityStyle = (priorityName) => {
      const key = normalizePriority(priorityName);
      const theme = PRIORITY_THEME[key] || 'status-unknown';

      return {
        backgroundColor: `var(--${theme}-bg)`,
        border: `1px solid var(--${theme}-border)`,
        color: `var(--${theme}-text)`,
      };
    };

  return (
      <div className='selected-priorities-container'>
        {priorities.map(priority => (
          <div 
            key={priority.id}
            className='sp-box'
            style={getPriorityStyle(priority.name)}
          >
            <HiMiniLightBulb className="priority-icon" />
            {priority.name}
          </div>
        ))}
      </div>
  )
}

export default CardSelectedProperties