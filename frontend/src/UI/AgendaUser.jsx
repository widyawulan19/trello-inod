import React from 'react'
import { FaCircle } from "react-icons/fa";
import { HiOutlineArrowRight } from 'react-icons/hi2';
import '../style/UI/AgendaUser.css'

const AgendaUser=()=> {
    //STATE

    //FUNCTION
    // const COLOR_TEXT ={
    //     urgent:'red',
    //     normal:'black',
    //     low:'green'
    // }

    // const AGENDA = {
    //     name1:'Agenda1',
    //     name2:'Agenda2',
    //     name3:'Agenda3',
    //     name4:'Agenda4',
    // }

    // const DESKRIPSI = {
    //     deskripsi1: "Meeting awal bulan dengan tim desain untuk review proyek yang sedang berjalan",
    //     deskripsi2:""
    // }

    //DEBUG

  return (
    <div className='agenda-main-container'>
        <div className='agenda-container'>
            <div className="ac-header">
                <div className="ach-left">
                    <h3>#MARKETING WORKSHOP #1</h3>
                    <div className='ac-icon'>
                        <FaCircle size={10} style={{color:'#a34dff'}}/> Agenda 1
                    </div>
                </div>
                <div className="ach-right">
                    <h3 style={{color:'#a34dff', fontSize:'20px'}}>24</h3>
                    <p>10.20 PM</p>
                </div>
                
            </div>
            
            <div className='agenda-desc'>
                <p>
                Meeting awal bulan dengan tim desain untuk review proyek yang sedang berjalan 
                </p>
            </div>
            <button>READ MORE <HiOutlineArrowRight/></button>
        </div>

        <div className='agenda-container' style={{borderLeft:'2px solid orange'}}>
            <div className="ac-header">
                <div className="ach-left">
                    <h3>#MARKETING WORKSHOP #2</h3>
                    <div className='ac-icon'>
                        <FaCircle size={10} style={{color:'orange'}}/> Agenda 2
                    </div>
                </div>
                <div className="ach-right">
                    <h3 style={{color:'orange', fontSize:'20px'}}>08</h3>
                    <p>12.00 PM</p>
                </div>
                
            </div>
            
            <div className='agenda-desc'>
                <p>
                Meeting awal bulan dengan tim desain untuk review proyek yang sedang berjalan 
                </p>
            </div>
            <button style={{color:'orange'}}>READ MORE <HiOutlineArrowRight/></button>
        </div>

        <div className='agenda-container' style={{borderLeft:'2px solid orange'}}>
            <div className="ac-header">
                <div className="ach-left">
                    <h3>#MARKETING WORKSHOP #2</h3>
                    <div className='ac-icon'>
                        <FaCircle size={10} style={{color:'orange'}}/> Agenda 2
                    </div>
                </div>
                <div className="ach-right">
                    <h3 style={{color:'orange', fontSize:'20px'}}>08</h3>
                    <p>12.00 PM</p>
                </div>
                
            </div>
            
            <div className='agenda-desc'>
                <p>
                Meeting awal bulan dengan tim desain untuk review proyek yang sedang berjalan 
                </p>
            </div>
            <button style={{color:'orange'}}>READ MORE <HiOutlineArrowRight/></button>
        </div>
        
    </div>
  )
}

export default AgendaUser

{/* <div className='agenda-container'>
        {AGENDA.map((item)=>(
            <div className='agenda-content'>
                <h4>{item.name}</h4>
            </div>
        ))}
    </div> */}