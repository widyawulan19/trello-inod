import React, { useEffect, useState } from 'react';
import '../style/modules/CardAssignment.css';
import {
  getAllCardUsers,
  getAllUserAssignToCard,
  assignUserToCard,
  deleteUserFromCard,
} from '../services/ApiServices';
import { PiUserCirclePlusFill } from "react-icons/pi";
import { HiOutlineTrash, HiOutlineUserGroup, HiPlus, HiXMark } from 'react-icons/hi2';
import BootstrapTooltip from '../components/Tooltip';
import user1 from '../assets/userwoman.png'
import user2 from '../assets/manuser.png'
import { IoCheckmarkCircleOutline } from 'react-icons/io5';
import { useSnackbar } from '../context/Snackbar';
import { FaXmark } from 'react-icons/fa6';

const CardAssigment = ({ 
    cardId,
    assignedUsers,
    setAssignedUsers,
    fetchAssignedUsers,
    onClose,
    assignableUsers,
    setAssignableUsers,
    fetchAssignableUsers
  }) => {
  // const [assignableUsers, setAssignableUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const {showSnackbar} = useSnackbar()

  //DEBUG
  console.log('File ini Card Assignment menerima data assigned user', assignedUsers)

  // const fetchAssignableUsers = async () => {
  //   const res = await getAllUserAssignToCard(cardId);
  //   setAssignableUsers(res.data);
  // };

  const handleAssignUser = async () => {
    if (!selectedUser) return;
    await assignUserToCard(cardId, selectedUser.user_id);
    setSelectedUser(null);
    setDropdownOpen(false);
    fetchAssignedUsers();
    fetchAssignableUsers();
    showSnackbar('User assigned successfully!', 'success');
  };

  const handleRemoveUser = async (userId) => {
    await deleteUserFromCard(cardId, userId);
    fetchAssignedUsers();
    fetchAssignableUsers();
    showSnackbar('User removed successfully!', 'success');
  };

  useEffect(() => {
    if (cardId) {
      fetchAssignedUsers();
      fetchAssignableUsers();
    }
  }, [cardId]);

  return (
    <div className="card-user-manager">
      <div className="cum-header">
        <div className="header-left">
          <div className="left-icon">
            <PiUserCirclePlusFill/>
          </div>
          <h5>Assigned User</h5>
        </div>
        <div className="header-right">
          <BootstrapTooltip title='Close' placement='top'>
            <FaXmark className='cum-icon' onClick={onClose}/>
        </BootstrapTooltip>
        </div>
        
        
      </div>
      <div className="cum-body">
          {assignedUsers.length === 0 ? (
            <div className="no-user">
                <p>Gak punya temen ya :"</p>
            </div>
            ) : (
              <p></p>
              
            )}
      </div>

      <div className="dropdown-container">
        {/* <h5 style={{fontSize:'10px', marginBottom:'10px'}}>Assign to</h5> */}
        <button onClick={() => setDropdownOpen(!dropdownOpen)} className="dropdown-btn">
          {selectedUser ? selectedUser.username : 'Select User'}
        </button>

        {dropdownOpen && (
          <ul className="dropdown-list">
            {assignableUsers.map((user) => (
              <li key={user.id} onClick={() => {
                setSelectedUser(user);
                setDropdownOpen(false);
              }}>
                <div className="dl-title">
                  <img src={user.photo_url} alt={user.username}/>
                  <span>{user.username}</span>
                </div>
                {/* <button className="select-btn">
                  <IoCheckmarkCircleOutline/>
                </button> */}
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={handleAssignUser}
          disabled={!selectedUser}
          className="assign-btn"
        >
          <HiPlus/>
          Add User
        </button>
      </div>
    </div>
  );
};

export default CardAssigment;
