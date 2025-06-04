import React, { useEffect, useState } from 'react';
import { getCardPriority } from '../services/ApiServices';
import { HiMiniLightBulb } from "react-icons/hi2";

const SelectPriority = ({ cardId, selectedPriority}) => {
    if(!selectedPriority) return null;


    return (
        <div className='selected-priority-container'>
            {/* {selectedPriority && ( */}
                <div 
                style={{
                    backgroundColor: selectedPriority.color,
                    color: 'white',
                    padding: "2px 8px",
                    borderRadius: "6px",
                    fontWeight: "normal",
                    fontSize:'10px',
                    border: `1px solid ${selectedPriority.color}`,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                }}
            >
                <HiMiniLightBulb />
                {selectedPriority.name}
            </div>
            {/* )} */}
        </div>
    );
};

export default SelectPriority;
