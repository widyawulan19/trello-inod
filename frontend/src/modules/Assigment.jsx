import React, { useEffect, useState } from 'react'
import { addUserToWorkspace, getAllUsers, getAllUsersWorkspace, getAllUsersWorkspaceAndProfil, removeUserFromWorkspace } from '../services/ApiServices';
import '../style/modules/Assignment.css'
import { HiOutlineMagnifyingGlass, HiOutlineTrash, HiOutlineUserGroup, HiXMark } from "react-icons/hi2";
import { RiAccountPinCircleLine } from "react-icons/ri";
import BootstrapTooltip from '../components/Tooltip';
import { useSnackbar } from '../context/Snackbar';
import { PiUserCirclePlusFill } from "react-icons/pi";

const Assigment=({
    workspaceId,
    fetchWorkspaceUser
})=> {
    const [users, setUsers] = useState([]);
    //search
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [showDropdown, setShowDropdown]= useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const {showSnackbar} = useSnackbar();
    
    // //FUNCTION
    // // 1. get all users from workspace id 
    const fetchUsers = async()=>{
        try{
            const response = await getAllUsersWorkspaceAndProfil(workspaceId);
            setUsers(response.data);
        }catch(error){
            console.error('Error fetching users:', error);
        }
    }
    useEffect(()=>{ 
        if(workspaceId){
            fetchUsers();
        }
    },[workspaceId]);

    // //2. fetch all users in login program(database)
    useEffect(()=>{
        const fetchAllUser = async()=>{
            try{
                const response = await getAllUsers();
                setAllUsers(response.data);
            }catch(error){
                console.error('Error fetch all data users:', error);
            }
        }
        fetchAllUser();
    },[])

    // //3. function search user
    useEffect(()=>{
        if (searchTerm) {
            const filtered = allUsers.filter((allUser) =>
              allUser.username.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredUsers(filtered);
            setShowDropdown(true);
          } else {
            setShowDropdown(false);
          }
    }, [searchTerm, allUsers]);

    // //4. select user
    const handleSelectUser = async (allUser) =>{
        try{
            await addUserToWorkspace(workspaceId, allUser.id, {role:"member"});
            showSnackbar(`${allUser.username} berhasil ditambahkan ke workspace`,'success')
            setSearchTerm("");
            setShowDropdown(false);
            fetchUsers();
            fetchWorkspaceUser();
        }catch(error){
            console.error("Error adding user to workspace:", error);
            showSnackbar('Failed adding user to workspace','error')
        }
    }


    // //5. remove user from workspace
    const handleRemoveUser = async (userId) =>{
        try{
            await removeUserFromWorkspace(workspaceId, userId);
            setUsers(users.filter(user => user.id !== userId));
            showSnackbar('Success removing user from workspace','success')
            fetchWorkspaceUser();
            fetchUsers();
        }catch(error){
            showSnackbar('Failed to removing user from workspace','error')
            console.error('Error removing user from workspace:', error);
        }
    }

  return (
    <div className="assign-container">
        <div className="assign-header">
            <div className="add-user-cont">
                <PiUserCirclePlusFill/>
            </div>
            <div className="assign-title">
                <h5>Invite to Workspace</h5>
                <p>Collaborate with members on this workspace</p>
            </div>
        </div>


        <div className="assign-search">
            <div className="search-icon">
                <HiOutlineMagnifyingGlass/>
            </div>
            
            <input
                type="text"
                placeholder="Search by username or email…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {showDropdown && (
            <div className="assign-dropdown">
                {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                    <div
                        key={user.id}
                        className="dropdown-item"
                        onClick={() => handleSelectUser(user)}
                    >
                        <div className="item-img">
                            <img src={user.photo_url} alt={user.username} />
                        </div>
                        
                        <div className='dropdown-info'>
                            <span className="name">{user.username}</span>
                            <span className="email">{user.email}</span>
                        </div>
                    </div>
                ))
                ) : (
                <div className="dropdown-empty">No user found</div>
                )}
            </div>
            )}
        </div>

        <div className="assign-members">
            <h5>Workspace Members</h5>
            <div className="member-card-con">
                {users.map((user) => (
                    <div className="member-card" key={user.id}>
                        <div className="member-img">
                            <img src={user.photo_url} alt={user.username} />
                        </div>
                        

                        <div className="member-info">
                            <span className="member-name">{user.username}</span>
                            <span className="member-email">{user.email}</span>
                        </div>

                        <button
                            className="remove-btn"
                            onClick={() => handleRemoveUser(user.id)}
                        >
                            <HiOutlineTrash />
                        </button>
                    </div>
                ))}
            </div>
            
        </div>
        </div>

  )
}

export default Assigment