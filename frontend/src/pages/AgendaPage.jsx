import React, { useEffect, useState } from 'react';
import '../style/pages/AgendaPage.css';
import { useUser } from '../context/UserContext';
import { createNewAgenda, getAgendaUser } from '../services/ApiServices';
import { FaXmark } from 'react-icons/fa6';

function AgendaPage() {
  const { user } = useUser();
  const userId = user.id;
  const [agendas, setAgendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);


  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showFormAgenda, setShowFormAgenda] = useState(false);
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

        const handleCreateAgenda = async (e) => {
        e.preventDefault();

        try {
            const payload = {
            ...newAgenda,
            user_id: userId,
            };

            const res = await createNewAgenda(payload);
            console.log('Agenda created:', res.data);

            setNewAgenda({
            title: '',
            description: '',
            agenda_date: '',
            reminder_time: '',
            status_id: ''
            });

            fetchDataAgenda(); // Refresh list
        } catch (err) {
            console.error('Failed to create agenda:', err);
        }
    };

    //5. show form agenda
    const handleShowForm = () =>{
        setShowFormAgenda(!showFormAgenda);
    }

    const handleCloseForm = () =>{
        setShowFormAgenda(false)
    }

  return (
    <div className='agenda-page-container'>
      <div className='agenda-page-header'>
        <h2>Your Personal Agenda</h2>
        <h4>Stay organized, stay ahead.</h4>
        <p>
          Here's everything you've planned — from deadlines and meetings, to daily to-dos. Keep track of what matters most and never miss a thing.
        </p>
      </div>

      <div className="agenda-page-action">
        <div className="action-left">
            <input
                type="text"
                placeholder="Search agenda..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '8px', width: '250px', marginRight: '16px' }}
            />
        </div>
        <div className="action-right">
            <div className="dropdown-wrapper">
                <p>Filter by Status:</p>
                <button
                    className="dropdown-toggle"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                    {selectedStatus || 'All Statuses'} ▼
                </button>

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
                <FaXmark/>
                Add New
            </div>
        </div>
      </div>

      {/* SHOW FORM AGENDA  */}
      {showFormAgenda && (
        <div className="create-agenda-form">
            <h3>Create New Agenda</h3>
            <form onSubmit={handleCreateAgenda} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                <input
                type="text"
                name="title"
                placeholder="Title"
                value={newAgenda.title}
                onChange={handleInputChange}
                required
                />
                <textarea
                name="description"
                placeholder="Description"
                value={newAgenda.description}
                onChange={handleInputChange}
                required
                />
                <input
                type="date"
                name="agenda_date"
                value={newAgenda.agenda_date}
                onChange={handleInputChange}
                required
                />
                <input
                type="time"
                name="reminder_time"
                value={newAgenda.reminder_time}
                onChange={handleInputChange}
                required
                />
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
                <button type="submit">Add Agenda</button>
            </form>
        </div>
      )}

      {/* END SHOW FORM AGENDA  */}

      <div className="agenda-page-content">
        <table className='agenda-page-table'>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Agenda Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredAgendas.map(agenda => (
              <tr key={agenda.id}>
                <td>{agenda.title}</td>
                <td>{agenda.description}</td>
                <td>{formatDate(agenda.agenda_date)}</td>
                <td>{agenda.status_name}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && <p>Loading agendas...</p>}
        {!loading && filteredAgendas.length === 0 && <p>No agendas found.</p>}
      </div>
    </div>
  );
}

export default AgendaPage;
