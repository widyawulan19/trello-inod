import React, { useState } from 'react';
import '../style/modules/CardStatus.css';
import { HiCheckCircle, HiChevronDown } from 'react-icons/hi2';
import { FaXmark } from 'react-icons/fa6';
import {
  updateCardStatusTesting,
  createStatusTesting
} from '../services/ApiServices';
import {
  ICON_STATUS,
  getStatusClass,
  getStatusColorStyle
} from '../context/StatusStyleHelper';
import { useSnackbar } from '../context/Snackbar';
// import { getStatusColorStyle } from '../context/StatusStyleHelper';

const CardStatus = ({
  cardId,
  userId,
  onClose,
  currentStatus,
  allStatuses,
  fetchCardStatus,
  selectedStatus,
  setSelectedStatus
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // ===== CREATE STATUS STATE =====
  const [isCreating, setIsCreating] = useState(false);
  const [newStatusName, setNewStatusName] = useState('');
  const [accentColor, setAccentColor] = useState('#2563eb');
  const {showSnackbar} = useSnackbar();

  /* ================= HANDLER ================= */

  const handleStatusChange = async (statusId) => {
    setSelectedStatus(statusId);
    setIsOpen(false);

    try {
      await updateCardStatusTesting(cardId, userId, { statusId });
      fetchCardStatus();
    } catch (err) {
      console.error('❌ Failed to update status:', err);
    }
  };

  const handleCreateStatus = async () => {
    if (!newStatusName.trim()) return;

    try {
      await createStatusTesting({
        status_name: newStatusName.trim(),
        accent_color: accentColor
      });

      // reset
      setNewStatusName('');
      setAccentColor('#2563eb');
      setIsCreating(false);
      showSnackbar('Status created successfully','success');

      // refresh status list (parent)
      fetchCardStatus();
    } catch (err) {
      console.error(
        '❌ Failed to create status:',
        err.response?.data?.error
      );
      showSnackbar('Failed to create status','error');
    }
  };

  const currentClass = currentStatus
    ? getStatusClass(currentStatus.status_name)
    : 'neutral';

  return (
    <div className="card-status-container">
      {/* ===== HEADER ===== */}
      <div className="status-header">
        <div className="header-left">
          <HiCheckCircle/>
          <h5>SELECT CARD STATUS</h5>
        </div>
        
        <FaXmark onClick={onClose} className="sch-icon" />
      </div>

      {/* ===== CURRENT STATUS ===== */}
      <div className="sc-content">
        {currentStatus ? (
         <button
            className="status-pill"
            style={getStatusColorStyle(currentStatus.accent_color)}
          >
            {currentStatus.status_name}
          </button>

        ) : (
          <p>Status belum ditentukan</p>
        )}
      </div>


      {/* ===== DROPDOWN ===== */}
      <div className="dropdown-status">
        <button
          className="dropdown-trigger"
          onClick={() => setIsOpen(!isOpen)}
        >
          Pilih Status
          <HiChevronDown />
        </button>

        {isOpen && (
          <div className="ds-box">
            <div className="dsb-pill">
              {allStatuses.map((status) => (
                <div
                  key={status.status_id}
                  className="status-pill"
                  style={getStatusColorStyle(status.accent_color)}
                  onClick={() => handleStatusChange(status.status_id)}
                >
                  {status.status_name}
                </div>
              ))}
            </div>
        
            {/* ===== CREATE STATUS SECTION ===== */}
            <div className="create-status-box">
              {!isCreating ? (
                <button
                  className="create-status-btn"
                  onClick={() => setIsCreating(true)}
                >
                  + Create New Status
                </button>
              ) : (
                <div className="create-status-form">
                  <h5>Create New Status</h5>
                  <div className="fill-form">
                    <input
                      type="text"
                      placeholder="Status name"
                      value={newStatusName}
                      onChange={(e) =>
                        setNewStatusName(e.target.value)
                      }
                    />

                    <div className="color-picker">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) =>
                          setAccentColor(e.target.value)
                        }
                      />
                      <span>{accentColor}</span>
                    </div>
                  </div>
                
                  <div className="cs-action">
                    <button
                      className="cs-cancel"
                      onClick={() => setIsCreating(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="cs-save"
                      onClick={handleCreateStatus}
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardStatus;
