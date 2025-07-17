import React, { useEffect, useState } from 'react'
import '../style/modules/PersonalAgendas.css'
import { FaCircle, FaXmark } from 'react-icons/fa6';
import { HiArrowRight } from 'react-icons/hi2';
import BootstrapTooltip from '../components/Tooltip';
import { getAgendaUser, getUnfinishAgenda } from '../services/ApiServices';
import { useNavigate } from 'react-router-dom';

const AgendaUser = ({userId,onClose}) => {
    //STATE
    const [agendas,setAgendas] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate()


    //FUNCTION
    //1. fetch data agenda user 
    const fetchAgendaUser = async() =>{
        try{
            const response = await getUnfinishAgenda(userId);
            setAgendas(response.data.data);
        }catch(error){
            console.log('Error fetch unfinished agenda:', error)
        }finally{
            setLoading(false)
        }
    }

    useEffect(()=>{
        if(userId){
            fetchAgendaUser()
        }
    },[userId])

    //2. function date 
    const renderAgendaDate = (isoDate) => {
        const date = new Date(isoDate);
        const day = date.getDate(); // ex: 24
        const month = date.toLocaleString('default', { month: 'short' }); // ex: Jul
        const year = date.getFullYear(); // ex: 2025

        return (
            <div className="pnh-right">
                <h3>{day}</h3>
                <p>{month} {year}</p>
            </div>
        );
    };

    //3. function navigate to app router
    const handleNavigateToPage = () =>{
        navigate('/agenda-page')
        onClose()
    }



    if(loading) return <p>Loading agenda ...</p>
    if(agendas.length === 0) return <p>No agendas found for this user</p>

  return (
    <div className='personal-agenda-navbar'>
        <div className="agenda-header">
            <h3>Your Personal Agenda</h3>
            <FaXmark onClick={onClose} className='ah-icon'/>
        </div>
        {agendas.map(agenda =>(
        <div key={agenda.id} className="personal-agenda-box">
            <div className="pn-header">
                <div className="pnh-left">
                    <FaCircle className='pnh-icon'
                        style={{
                            color:agenda.color
                        }}
                    />
                    <h4
                        style={{color:agenda.color}}
                    >#{agenda.title}</h4>
                </div>
                {renderAgendaDate(agenda.agenda_date)}
            </div>
            {/* <div className="pn-content">
                <p>
                    {agenda.description}
                </p>
            </div> */}
            <div className="pn-footer">
                <BootstrapTooltip title='Agenda Status' placement='top'>
                    <div className="agenda" 
                        style={{
                            border: `1px solid ${agenda.color}`,
                            backgroundColor:agenda.color
                        }}>
                        {agenda.status_name}
                    </div>
                </BootstrapTooltip>
                <div className="read" onClick={handleNavigateToPage}>
                    READ MORE <HiArrowRight className='read-icon'/>
                </div>
            </div>
        </div>
        ))}
    </div>
  )
}

export default AgendaUser