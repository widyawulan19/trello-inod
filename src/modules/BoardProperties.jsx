import React, { useState, useEffect } from 'react';
import {
  addPriorityToBoard,
  deletePropertyFromBoard,
  getALlPriorities,
  getBoardPriorities
} from '../services/ApiServices';
import '../style/modules/BoardProperties.css'
import { HiOutlineAdjustmentsHorizontal, HiOutlineEllipsisHorizontal, HiOutlineLightBulb, HiOutlinePlus, HiXMark } from 'react-icons/hi2';
import BootstrapTooltip from '../components/Tooltip';
import { useSnackbar } from '../context/Snackbar';
import { FaXmark } from 'react-icons/fa6';

const BoardProperties = ({ boardId }) => {
  const {showSnackbar} = useSnackbar();
  const [allPriorities, setAllPriorities] = useState([]);
  const [selectedPriority, setSelectedPriority] = useState(null);
  const [showBoardProperties, setShowBoardProperties] = useState(false);

  useEffect(() => {
    fetchData();
  }, [boardId]);

  const fetchData = async () => {
    try {
      const all = await getALlPriorities();
      const current = await getBoardPriorities(boardId);
      setAllPriorities(all.data);
      setSelectedPriority(current.data[0] || null); // hanya satu prioritas
    } catch (error) {
      console.error('Gagal fetch data', error);
    }
  };

  const handleShowBoard = () => {
    setShowBoardProperties((prev) => !prev);
  };

  const handleCloseBoard = () =>{
    setShowBoardProperties(false)
  }

  const handleSelect = async (property) => {
    try {
      await addPriorityToBoard(boardId, property.id);
      await fetchData();
      setShowBoardProperties(false);
      showSnackbar('Priority board added','success');
    } catch (error) {
      showSnackbar('Failed to add priority board','error');
      console.error('Gagal menambahkan prioritas', error);
    }
  };

  const handleDelete = async () => {
    try {
      if (selectedPriority) {
        await deletePropertyFromBoard(boardId, selectedPriority.id);
        setSelectedPriority(null);
      }
    } catch (error) {
      console.error('Gagal menghapus prioritas', error);
    }
  };

  return (
    <div className='bp-container'>
        <div className="bp-select">
            {selectedPriority ? (
                <div className='bps-box'>
                    <button style={{ backgroundColor: selectedPriority.color, border:`1px solid ${selectedPriority.color}`, borderRadius:'6px' }}>
                        <HiOutlineLightBulb className='bps-lamp'/>
                        {selectedPriority.name}
                    </button>
                </div>
            ) : (
                <button className='box-add' onClick={handleShowBoard}>
                  <HiOutlinePlus className='ba-icon'/>
                  Add Priority
                </button>
            )}
            <BootstrapTooltip title='Priority Setting' placement='top'>
                <HiOutlineEllipsisHorizontal className='bps-icon' onClick={handleShowBoard}/>
            </BootstrapTooltip>
        </div>

      {showBoardProperties && (
        <ul className='sbp-container'>
            <div className="sbp-header">
              <div className="header-left">
                <div className="left-icon">
                  <HiOutlineLightBulb className='mini-icon'/>
                </div>
                <h4>Select Property</h4>
              </div>
              <div className="header-right">
                <BootstrapTooltip title='Close' placement='top'>
                    <FaXmark onClick={handleCloseBoard} className='sbp-close'/>
                </BootstrapTooltip>
              </div>
            </div>
            {allPriorities.map((priority) => (
                <li
                key={priority.id}
                onClick={() => handleSelect(priority)}
                style={{color:priority.color}}
                className='sbp-li'
                >
                    <HiOutlineLightBulb className='sbp-icon'/>
                    {priority.name}
                </li>
            ))}
        </ul>
      )}

      {/* {selectedPriority && (
        <div style={{ marginTop: '10px' }}>
          <p>
            Prioritas terpilih:{' '}
            <strong style={{ color: selectedPriority.color }}>
              {selectedPriority.name}
            </strong>
          </p>
          <button onClick={handleDelete}>Hapus Prioritas</button>
        </div>
      )} */}
    </div>
  );
};

export default BoardProperties;
