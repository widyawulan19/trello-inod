import React, { useState } from 'react';
import { HiChevronRight, HiMiniLightBulb } from "react-icons/hi2";
import CardProperties from '../modules/CardPriorities';
import '../style/modules/CardPriorities.css';

const SelectPriority = ({ 
    cardId,
    selectedPriority,
    selectedProperties,
    setSelectedProperties,
    refreshPriority,
    fetchCardDetail,
    fetchCardActivities,
    cardActivities,
    setCardActivities
}) => {
 const [showPriority, setShowPriority] = useState(false);
 
const handleShowPriority = () => {
    setShowPriority(true);
};
const handleClosePriority = () => {
    setShowPriority(false);
};

/* =========================
   PRIORITY THEME MAPPING
========================= */
const PRIORITY_THEME = {
  low: 'status-progress',
  medium: 'status-confirmed',
  high: 'status-rejected',
  no: 'status-unknown',
};

/* =========================
   NORMALIZER (WAJIB)
========================= */
const normalizePriority = (name = '') => {
  return name
    .toLowerCase()
    .replace('priority', '')
    .trim();
};

/* =========================
   STYLE HELPER
========================= */
const getPriorityStyle = (priorityName) => {
  const key = normalizePriority(priorityName);
  const theme = PRIORITY_THEME[key] || 'status-unknown';

  return {
    backgroundColor: `var(--${theme}-bg)`,
    border: `1px solid var(--${theme}-border)`,
    color: `var(--${theme}-text)`,
  };
};


    return (
        <div className="card-priority">
            {selectedPriority ? (
                <div
                    className='cp-card-selected'
                    style={{
                        ...getPriorityStyle(selectedPriority.name),
                    }}
                >
                    {/* HEADER  */}
                    <div className='cp-card-header'>
                        <div className='cp-card-title'>
                            <HiMiniLightBulb />
                            PRIORITY
                        </div>
                        <HiChevronRight
                            onClick={handleShowPriority}
                            style={{ cursor: 'pointer' }}
                        />
                    </div>

                    {/* PRIORITY NAME */}
                    <div className='cp-card-value'>
                        {selectedPriority.name}
                    </div>
                </div>
            ) : (
                <div className='cp-empty'>
                    <p>No priority set</p>
                    <button onClick={handleShowPriority}>
                        + Choose Priority
                    </button>
                </div>
            )}

            {showPriority && (
                <div className='priority-modals'>
                    <CardProperties
                        cardId={cardId}
                        onClose={handleClosePriority}
                        selectedProperties={selectedProperties}
                        setSelectedProperties={setSelectedProperties}
                        selectedPriority={selectedPriority}
                        refreshPriority={refreshPriority}
                        fetchCardDetail={fetchCardDetail}
                        fetchCardActivities={fetchCardActivities}
                        cardActivities={cardActivities}
                        setCardActivities={setCardActivities}
                    />
                </div>
            )}
        </div>
    );
};

export default SelectPriority;
