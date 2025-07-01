import React from 'react'
import '../style/modules/PersonalNote.css'
import { FaCircle } from 'react-icons/fa6'
import { HiArrowRight } from 'react-icons/hi2'
import { FaEdit } from 'react-icons/fa'
import { MdDelete } from 'react-icons/md'

const PersonalNote=()=> {
  return (
    <div className='personal-note-container'>
        <div className="personal-note-box">
            <div className="pn-header">
                <div className="pnh-left">
                    <FaCircle className='pnh-icon'/>
                    <h4>#MARKETING WORKSHOP #1</h4>
                </div>
                <div className="pnh-right">
                    {/* <div className="agenda">
                        Agenda 1
                    </div> */}
                    {/* <h3>24</h3> */}
                    <p>10.30 PM</p>
                </div>
            </div>
            <div className="pn-content">
                <p>
                    Meeting awal bulan dengan tim desain untuk review proyek yang sedang berjalan dan planning untuk bulan depan.
                </p>
            </div>
            <div className="pn-footer">
                <div className="read">
                    READ MORE <HiArrowRight className='read-icon'/>
                </div>
                <div className="btn">
                    <FaEdit/>
                    <MdDelete/>
                </div>
            </div>
        </div>

        <div className="personal-note-box">
            <div className="pn-header">
                <div className="pnh-left">
                    <FaCircle className='pnh-icon'/>
                    <h4>#MARKETING WORKSHOP #1</h4>
                </div>
                <div className="pnh-right">
                    {/* <div className="agenda">
                        Agenda 1
                    </div> */}
                    {/* <h3>24</h3> */}
                    <p>10.30 PM</p>
                </div>
            </div>
            <div className="pn-content">
                <p>
                    Meeting awal bulan dengan tim desain untuk review proyek yang sedang berjalan dan planning untuk bulan depan.
                </p>
            </div>
            <div className="pn-footer">
                <div className="read">
                    READ MORE <HiArrowRight className='read-icon'/>
                </div>
                <div className="btn">
                    <FaEdit/>
                    <MdDelete/>
                </div>
            </div>
        </div>
    </div>
  )
}

export default PersonalNote