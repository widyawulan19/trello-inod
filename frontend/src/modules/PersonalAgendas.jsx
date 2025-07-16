import React, { useEffect, useState } from 'react'
import '../style/modules/PersonalAgendas.css'
import { FaCircle } from 'react-icons/fa6';
import { HiArrowRight, HiXMark } from 'react-icons/hi2';
import { getAgendaUser } from '../services/ApiServices';
import BootstrapTooltip from '../components/Tooltip';
import { useNavigate } from 'react-router-dom';

const PersonalAgendas = ({userId}) => {
    //STATE
    const [agendas,setAgendas] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate()
    const [selectedAgenda, setSelectedAgenda] = useState(null);

    //FUNCTION
    //1. fetch data agenda user 
    const fetchAgendaUser = async() =>{
        try{
            const response = await getAgendaUser(userId);
            setAgendas(response.data);
        }catch(error){
            console.log('Error fetch data agenda:', error)
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

    //3, function render agenda
    const handleShowModals = (agenda) => {
        setSelectedAgenda(agenda);
    };

    const handleCloseModals = () => {
        setSelectedAgenda(null);
    };

    //4. navigate 
    const handleNavigateToAgendaPage = () =>{
        navigate('/agenda-page')
    }



    if(loading) return <p>Loading agenda ...</p>
    if(agendas.length === 0) return <p>No agendas found for this user</p>

  return (
    <div className='personal-agenda-container'>
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
                {/* <div className="read" onClick={handleNavigateToAgendaPage}>
                    READ MORE <HiArrowRight className='read-icon'/>
                </div> */}
                {/* {selectedAgenda && (
                    <div className="agenda-modals">
                    <div className="agenda-modals-box">
                        <div className="modals-header">
                        <h3 style={{ color: selectedAgenda.color }}>{selectedAgenda.title}</h3>
                        <HiXMark className='close-icon' onClick={handleCloseModals} />
                        </div>
                        <div className="modals-content">
                        <div className="modals-main">
                            <p><strong>Description:</strong> {selectedAgenda.description}</p>
                            <p><strong>Date:</strong> {renderAgendaDate(selectedAgenda.agenda_date)}</p>
                            <p><strong>Reminder:</strong> {new Date(selectedAgenda.reminder_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            <p><strong>Status:</strong> {selectedAgenda.status_name}</p>
                        </div>
                        </div>
                    </div>
                    </div>
                )} */}
            </div>
        </div>
        ))}
    </div>
  )
}

export default PersonalAgendas