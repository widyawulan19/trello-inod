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
import { updateCardStatusTesting } from '../services/ApiServices';

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

  /* ================= ICON MAP ================= */
  const ICON_STATUS = {
    Accepted: <HiCheckCircle />,
    Hold: <HiMiniEye />,
    Cancle: <HiMiniXCircle />,
    'On Progress': <HiChevronDown />,
    Revisi: <HiArrowUturnLeft />,
    'One Hit': <HiCheckCircle />,
    'Pindah Producer': <HiArrowUturnLeft />,
    'Revisi in chat on progress': <HiMiniEye />,
    'Revisi in chat accept': <HiCheckCircle />,
    FINISH: <HiCheckCircle />
  };

  /* ================= STATUS → CSS VAR MAP ================= */
  const STATUS_VAR_MAP = {
    Accepted: 'accepted',
    Hold: 'hold',
    Cancle: 'cancle',
    'On Progress': 'on-progress',
    Revisi: 'revisi',
    'One Hit': 'one-hit',
    'Pindah Producer': 'pindah-producer',
    'Revisi in chat on progress': 'revisi-chat-progress',
    'Revisi in chat accept': 'revisi-chat-accept',
    FINISH: 'finish'
  };

  /* ================= STYLE HELPER ================= */
  const getStatusStyle = (statusName) => {
    const key = STATUS_VAR_MAP[statusName];

    if (!key) {
      return {
        backgroundColor: 'var(--status-default-bg)',
        color: 'var(--status-default-text)',
        border: '1px solid var(--status-default-border)'
      };
    }

    return {
      backgroundColor: `var(--status-${key}-bg)`,
      color: `var(--status-${key}-text)`,
      border: `1px solid var(--status-${key}-border)`
    };
  };

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

  const currentStyle = currentStatus
    ? getStatusStyle(currentStatus.status_name)
    : null;

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
            style={{
              ...currentStyle,
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              padding: '6px 12px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
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
        <button onClick={() => setIsOpen(!isOpen)}>
          Pilih Status
          <HiChevronDown />
        </button>

        {isOpen && (
          <div className="ds-box">
            {allStatuses.map((status) => {
              const style = getStatusStyle(status.status_name);

              return (
                <div
                  key={status.status_id}
                  onClick={() => handleStatusChange(status.status_id)}
                  style={{
                    ...style,
                    padding: '6px 10px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
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
