import React, { useState } from 'react';
import '../style/modules/CardStatus.css';
import {
  HiArrowUturnLeft,
  HiCheckCircle,
  HiChevronDown,
  HiMiniEye,
  HiMiniXCircle
} from 'react-icons/hi2';
import { FaXmark } from 'react-icons/fa6';
import { useUser } from '../context/UserContext';
import { updateCardStatusTesting } from '../services/ApiServices';

const CardStatus = ({
  cardId,
  onClose,
  currentStatus,
  allStatuses,
  fetchCardStatus,
  selectedStatus,
  setSelectedStatus
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const userId = user?.id;

  // Icon untuk setiap status
  const ICON_STATUS = {
    Reviewed: <HiMiniEye />,
    Approved: <HiCheckCircle />,
    Rejected: <HiMiniXCircle />,
    Returned: <HiArrowUturnLeft />
  };

  // Fungsi untuk mengubah status
  const handleStatusChange = async (statusId) => {
    setSelectedStatus(statusId);
    setIsOpen(false);

    try {
      const res = await updateCardStatusTesting(cardId, userId, { statusId });
      console.log('✅ Status updated:', res.data);
      fetchCardStatus(); // refresh data status
    } catch (err) {
      console.error('❌ Failed to update status:', err);
      if (err.response) {
        console.error('Server response:', err.response.data);
      }
    }
  };

  return (
    <div className="card-status-container">
      {/* Header */}
      <div className="status-header">
        <h5>CARD STATUS</h5>
        <FaXmark onClick={onClose} size={20} className="sch-icon" />
      </div>

      {/* Status saat ini */}
      <div className="sc-content">
        {currentStatus ? (
          <button
            style={{
              backgroundColor: currentStatus.background_color,
              border: `1px solid ${currentStatus.background_color}`,
              color: currentStatus.text_color,
              borderRadius: '4px',
              fontWeight: 'bold',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '5px',
              padding: '6px 12px',
              width: '100%',
              gap: '5px'
            }}
          >
            {ICON_STATUS[currentStatus.status_name]}
            {currentStatus.status_name}
          </button>
        ) : (
          <p>Status belum ditentukan</p>
        )}
      </div>

      {/* Dropdown pilih status */}
      <div className="dropdown-status">
        <button onClick={() => setIsOpen(!isOpen)}>
          Pilih Status
          <HiChevronDown />
        </button>

        {isOpen && (
          <div className="ds-box">
            {allStatuses.map((status) => (
              <div
                key={status.status_id}
                onClick={() => handleStatusChange(status.status_id)}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  backgroundColor: status.background_color,
                  color: status.text_color,
                  border: `1px solid ${status.background_color}`,
                  borderRadius: '4px',
                  margin: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: '8px'
                }}
              >
                {ICON_STATUS[status.status_name]}
                {status.status_name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CardStatus;
