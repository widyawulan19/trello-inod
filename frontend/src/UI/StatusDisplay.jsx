import React, { useState } from 'react';
import { HiCheckCircle, HiChevronRight } from 'react-icons/hi2';
import CardStatus from '../modules/CardStatus';
import { getStatusColorStyle } from '../context/StatusStyleHelper';
import '../style/modules/CardStatus.css';
// import '../style/modules/StatusDisplay.css';

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


  // debug console 
  console.log('Current Status:', currentStatus);

  return (
    <div className="status-display-wrapper" >
      {currentStatus ? (
        <div
          className="status-display-pill status-pill"
          style={getStatusColorStyle(currentStatus.accent_color)}
        >
          <div className="status-display-header">
            <div className="header-left">
              <HiCheckCircle/>
              <h5>CARD STATUS</h5>
            </div>
            <HiChevronRight
              onClick={() => setShowStatus(true)}
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
          <button onClick={() => setShowStatus(true)}>
            + Choose Status
          </button>
        </div>
      )}

      {showStatus && (
        <div className="status-popover">
          <CardStatus
            userId={userId}
            cardId={cardId}
            currentStatus={currentStatus}
            setCurrentStatus={setCurrentStatus}
            allStatuses={allStatuses}
            setAllStatuses={setAllStatuses}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            fetchCardStatus={fetchCardStatus}
            fetchAllStatuses={fetchAllStatuses}
            onClose={() => setShowStatus(false)}
          />
        </div>
      )}
    </div>
  );
};

export default StatusDisplay;
