import React, { useEffect, useState } from 'react';
import { getCardPriority } from '../services/ApiServices';
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
    const[showPriority, setShowPriority] = useState(false);


    if(!selectedPriority) return null;

    // fuction show priotitie 
    const handleSHowPriority = () =>{
        setShowPriority(!showPriority);
    }

    const handleClosePriority = () =>{
        setShowPriority(false);
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
                // border:'1px solid #ddd'
            }}
        >
            <div
                style={{
                    width:'100%',
                    height:'100%',
                    borderRadius:'8px',
                    display:'flex',
                    flexDirection:'column',
                    justifyContent:'flex-start',
                    position:'relative',
                    color:selectedPriority.color,
                    border:`2px solid ${selectedPriority.color}`,
                    backgroundColor:selectedPriority.background
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
                        <HiMiniLightBulb />
                        PRIORITY
                    </div>
                    <HiChevronRight
                        onClick={handleSHowPriority}
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
                    {selectedPriority.name}
                </div>
            </div>
            {showPriority && (
                <div 
                    className='priority-modals'
                >
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


    // return (
    //     <div className='selected-priority-container'>
    //         {/* {selectedPriority && ( */}
    //             <div 
    //             style={{
    //                 backgroundColor: selectedPriority.color,
    //                 color: 'white',
    //                 padding: "2px 8px",
    //                 borderRadius: "6px",
    //                 fontWeight: "normal",
    //                 fontSize:'10px',
    //                 border: `1px solid ${selectedPriority.color}`,
    //                 display: "inline-flex",
    //                 alignItems: "center",
    //                 gap: "6px",
    //             }}
    //         >
    //             <HiMiniLightBulb />
    //             {selectedPriority.name}
    //         </div>
    //         {/* )} */}
    //     </div>
    // );


    // <div
    //         style={{
    //             width:'100%',
    //             height:'100%',
    //             borderRadius:'8px',
    //             display:'flex',
    //             flexDirection:'column',
    //             justifyContent:'flex-start',
    //             position:'relative',
    //             color:selectedPriority.color,
    //             border:`2px solid ${selectedPriority.color}`,
    //             backgroundColor:selectedPriority.background
    //         }}
    //     >
    //            {selectedPriority.name}
    //     </div>