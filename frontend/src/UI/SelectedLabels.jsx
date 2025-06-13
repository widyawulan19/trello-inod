import React, { useEffect, useState } from 'react';
import { getAllLabels, getLabelByCard, deleteLabels, addLabelToCard } from '../services/ApiServices';
import { HiXMark } from "react-icons/hi2";
import '../style/modules/Labels.css';
import BootstrapTooltip from '../components/Tooltip';

const SelectedLabels = ({ cardId, fetchCardDetail,labels }) => {
    const [selectedLabels, setSelectedLabels] = useState([]);
    const [allLabels, setAllLabels] = useState([]);
    // const [labels, setLabels] = useState([]);


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
                key={label.id} 
                className="label-item"
                style={{ backgroundColor: label.bg_color, color:'#333' }}
                >
                {label.name}
                </div>
            ))}
        </div>
    );
};

export default SelectedLabels;


// <div className='selected-labels-container'>
//             {/* <h5>Selected Labels</h5> */}
//             {selectedLabels.length > 0 ? (
//                 selectedLabels.map(label => (
//                     <div 
//                         key={label.id} 
//                         style={{ 
//                             backgroundColor: label.bg_color?.replace("rgb", "rgba")?.replace(")", ", 0.3)"),
//                             color: label.color,
//                             padding: "4px",
//                             margin: "2px",
//                             borderRadius: "8px",
//                             display: "inline-flex",
//                             alignItems: 'center',
//                             fontSize: '10px',
//                             fontWeight: 'bold',
//                         }}
//                     >
//                         {label.name}
//                         <button
//                             onClick={() => handleRemoveLabel(label.id)}
//                             className='delete-label'
//                             style={{ marginLeft: '5px', cursor: 'pointer', background: 'transparent', border: 'none' }}
//                         >
//                             <HiXMark size={10} />
//                         </button>
//                     </div>
//                 ))
//             ) : (
//                 <p>No labels selected</p>
//             )}
//         </div>