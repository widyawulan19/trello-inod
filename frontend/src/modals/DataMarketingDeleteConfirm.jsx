import React from 'react'
import '../style/modals/ListDeleteConfirm.css'
import '../style/pages/DataMarketing.css'
import { PiWarningFill } from 'react-icons/pi';

function DataMarketingDeleteConfirm({isOpen, marketingId, onConfirm,onCancle}) {
    if(!isOpen) return null;

  return (
    <div className='archive-modal-overlay'>
        <div className="archive-modal">
            <h3>Delete Confirmation</h3>
            <p >
                {/* <PiWarningFill size={15}/> */}
                Are you sure you want to delete this Data
            </p>
            <div className="modal-archive-action">
                <button onClick={onCancle} className='btn-cancel'>
                    Cancle
                </button>
                <button onClick={onConfirm} className='btn-danger'>
                    Yes, Delete
                </button>
            </div>
        </div>
    </div>
  )
}

export default DataMarketingDeleteConfirm