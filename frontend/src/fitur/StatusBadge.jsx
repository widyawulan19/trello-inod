import React from 'react';
import {
  HiCheckCircle,
  HiMiniEye,
  HiMiniXCircle,
  HiArrowUturnLeft
} from 'react-icons/hi2';
import '../style/fitur/StatusBadge.css'

/* ===== ICON MAP ===== */
const ICON_STATUS = {
  Accepted: <HiCheckCircle />,
  Hold: <HiMiniEye />,
  Cancle: <HiMiniXCircle />,
  'On Progress': <HiMiniEye />,
  Revisi: <HiArrowUturnLeft />,
  'One Hit': <HiCheckCircle />,
  'Pindah Producer': <HiArrowUturnLeft />,
  'Revisi in chat on progress': <HiMiniEye />,
  'Revisi in chat accept': <HiCheckCircle />,
  FINISH: <HiCheckCircle />
};

/* ===== STATUS → CSS VAR KEY ===== */
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

const StatusBadge = ({
  statusName,
  size = 'md',     // sm | md | lg
  showIcon = true,
  className = ''
}) => {
  const key = STATUS_VAR_MAP[statusName] || 'default';

  return (
    <span
      className={`status-badge-container status-${key} status-${size} ${className}`}
    >
      {showIcon && ICON_STATUS[statusName]}
      <span className="status-text">{statusName}</span>
    </span>
  );
};

export default StatusBadge;


// CARA PENGGUNAAN 

{/* <StatusBadge statusName={currentStatus.status_name} size="lg" /> */}
