import React, { useState,useEffect } from 'react'
import {
  HiOutlineHome,
  HiMiniSlash,
  HiOutlineSquaresPlus,
  HiOutlineEllipsisHorizontal,
  HiOutlineClock,
  HiOutlineArchiveBox,
  HiOutlinePencilSquare,
  HiOutlineSquare2Stack,
  HiOutlineTrash,
  HiOutlineChevronRight,
  HiOutlinePlus,
  HiMiniUserGroup,
  HiMiniCalendar,
  HiOutlineUserGroup,
  HiSquaresPlus,
} 
from "react-icons/hi2";
import { TbListCheck } from "react-icons/tb";
import { FiLayers } from "react-icons/fi";
import '../style/pages/Workspace.css'
import { useNavigate, useParams } from 'react-router-dom';
import OutsideClick from '../hook/OutsideClick';
import { createWorkspace, getWorkspacesByUserId, getWorkspaceUsers,getAdminFromWorkspace,updateWorkspaceName, updateWorkspaceDescription,getAllUsersWorkspace, deleteWorkspaceUser, archiveWorkspaceUser, getTotalUserWorkspace, getAllUsersWorkspaceAndProfil, getAllUsers, addUserToWorkspace, removeUserFromWorkspace, getWorkspaceSummary, getWorkspaceSummaryByWorkspaceId } from '../services/ApiServices';
import CustomAlert from '../hook/CustomAlert';
import Assigment from '../modules/Assigment';
import FormNewWorkspace from '../modules/FormNewWorkspace';
import BootstrapTooltip from '../components/Tooltip';
import { useSnackbar } from '../context/Snackbar';
import WorkspaceDeleteConfirm from '../modals/WorkspaceDeleteConfirm';
import UsersTotal from '../modules/UsersTotal';
import { useUser } from '../context/UserContext';
import { IoHome, IoLayers, IoTimeSharp } from 'react-icons/io5';
import { HiViewBoards } from 'react-icons/hi';
import { PiCardsFill } from 'react-icons/pi';
import { handleArchive } from '../utils/handleArchive';
import { generateSlug } from '../utils/Slug';

function NewWorkspace() {
  const {user} = useUser();
  const userId = user?.id;

  //state
  const navigate = useNavigate();
  const [showUser, setShowUser] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [showSetting, setShowSetting] = useState(false);
  const showRef = OutsideClick(()=> setShowForm(false));
  const settingRef = OutsideClick(()=> setShowSetting(false));
  const userRef = OutsideClick(()=> setShowUser(false))
  //create workspace
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [users, setUsers] = useState([]);
  const [userWorkspace, setUserWorkspace] = useState([]);
  //total user
  const [userCount, setUserCount] = useState(null);
  const [workspaceSummaries, setWorkspaceSummaries] = useState({});
  //show detail workpace
  const [detailWrokspace, setDetailWorkspace] = useState(false);
  const detailRef = OutsideClick(()=>setDetailWorkspace(false))



  //load workspace
  const [workspaces, setWorkspaces] = useState([]);
  const [workspaceId, setWorkspaceId] = useState(null)
  const [admin, setAdmin] = useState({});
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  //state edit workspace
  const [editingName, setEditingName] = useState(null);
  const [editingDescription, setEditingDescription] = useState(null);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  //delete confirm
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null)
  const [selectedWorkspaceName, setSelectedWorkspaceName] = useState(null);
  //alert
  const {showSnackbar} = useSnackbar();

  //state assign
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showDropdown, setShowDropdown]= useState(false);
  const [allUsers, setAllUsers] = useState([]);

  //DEBUG
  console.log('File New Workspace menerima userId dari userContex:', userId)
  console.log('file new workspace menerima data workspace:', workspaces);
  console.log('workspace id:', workspaceId)

  //onclose form
  const onCloseForm =()=>{
    setShowForm(false);
  }

  //alert
  const [alertInfo, setAlertInfo] = useState({
    severity: '',
    title: '',
    message: '',
    showAlert: false,
  });

  //function
  //1. fungsi navigate home
  const navigateToHome = () =>{
    navigate('/layout');
  }
  //2. show form create workspace
  const handleShowForm = (e) =>{
    e.stopPropagation();
    setShowForm((prev)=> !prev);
  }
  const handleShowSetting = (e, workspaceId)=>{
    e.stopPropagation();
    setActiveWorkspace(workspaceId); 
    // setShowSetting((prev)=> !prev);
    setShowSetting((prev) => ({
      ...prev,  // Menyalin status sebelumnya
      [workspaceId]: !prev[workspaceId],  // Toggle hanya untuk workspace yang dipilih
    }));
  }

  const handleShowUser = (e, workspaceId) =>{
    e.stopPropagation();
    setActiveWorkspace(workspaceId); 
    setShowUser((prev)=> ({
      ...prev,
      [workspaceId]: !prev[workspaceId],
    }))
  }

  //3. fungsi create workspace
  const handleSubmit = async(e) =>{
      e.preventDefault();
      try{
        const response = await createWorkspace({name, description});
        setName('');
        setDescription('');
        setAlertInfo({
          severity: 'success',
          title: 'Success',
          message: 'successfully create a new workspace!',
          showAlert: true,
        });
        // Re-fetch workspaces setelah berhasil create
        const workspaceResult = await getWorkspacesByUserId(userId);
        console.log("Response workspaceResult.data:", workspaceResult.data);
        setWorkspaces(workspaceResult.data);
        console.log('cworkspace successfully:', response.data); 
      }catch(error){
        setAlertInfo({
          severity: 'error',
          title: 'error',
          message: 'Error to create a new workspace!',
          showAlert: true,
        });
        console.error('Error create workspace:', error);
      }
    }
    //4.close alert
    const handleCloseAlert = () => {
      setAlertInfo({ ...alertInfo, showAlert: false });
    };
    //5. load all workspace user
    const fetchWorkspaceUser = async () => {
    try {
      const workspaceResult = await getWorkspacesByUserId(userId); // ✅ ganti fungsi di sini
      setWorkspaces(workspaceResult.data);
      fetchAdmins(workspaceResult.data);  // opsional, kalau perlu
    } catch (error) {
      console.error("Error fetching workspace data:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchWorkspaceUser();
    }
  }, [userId]);
  //6. load user 
  useEffect(()=> {
    const fetchUsers = async()=>{
      try{
        const response = await getWorkspaceUsers(userId);
        // const response = await getWorkspaceUsers(works);
        setUsers(response.data);
      }catch(error){
        console.error('Failed to fetch user data');
      }
    };
    if(userId){
      fetchUsers();
    }
  },[userId])
  //7. format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);  // Membuat objek Date dari string tanggal
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };  // Menentukan format yang diinginkan: "Day Month Year"
    
    return date.toLocaleDateString('id-ID', options); // Format tanggal Indonesia
  };
  
  //8. navigate to workspace id
  const handleWorkspaceClick = (workspaceId, userId) =>{
    navigate(`/layout/workspaces/${workspaceId}`,{ state: { userId } })
  }


  //9.fetch data admin
  const fetchAdmins = async (workspaces) => {
    const adminData = {};
    await Promise.all(
      workspaces.map(async (workspace) => {
        try {
          const response = await getAdminFromWorkspace(workspace.id);
          const admin = response.data.admins[0]; // ambil admin pertama
          adminData[workspace.id] = admin || null;
        } catch (error) {
          console.error(`Error fetching admin for workspace ${workspace.id}:`, error);
          adminData[workspace.id] = null;
        }
      })
    );
    setAdmin(adminData);
  };
  
  //10. generate profil initials
  const generateProfileInitials = (username) => {
    if (!username || typeof username !== 'string') return ''; // Memastikan username adalah string
  
    const words = username.split(/[_\s]+/); // Pisahkan dengan underscore atau spasi
    const initials = words.map(word => word.charAt(0).toUpperCase()).join('');
  
    return initials.slice(0, 2); // Ambil maksimal 2 huruf
  };
  //11. generate backgorund
  const generateBackgroundColor = (username) => {
    if (!username) return '#cccccc'; // Warna default jika username tidak ada
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${hash % 360}, 70%, 60%)`; // Warna unik berdasarkan username
  };

  //12. fungsi delete workspace
  const handleDeleteClick = (e, workspaceId, workspaceName, userId) => {
    e.stopPropagation();
    setSelectedWorkspaceId(workspaceId);
    setSelectedWorkspaceName(workspaceName);
    setSelectedUserId(userId);
    setShowDeleteModal(true);
  };
  
  const confirmDelete = async () => {
    try {
      console.log('Deleting workspace with id:', selectedWorkspaceId, 'and user:', selectedUserId);
      const response = await deleteWorkspaceUser(selectedWorkspaceId, selectedUserId);
      showSnackbar('Workspace deleted successfully', 'success');
      console.log('Workspace deleted successfully', response.data);
      fetchWorkspaceUser()
    } catch (error) {
      showSnackbar('Failed to delete workspace', 'error');
      console.error('Error deleting workspace:', error);
    } finally {
      setShowDeleteModal(false);
      setSelectedWorkspaceId(null);
      setSelectedUserId(null);
      setSelectedWorkspaceName('');
    }
  };
  
  const handleCancleDelete = (e) => {
    e.stopPropagation();
    setShowDeleteModal(false);
    setSelectedWorkspaceId(null);
    setSelectedUserId(null);
    setSelectedWorkspaceName('');
  };
  

  //13. fungsi archive workspace user
  const archiveWorkspaceUserData = (workspaceId)=>{
    handleArchive({
      entity:'workspaces',
      id: workspaceId,
      userId: userId,
      refetch: fetchWorkspaceUser,
      showSnackbar:showSnackbar,
    })
  }


  const handleEditName = (e, workspaceId, currentName) =>{
    e.stopPropagation()
    setEditingName(workspaceId);
    setNewName(currentName);
  }

  const handleEditDescription = (e, workspaceId, currentDescription) => {
    e.stopPropagation();
    setEditingDescription(workspaceId);
    setNewDescription(currentDescription); // Mengatur nilai awal input deskripsi
  };

  const handleSaveName = async(workspaceId) =>{
    try{
      await updateWorkspaceName(workspaceId, {name:newName})
      setEditingName(null);
      fetchWorkspaceUser();
    }catch(error){
      console.error('Error updating workspace name:', error)
    }
  }
  const handleSaveDescription = async(workspaceId)=>{
    try{
      await updateWorkspaceDescription(workspaceId, {description:newDescription})
      setEditingDescription(null)
      fetchWorkspaceUser();
    }catch(error){
      console.error('Error updating workspace description:', error)
    }
  }

    // Fungsi untuk menangani saat tombol Enter ditekan
    const handleKeyPressName = (e, workspaceId) => {
      if (e.key === 'Enter') {
        handleSaveName(workspaceId); // Simpan nama jika Enter ditekan
        e.stopPropagation();
      }
    };
  
    const handleKeyPressDescription = (e, workspaceId) => {
      if (e.key === 'Enter') {
        handleSaveDescription(workspaceId); // Simpan deskripsi jika Enter ditekan
        e.stopPropagation();
      }
    };

    //fetch all user from workspace id
    const fetchUsers = async()=>{
      try{
        const response = await getAllUsersWorkspaceAndProfil(workspaceId);
        setUsers(response.data);
      }catch(error){
        console.error('Error fetching users:', error)
      }
    }
    useEffect(()=>{
      if(workspaceId){
        fetchUsers();
      }
    },[]);

    //fetch all user in login program
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


    // function search user
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

   //select user
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
  
  
      //remove user from workspace
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

      //fetch summary 
    const fetchSummaries = async (workspaces) => {
      const summaryData = {};

      await Promise.all(
        workspaces.map(async (workspace) => {
          try {
            const res = await getWorkspaceSummaryByWorkspaceId(userId, workspace.id);
            summaryData[workspace.id] = res.data;
          } catch (err) {
            console.error(`Error fetching summary for workspace ${workspace.id}:`, err);
            summaryData[workspace.id] = null;
          }
        })
      );

      setWorkspaceSummaries(summaryData);
    };



    useEffect(() => {
      if (userId && workspaces.length > 0) {
        fetchSummaries(workspaces);
        fetchAdmins(workspaces); // bisa jalan barengan
      }
    }, [userId, workspaces]);

  // SHOW DETAIL WORKSPACE 
  const handleShowWorkspace = (workspaceId) => {
    setDetailWorkspace((prev) => ({
      ...prev,
      [workspaceId]: !prev[workspaceId]  // toggle show/hide
    }));
  };

  const handleCloseDetail = () =>{
    setDetailWorkspace(false)
  }


 if (!userId) {
    return <p>Loading workspace user</p>; // atau navigate("/login")
  }



  return (
    <div className='workspace-container'>
      <div className="workspace-header">
        <div className="wnav">
          <div className="wnav-btn-con">
            <div className="wnav-btn">
              <IoHome className='nav-icon' onClick={navigateToHome}/>
            </div>
            <HiOutlineChevronRight size={15}/>
            <div className="wnav-active">
              Workspace Page
            </div>
          </div>
        </div>
        <div className="wform">
          <button onClick={handleShowForm}>
            <HiOutlinePlus className='wform-icon'/>
           CREATE WORKSPACE
          </button>
        </div>
        {/* CREATE WORKSPACE FORM  */}
          <CustomAlert
            severity={alertInfo.severity}
            title={alertInfo.title}
            message={alertInfo.message}
            showAlert={alertInfo.showAlert}
            onClose={handleCloseAlert}
          />

          {showForm && (
            
              <FormNewWorkspace userId={userId} fetchWorkspaceUser={fetchWorkspaceUser} onCloseForm={onCloseForm}/>

          )}
        {/* END CREATE WORKSPACE FORM  */}
      </div>

      <div className="workspace-welcome">
        <h3>Welcome to {user.username}'s Workspace</h3>
        <p>
          Mulailah mengelola proyek, tim, dan ide hebatmu di sini. Buat board baru, undang anggota, dan capai target bersama.
        </p>
      </div>

      <div className="workspace-body">
          <div className="workspace-content">
            {workspaces.map(workspace=>(
              
              <div key={workspace.id} className="workspace-card" onClick={()=> setWorkspaceId(workspace.id)}>
                <div className="wc-header">
                  <div className="wc-name">
                    <div className="name-icon">
                      <HiSquaresPlus className='ni-mini'/>
                    </div>
                    {/* Editing nama  */}
                    {editingName === workspace.id ?(
                      <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onBlur={() => handleSaveName( workspace.id)} 
                      onKeyDown={(e) => handleKeyPressName(e, workspace.id)}
                      autoFocus
                    />
                    ):(
                      <h5 onClick={(e) => handleEditName(e,workspace.id, workspace.name)}>{workspace.name}</h5>
                    )}
                  </div>
                  <BootstrapTooltip title='Workspace Setting' placement='top'>
                    <HiOutlineEllipsisHorizontal className='setting-icon' onClick={(e) => handleShowSetting(e, workspace.id)} />
                  </BootstrapTooltip>
                </div>
                {/* SHOW SETTING  */}
                {showSetting[workspace.id] && activeWorkspace === workspace.id && (
                  <div className="setting-wc" ref={settingRef}>
                    <button onClick={()=> archiveWorkspaceUserData(workspace.id)}>
                      <HiOutlineArchiveBox className='swc-icon'/>
                      Archive
                    </button>
                    <div className="delete">
                      <button onClick={(e) => handleDeleteClick(e, workspace.id, workspace.name, userId)} className="flex items-center gap-1 text-red-500 hover:text-red-700">
                        <HiOutlineTrash className='swc-delete'/>
                        Delete
                      </button>
                    </div>
                  </div>
                )}
                {/* DELETE CONFIRM MODAL  */}
                <WorkspaceDeleteConfirm
                  isOpen={showDeleteModal}
                  workspaceId={selectedWorkspaceId}
                  onConfirm={confirmDelete}
                  onCancel = {handleCancleDelete}
                  workspaceName={selectedWorkspaceName}
                />

                {/* END SHOW SETTING  */}
                
                {/* BODY CARD WORKSPACE  */}
                <div className="workspace-card-body">
                  <div className="workspace-card-desc">
                     {editingDescription === workspace.id ?(
                      <textarea
                        value={newDescription}
                        onChange={(e)=> setNewDescription(e.target.value)}
                        onBlur={() => handleSaveDescription(workspace.id)}
                        onKeyDown={(e)=> handleKeyPressDescription(e, workspace.id)}
                        autoFocus
                      />
                    ):(
                      <p onClick={(e)=> handleEditDescription(e, workspace.id, workspace.description)}>{workspace.description}</p>
                    )}
                  </div>

                  <div className="workspace-info">
                    <div className="user-admin" onClick={(e)=> handleShowUser(e, workspace.id)}>
                      {admin[workspace.id] ? (
                          <div className='prof-user'>
                            {/* <IoTimeSharp className='create-icon'/> */}
                            <img 
                              src={admin[workspace.id].photo_url || 'default-avatar.png'} 
                              alt={admin[workspace.id].username}
                            />
                            <p>{admin[workspace.id].username}  & <UsersTotal workspaceId={workspace.id}/> </p>
                            <p></p>
                          </div>
                        ) : (
                          <span></span>
                        )}
                    </div>
                    <div className="info-date">
                       {/* <HiMiniCalendar className='create-icon'/> */}
                        {formatDate(workspace.create_at)}
                    </div>

                    {/* SHOW USER  */}
                    {showUser[workspace.id] && (
                      <div className="user-container" ref={userRef} onClick={(e)=>e.stopPropagation()}>
                        <Assigment 
                          workspaceId={workspace.id} 
                          fetchWorkspaceUser={fetchWorkspaceUser}
                          searchTerm={searchTerm}
                          setSearchTerm={setSearchTerm}
                          users={users}
                          filteredUsers={filteredUsers}
                          handleSelectUser={handleSelectUser}
                          handleRemoveUser={handleRemoveUser}
                        />
                      </div>
                    )}
                  </div>
                  
                </div>


                <div className="summary-counts">
                  {workspaceSummaries[workspace.id] ? (
                    <BootstrapTooltip title='Detail Workspace' placement='top'>
                      <div className="detail-icon" onClick={()=> handleShowWorkspace(workspace.id)}>
                        <div className="mini-icon">
                          <IoLayers className='mi'/>
                        </div>
                         <p>Workspace Detail</p>
                      </div>
                    </BootstrapTooltip>
                    
                  ) : (
                    <p>Loading summary...</p>
                  )}
                  <div className='btn-nav-board' onClick={() => handleWorkspaceClick(workspace.id, userId)}>
                    View Board
                  </div>

                  {detailWrokspace[workspace.id] &&(
                      <ul className='detail-ul' ref={detailRef}>
                        <li> <HiViewBoards className='detail-icon'/> {workspaceSummaries[workspace.id].board_count} boards</li>
                        <li> <TbListCheck className='detail-icon'/> {workspaceSummaries[workspace.id].list_count} lists</li>
                        <li> <PiCardsFill className='detail-icon'/> {workspaceSummaries[workspace.id].card_count} cards</li>
                        {/* <li> <UsersTotal workspaceId={workspace.id}/> </li> */}
                      </ul>
                    )}
                </div>

              </div>
            ))}
            {/* CARD FORM CREATE  */}
            <div className="form-workspace-card" onClick={handleShowForm}>
              <div className="fwc-icon">
                  <HiOutlinePlus/>
              </div>
              <h4> CREATE A WORKSPACE</h4>
              <p>
                Start a new project and collaborate with your team
              </p>
            </div>
          </div>
      </div>
      
    </div>
  )
}

export default NewWorkspace