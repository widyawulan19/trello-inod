import React, { useEffect, useState } from 'react';
import '../style/pages/AgendaPage.css';
import { useUser } from '../context/UserContext';
import { createNewAgenda, deletAgendaUser, getAgendaUser, updateAgendaByUser, updateAgendaDescription, updateAgendaTitle, updateAgendaUser } from '../services/ApiServices';
import { FaXmark } from 'react-icons/fa6';
import { IoCheckmarkSharp, IoSearch, IoTrash } from "react-icons/io5";
import { HiCalendarDateRange, HiOutlineClock, HiOutlinePlus, HiXMark } from 'react-icons/hi2';
import { AiFillClockCircle, AiFillSchedule } from "react-icons/ai";
import { useSnackbar } from '../context/Snackbar';
import { IoCreateOutline, IoCalendar } from "react-icons/io5";
import { HiDocumentText } from "react-icons/hi2";
import BootstrapTooltip from '../components/Tooltip';

function AgendaPage() {
  const { user } = useUser();
  const userId = user.id;
  const {showSnackbar} = useSnackbar();
  const [agendas, setAgendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedAgenda, setSelectedAgenda] = useState(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showFormAgenda, setShowFormAgenda] = useState(false);

  // edit desc 
  const [editAgendaDescription, setEditAgendaDescription] = useState(null);
  const [newDescriptionAgenda, setNewDescriptionAgenda] = useState('');

  // edit title
  const [editAgendaTitle, setEditAgendaTitle] = useState(null);
  const [newTitleAgenda, setNewTitleAgenda] = useState('');



  const [editAgendaId, setEditAgendaId] = useState(null);
  const [newAgenda, setNewAgenda] = useState({
    title: '',
    description: '',
    agenda_date: '',
    reminder_time: '',
    status_id: ''
  })

//FUNCTION 
//1. fetch data agenda
  const fetchDataAgenda = async () => {
    try {
      const response = await getAgendaUser(userId);
      setAgendas(response.data);
    } catch (error) {
      console.error('Error fetching data agenda:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchDataAgenda();
    }
  }, [userId]);


  //2. function date 
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  //3. Filtered agenda list based on search and status
  const filteredAgendas = agendas.filter(agenda => {
    const matchSearch =
      agenda.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agenda.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus =
      selectedStatus === '' || agenda.status_name.toLowerCase() === selectedStatus.toLowerCase();

    return matchSearch && matchStatus;
  });

  //4. function create new agenda
  const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewAgenda({ ...newAgenda, [name]: value });
    };

    // 5. create 
    const handleCreateAgenda = async (e) => {
      e.preventDefault();

      try {
        const agendaDate = newAgenda.agenda_date;
        const reminderTime = newAgenda.reminder_time;
        const reminderDateTime = new Date(`${agendaDate}T${reminderTime}:00`).toISOString();

        const payload = {
          ...newAgenda,
          reminder_time: reminderDateTime,
          user_id: user.id,
        };

        if (editAgendaId) {
          // UPDATE AGENDA
          await updateAgendaUser(editAgendaId, user.id, payload);
          showSnackbar('Agenda updated successfully', 'success');
        } else {
          // CREATE AGENDA
          await createNewAgenda(payload);
          showSnackbar('Successfully created agenda', 'success');
        }

        // Reset state & refresh
        setNewAgenda({
          title: '',
          description: '',
          agenda_date: '',
          reminder_time: '',
          status_id: ''
        });
        setEditAgendaId(null);
        setShowFormAgenda(false);
        fetchDataAgenda();
      } catch (err) {
        console.error('Failed to save agenda:', err);
        showSnackbar('Failed to save agenda', 'error');
      }
    };

    //6. delete agenda
    const handleDeleteAgenda = async (agendaId) => {
      const confirm = window.confirm("Are you sure you want to delete this agenda?");
      if (!confirm) return;

      try {
        await deletAgendaUser(agendaId, userId);
        showSnackbar("Agenda deleted successfully", "success");
        fetchDataAgenda(); // refresh list
      } catch (err) {
        console.error("Failed to delete agenda:", err);
        showSnackbar("Failed to delete agenda", "error");
      }
    };



    //7. show form agenda
    const handleShowForm = () =>{
        setShowFormAgenda(!showFormAgenda);
    }

    const handleCloseForm = () =>{
        setShowFormAgenda(false)
    }

    // 8. show detail agenda 
       const handleShowModals = (agenda) => {
        setSelectedAgenda(agenda);
    };

    const handleCloseModals = () => {
        setSelectedAgenda(null);
    };

    //9. fungsi update finished status agenda
    const handleToggleDone = async(agendaId, userId, currentStatus) =>{
      try{
        await updateAgendaByUser(agendaId, userId, {is_done : !currentStatus});
        showSnackbar('Status update successfully', 'success');
        fetchDataAgenda();
      }catch(error){
        console.error('Updated failed!', error);
        showSnackbar('Error updating finished status!', 'error')
      }
    }

    //10. edit description 
    const handleEditDescription = (e, agendaId, currentDescription) =>{
      e.stopPropagation();
      setEditAgendaDescription(agendaId);
      setNewDescriptionAgenda(currentDescription);
    }

    const handleSaveDescription = async(agendaId) =>{
      try{
        await updateAgendaDescription(agendaId, {description:newDescriptionAgenda})
        setEditAgendaDescription(null);
        fetchDataAgenda();
      }catch(error){
        console.error('Error updating agenda description:', error);
      }
    }

    const handleKeyPressDescription = (e, agendaId) => {
      if (e.key === 'Enter' && !e.shiftKey) { // Enter = save, Shift+Enter = line break
        e.preventDefault();
        handleSaveDescription(agendaId);
      }
    };

    //11. edit title
    const handleEditTitle = (e, agendaId, currentTitle) => {
      e.stopPropagation();
      setEditAgendaTitle(agendaId);
      setNewTitleAgenda(currentTitle);
    };

    // simpan title baru
    const handleSaveTitle = async (agendaId) => {
      try {
        await updateAgendaTitle(agendaId, userId, newTitleAgenda); 
        setEditAgendaTitle(null);
        fetchDataAgenda(); // refresh data
      } catch (error) {
        console.error('Error updating agenda title:', error);
      }
    };

    // tekan enter untuk save
    const handleKeyPressTitle = (e, agendaId) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSaveTitle(agendaId);
      }
    };



  return (
    <div className='agenda-page-container'>
      <div className='agenda-page-header'>
        <div className="ap-title">
          <div className="ap-icon">
            <IoCalendar className='mini-icon'/>
          </div>
          <h2>Your Personal Agenda</h2>
        </div>
        
        {/* <h4>Stay organized, stay ahead.</h4> */}
        <p>
          Here's everything you've planned — from deadlines and meetings, to daily to-dos. Keep track of what matters most and never miss a thing.
        </p>
      </div>

      <div className="agenda-page-action">
        <div className="action-left">
            <IoSearch className='ac-icon'/>
            <input
                type="text"
                placeholder="Search agenda..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="action-right">
            <div className="dropdown-wrapper">
                <p>Filter by Status:</p>
                <div
                    className="dropdown-toggle"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                    {selectedStatus || 'All Statuses'} <span>▼</span>
                </div>

                {dropdownOpen && (
                    <ul className="dropdown-menu">
                    {['All Statuses', 'Trivial', 'Optional', 'Normal', 'Important', 'Critical'].map((status, index) => (
                        <li
                        key={index}
                        className={selectedStatus === status || (status === 'All Statuses' && selectedStatus === '') ? 'active' : ''}
                        onClick={() => {
                            setSelectedStatus(status === 'All Statuses' ? '' : status);
                            setDropdownOpen(false);
                        }}
                        >
                        {status}
                        </li>
                    ))}
                    </ul>
                )}
                </div>


            {/* form create new agenda  */}
            <div className="form-agenda" onClick={handleShowForm}>
                <HiOutlinePlus/>
                Add New
            </div>
        </div>
      </div>

      {/* SHOW FORM AGENDA  */}
      {showFormAgenda && (
        <div className="create-agenda-form">
            <div className="create-agenda-header">
              <div className="agenda-header-left">
                <div className="icon-agenda">
                  <HiCalendarDateRange/>
                </div>
                  <h3>Create New Agenda</h3>
              </div>
              
                <HiXMark onClick={handleCloseForm} className='cah-icon'/>
            </div>
            
            <form onSubmit={handleCreateAgenda}>
              <div className="ap-box">
                <label>Agenda title <span className='span-red'>*</span></label>
                <input
                    type="text"
                    name="title"
                    placeholder="Title"
                    value={newAgenda.title}
                    onChange={handleInputChange}
                    required
                />
              </div>
              <div className="ap-box">
                <label>Agenda description <span className='span-red'>*</span></label>
                <textarea
                    name="description"
                    placeholder="Description"
                    value={newAgenda.description}
                    onChange={handleInputChange}
                    required
                />
              </div>
                <div className="ap-box">
                  <label>Agenda date <span className='span-red'>*</span></label>
                  <input
                    type="date"
                    name="agenda_date"
                    value={newAgenda.agenda_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="ap-box">
                  <label> Agenda time <span className='span-red'>*</span></label>
                   <input
                    type="time"
                    name="reminder_time"
                    value={newAgenda.reminder_time}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <select
                    name="status_id"
                    value={newAgenda.status_id}
                    onChange={handleInputChange}
                    required
                >
                    <option value="">Select Status</option>
                    <option value="1">Trivial</option>
                    <option value="2">Optional</option>
                    <option value="3">Normal</option>
                    <option value="4">Important</option>
                    <option value="5">Critical</option>
                </select>
                <button type="submit">{editAgendaId ? 'Update Agenda' : 'Add Agenda'}</button>

            </form>
        </div>
      )}

      {/* END SHOW FORM AGENDA  */}
      <div className="agenda-page-content">
        <div className="agenda-table-box">
          {loading ? (
            <p>Loading agendas...</p>
          ):filteredAgendas.length === 0 ? (
            <div className="empty-agenda-container">
              <div className="empty-container">
                <h3>No agendas found</h3>
                <p>Kamu belum membuat agenda apa pun. Mulai buat jadwal atau rencana sekarang agar harimu lebih terorganisir!</p>
                <div className="btn-create-agenda" onClick={()=> setShowFormAgenda(true)}>
                  Create New Agenda
                </div>
              </div>
            </div> 
          ):(
            <table className='agenda-page-table'>
            <thead>
                <tr>
                <th>TITLE & DESCRIPTION</th>
                <th>DATE</th>
                <th>STATUS</th>
                <th>FINISHED</th>
                <th style={{textAlign:'center'}}>ACTION</th>
                </tr>
            </thead>
            <tbody>
                {filteredAgendas.map(agenda => (
                <tr key={agenda.id}>
                    <td className='title-box'>
                        <div className='title-container'>
                            <h5
                              onClick={()=> handleShowModals(agenda)}
                            >{agenda.title}</h5>
                            <p>{agenda.description}</p>
                        </div>
                    </td>
                    <td className='date-cont'>{formatDate(agenda.agenda_date)}</td>
                    <td className='status-cont'>
                        <div className='status' style={{backgroundColor:agenda.color}}>
                            {agenda.status_name}
                        </div>
                    </td>
                    <td className='done-cont'>
                      <BootstrapTooltip title='Click to Change status' placement='top'>
                        <div
                        className='done-agenda'
                          onClick={()=> handleToggleDone(agenda.id, agenda.user_id, agenda.is_done)}
                          style={{
                          color: agenda.is_done ? '#246c12' : '#821715',
                          backgroundColor: agenda.is_done ? '#b6f7a6' : '#f7a7a6'
                        }}>
                          {agenda.is_done ? 'Finished': ' Not Finished'}
                        </div>
                      </BootstrapTooltip>
                    </td>
                    <td>
                        <div className='action-page-icon'>
                          <BootstrapTooltip title='Edit Agenda' placement='top'>
                            {/* <div className='action-btn'><IoCreateOutline/></div> */}
                            <div
                              className='action-btn'
                              onClick={() => {
                                setEditAgendaId(agenda.id);
                                setNewAgenda({
                                  title: agenda.title,
                                  description: agenda.description,
                                  agenda_date: agenda.agenda_date.split('T')[0],
                                  reminder_time: new Date(agenda.reminder_time).toTimeString().slice(0, 5),
                                  status_id: agenda.status_id.toString()
                                });
                                setShowFormAgenda(true);
                              }}
                            >
                              <IoCreateOutline/>
                            </div>
                          </BootstrapTooltip>
                          <BootstrapTooltip title='Delete Agenda' placement='top'>
                            <div 
                              className='action-btn'
                              onClick={() => handleDeleteAgenda(agenda.id)}
                            >
                              <IoTrash/>
                            </div>
                          </BootstrapTooltip>
                          {/* <BootstrapTooltip title='Marks Agenda' placement='top'>
                             <div className='action-btn'><IoCheckmarkSharp/></div>
                          </BootstrapTooltip> */}
                        </div>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
          )}
            
            {/* FORM MODALS  */}
            {selectedAgenda && (
              <div className="agenda-modals">
                <div className="agenda-modals-box">
                    <div className="modals-header">
                      <div className="mh-left">
                        <div className="icon">
                          <AiFillSchedule/>
                        </div>
                        <div className="title">
                          {editAgendaTitle === selectedAgenda.id ? (
                            <input
                              type="text"
                              value={newTitleAgenda}
                              onChange={(e) => setNewTitleAgenda(e.target.value)}
                              onBlur={() => handleSaveTitle(selectedAgenda.id)}
                              onKeyDown={(e) => handleKeyPressTitle(e, selectedAgenda.id)}
                              autoFocus
                            />
                          ) : (
                            <h3
                              onClick={(e) =>
                                handleEditTitle(e, selectedAgenda.id, selectedAgenda.title)
                              }
                            >
                              {selectedAgenda.title}
                            </h3>
                          )}
                          <p>Agenda Details</p>
                        </div>

                      </div>
                      
                      <FaXmark className='close-icon' onClick={handleCloseModals} />
                    </div>
                    
                    <div className="modals-content">
                      {/* MODAL ACTIONS  */}
                      <div className="modals-action">
                        {/* status  */}
                        <div className="ma-left">
                          {/* status  */}
                          <div 
                            style={{
                              border:`1px solid white`,
                              borderRadius:'8px',
                              backgroundColor: selectedAgenda.color,
                              color: '#fff',
                              padding: '5px 8px',
                              fontSize:'10px'
                            }}
                            > {selectedAgenda.status_name} 
                          </div>
                          {/* status finished  */}
                          <div
                            onClick={()=> handleToggleDone(selectedAgenda.id, selectedAgenda.user_id, selectedAgenda.is_done)}
                            style={{
                              padding:'5px 8px',
                              border:'1px solid white',
                              borderRadius:'8px',
                              cursor:'pointer',
                              fontSize:'10px',
                              width:'fit-content',
                              textAlign:'center',
                              color: selectedAgenda.is_done ? '#821715' : '#246c12',
                              backgroundColor: selectedAgenda.is_done ? '#f7a7a6' : '#b6f7a6'
                            }}>
                            {selectedAgenda.is_done ? 'Finished': 'Not Finished'}
                          </div>
                        </div>
                        <BootstrapTooltip title='Delete Agenda' placement='top'>
                          <div className="trash-btn">
                            <IoTrash/>
                          </div>
                        </BootstrapTooltip>
                      </div>
                      
                      {/* MODALS DATE  */}
                      <div className="modals-date">
                        <div className="md-top">
                          <div className="top-left">
                            <AiFillSchedule/>
                          </div>
                          <div className="top-right">
                            <p>Date</p>
                            <h4>
                              {new Date(selectedAgenda.agenda_date).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </h4>
                          </div>
                        </div>
                        
                        <div className="md-top">
                          <div className="top-left2">
                            <HiOutlineClock/>
                          </div>
                          <div className="top-right">
                            <p>Time</p>
                            <h4>
                              {new Date(selectedAgenda.reminder_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </h4>
                          </div>
                        </div>
                      </div>
                      <div className="modals-main">
                        <div className="mm-header"> 
                          <div className="mm-icon">
                            <HiDocumentText/>
                          </div>
                           <h4>Descriptions</h4>
                        </div>
                        <div className="mm-desc">
                          {/* <p> {selectedAgenda.description}</p> */}
                          {editAgendaDescription === selectedAgenda.id ? (
                            <textarea 
                              value={newDescriptionAgenda}
                              onChange={(e) => setNewDescriptionAgenda(e.target.value)}
                              onBlur={() => handleSaveDescription(selectedAgenda.id)}
                              onKeyDown={(e) => handleKeyPressDescription(e, selectedAgenda.id)}
                            />
                          ):(
                            <p onClick={(e) => handleEditDescription(e, selectedAgenda.id, selectedAgenda.description)}> {selectedAgenda.description}</p> 
                          )}
                        </div>
                      </div>
                    </div>
                </div>
              </div>
            )}
        </div>

        {/* {loading && <p>Loading agendas...</p>} */}
        {/* {!loading && filteredAgendas.length === 0 && <p>No agendas found.</p>} */}
      </div>
    </div>
  );
}

export default AgendaPage;


