import React, { useState } from 'react';
import { HiChevronRight } from 'react-icons/hi2';
import CardStatus from '../modules/CardStatus';
import {
  ICON_STATUS,
  getStatusClass
} from '../context/StatusStyleHelper';
import '../style/modules/CardStatus.css'

const StatusDisplay = ({
  userId,
  cardId,
  currentStatus,
  setCurrentStatus,
  allStatuses,
  setAllStatuses,
  selectedStatus,
  setSelectedStatus,
  fetchAllStatuses,
  fetchCardStatus
}) => {
  const [showStatus, setShowStatus] = useState(false);

  const handleShowStatus = () => {
    setShowStatus(true);
  };

  const handleCloseStatus = () => {
    setShowStatus(false);
  };

  const currentClass = currentStatus
    ? getStatusClass(currentStatus.status_name)
    : 'neutral';

  return (
    <div className="status-display-wrapper">
      {currentStatus ? (
        <div className={`status-pill status-display status--${currentClass}`}>
            <div className="status-display-header">
                <div className="status-display-title">
                {ICON_STATUS[currentStatus.status_name]}
                CARD STATUS
                </div>

                <HiChevronRight
                onClick={handleShowStatus}
                className="status-display-action"
                />
            </div>

            <div className="status-display-name">
                {currentStatus.status_name}
            </div>
         </div>

      ) : (
        <div className="status-display-empty">
          <p>No status set</p>
          <button onClick={handleShowStatus}>
            + Choose Status
          </button>
        </div>
      )}

      {/* ===== POPOVER ===== */}
      {showStatus && (
        <div className="status-popover">
          <CardStatus
            userId={userId}
            cardId={cardId}
            onClose={handleCloseStatus}
            currentStatus={currentStatus}
            setCurrentStatus={setCurrentStatus}
            allStatuses={allStatuses}
            setAllStatuses={setAllStatuses}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            fetchCardStatus={fetchCardStatus}
            fetchAllStatuses={fetchAllStatuses}
          />
        </div>
      )}
    </div>
  );
};

export default StatusDisplay;
