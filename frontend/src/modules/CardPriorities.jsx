import React, { useState, useEffect } from 'react';
import {
  addPriorityToCard,
  addPriorityToCardTesting,
  deletePriorityFromCard,
  getActivityCardTesting,
  getAllCardPriority,
} from '../services/ApiServices';
// import '../style/modules/BoardProperties.css';
import {
  HiChevronDown,
  HiMiniLightBulb,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineEllipsisHorizontal,
  HiOutlineLightBulb,
  HiXMark
} from 'react-icons/hi2';
import { FaTrash } from "react-icons/fa";
import BootstrapTooltip from '../components/Tooltip';
import '../style/modules/CardPriorities.css'
import { useSnackbar } from '../context/Snackbar';
import { useUser } from '../context/UserContext';

const CardProperties = ({ cardId, selectedPriority, refreshPriority, onClose, fetchCardDetail, fetchCardActivities  }) => {
  const [allPriorities, setAllPriorities] = useState([]);
  const [showCardProperties, setShowCardProperties] = useState(false);
  const {showSnackbar} = useSnackbar();
  const {user} = useUser();
  const userId = user?.id;
  const [cardActivities, setCardActivities] = useState([]);


  useEffect(() => {
    fetchAllPriorities();
  }, []);

  const fetchAllPriorities = async () => {
    try {
      const all = await getAllCardPriority();
      setAllPriorities(all.data);
    } catch (error) {
      console.error('Gagal fetch semua prioritas', error);
    }
  };
  const handleShowProperties = () => {
    setShowCardProperties((prev) => !prev);
  };

  const handleCloseProperties = () => {
    setShowCardProperties(false);
  };

  const handleSelect = async (priority) => {
    try {
      await addPriorityToCardTesting(cardId, priority.id, userId);
      refreshPriority(); // Meminta induk update data
      fetchCardActivities(cardId);
      fetchCardDetail();
      showSnackbar('Successfully add a new priority','success');
      setShowCardProperties(false);
    } catch (error) {
      console.error('Gagal menambahkan prioritas ke kartu', error);
      showSnackbar('Failed to add a new priority','error');
    }
  };

  const handleRemovePriority = async () => {
    if (!selectedPriority) return;
  
    try {
      await deletePriorityFromCard(cardId, selectedPriority.priority_id);
  
      showSnackbar('Priority removed from card', 'success');
  
      // 🔄 refresh state & data
      refreshPriority?.();
      fetchCardDetail?.();
      fetchCardActivities?.();
  
    } catch (error) {
      console.error('❌ Failed to remove priority:', error);
      showSnackbar('Failed to remove priority', 'error');
    }
  };

  return (
    <div className='cp-container'>
      <div className="scp-header">
        <div className="scp-header-left">
          <HiMiniLightBulb/>
          <h4>SELECT PRIORITY</h4>
        </div>
        
        <BootstrapTooltip title='Close' placement='top'>
          <HiXMark onClick={onClose} className='close-icon' />
        </BootstrapTooltip>
      </div>
      <div className="scp-content">
        {selectedPriority ? (
          <>
            {/* PRIORITY BADGE */}
            <div className='cps-box'>
              <button
                style={{
                  backgroundColor: selectedPriority.color,
                  border: `1px solid ${selectedPriority.color}`
                }}
              >
                <HiOutlineLightBulb className='cps-lamp' />
                {selectedPriority.name}
              </button>
            </div>

            {/* DELETE PRIORITY */}
            <div className="scp-delete-priority">
              <button onClick={handleRemovePriority}>
                <FaTrash />
                Remove Priority
              </button>
            </div>
          </>
        ) : (
          /* NO PRIORITY STATE */
          <div className="cps-no-priority">
            <div className='cps-no-priority-button'>
              <HiOutlineLightBulb />
              No Priority
            </div>
          </div>
        )}
      </div>


      <div className="scp-container">
        <button className='scp-button' onClick={handleShowProperties}>
          Select Priority
          <HiChevronDown/>
        </button>
        {showCardProperties && (
            <ul className='scp-list'>
            {allPriorities.map((priority) => (
              <li
                key={priority.id}
                onClick={() => handleSelect(priority)}
                style={{
                  color:priority.color,
                  border:`1px solid ${priority.color}`,
                }}
                className='sbp-li'
              >
                <HiOutlineLightBulb className='scp-icon' />
                {priority.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CardProperties;
