import React, { useEffect, useState } from 'react'
import { addUserToWorkspace, getAllUsers, getAllUsersWorkspace, getAllUsersWorkspaceAndProfil, removeUserFromWorkspace } from '../services/ApiServices';
import '../style/modules/Assignment.css'
import { HiOutlineMagnifyingGlass, HiOutlineTrash, HiOutlineUserGroup } from "react-icons/hi2";
import { RiAccountPinCircleLine } from "react-icons/ri";
import BootstrapTooltip from '../components/Tooltip';
import { useSnackbar } from '../context/Snackbar';

const Assigment=({
    workspaceId,
    fetchWorkspaceUser,
    // searchTerm,
    // setSearchTerm,
    // users,
    // filteredUsers,
    // handleSelectUser,
    // handleRemoveUser
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
            <div className="title">
                <HiOutlineUserGroup />
                <h4>Workspace Members</h4>
            </div>
            <p>Manage who has access to this workspace</p>
        </div>


        <div className="assign-search">
            <HiOutlineMagnifyingGlass className="search-icon" />
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
                        <img src={user.photo_url} alt={user.username} />
                        <div>
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

            {users.map((user) => (
            <div className="member-card" key={user.id}>
                <img src={user.photo_url} alt={user.username} />

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

  )
}

export default Assigment


// import React, { useEffect, useState } from 'react'
// import { addUserToWorkspace, getAllUsers, getAllUsersWorkspace, getAllUsersWorkspaceAndProfil, removeUserFromWorkspace } from '../services/ApiServices';
// import '../style/modules/Assignment.css'
// import { HiOutlineMagnifyingGlass, HiOutlineTrash } from "react-icons/hi2";
// import { RiAccountPinCircleLine } from "react-icons/ri";
// import BootstrapTooltip from '../components/Tooltip';
// import { useSnackbar } from '../context/Snackbar';

// const Assigment=({workspaceId})=> {
//     const [users, setUsers] = useState([]);
//     //search
//     const [searchTerm, setSearchTerm] = useState("");
//     const [filteredUsers, setFilteredUsers] = useState([]);
//     const [showDropdown, setShowDropdown]= useState(false);
//     const [allUsers, setAllUsers] = useState([]);
//     const {showSnackbar} = useSnackbar();
    
//     //FUNCTION
//     // 1. get all users from workspace id 
//     const fetchUsers = async()=>{
//         try{
//             const response = await getAllUsersWorkspaceAndProfil(workspaceId);
//             setUsers(response.data);
//         }catch(error){
//             console.error('Error fetching users:', error);
//         }
//     }
//     useEffect(()=>{ 
//         if(workspaceId){
//             fetchUsers();
//         }
//     },[workspaceId]);

//     //2. fetch all users in login program(database)
//     useEffect(()=>{
//         const fetchAllUser = async()=>{
//             try{
//                 const response = await getAllUsers();
//                 setAllUsers(response.data);
//             }catch(error){
//                 console.error('Error fetch all data users:', error);
//             }
//         }
//         fetchAllUser();
//     },[])

//     //3. function search user
//     useEffect(()=>{
//         if (searchTerm) {
//             const filtered = allUsers.filter((allUser) =>
//               allUser.username.toLowerCase().includes(searchTerm.toLowerCase())
//             );
//             setFilteredUsers(filtered);
//             setShowDropdown(true);
//           } else {
//             setShowDropdown(false);
//           }
//     }, [searchTerm, allUsers]);

//     //4. select user
//     const handleSelectUser = async (allUser) =>{
//         try{
//             await addUserToWorkspace(workspaceId, allUser.id, {role:"member"});
//             showSnackbar(`${allUser.username} berhasil ditambahkan ke workspace`,'success')
//             setSearchTerm("");
//             setShowDropdown(false);
//             fetchUsers();
//         }catch(error){
//             console.error("Error adding user to workspace:", error);
//             showSnackbar('Failed adding user to workspace','error')
//         }
//     }


//     //5. remove user from workspace
//     const handleRemoveUser = async (userId) =>{
//         try{
//             await removeUserFromWorkspace(workspaceId, userId);
//             setUsers(users.filter(user => user.id !== userId));
//             showSnackbar('Success removing user from workspace','success')
//         }catch(error){
//             showSnackbar('Failed to removing user from workspace','error')
//             console.error('Error removing user from workspace:', error);
//         }
//     }

//   return (
//     <div className='assig-container'>
//         <div className="add-user">
//             <div className="input-box">
//                 <HiOutlineMagnifyingGlass/>
//                 <input 
//                         type="text" 
//                         placeholder='Search or enter email...'
//                         value={searchTerm}
//                         onChange={(e)=>setSearchTerm(e.target.value)}
//                     />
//             </div>
//             {showDropdown && (
//                 <div className="dropdown">
//                 {filteredUsers.length > 0 ? (
//                     filteredUsers.map((user) => (
//                     <div className='dropdown-box' key={user.id} onClick={()=> handleSelectUser(user)}>
//                         <img src={user.photo_url} alt={user.username} />
//                         {user.username}
//                     </div>
//                     ))
//                 ) : (
//                     <li>Tidak ada user ditemukan</li>
//                 )}
//                 </div>
//             )}   
                    
//         </div>
//         <h5>Workspace Members</h5>
//         {users.map(user =>(
//             <div className='wuser' key={user.id}>
//                 <div className="wuser-pof">
//                     <img src={user.photo_url} alt={user.username} />
//                 </div>
//                 <div className="wuser-user">
//                     <BootstrapTooltip title={user.email} placement="top">
//                         {user.username}
//                     </BootstrapTooltip>
//                 </div>
//                 <div className="wuser-action">
//                     <BootstrapTooltip title='View User' placement='top'>
//                         <button className='prof-acc'>
//                             <RiAccountPinCircleLine/>
//                         </button>
//                     </BootstrapTooltip>
                    
//                     <BootstrapTooltip title='Remove User' placement='top'>
//                         <button className='remove-btn' onClick={()=> handleRemoveUser(user.id)}>
//                             <HiOutlineTrash/>
//                         </button>
//                     </BootstrapTooltip>
//                 </div>
//             </div>
//         ))}
//     </div>
//   )
// }

// export default Assigment