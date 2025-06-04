// components/DeleteConfirmModal.jsx
import React from 'react';
import '../style/modals/ListDeleteConfirm.css'
import { PiWarningFill } from "react-icons/pi";

const ListDeleteConfirm = ({ listId,isOpen, onConfirm, onCancel,listName }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-title">Delete Confirmation</h2>
        <p className="modal-message">
            <PiWarningFill className='warn-icon'/>
            Are you sure you want to delete this list <strong>"{listId}"</strong> ?
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
  );
};

export default ListDeleteConfirm;
