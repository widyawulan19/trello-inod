import React from 'react'
import { PiWarningFill } from 'react-icons/pi';
import '../style/modals/ListDeleteConfirm.css'

const WorkspaceDeleteConfirm=({isOpen,onConfirm,onCancel,workspaceId,workspaceName})=> {
    if(!isOpen) return null;

      

  return (
    <div className='modal-overlay'>
        <div className="modal-box">
            <h2 className="modal-title">Delete Workspace Confirm</h2>
            <p className='modal-message'>
                <PiWarningFill/>
                Are you sure you want to delete this workspace <strong>"{workspaceName}"</strong> ?
            </p>
            <div className="modal-buttons">
                <button onClick={onCancel} className="ldc-cancel">
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

export default WorkspaceDeleteConfirm