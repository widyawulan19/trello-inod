import React, { useEffect, useState } from 'react';
import '../style/modules/CardAssignedUsers.css';
import { assignUserToCard, deleteUserFromCard, getAllCardUsers } from '../services/ApiServices';
import userIcon from '../assets/manuser.png';
import BootstrapTooltip from '../components/Tooltip';
import { HiOutlineTrash } from 'react-icons/hi2';
import { useSnackbar } from '../context/Snackbar';
import { useLocation } from 'react-router-dom';

const CardAssignedUsers = ({ 
  cardId,
  assignedUsers,
  setAssignedUsers,
  fetchAssignedUsers,
  onClose,
  assignableUsers,
  setAssignableUsers,
  fetchAssignableUsers,
  handleRemoveUser
}) => {

  const {showSnackbar} = useSnackbar();
  // const userId = location.state?.userId;
  const location = useLocation();
  //DEBUG
  console.log('CARD DETAIL MENERIMA DATA ASSIGNED USERS',assignedUsers);
  // console.log('Halaman card Assigned users menerima data userId:', userId);
if (!assignedUsers || assignedUsers.length === 0) return null;

  const visibleUsers = assignedUsers.slice(0, 5);
  const extraUserCount = assignedUsers.length - visibleUsers.length;

  return (
    <div className="assigned-users-preview">
      {assignedUsers.length === 0 ? (
        <span className="no-user-text">No users assigned</span>
      ) : (
        <div className="user-avatar-group">
          {visibleUsers.map((user) => (
            <div key={user.user_id} className="user-avatar" >
              <div className="ua-prof">
                <img src={user.photo_url} alt={user.username} />
                <p>{user.username}</p>
              </div>
                <BootstrapTooltip title='Remove User' placement='top'>
                  <button onClick={()=> handleRemoveUser(user.user_id)} className="remove-user-btn">
                    <HiOutlineTrash/>
                  </button>
                </BootstrapTooltip>
            </div>
          ))}
          {extraUserCount > 0 && (
            <div className="user-avatar extra-count" title={`${extraUserCount} more users`}>
              +{extraUserCount}
            </div>
          )}
        </div>
      )}
       {/* <div className="user-count-text">
        {assignedUsers.length} user{assignedUsers.length > 1 ? 's' : ''} assigned
      </div> */}
    </div>
  );
};

export default CardAssignedUsers;
