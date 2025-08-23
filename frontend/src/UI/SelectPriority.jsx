import React, { useState } from 'react';
import { HiChevronRight, HiMiniLightBulb } from "react-icons/hi2";
import CardProperties from '../modules/CardPriorities';
import '../style/modules/CardPriorities.css';

const SelectPriority = ({ 
    cardId,
    selectedPriority,
    selectedProperties,
    setSelectedProperties,
    refreshPriority
}) => {
    const [showPriority, setShowPriority] = useState(false);

    const handleShowPriority = () => {
        setShowPriority(true);
    };

    const handleClosePriority = () => {
        setShowPriority(false);
    };

    return (
        <div
        className="card-priority"
            style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
            }}
        >
            {selectedPriority ? (
                <div
                    style={{
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        color: selectedPriority.color,
                        border: `2px solid ${selectedPriority.color}`,
                        backgroundColor: selectedPriority.background,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '12px',
                            }}
                        >
                            <HiMiniLightBulb />
                            PRIORITY
                        </div>
                        <HiChevronRight
                            onClick={handleShowPriority}
                            style={{ cursor: 'pointer' }}
                        />
                    </div>
                    <div
                        style={{
                            padding: '0px 10px',
                            fontWeight: 'bold',
                            fontSize: '12px',
                            marginBottom: '5px',
                        }}
                    >
                        {selectedPriority.name}
                    </div>
                </div>
            ) : (
                <div
                    style={{
                        border: '1px dashed #ccc',
                        borderRadius: '8px',
                        // padding: '12px',
                        padding:'5px 10px',
                        textAlign: 'center',
                        fontSize: '12px',
                        color: '#888',
                        backgroundColor: '#f9f9f9',
                    }}
                >
                    <p style={{ margin: '0 0 8px 0' }}>No priority set</p>
                    <button
                        onClick={handleShowPriority}
                        style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            backgroundColor: '#eef',
                            border: '1px solid #ccd',
                            borderRadius: '4px',
                        }}
                    >
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
                    />
                </div>
            )}
        </div>
    );
};

export default SelectPriority;
