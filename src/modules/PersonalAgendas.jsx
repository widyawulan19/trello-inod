import React, { useEffect, useState } from 'react';
import '../style/modules/PersonalAgendas.css';
import { FaCircle } from 'react-icons/fa6';
import { getUnfinishAgenda, deletAgendaUser } from '../services/ApiServices';
import BootstrapTooltip from '../components/Tooltip';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from '../context/Snackbar';
import { IoTrash, IoCalendar } from 'react-icons/io5';
import { LiaNetworkWiredSolid } from "react-icons/lia";

const PersonalAgendas = ({ userId }) => {
  const [agendas, setAgendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [selectedAgenda, setSelectedAgenda] = useState(null);

  // Fetch unfinished agendas
  const fetchUnfinishedAgenda = async () => {
    try {
      const response = await getUnfinishAgenda(userId);
      setAgendas(response.data.data);
    } catch (error) {
      console.error('Error fetching unfinished agenda!', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUnfinishedAgenda();
    }
  }, [userId]);

    //navigate to agenda page
  const navigateToAgendaPage = () =>{
    navigate('agenda-page')
  }

  const renderAgendaDate = (isoDate) => {
    const date = new Date(isoDate);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();

    return (
      <div className="pnh-right">
        <h3>{day}</h3>
        <p>{month} {year}</p>
      </div>
    );
  };

  const handleDeleteAgenda = async (agendaId) => {
    const confirm = window.confirm("Are you sure you want to delete this agenda?");
    if (!confirm) return;

    try {
      await deletAgendaUser(agendaId, userId);
      showSnackbar('Successfully deleted agenda', 'success');
      fetchUnfinishedAgenda();
    } catch (error) {
      console.log('Error deleting agenda!', error);
      showSnackbar('Failed to delete agenda', 'error');
    }
  };

   const navigateToAgenda = () =>{
    navigate('agenda-page')
  }

  if (loading) return <p>Loading agenda...</p>;
  if (agendas.length === 0) {
        return (
              <div className='no-workspace'>
                <div className="no-icon">
                  <LiaNetworkWiredSolid />
                </div>
                <h2>Let’s create your first Agenda!</h2>
                <p>Yuk mulai produktif! tambahkan agenda pertamamu untuk mengelola project dan kolaborasi tim.</p>
                <div className="btn-create-workspace" onClick={navigateToAgendaPage}>
                  Add New Agenda
                </div>
              </div>
            );
    };
  
 
  return (
    <div className="pa-container">
      {agendas.map((agenda) => (
        <div key={agenda.id} className="pa-box">
          <div className="pa-title">
            <h4>#{agenda.title}</h4>
            <div className="sa">
              <p style={{color:`${agenda.color}`}}>{agenda.status_name}</p>
            </div>
          </div>

          <div className="pa-date">
             {renderAgendaDate(agenda.agenda_date)}
             <div className="footer-delete" onClick={() => handleDeleteAgenda(agenda.id)}>
                <IoTrash className='pa-delete'/>
              </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PersonalAgendas;


{/* <div className="personal-agenda-container">
      {agendas.map((agenda) => (
        <div key={agenda.id} className="personal-agenda-box">
          <div className="pn-header">
            <div className="pnh-left">
              <h4 style={{ color: agenda.color}}>#{agenda.title}</h4>
              <BootstrapTooltip title="Agenda Status" placement="top">
                <div className="agenda">
                    <span
                      style={{
                        border: `1px solid ${agenda.color}`,
                        backgroundColor: 'white',
                        color:'#333',
                        borderRadius:'8px',
                        padding:'3px 10px',
                        fontSize:'10px',
                      }}
                    >{agenda.status_name}</span>
                  
                </div>
              </BootstrapTooltip>
            </div>
            {renderAgendaDate(agenda.agenda_date)}
            <div className="pn-footer-right">
              <BootstrapTooltip title="Delete Agenda" placement="top">
                <div className="footer-delete" onClick={() => handleDeleteAgenda(agenda.id)}>
                  <IoTrash />
                </div>
              </BootstrapTooltip>
            </div>
          </div>
        </div>
      ))}
    </div> */}