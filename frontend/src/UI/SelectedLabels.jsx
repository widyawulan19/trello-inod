import React, { useEffect, useState } from 'react';
import { getAllLabels, getLabelByCard, deleteLabels, addLabelToCard } from '../services/ApiServices';
import { HiXMark } from "react-icons/hi2";
import '../style/modules/Labels.css';
import BootstrapTooltip from '../components/Tooltip';

const SelectedLabels = ({ cardId, fetchCardDetail,labels }) => {
    const [selectedLabels, setSelectedLabels] = useState([]);
    const [allLabels, setAllLabels] = useState([]);
    // const [labels, setLabels] = useState([]);

    //debug
    console.log('File ini selected labels', cardId, labels)


    useEffect(() => {
        fetchData();
    }, [cardId]);

    const fetchData = async () => {
        try {
            const selected = await getLabelByCard(cardId);
            const all = await getAllLabels();
            setSelectedLabels(selected.data);
            setAllLabels(all.data);
        } catch (error) {
            console.error('Error fetching label data:', error);
        }
    };


    return (
        <div className="selected-labels" >
            {labels.map(label => (
                <div 
                key={label.label_id} 
                className="label-item"
                style={{ backgroundColor: label.bg_color, color:'#333', fontWeight:'bold' }}
                >
                {label.label_name}
                </div>
            ))}
        </div>
    );
};

export default SelectedLabels;
