import React, { useState, useEffect } from 'react';
import {
  addPriorityToBoard,
  deletePropertyFromBoard,
  getALlPriorities,
  getBoardPriorities
} from '../services/ApiServices';
import '../style/modules/BoardProperties.css';
import {
  HiOutlineEllipsisHorizontal,
  HiOutlineLightBulb,
  HiOutlinePlus
} from 'react-icons/hi2';
import BootstrapTooltip from '../components/Tooltip';
import { useSnackbar } from '../context/Snackbar';
import { FaXmark } from 'react-icons/fa6';

/* =========================
   PRIORITY THEME MAPPING
========================= */
const PRIORITY_THEME = {
  low: 'status-confirmed',
  medium: 'status-progress',
  high: 'status-rejected',
  no: 'status-unknown',
};

/* =========================
   NORMALIZER (WAJIB)
========================= */
const normalizePriority = (name = '') => {
  return name
    .toLowerCase()
    .replace('priority', '')
    .trim();
};

/* =========================
   STYLE HELPER
========================= */
const getPriorityStyle = (priorityName) => {
  const key = normalizePriority(priorityName);
  const theme = PRIORITY_THEME[key] || 'status-unknown';

  return {
    backgroundColor: `var(--${theme}-bg)`,
    border: `1px solid var(--${theme}-border)`,
    color: `var(--${theme}-text)`,
  };
};

const BoardProperties = ({ boardId }) => {
  const { showSnackbar } = useSnackbar();

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
      setSelectedPriority(current.data[0] || null);
    } catch (error) {
      console.error('Gagal fetch data', error);
    }
  };

  const handleSelect = async (priority) => {
    try {
      await addPriorityToBoard(boardId, priority.id);
      await fetchData();
      setShowBoardProperties(false);
      showSnackbar('Priority board added', 'success');
    } catch (error) {
      showSnackbar('Failed to add priority board', 'error');
    }
  };

  const handleCloseBoard = () => {
    setShowBoardProperties(false);
  };

  return (
    <div className="bp-container">
      <div className="bp-select">
        {selectedPriority ? (
          <div className="bps-box">
            {/* MINI PRIORITY BADGE */}
            <span
              className="priority-mini"
              style={getPriorityStyle(selectedPriority.name)}
              title={selectedPriority.name}
            >
              <HiOutlineLightBulb className="priority-mini-icon" />
              {selectedPriority.name}
            </span>
          </div>
        ) : (
          <button className="box-add" onClick={() => setShowBoardProperties(true)}>
            <HiOutlinePlus className="ba-icon" />
            Add Priority
          </button>
        )}

        <BootstrapTooltip title="Priority Setting" placement="top">
          <HiOutlineEllipsisHorizontal
            className="bps-icon"
            onClick={() => setShowBoardProperties((prev) => !prev)}
          />
        </BootstrapTooltip>
      </div>

      {showBoardProperties && (
        <ul className="sbp-container">
          <div className="sbp-header">
            <div className="header-left">
              <div className="left-icon">
                <HiOutlineLightBulb className="mini-icon" />
              </div>
              <h4>Select Priority</h4>
            </div>
            <div className="header-right">
              <BootstrapTooltip title="Close" placement="top">
                <FaXmark onClick={handleCloseBoard} className="sbp-close" />
              </BootstrapTooltip>
            </div>
          </div>

          {allPriorities.map((priority) => (
            <li
              key={priority.id}
              className="sbp-li"
              onClick={() => handleSelect(priority)}
              style={getPriorityStyle(priority.name)}
            >
              <HiOutlineLightBulb className="sbp-icon" />
              {priority.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BoardProperties;
