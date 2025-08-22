import React, { useEffect, useState } from 'react';
import { HiArrowUturnLeft, HiCheckCircle, HiChevronRight, HiMiniEye, HiMiniXCircle } from 'react-icons/hi2';
import CardStatus from '../modules/CardStatus';

const StatusDisplay = ({ 
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

    function hexToRGBA(hex, opacity) {
        let r = 0, g = 0, b = 0;
        if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length === 7) {
            r = parseInt(hex[1] + hex[2], 16);
            g = parseInt(hex[3] + hex[4], 16);
            b = parseInt(hex[5] + hex[6], 16);
        }
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    const ICON_STATUS = {
        Reviewed: <HiMiniEye size={15}/>,
        Approved: <HiCheckCircle size={15}/>,
        Rejected: <HiMiniXCircle size={15}/>,
        Returned: <HiArrowUturnLeft size={15}/>
    };

    const BORDER_COLOR = {
        Reviewed: "#C0DCFD",
        Approved: '#BDF6D1',
        Rejected: '#FC9395',
        Returned: '#FCE593'
    };

    const handleShowStatus = () => {
        setShowStatus(true);
    };

    const handleCloseStatus = () => {
        setShowStatus(false);
    };

    return (
        <div
            style={{
                width:'100%',
                display:'flex',
                flexDirection:'column',
                position:'relative',
            }}
        >
            {currentStatus ? (
                <div
                    style={{
                        border:`2px solid ${BORDER_COLOR[currentStatus.status_name]}`,
                        borderRadius:'8px',
                        backgroundColor: currentStatus.background_color,
                        color: currentStatus.text_color,
                        width:'100%',
                    }}
                >
                    <div
                        style={{
                            display:'flex',
                            alignItems:'center',
                            justifyContent:'space-between',
                            padding:'10px'
                        }}
                    >
                        <div
                            style={{
                                display:'flex',
                                alignItems:'center',
                                gap:'8px',
                                fontSize:'12px'
                            }}
                        >
                            {ICON_STATUS[currentStatus.status_name]}
                            STATUS
                        </div>
                        <HiChevronRight
                            onClick={handleShowStatus}
                            style={{ cursor:'pointer' }}
                        />
                    </div>
                    <div 
                        style={{
                            padding:'0px 10px',
                            fontWeight:'bold',
                            fontSize:'12px',
                            marginBottom:'5px'
                        }}
                    >
                        {currentStatus.status_name}
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
                        backgroundColor: '#f9f9f9'
                    }}
                >
                    <p style={{ margin: '0 0 8px 0' }}>No status set</p>
                    <button
                        onClick={handleShowStatus}
                        style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            backgroundColor: '#eef',
                            border: '1px solid #ccd',
                            borderRadius: '4px'
                        }}
                    >
                        + Choose Status
                    </button>
                </div>
            )}

            {showStatus && (
                <div
                    style={{
                        position: 'absolute',
                        top: '100%',
                        right: '0px',
                        padding: '4px 8px',
                        border: '1px solid #ddd',
                        boxShadow: '0px 4px 8px #5e12eb1e',
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        zIndex: '99',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <CardStatus
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
