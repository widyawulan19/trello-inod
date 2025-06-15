import React, { useState, useEffect } from 'react';
import {
  addPriorityToCard,
  deletePriorityFromCard,
  getAllCardPriority
} from '../services/ApiServices';
// import '../style/modules/BoardProperties.css';
import {
  HiChevronDown,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineEllipsisHorizontal,
  HiOutlineLightBulb,
  HiXMark
} from 'react-icons/hi2';
import BootstrapTooltip from '../components/Tooltip';
import '../style/modules/CardPriorities.css'
import { useSnackbar } from '../context/Snackbar';

const CardProperties = ({ cardId, selectedPriority, refreshPriority, onClose }) => {
  const [allPriorities, setAllPriorities] = useState([]);
  const [showCardProperties, setShowCardProperties] = useState(false);
  const {showSnackbar} = useSnackbar();

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
      await addPriorityToCard(cardId, priority.id);
      await refreshPriority(); // Meminta induk update data
      showSnackbar('Successfully add a new priority','success');
      setShowCardProperties(false);
    } catch (error) {
      console.error('Gagal menambahkan prioritas ke kartu', error);
      showSnackbar('Failed to add a new priority','error');
    }
  };

  const handleDelete = async () => {
    try {
      if (selectedPriority) {
        await deletePriorityFromCard(cardId, selectedPriority.id);
        await refreshPriority(); // Sinkronkan kembali
      }
    } catch (error) {
      console.error('Gagal menghapus prioritas kartu', error);
    }
  };

  return (
    <div className='cp-container'>
      <div className="scp-header">
        <h4>SELECT PRIORITY</h4>
        <BootstrapTooltip title='Close' placement='top'>
          <HiXMark onClick={onClose} className='close-icon' />
        </BootstrapTooltip>
      </div>
      <div className="scp-content">
          {selectedPriority && (
            <div className='cps-box'>
              <button
                style={{
                  backgroundColor: selectedPriority.color,
                  border: `1px solid ${selectedPriority.color}`,
                  borderRadius: '6px',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize:'12px',
                  fontWeight:'bold',
                  padding: '4px 10px',
                  width:'100%'
                }}
              >
                <HiOutlineLightBulb className='cps-lamp' />
                {selectedPriority.name}
              </button>
            </div>
          )}
      </div>

      <div className="scp-container">
        <button onClick={handleShowProperties}>
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
                  margin: '0px 5px',
                  borderRadius: '4px',
                  padding: '5px 10px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  color:priority.color,
                  gap:'5px',
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


// return (
//   <div className='cp-container'>
//     <div className="cp-select">
//       {selectedPriority && (
//         <div className='cps-box'>
//           <button
//             style={{
//               backgroundColor: selectedPriority.color,
//               border: `1px solid ${selectedPriority.color}`,
//               borderRadius: '6px',
//               color: 'white',
//               display: 'flex',
//               alignItems: 'center',
//               gap: '4px',
//               padding: '4px 10px',
//             }}
//           >
//             <HiOutlineLightBulb className='cps-lamp' />
//             {selectedPriority.name}
//           </button>
//           <BootstrapTooltip title='Priority Setting' placement='top'>
//             <HiXMark className='cps-icon' onClick={onClose}/>
//           </BootstrapTooltip>
//         </div>
//       )}
//       <ul className='scp-container'>
//         <div className="scp-header">
//           <h4>Select Priority</h4>
//           <BootstrapTooltip title='Close' placement='top'>
//             {/* <HiXMark onClick={handleCloseCard} className='sbp-close' /> */}
//           </BootstrapTooltip>
//         </div>
//         {allPriorities.map((priority) => (
//           <li
//             key={priority.id}
//             onClick={() => handleSelect(priority)}
//             style={{
//               margin: '0px 5px',
//               borderRadius: '4px',
//               padding: '8px 10px',
//               fontSize: '12px',
//               cursor: 'pointer',
//               backgroundColor:
//                 selectedPriority?.id === priority.id ? priority.color : '#fff',
//               color:
//                 selectedPriority?.id === priority.id ? '#fff' : priority.color,
//               fontWeight:
//                 selectedPriority?.id === priority.id ? 'bold' : 'normal',
//             }}
//             className='sbp-li'
//           >
//             <HiOutlineLightBulb className='scp-icon' />
//             {priority.name}
//           </li>
//         ))}
//       </ul>
//     </div>

//     {/* {showCardProperties && ( */}
      
//     {/* )} */}
//   </div>
// );