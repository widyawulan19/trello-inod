import React from 'react'
import '../style/modules/PersonalAgenda.css'
import { IoCalendar } from "react-icons/io5";
import { BsArrowsAngleExpand } from "react-icons/bs";
import { FaCircle } from 'react-icons/fa6';
import { FaEdit } from 'react-icons/fa';
import { HiArrowRight } from 'react-icons/hi2';

const PersonalAgenda=()=> {
  return (
    <div className='personal-agenda-container'>
        <div className="personal-agenda-box">
            <div className="pn-header">
                <div className="pnh-left">
                    <FaCircle className='pnh-icon'/>
                    <h4>#MARKETING WORKSHOP</h4>
                </div>
                <div className="pnh-right">
                    <h3>24</h3>
                    <p>Jun 25</p>
                </div>
            </div>
            <div className="pn-content">
                <p>
                    Meeting awal bulan dengan tim desain untuk review proyek yang sedang berjalan dan planning untuk bulan depan.
                </p>
            </div>
            <div className="pn-footer">
                <div className="agenda">
                    Agenda 1
                </div>
                <div className="read">
                    READ MORE <HiArrowRight className='read-icon'/>
                </div>
            </div>
        </div>

        <div className="personal-agenda-box">
            <div className="pn-header">
                <div className="pnh-left">
                    <FaCircle className='pnh-icon'/>
                    <h4>#MARKETING WORKSHOP</h4>
                </div>
                <div className="pnh-right">
                    <h3>24</h3>
                    <p>Jun 25</p>
                </div>
            </div>
            <div className="pn-content">
                <p>
                    Meeting awal bulan dengan tim desain untuk review proyek yang sedang berjalan dan planning untuk bulan depan.
                </p>
            </div>
            <div className="pn-footer">
                <div className="agenda">
                    Agenda 1
                </div>
                <div className="read">
                    READ MORE <HiArrowRight className='read-icon'/>
                </div>
            </div>
        </div>

        <div className="personal-agenda-box">
            <div className="pn-header">
                <div className="pnh-left">
                    <FaCircle className='pnh-icon'/>
                    <h4>#MARKETING WORKSHOP</h4>
                </div>
                <div className="pnh-right">
                    <h3>24</h3>
                    <p>Jun 25</p>
                </div>
            </div>
            <div className="pn-content">
                <p>
                    Meeting awal bulan dengan tim desain untuk review proyek yang sedang berjalan dan planning untuk bulan depan.
                </p>
            </div>
            <div className="pn-footer">
                <div className="agenda">
                    Agenda 1
                </div>
                <div className="read">
                    READ MORE <HiArrowRight className='read-icon'/>
                </div>
            </div>
        </div>
    </div>
  )
}

export default PersonalAgenda