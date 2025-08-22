import React, { useEffect, useState } from 'react';
import { getLabelByCard, deleteLabels } from '../services/ApiServices';
import { HiXMark } from "react-icons/hi2";
import '../style/modules/BoxStatus.css'
import BootstrapTooltip from '../components/Tooltip';

const SelectedLabelCard = ({ cardId }) => {
    const [labels, setLabels] = useState([]);

    useEffect(() => {
        fetchSelectedLabels();
    }, [cardId]);

    const fetchSelectedLabels = async () => {
        try {
            const response = await getLabelByCard(cardId);
            setLabels(response.data);
        } catch (error) {
            console.error('Error fetching selected labels:', error);
        }
    };

    const handleRemoveLabel = async (labelId) => {
        try {
            await deleteLabels(cardId, labelId);
            setLabels(labels.filter(label => label.id !== labelId));
        } catch (error) {
            console.error('Error removing label:', error);
        }
    };

    return (
        <div className='c-selected-labels-container'>
            {labels.length > 0 ? (
                labels.map(label => (
                    <div 
                        key={label.id} 
                        className='label-box'
                        style={{ 
                            // backgroundColor: label.bg_color.replace("rgb", "rgba").replace(")", ", 0.3)"),
                            backgroundColor: label.bg_color,
                            color: label.color,
                        }}
                    >
                        {label.label_name}
                        
                        {/* <BootstrapTooltip title='Remove Labels' placement='top'>
                            <HiXMark 
                                className='sl-icon'
                                onClick={()=> handleRemoveLabel(label.id)}
                            />
                        </BootstrapTooltip> */}
                    </div>
                ))
            ) : (
                <p
                    style={{
                        margin:'0px',
                        padding:'0px'
                    }}
                ></p>
            )}
        </div>
    );
};

export default SelectedLabelCard;
