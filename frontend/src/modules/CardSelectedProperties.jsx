import React, { useEffect, useState } from 'react'
import { getCardPriority } from '../services/ApiServices'
import { HiMiniLightBulb } from 'react-icons/hi2'

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

  return (
        <div className='selected-priorities-container'>
          {priorities.map(priority => (
            <div 
              key={priority.id}
              style={{ 
                backgroundColor: priority.color.startsWith('#') ? `${priority.color}55` : priority.color,
                color: priority.color,
                padding: "4px",
                margin: "2px",
                borderRadius: "4px",
                // display: "inline-block",
                display:'flex',
                alignItems:'center',
                justifyContent:'flex-start',
                fontSize: '10px',
                fontWeight: 'bold',
                border:'1px solid transparent'
                // border: `1px solid ${priority.color}`
              }}
            >
              <HiMiniLightBulb style={{ color: priority.color, marginRight: '5px' }} />
              {priority.name}
            </div>
          ))}
        </div>
  )
}

export default CardSelectedProperties