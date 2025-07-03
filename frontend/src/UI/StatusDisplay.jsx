import React, { useEffect, useState } from 'react';
import { getStatusByCardId } from '../services/ApiServices';
import { HiDotsCircleHorizontal } from 'react-icons/hi';
import { HiArrowUturnLeft, HiCheckCircle, HiChevronRight, HiMiniCircleStack, HiMiniEye, HiMiniXCircle } from 'react-icons/hi2';
import { FaCircle } from 'react-icons/fa';
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
    //state
    const [showStatus, setShowStatus] = useState(false);
    if(!currentStatus) return null;

    
    function hexToRGBA(hex, opacity) {
        let r = 0, g = 0, b = 0;
    
        // 3 digits
        if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        }
        // 6 digits
        else if (hex.length === 7) {
            r = parseInt(hex[1] + hex[2], 16);
            g = parseInt(hex[3] + hex[4], 16);
            b = parseInt(hex[5] + hex[6], 16);
        }
    
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    //tampilkan icon berdasarkan status
        const ICON_STATUS = {
            Reviewed: <HiMiniEye size={15}/>,
            Approved:<HiCheckCircle size={15}/>,
            Rejected:<HiMiniXCircle size={15}/>,
            Returned: <HiArrowUturnLeft size={15}/>
        }
    //tampilkan warna border berdasarkan status
    const BORDER_COLOR={
            Reviewed: "#C0DCFD",
            Approved:'#BDF6D1',
            Rejected:'#FC9395',
            Returned: '#FCE593'
    }


    //fungsi show status 
    const handleShowStatus = () =>{
        setShowStatus(!showStatus)
    }
    //fungsi close status
    const handleCloseStatus = () =>{
        setShowStatus(false)
    }

    return (
        <div
            style={{
                width:'100%',
                height:'100%',
                display:'flex',
                flexDirection:'column',
                justifyContent:'flex-start',
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
                        height:'100%',
                        width:'100%'
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
                            justifyContent:'flex-start',
                            gap:'8px',
                            fontSize:'12px'
                        }}
                        >
                            {ICON_STATUS[currentStatus.status_name]}
                            STATUS
                        </div>
                        <HiChevronRight
                            onClick={handleShowStatus}
                            style={{
                                cursor:'pointer'
                            }}
                        />
                       
                    </div>

                    <div 
                        style={{
                            // border:'1px solid red',
                            width:'100%',
                            padding:'0px 10px',
                            fontWeight:'bold',
                            fontSize:'12px',
                            marginBottom:'5px'
                        }}
                    >
                        {currentStatus.status_name}
                    </div>
                    
                </div>
            ):(
                <></>
            )}
            {showStatus  && (
                <div
                    style={{
                        position:'absolute',
                        top:'100%',
                        right:'0px',
                        padding:'10px',
                        border:'1px solid #ddd',
                        boxShadow: '0px 4px 8px #5e12eb1e',
                        borderRadius:'8px',
                        backgroundColor:'white',
                        zIndex:'99',
                        width:'100%',
                        display:'flex',
                        alignItems:'center',
                        justifyContent:'center'
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
