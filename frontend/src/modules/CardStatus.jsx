import React, { useEffect, useState } from 'react';
import { getStatusByCardId, getAllStatus, updateStatus } from '../services/ApiServices';
import '../style/modules/CardStatus.css';
import { HiArrowDown, HiArrowUturnLeft, HiCheckCircle, HiChevronDown, HiFlag, HiMiniEye, HiMiniXCircle, HiXMark } from 'react-icons/hi2';
import { FaCheckCircle } from 'react-icons/fa';
import { FaXmark } from 'react-icons/fa6';

const CardStatus = ({ 
    cardId,
    onClose,
    currentStatus,
    setCurrentStatus,
    allStatuses,
    setAllStatuses,
    selectedStatus,
    setSelectedStatus,
    fetchAllStatuses,
    fetchCardStatus
 }) => {
    const [isOpen, setIsOpen] = useState(false);
    console.log('currentStatus:', currentStatus);

    const handleStatusChange = async (statusId) => {
        setSelectedStatus(statusId);
        setIsOpen(false);

        try {
            await updateStatus(cardId, { statusId });
            fetchCardStatus();
        } catch (error) {
            console.error('Gagal memperbarui status kartu:', error);
        }
    };

    //tampilkan icon berdasarkan status
    const ICON_STATUS = {
        Reviewed: <HiMiniEye/>,
        Approved:<HiCheckCircle/>,
        Rejected:<HiMiniXCircle/>,
        Returned: <HiArrowUturnLeft/>
    }

    return (
        <div className='card-status-container'>
            <div className="status-header">
                <h5>CARD STATUS</h5>
                <FaXmark onClick={onClose}  size={20} className='sch-icon'/>
            </div>
            <div className="sc-content">
                {/* <h5>Status Kartu Saat ini</h5> */}
                {currentStatus ? (
                    <button 
                    style={{
                        backgroundColor:currentStatus.background_color,
                        border: `1px solid ${currentStatus.background_color}`,
                        color: currentStatus.text_color,
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        fontSize:'12px',
                        display:'flex',
                        alignItems:'center',
                        justifyContent:'center',
                        marginTop:'5px',
                        padding: '6px 12px',
                        width:'100%',
                        gap:'5px'
                    }}
                >
                    {ICON_STATUS[currentStatus.status_name]}
                    {currentStatus.status_name}
                </button>
                
                ) : (
                    <p>Status belum ditentukan</p>
                )}
            </div>

            {/* Dropdown untuk mengubah status */}
            <div className='dropdown-status'>
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                >
                    Pilih Status
                    <HiChevronDown/>
                </button>
                {isOpen && (
                    <div className='ds-box'>
                        {allStatuses.map((status) => (
                            <div 
                                key={status.status_id} 
                                onClick={() => handleStatusChange(status.status_id)}
                                style={{
                                    padding: '4px 8px',
                                    fontSize:'12px',
                                    cursor: 'pointer',
                                    backgroundColor: status.background_color,
                                    color: status.text_color,
                                    border: `1px solid ${status.background_color}`,
                                    borderRadius:'4px',
                                    margin:'2px',
                                    display:'flex',
                                    alignItems:'center',
                                    justifyContent:'flex-start',
                                    gap:'8px'
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

// hexToRGBA(currentStatus.background_color, 0.1)