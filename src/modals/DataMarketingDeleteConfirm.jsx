import React from 'react'
import '../style/modals/ListDeleteConfirm.css'
import { PiWarningFill } from 'react-icons/pi';

function DataMarketingDeleteConfirm({isOpen, marketingId, onConfirm,onCancle}) {
    if(!isOpen) return null;

  return (
    <div className='modal-overlay'>
        <div className="modal-box">
            <div className="modal-title">Delete Confirmation</div>
            <p className="modal-message">
                <PiWarningFill className='warn-icon'/>
                Are you sure you want to delete this Data
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

export default DataMarketingDeleteConfirm