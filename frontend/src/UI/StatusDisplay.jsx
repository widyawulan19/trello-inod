import React, { useEffect, useState } from 'react';
import { getStatusByCardId } from '../services/ApiServices';
import { HiDotsCircleHorizontal } from 'react-icons/hi';
import { HiArrowUturnLeft, HiCheckCircle, HiMiniCircleStack, HiMiniEye, HiMiniXCircle } from 'react-icons/hi2';
import { FaCircle } from 'react-icons/fa';

const StatusDisplay = ({ cardId,currentStatus }) => {
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
            Reviewed: <HiMiniEye/>,
            Approved:<HiCheckCircle/>,
            Rejected:<HiMiniXCircle/>,
            Returned: <HiArrowUturnLeft/>
        }
    

    return (
        <div>
            {/* <h5>Status Kartu:</h5> */}
            {currentStatus ? (
                <button 
                    style={{
                        backgroundColor: currentStatus.background_color,
                        color: currentStatus.text_color,
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        fontSize:'10px',
                        margin:'0px',
                        padding:'3px 8px',
                        display:'flex',
                        alignItems:'center',
                        justifyContent:'center',
                        gap:'5px'
                    }}
                >
                    {ICON_STATUS[currentStatus.status_name]}
                    {currentStatus.status_name}
                </button>
            ) : (
                <p
                    style={{fontSize:'12px', margin:'0px'}}
                ></p>
            )}
        </div>
    );
};

export default StatusDisplay;
