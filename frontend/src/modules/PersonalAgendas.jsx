import React, { useEffect, useState } from 'react';
import '../style/modules/PersonalAgendas.css';
import { FaCircle } from 'react-icons/fa6';
import { getUnfinishAgenda, deletAgendaUser } from '../services/ApiServices';
import BootstrapTooltip from '../components/Tooltip';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from '../context/Snackbar';
import { IoTrash, IoCalendar } from 'react-icons/io5';

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

  const renderAgendaDate = (isoDate) => {
    const date = new Date(isoDate);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();

    return (
      <div className="pnh-right">
        <div className="right-box">
          <h3>{day}</h3>
          <p>{month} {year}</p>
        </div>
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
        return(
            <div className="no-agenda">
                {/* <h2>Your agenda will show here!</h2> */}
                <div className="no-icon">
                  <IoCalendar/>
                </div>
                <p>Your agenda will show here!</p>
                {/* <p>Gunakan Personal Notes untuk menyimpan ide, daftar tugas, atau hal penting lainnya secara pribadi.</p> */}
                <div className="btn-create-agenda" onClick={navigateToAgenda}>
                    Add New Agendas
                </div>
            </div>
        )
    };
  
 
  return (
    <div className="personal-agenda-container">
      {agendas.map((agenda) => (
        <div key={agenda.id} className="personal-agenda-box">
          <div className="pn-header">
            <div className="pnh-left">
              <FaCircle className='pnh-icon' style={{ color: agenda.color}} />
              <h4 style={{ color: agenda.color}}>#{agenda.title}</h4>
            </div>
            {renderAgendaDate(agenda.agenda_date)}
          </div>

          <div className="pn-footer">
            <BootstrapTooltip title="Agenda Status" placement="top">
              <div className="agenda"
                style={{
                  border: `1px solid ${agenda.color}`,
                  backgroundColor: agenda.color,
                }}>
                {agenda.status_name}
              </div>
            </BootstrapTooltip>
            <div className="pn-footer-right">
              <BootstrapTooltip title="Finished Status" placement="top">
                <div 
                className='footer-status'
                style={{
                  color: agenda.is_done ? '#246c12' : '#821715',
                  backgroundColor: agenda.is_done ? '#b6f7a6' : '#f7a7a6'
                }}>
                  {agenda.is_done ? 'Finished' : 'Not Finished'}
                </div>
              </BootstrapTooltip>

              <BootstrapTooltip title="Delete Agenda" placement="top">
                <div className="footer-delete" onClick={() => handleDeleteAgenda(agenda.id)}>
                  <IoTrash />
                </div>
              </BootstrapTooltip>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PersonalAgendas;
