import React, { useEffect, useState } from 'react'
import { getTotalUserWorkspace } from '../services/ApiServices';
import { HiOutlineUserGroup } from 'react-icons/hi';
import '../style/pages/Workspace.css'

const UsersTotal=({workspaceId})=> {
    const [userCount, setUserCount] = useState(null);
    const [loading, setLoading] = useState(true);


      useEffect(() => {
        const fetchUserCount = async () => {
          try {
            const response = await getTotalUserWorkspace(workspaceId);
            setUserCount(response.data.user_count);
          } catch (error) {
            console.error('Error fetching user count:', error);
          } finally {
            setLoading(false);
          }
        };
    
        fetchUserCount();
      }, [workspaceId]);
    
      if (loading) return <p>🔄 Loading users...</p>

      return (
        <div className='ut-container'>
            <HiOutlineUserGroup className='wc-icon'/>
            <p>{userCount} members</p>
        </div>
        
      );
}

export default UsersTotal

{/* <p>👥 Users: {userCount}</p> */}