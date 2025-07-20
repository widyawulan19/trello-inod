import React, { useEffect, useRef, useState } from 'react';
import { useUser } from '../context/UserContext';
import '../style/pages/NotesPage.css';
import { useSnackbar } from '../context/Snackbar';
import { getNotesByUserId, createNote, updateNote, deleteNote, updateNameNote, updateIsiNote } from '../services/ApiServices';
import { HiPlus, HiSearch, HiTrash, HiPencil, HiX } from 'react-icons/hi';
import { IoSearch,IoTimeOutline } from 'react-icons/io5';
import { FaXmark } from 'react-icons/fa6';
import { PiNotepadFill } from "react-icons/pi";
import BootstrapTooltip from '../components/Tooltip';
import ToolbarFormat from '../modules/ToolbarFormat';
// import e from 'express';

const NotesPage = () => {
  const { user } = useUser();
  const userId = user.id;
  const { showSnackbar } = useSnackbar();
  const textareaRef = useRef();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newNote, setNewNote] = useState({ name: '', isi_note: '' });
  const [editingNote, setEditingNote] = useState(null);
  const [showFormCreate, setShowFormCreate] = useState(false);
  const [editNote, setEditNote] = useState(false);
  const [detailNote, setDetailNote] = useState(null);
  //edit name
  const [editNoteName, setEditNoteName] = useState(null);
  const [newNoteName, setNewNoteName] = useState('');
  //edit isi note
  const [editIsiNote, setEditIsiNote] = useState(null)
  const [newIsiNote, setNewIsiNote] = useState('');

  //FUNCTION UPDATE NAME NOTE
  const handleEditNoteName = (e, noteId, currentName) =>{
    e.stopPropagation();
    setEditNoteName(noteId);
    setNewNoteName(currentName);
  }

  const handleSaveName = async(noteId)=>{
    try{
      await updateNameNote(noteId, userId, { name: newNoteName.trim() });
      fetchDataNotes(); // ambil ulang data biar sync
      setDetailNote(prev => ({
        ...prev,
        name: newNoteName.trim()
      }));
      setEditNoteName(null);
      showSnackbar('Note name updated successfully', 'success');

    }catch(error){
      console.error('Error updating note name:', error)
      showSnackbar('Failed to updating note name', 'error');

    }
  }

  const handleKeyPressName = (e, noteId) =>{
      if(e.key === 'Enter'){
          handleSaveName(noteId)
          e.stopPropagation();
      }
  }

  //FUNCTION UPDATE ISI NOTE
  const handleEditIsiNote = (e, noteId, currentIsi) =>{
    e.stopPropagation();
    setEditIsiNote(noteId);
    setNewIsiNote(currentIsi);
  }

  const handleSaveIsi = async(noteId)=>{
    try{
      await updateIsiNote(noteId, userId, {isi_note: newIsiNote.trim()});
      fetchDataNotes();
      setDetailNote(prev => ({
        ...prev,
        isi_note: newIsiNote.trim()
      }));
      setEditIsiNote(null);
      showSnackbar('Note isi updated successfully', 'success');
    }catch(error){
      console.error('Error updating isi note :', error)
      showSnackbar('Failed to updating isi note', 'error');
    }
  }

  const handleKeyPressIsi = (e, noteId) =>{
    if(e.key === 'Enter'){
      handleSaveIsi(noteId)
      e.stopPropagation();
    }
  }

  //SHOW DETAIL NOTE
  const handleShowDetailNote = (note) =>{
    setDetailNote(note);
  }
  const closeDetailNote = () =>{
    setDetailNote(null);
  }


  //SHOW CREATE NOTE FORM
  const handleShowForm = () =>{
    setShowFormCreate(!showFormCreate)
  }

  const closeShowForm = () =>{
    setShowFormCreate(false);
  }

  //SHOW EDIT NOTE FORM
  const handleShowEditForm = (note) =>{
    setEditNote(note)
  }

  const handleCloseEdit = () =>{
    setEditNote(false)
  }

  // Get Notes
  const fetchDataNotes = async () => {
    try {
      const response = await getNotesByUserId(userId);
      setNotes(response.data);
    } catch (error) {
      console.log('Error fetch data note', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchDataNotes();
    }
  }, [userId]);

  // Create Note
  const handleCreateNote = async () => {
    if (!newNote.name || !newNote.isi_note) return showSnackbar('Note name and content required', 'error');
    try {
      const response = await createNote({ ...newNote, user_id: userId });
      showSnackbar('Note created successfully', 'success');
      setNewNote({ name: '', isi_note: '' });
      fetchDataNotes();
      setShowFormCreate(false);
    } catch (error) {
      console.error('Create error:', error);
      showSnackbar('Failed to create note', 'error');
    }
  };

  // Update Note
  const handleUpdateNote = async () => {
    if (!editingNote?.name || !editingNote?.isi_note) return showSnackbar('Note name and content required', 'error');
    try {
      await updateNote(editingNote.id, editingNote, userId);
      showSnackbar('Note updated successfully', 'success');
      setEditingNote(null);
      fetchDataNotes();
    } catch (error) {
      console.error('Update error:', error);
      showSnackbar('Failed to update note', 'error');
    }
  };

  // Delete Note
  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote(noteId, userId);
      showSnackbar('Note deleted successfully', 'success');
      fetchDataNotes();
    } catch (error) {
      console.error('Delete error:', error);
      showSnackbar('Failed to delete note', 'error');
    }
  };

  const filteredNotes = notes.filter(note =>
    note.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.isi_note.toLowerCase().includes(searchTerm.toLowerCase())
  );

  //FORMAT DATE 
  const formatDate = (datetime) => {
    if (!datetime) return 'Invalid Date';

    const date = new Date(datetime);
    if (isNaN(date.getTime())) return 'Invalid Date';

    const day = date.toLocaleDateString("en-US", { weekday: "short" }).toLowerCase();
    const dayNum = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleDateString("en-US", { month: "short" }).toLowerCase();
    const year = date.getFullYear();

    const time = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).replace(":", ".").toUpperCase();

    return `${day} ${dayNum} ${month} ${year} | ${time}`;
  };


  return (
    <div className='notes-page-container'>
      <div className="notes-page-header">
        <div className="header-left">
          <h2>Notes Board</h2>
          <p>Dokumentasikan setiap detail, jangan lewatkan satu langkah pun.</p>
        </div>
        <div className="header-right">
          <div className="search-box">
            <IoSearch/>
            <input
              type="text"
              placeholder='Search note here'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="btn-note" onClick={handleShowForm}>
            <HiPlus/>
            Add Note
          </div>
        </div>
        {showFormCreate && (
          <div className="form-create-note">
            <div className="fc-header">
              <h2>Form Create Note</h2>
              <FaXmark onClick={closeShowForm}/>
            </div>
            <div className="fc-content">
              <input
                type="text"
                placeholder="New note title"
                value={newNote.name}
                onChange={(e) =>
                  setNewNote({ ...newNote, name: e.target.value })
                }
              />
              <textarea
                placeholder="New note content"
                value={newNote.isi_note}
                onChange={(e) =>
                  setNewNote({ ...newNote, isi_note: e.target.value })
                }
              />
              <button onClick={handleCreateNote}>
                <HiPlus /> Add Note
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="notes-page-content">
        {filteredNotes.length === 0 && <p>Tidak ada catatan ditemukan.</p>}
        {filteredNotes.map(note => (
          <div key={note.id} className="note-item">
            <div className="note-item-header">
              <div className="header-title">
                <div className='note-header-icon'>
                  <PiNotepadFill/>
                </div>
                Note
              </div>
              
              <div className="header-btn">
                {/* <BootstrapTooltip title='Edit Note' placement='top'>
                  <div className='btn' onClick={() => handleShowEditForm(note)}><HiPencil /></div>
                </BootstrapTooltip> */}
                <BootstrapTooltip title='Delete Note' placement='top'>
                  <div className='btn' onClick={() => handleDeleteNote(note.id)}><HiTrash /></div>
                </BootstrapTooltip>
              </div>
              
            </div>

            <div className="note-item-main">
              <h3>{note.name}</h3>
              <p>{note.isi_note}</p>
            </div>

            <div className="note-item-footer">
              <p>Update : {formatDate(note.updated_at)}</p>
              <div className="footer-btn" onClick={() => handleShowDetailNote(note)}>
                View Note
              </div>
            </div>

          </div>
        ))}
      </div>
      {/* DETAIL NOTE MODALS  */}
        {detailNote && (
        <div className="note-detail-modal">
          <div className="note-detail-content">
            
           <div className="detail-header">
            <div className='note-header-icon'>
              <PiNotepadFill/>
            </div>
            <p>Detail Note</p>
            <div className="btn-close" onClick={closeDetailNote}>
              <HiX/> 
            </div>
           </div>

          {/* MAIN CONTENT  */}
           <div className="detail-main">
            <div className="main-header">
              <p>Update : {formatDate(detailNote.updated_at)}</p>
            </div>
            <div className="main-content">
              {/* <h3>{detailNote.name}</h3> */}
              <div className="main-title">
                {editNoteName === detailNote.id ? (
                  <input
                    type='text'
                    value={newNoteName}
                    onChange={(e) => setNewNoteName(e.target.value)}
                    onBlur={() => handleSaveName(detailNote.id)}
                    onKeyDown={(e) => handleKeyPressName(e, detailNote.id)}
                    autoFocus
                  />
                ) : (
                  <h3 onClick={(e) => handleEditNoteName(e, detailNote.id, detailNote.name)}>
                    {detailNote.name}
                  </h3>
                )}
              </div>

                {/* ISI NOTE  */}
              {/* <p>{detailNote.isi_note}</p> */}
                {editIsiNote === detailNote.id ? (
                  <textarea
                    type='text'
                    value={newIsiNote}
                    onChange={(e) => setNewIsiNote(e.target.value)}
                    onBlur={() => handleSaveIsi(detailNote.id)}
                    onKeyDown={(e) => handleKeyPressIsi(e, detailNote.id)}
                    autoFocus
                  />
                ):(
                  <p onClick={(e)=> handleEditIsiNote(e, detailNote.id, detailNote.isi_note)}>
                    {detailNote.isi_note}
                  </p>
                )}

            </div>
           </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesPage;

