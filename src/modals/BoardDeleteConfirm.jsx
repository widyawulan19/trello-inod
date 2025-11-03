import React from 'react'
import '../style/modals/ListDeleteConfirm.css'
import { PiWarningFill } from 'react-icons/pi';

const BoardDeleteConfirm=({boardId, isOpen, onConfirm, boardName,onCancle})=> {
    console.log('board id diterima pada file board delete confirm', boardId)
    console.log('Board delete confirm menerima board name', boardName)
    if(!isOpen) return null;

    return (
      <div className='modal-overlay'>
          <div className="modal-box">
              <h2 className="modal-title">Delete Board Confirm</h2>
              <p className='modal-message'>
                  <PiWarningFill/>
                  Are you sure you want to delete this board <strong>"{boardName}"</strong> ?
              </p>
              <div className="modal-buttons">
                  <button onClick={onCancle} className="ldc-cancel">
                      Cancel
                  </button>
                  <button onClick={onConfirm} className="ldc-delete">
                      Yes, Delete
                  </button>
              </div>
          </div>
      </div>
    )
}

export default BoardDeleteConfirm