import React, { useState } from 'react';
import '../style/modules/CardStatus.css';
import { HiChevronDown } from 'react-icons/hi2';
import { FaXmark } from 'react-icons/fa6';
import { updateCardStatusTesting } from '../services/ApiServices';
import {
  ICON_STATUS,
  getStatusClass
} from '../context/StatusStyleHelper';

const CardStatus = ({
  cardId,
  userId,
  onClose,
  currentStatus,
  allStatuses,
  fetchCardStatus,
  selectedStatus,
  setSelectedStatus
}) => {
  const [isOpen, setIsOpen] = useState(false);

  /* ================= HANDLER ================= */
  const handleStatusChange = async (statusId) => {
    setSelectedStatus(statusId);
    setIsOpen(false);

    try {
      await updateCardStatusTesting(cardId, userId, { statusId });
      fetchCardStatus();
    } catch (err) {
      console.error('❌ Failed to update status:', err);
    }
  };

  const currentClass = currentStatus
    ? getStatusClass(currentStatus.status_name)
    : 'neutral';

  return (
    <div className="card-status-container">
      {/* ===== HEADER ===== */}
      <div className="status-header">
        <h5>CARD STATUS</h5>
        <FaXmark onClick={onClose} size={18} className="sch-icon" />
      </div>

      {/* ===== CURRENT STATUS ===== */}
      <div className="sc-content">
        {currentStatus ? (
          <button
            className={`status-pill status--${currentClass}`}
          >
            {ICON_STATUS[currentStatus.status_name]}
            {currentStatus.status_name}
          </button>
        ) : (
          <p>Status belum ditentukan</p>
        )}
      </div>

      {/* ===== DROPDOWN ===== */}
      <div className="dropdown-status">
        <button
          className="dropdown-trigger"
          onClick={() => setIsOpen(!isOpen)}
        >
          Pilih Status
          <HiChevronDown />
        </button>

        {isOpen && (
          <div className="ds-box">
            {allStatuses.map((status) => {
              const statusClass = getStatusClass(status.status_name);

              return (
                <div
                  key={status.status_id}
                  className={`status-pill status--${statusClass}`}
                  onClick={() => handleStatusChange(status.status_id)}
                >
                  {ICON_STATUS[status.status_name]}
                  {status.status_name}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CardStatus;
