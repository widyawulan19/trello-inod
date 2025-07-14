import React from 'react'
import '../style/pages/AgendaPage.css'
import { useUser } from '../context/UserContext'

function AgendaPage() {
    //STATE
    const user = useUser();
    const userId = user.id;

    //FUNCTION

    //DEBUG
    console.log('File agenda page menerima data userId:', userId)

  return (
    <div className='agenda-page-container'>
        <div className='agenda-page-header'>
            <h2>Your Pesonal Agenda</h2>
            <h4>Stay organized, stay ahead.</h4>
            <p>
                Here's everything you've planned — from deadlines and meetings, to daily to-dos. Keep track of what matters most and never miss a thing.
            </p>
        </div>

        <div className="agenda-page-action">
            
        </div>

        <div className="agenda-page-content">

        </div>
    </div>
  )
}

export default AgendaPage