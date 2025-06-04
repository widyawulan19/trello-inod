import React from 'react'
import { PiWarningFill } from 'react-icons/pi';
import '../style/modals/ListDeleteConfirm.css'

const CardDeleteConfirm=({isOpen, cardId, onConfirm, onCancle, cardName})=> {
    if(!isOpen) return null;

  return (
    <div className='modal-overlay'>
        <div className="modal-box">
            <div className="modal-title">Delete Confirmation</div>
            <p className="modal-message">
                <PiWarningFill className='warn-icon'/>
                Are you sure you want to delete this Card <strong>"{cardName}"</strong>
            </p>
            <div className="modal-buttons">
                <button onClick={onCancle} className='ldc-cancel'>
                    Cancle
                </button>
                <button onClick={onConfirm} className='ldc-delete'>
                    Yes, Delete
                </button>
            </div>
        </div>
    </div>
  )
}

export default CardDeleteConfirm

{/* <CardDeleteConfirm
                isOpen={showDeleteConfirm}
                cardId={card.id}
                onConfirm={confirmDelete}
                onCancle={cancleDeleteCard}
                cardName ={card.name}
            /> */}