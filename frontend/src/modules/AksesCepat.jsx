import React from 'react'
import '../style/modules/AksesCepat.css'
import { FaNoteSticky, FaPlus, FaTable } from 'react-icons/fa6'
import { IoCalendar } from 'react-icons/io5'

const AksesCepat=()=> {
  return (
    <div className='akses-container'> 
        <div className="akses-box">
            <div className="akses-icon">
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
        <div className="akses-box">
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