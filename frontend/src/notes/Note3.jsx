app.post('/api/archive/:entity/:id', async (req, res) => {
    const { entity, id } = req.params;

    const entityMap = {
        data_marketing: { table: 'data_marketing', idField: 'marketing_id' },
        workspace: { table: 'workspaces', idField: 'id' },
        cards: { table: 'cards', idField: 'id' },
        // tambahkan entitas lainnya jika perlu
    };

    const config = entityMap[entity];
    if (!config) return res.status(400).json({ error: 'Entity tidak dikenali' });

    try {
        const { table, idField } = config;

        // 1. Ambil data dari tabel asli
        const result = await client.query(
            `SELECT * FROM ${table} WHERE ${idField} = $1`, [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: `Data ${entity} dengan ID ${id} tidak ditemukan` });
        }

        const data = result.rows[0];

        // 2. Masukkan ke archive_universal
        await client.query(`
            INSERT INTO archive_universal (entity_type, entity_id, data)
            VALUES ($1, $2, $3)
        `, [entity, id, data]);

        // 3. Hapus dari tabel aslinya
        await client.query(
            `DELETE FROM ${table} WHERE ${idField} = $1`, [id]
        );

        res.status(200).json({ message: `Data ${entity} ID ${id} berhasil diarsipkan` });
    } catch (err) {
        console.error('Archive error:', err);
        res.status(500).json({ error: err.message });
    }
});

// import { handleArchive } from '../utils/handleArchive';

const handleArchiveBoard = (boardId) => {
  handleArchive({
    entity: 'board',
    id: boardId,
    refetch: fetchBoards,         // fungsi yang refresh daftar board
    showSnackbar: showSnackbar,   // fungsi snackbar dari props/context
  });
};

// get semua data archive universal 
app.get('/api/archive-data', async (req, res) => {
  try {
    const result = await client.query(`SELECT * FROM archive_universal ORDER BY archived_at DESC`);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching archive:', error);
    res.status(500).json({ error: error.message });
  }
});


//delete data archive universall by id
app.delete('/api/archive/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query(`DELETE FROM archive_universal WHERE id = $1`, [id]);
    if (result.rowCount > 0) {
      res.status(200).json({ message: `Archive with id ${id} deleted` });
    } else {
      res.status(404).json({ error: `Archive with id ${id} not found` });
    }
  } catch (error) {
    console.error('Error deleting archive:', error);
    res.status(500).json({ error: error.message });
  }
});

//restore data archive
app.post('/api/restore/:entity/:id', async (req, res) => {
  const { entity, id } = req.params;

  const entityMap = {
    data_marketing: { table: 'data_marketing' },
    workspace: { table: 'workspaces' },
    cards: { table: 'cards' },
    board: { table: 'boards' },
    // tambah sesuai entity kamu
  };

  const config = entityMap[entity];
  if (!config) return res.status(400).json({ error: 'Entity tidak dikenali' });

  try {
    // 1. Ambil data dari archive_universal
    const archiveResult = await client.query(
      `SELECT data FROM archive_universal WHERE entity_type = $1 AND entity_id = $2`,
      [entity, id]
    );

    if (archiveResult.rows.length === 0) {
      return res.status(404).json({ error: `Data ${entity} dengan id ${id} tidak ditemukan di archive` });
    }

    const data = archiveResult.rows[0].data;
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

    // 2. Insert kembali ke tabel aslinya
    const insertQuery = `
      INSERT INTO ${config.table} (${keys.join(', ')})
      VALUES (${placeholders})
    `;
    await client.query(insertQuery, values);

    // 3. Hapus dari archive_universal
    await client.query(
      `DELETE FROM archive_universal WHERE entity_type = $1 AND entity_id = $2`,
      [entity, id]
    );

    res.status(200).json({ message: `Data ${entity} berhasil direstore.` });
  } catch (err) {
    console.error('Restore error:', err);
    res.status(500).json({ error: err.message });
  }
});

import React, { useEffect, useState } from "react";
import { getAllDataArchive, deleteArchiveDataUniversalById } from "../services/ApiServices";

const ArchiveUniversal = () => {
  const [archiveData, setArchiveData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ message: "", type: "" });

  const fetchArchiveData = async () => {
    setLoading(true);
    try {
      const response = await getAllDataArchive();
      setArchiveData(response.data);
    } catch (error) {
      console.error("Error fetching archive data", error);
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, type) => {
    setSnackbar({ message, type });
    setTimeout(() => setSnackbar({ message: "", type: "" }), 3000);
  };

  const handleDeleteArchive = async (id) => {
    try {
      await deleteArchiveDataUniversalById(id);
      showSnackbar("Successfully deleted archive data", "success");
      fetchArchiveData(); // Refresh
    } catch (error) {
      console.error("Failed to delete archive data:", error);
      showSnackbar("Failed to delete archive data", "error");
    }
  };

  useEffect(() => {
    fetchArchiveData();
  }, []);

  return (
    <div className="p-4">
      {snackbar.message && (
        <div className={`p-2 mb-4 text-white ${snackbar.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
          {snackbar.message}
        </div>
      )}
      <h2 className="mb-4 text-xl font-bold">Archive Data</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full text-sm border">
          <thead>
            <tr className="text-left bg-gray-100">
              <th className="p-2 border">Entity Type</th>
              <th className="p-2 border">Entity ID</th>
              <th className="p-2 border">User ID</th>
              <th className="p-2 border">Archived At</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {archiveData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="p-2 border">{item.entity_type}</td>
                <td className="p-2 border">{item.entity_id}</td>
                <td className="p-2 border">{item.user_id ?? "-"}</td>
                <td className="p-2 border">{new Date(item.archived_at).toLocaleString()}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => handleDeleteArchive(item.id)}
                    className="px-2 py-1 text-white bg-red-500 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {archiveData.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">No archived data found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ArchiveUniversal;


<div className='ncd-status'>
                        <div className="ncd-status-container">
                            <StatusDisplay 
                                cardId={cardId} 
                                // onClose={handleCloseStatus}
                                currentStatus={currentStatus}
                                setCurrentStatus={setCurrentStatus}
                                allStatuses={allStatuses}
                                setAllStatuses={setAllStatuses}
                                selectedStatus={selectedStatus}
                                setSelectedStatus={setSelectedStatus}
                                fetchCardStatus={fetchCardStatus}
                                fetchAllStatuses={fetchAllStatuses}
                            />
                        </div>
                        <div className="ncd-status-priority">
                           <SelectPriority 
                                cardId={cardId} 
                                selectedProperties={selectedProperties} 
                                setSelectedProperties={setSelectedProperties} 
                                selectedPriority={selectedPriority}
                                refreshPriority={fetchPriority}
                            />
                        </div>
                        <div className="ncd-status-due">
                            <DueDateDisplay
                                cardId={cardId}
                                dueDates={dueDates}
                                setDueDates={setDueDates}
                                selectedDate={selectedDate}
                                setSelectedDate={setSelectedDate}
                                selectedDueDateId={selectedDueDateId}
                                setSelectedDueDateId={setSelectedDueDateId}
                                loading={loading}
                                setLoading={setLoading}
                                fetchDueDates={fetchDueDates}
                            />
                        </div>
                    </div>

// Form states
const [newAgenda, setNewAgenda] = useState({
  title: '',
  description: '',
  agenda_date: '',
  reminder_time: '',
  status_id: '' // asumsi status pakai id
});

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


const handleToggleDone = async (agendaId, userId, currentStatus) => {
  try {
    await updateAgendaByUser(agendaId, userId, { is_done: !currentStatus });
    alert('Status updated successfully!');
    // Optionally fetch updated agenda list here
  } catch (error) {
    console.error('Update failed:', error);
  }
};




<div>
  <h3>Unfinished Agendas ({unfinishedCount})</h3>
  <ul>
    {unfinishedAgendas.map((agenda) => (
      <li key={agenda.id}>
        <strong>{agenda.title}</strong> — {agenda.date} ({agenda.category})
      </li>
    ))}
  </ul>
</div>


import React, { useEffect, useState } from 'react';
import '../style/modules/PersonalAgendas.css';
import { FaCircle } from 'react-icons/fa6';
import { getUnfinishAgenda, deletAgendaUser } from '../services/ApiServices';
import BootstrapTooltip from '../components/Tooltip';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from '../context/Snackbar';
import { IoTrash } from 'react-icons/io5';

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

  if (loading) return <p>Loading agenda...</p>;
  if (agendas.length === 0) return <p>No unfinished agendas found</p>;

  return (
    <div className="personal-agenda-container">
      {agendas.map((agenda) => (
        <div key={agenda.id} className="personal-agenda-box">
          <div className="pn-header">
            <div className="pnh-left">
              <FaCircle className="pnh-icon" style={{ color: agenda.color }} />
              <h4 style={{ color: agenda.color }}>#{agenda.title}</h4>
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
                <div style={{
                  padding: '5px 8px',
                  border: '1px solid white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  width: 'fit-content',
                  textAlign: 'center',
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

// export default PersonalAgendas;



//2. update title description
app.put('/api/cards/:id/desc', async(req,res)=>{
    const { id } = req.params;
    const { description } = req.body;
    const userId = req.user.id;

        try {
            const result = await client.query("UPDATE cards SET description = $1, update_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *", [description, id]);
            if (result.rows.length === 0) return res.status(404).json({ error: "Card not found" });
            
            //add log card activity
            await logCardActivity({
                action: 'updated_desc',
                card_id: parseInt(id),
                user_id: userId,
                entity: 'description',
                entity_id: null,
                details:''
            })

            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
})

// {/* <div className="note-form">
//   {editingNote ? (
//     <>
//       {/* Edit Note Form */}
//       <input
//         type="text"
//         placeholder="Edit title"
//         value={editingNote.name}
//         onChange={(e) =>
//           setEditingNote({ ...editingNote, name: e.target.value })
//         }
//       />
//       <textarea
//         placeholder="Edit content"
//         value={editingNote.isi_note}
//         onChange={(e) =>
//           setEditingNote({ ...editingNote, isi_note: e.target.value })
//         }
//       />
//       <button onClick={handleUpdateNote}>Update Note</button>
//     </>
//   ) : (
//     <>
//       {/* Create New Note Form */}
//       <input
//         type="text"
//         placeholder="New note title"
//         value={newNote.name}
//         onChange={(e) =>
//           setNewNote({ ...newNote, name: e.target.value })
//         }
//       />
//       <textarea
//         placeholder="New note content"
//         value={newNote.isi_note}
//         onChange={(e) =>
//           setNewNote({ ...newNote, isi_note: e.target.value })
//         }
//       />
//       <button onClick={handleCreateNote}>
//         <HiPlus /> Add Note
//       </button>
//     </>
//   )}
// </div> */}

//5.1 Update title note
app.put('/api/personal-note/:id/name/:userId', async (req, res) => {
  const { id, userId } = req.params;
  const { name } = req.body;

  try {
    const result = await client.query(
      `UPDATE personal_notes 
       SET name = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 AND user_id = $3 
       RETURNING *`,
      [name, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Note not found or not owned by user" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});