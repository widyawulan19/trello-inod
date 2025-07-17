import React from 'react'
import '../style/modules/AksesCepat.css'
import { FaNoteSticky, FaPlus, FaTable } from 'react-icons/fa6'
import { IoCalendar } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'

const AksesCepat=({userId,handleShowForm})=> {
    //state
    const navigate = useNavigate()

    //function
    // 1. function navigate to agenda page 
    const handleNavigateToAgendaPage = () =>{
        navigate('/agenda-page')
    }
    //debug
    console.log('Fitur akses cepat menerima data userId:',userId)
  return (
    <div className='akses-container'> 
        <div className="akses-box">
            <div className="akses-icon" onClick={handleShowForm}>
                <FaPlus/>
            </div>
            <h4>New Workspace</h4>
        </div>
        <div className="akses-box">
            <div className="akses-icon2">
                <FaNoteSticky/>
            </div>
            <h4>Add Note</h4>
        </div>
        <div className="akses-box" onClick={handleNavigateToAgendaPage}>
            <div className="akses-icon3">
                <IoCalendar/>
            </div>
            <h4>Add Agenda</h4>
        </div>
        <div className="akses-box">
            <div className="akses-icon4">
                <FaTable/>
            </div>
            <h4>Data Marketing</h4>
        </div>
    </div>
  )
}

export default AksesCepat