import React, { useEffect, useState } from 'react'
import '../style/modules/PersonalNotes.css'
import { FaCircle } from 'react-icons/fa6'
import { HiArrowRight } from 'react-icons/hi2'
import { FaEdit } from 'react-icons/fa'
import { MdDelete } from 'react-icons/md'
import { getNotesByUserId } from '../services/ApiServices'
import { useNavigate } from 'react-router-dom'

const PersonalNotes=({userId})=> {
    //DEBUG
    console.log('File personal notes menerima userId:', userId);

    // STATE 
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();


    //FUNCTION
    //1. fetch notes by userId
    const fetchDataNotes = async () =>{
        try{
            const response = await getNotesByUserId(userId);
            setNotes(response.data)
        }catch(error){
            console.log('Error fetching notes data:', error);
        }finally{
            setLoading(false)
        }
    }

    useEffect(()=>{
        if(userId){
            fetchDataNotes()
        }
    }, [userId])

    const navigateToNotePage = () =>{
        navigate('note-page')
    }


    if (loading) return <p>Loading notes...</p>;
    if (notes.length === 0) {
        return(
            <div className="no-notes">
                <h2>Catatanmu masih kosong saat ini</h2>
                <p>Gunakan Personal Notes untuk menyimpan ide, daftar tugas, atau hal penting lainnya secara pribadi.</p>
                <div className="btn-create-notes" onClick={navigateToNotePage}>
                    Add New Notes
                </div>
            </div>
        )
    };

  return (
    <div className='personal-notes-container'>
        {notes.map(note =>(
             <div key={note.id} className="personal-notes-box">
                <div className="pn-header">
                    <div className="pnh-left">
                        <FaCircle className='pnh-icon'/>
                        <h4>#{note.name} #1</h4>
                    </div>
                    <div className="pnh-right">
                        <p>10.30 PM</p>
                    </div>
                </div>

                <div className="pn-content">
                    <p dangerouslySetInnerHTML={{ __html: note.isi_note }}/>
                    
                </div>

                {/* <div className="pn-footer">
                    <div className="read">
                        READ MORE <HiArrowRight className='read-icon'/>
                    </div>
                    <div className="btn">
                        <FaEdit/>
                        <MdDelete/>
                    </div>
                </div> */}
            </div>
        ))}
    </div>
  )
}

export default PersonalNotes