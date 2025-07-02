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
} 
from "react-icons/hi2";
import '../style/pages/Workspace.css'
import { useNavigate, useParams } from 'react-router-dom';
import OutsideClick from '../hook/OutsideClick';
import { createWorkspace, getWorkspacesByUserId, getWorkspaceUsers,getAdminFromWorkspace,updateWorkspaceName, updateWorkspaceDescription,getAllUsersWorkspace, deleteWorkspaceUser, archiveWorkspaceUser, getTotalUserWorkspace, getAllUsersWorkspaceAndProfil, getAllUsers, addUserToWorkspace, removeUserFromWorkspace } from '../services/ApiServices';
import CustomAlert from '../hook/CustomAlert';
import Assigment from '../modules/Assigment';
import FormNewWorkspace from '../modules/FormNewWorkspace';
import BootstrapTooltip from '../components/Tooltip';
import { useSnackbar } from '../context/Snackbar';
import WorkspaceDeleteConfirm from '../modals/WorkspaceDeleteConfirm';
import UsersTotal from '../modules/UsersTotal';
import { useUser } from '../context/UserContext';
import { IoHome } from 'react-icons/io5';

function NewWorkspace() {
  const {user} = useUser()
  const userId = user.id;

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
    navigate('/');
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
      setWorkspaces(workspaceResult.data);
      console.log('Create workspace successfully:', response.data); 
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
      const workspaceResult = await getWorkspacesByUserId(userId);
      setWorkspaces(workspaceResult.data);
      fetchAdmins(workspaceResult.data);  // Jika ada data admin yang perlu diambil
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
    navigate(`/workspaces/${workspaceId}`,{ state: { userId } })
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
  const archiveWorkspaceUserData = async(workspaceId)=>{
    try{
      const respone = await archiveWorkspaceUser(workspaceId);
      console.log("Succesfully archive workspace data")
      showSnackbar('Succesfully archive workspace', 'success')
      fetchWorkspaceUser()
    }catch(error){
      console.error('Error archive data:', error)
      showSnackbar('Failed to archive workspace', 'error')
    }
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

  return (
    <div className='workspace-container'>
      <div className="workspace-header">
        <div className="wnav">
          <div className="wnav-btn-con">
            <div className="wnav-btn">
              <IoHome className='nav-icon'/>
            </div>
            <HiOutlineChevronRight size={15}/>
            <div className="wnav-active">
              Workspace
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
        <p>Mulailah mengelola proyek, tim, dan ide hebatmu di sini.
Buat board baru, undang anggota, dan capai target bersama.</p>
      </div>

      <div className="workspace-body">
          {/* <div className="greeting">
            <h4>Welcome, name</h4>
          </div> */}
          <div className="workspace-content">
            {workspaces.map(workspace=>(
              <div key={workspace.id} className="workspace-card" onClick={()=> setWorkspaceId(workspace.id)}>
                <div className="wc-header">
                  <div className="wc-name">
                    <HiOutlineSquaresPlus/>
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
                <div className="wc">
                  {/* EDITING DESCRIPTION  */}
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
                  {/* <p>{workspace.description}</p> */}
                  <div className="wc-btm">
                    <div className='wc-user' onClick={(e) => handleShowUser(e, workspace.id)}>
                      <div className="user-group">
                        {admin[workspace.id] ? (
                          <div className='prof-user'>
                            <img 
                              src={admin[workspace.id].photo_url || 'default-avatar.png'} 
                              alt={admin[workspace.id].username}
                            />
                            <span>{admin[workspace.id].username}</span>
                          </div>
                        ) : (
                          <span></span>
                        )}

                        {/* Nama Admin */}
                        <button className='btn-date'>
                          <HiMiniCalendar className='wc-icon'/>
                          {formatDate(workspace.create_at)}
                        </button>
                          {/* MEMBER  */}
                        <div className="btn-ts">
                          <UsersTotal workspaceId={workspace.id}/>
                        </div>
                      </div>
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
                    {/* END SHOW USER  */}
                    <button className='btn-nav-board' onClick={() => handleWorkspaceClick(workspace.id, userId)}>
                      View Board
                    </button>
                  </div>
                </div>
                
              </div>
            ))}
            {/* CARD FORM CREATE  */}
            <div className="form-workspace-card" onClick={handleShowForm}>
                <HiOutlinePlus className='fwc-icon'/>
                <p> CREATE A WORKSPACE</p>
            </div>
          </div>
      </div>
      
    </div>
  )
}

export default NewWorkspace

import React, { useCallback, useEffect, useState } from 'react'
import '../style/pages/BoardList.css'
import { HiMiniListBullet,
        HiMiniSlash,
        HiOutlineChartBar,
        HiOutlineEllipsisHorizontal,
        HiOutlineSquare2Stack,
        HiOutlineArchiveBox,
        HiOutlineTrash,
        HiOutlinePlus,
        HiOutlineCreditCard,
        HiPlus,
        HiMiniArrowLeftStartOnRectangle,
        HiOutlineChevronRight,
        HiOutlineListBullet
         } from 'react-icons/hi2'
import { archiveList, deleteLists, duplicateBoards, getAllLists, getBoardById, getCardByList, getListByBoard, updateLists } from '../services/ApiServices'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Card from './Card'
import OutsideClick from '../hook/OutsideClick'
import CreateCard from '../modules/CreateCard'
import CustomAlert from '../hook/CustomAlert'
import BootstrapTooltip from '../components/Tooltip'
import CardDetail from './CardDetail'
import FormNewLists from '../modules/FormNewLists'
import CardDetailPopup from '../hook/CardDetailPopup'
import MoveList from '../fitur/MoveList'
import DuplicateList from '../fitur/DuplicateList'
import ListDeleteConfirm from '../modals/ListDeleteConfirm'
import { useSnackbar } from '../context/Snackbar'
import { useUser } from '../context/UserContext'

const BoardList=()=> {
    //STATE
    const location = useLocation();
    const {user} = useUser();
    const userId = user.id;
    console.log('File Board List menerima data user:', user)
    console.log('berhasil menerima userId:', userId)
    const {boardId, workspaceId} = useParams();
    console.log('boardId diterima pada file board list:',boardId)
    console.log('workspace id diterima:', workspaceId)
    const [boards, setBoards] = useState({});
    const [lists, setLists] = useState([]);
    const [listId, setListId] = useState([]);
    const [clickedListId, setClickedListId] = useState(null);
    const [cards, setCards] = useState({});
    //state show
    const [showSetting, setShowSetting] = useState({})
    const settingRef = OutsideClick(()=>setShowSetting(false))
    const [showForm, setShowForm] = useState({});
    const formRef = OutsideClick(()=> setShowForm(false))
    //navigate
    const navigate = useNavigate();
    //edit list
    const [editName, setEditName] = useState(null);
    const [newName, setNewName] = useState('')
    //alert
    const {showSnackbar} = useSnackbar();
    //show list form
    const [showListForm, setShowListForm] = useState(false)
    const listFormRef = OutsideClick(()=> setShowListForm(false))

    const handleShowListForm = (e)=>{
        e.preventDefault()
        setShowListForm((prev)=> !prev)
    }


    const handleShow = () =>{
        setShowForm(!showForm)
    }

    // const handleShowListForm = () => {
    //     setShowListForm(!showListForm)
    // }
   
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedCardId, setSelectedCardId] = useState(null);
    //move and duplicate
    const [showMovePopup, setShowMovePopup] = useState({})
    const [showDuplicatePopup, setShowDuplicatePopup] = useState({})
    //Delete confirm
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [selectedListId, setSelectedListId] = useState(null)

    //FUNGSI POPUP MOVE DAN DUPLICATE
    const handleShowMovePopup = (listId) => {
        setShowMovePopup((prevState) => ({
            ...prevState,
            [listId]: !prevState[listId],  // Toggle true/false untuk board tersebut
        }));
        setShowSetting(false)
        // handleShowSetting(false)
    }
    const handleCloseMovePopup = (listId) =>{
        setShowMovePopup((prevState)=>({
          ...prevState,
            [listId]: false,
        }))
      }
    
     //DUPLICATE
     const handleShowDuplicate = (listId)=>{
        setShowDuplicatePopup((prevState) => ({
            ...prevState,
            [listId]: !prevState[listId],  // Toggle true/false untuk board tersebut
        }));
        setShowSetting(false)
     } 

     const handleCloseDuplicate = (listId)=>{
        setShowDuplicatePopup((prevState)=>({
            ...prevState,
              [listId]: false,
          }))
     }

    // Fungsi untuk menampilkan popup
    const handleOpenPopup = (cardId) => {
        setSelectedCardId(cardId);
        setIsPopupOpen(true);
    };

    // Fungsi untuk menutup popup
    const handleClosePopup = () => {
        setIsPopupOpen(false);
        setSelectedCardId(null);
    };

    //FUNCTION
    //1.fetch board 
    const fetchBoardDetail = async () =>{
        if(!boardId) return;
        try{
            const response = await getBoardById(boardId);
            setBoards(response.data)
        }catch(error){
            console.log('Failed fetching board data:');
        }
    };

    useEffect(() => {
    fetchBoardDetail();
  }, [boardId]);

    //2. fetch lists
    const fetchLists = useCallback(async()=>{
        try{
            const response = await getListByBoard(boardId)
            setLists(response.data)
            const ids = response.data.map(list => list.id)
            setListId(ids)
        }catch(error){
            console.error('Failed fetching lists:', error)
        }
    },[boardId])

    useEffect(()=>{
        if(boardId){
            fetchLists()
        }
    }, [boardId, fetchLists]);

    
    //3. fetch card by list
    const fetchCardList = useCallback(async(listId)=>{
        console.log('Fetching cards for list:', listId); 
        try{
            const response = await getCardByList(listId);
            setCards(prevCards => ({
                ...prevCards,
                [listId]: response.data // Simpan kartu berdasarkan listId
            }));
        }catch(error){
            console.error('failed fatch cards:', error)
        }
    },[])

    // Fetch cards for all lists when lists are loaded
    useEffect(() => {
        lists.forEach(list => fetchCardList(list.id));
    }, [lists, fetchCardList]);

    // const fetchAllCardList = useCallback(()=>{
    //     lists.forEach(list => fetchCardList(list.id));
    // },[lists, fetchCardList]);

    //FETCH ALL
    const handleRefetchBoard = () => {
        fetchBoardDetail();
        fetchLists();
        fetchCardList(listId)
      };


    //4. create new list 
    const handleListCreated = (newList) => {
        setLists([...lists, newList]); // Menambahkan list baru ke state
    };

    
    //show lists setting
    const handleShowSetting = (e, listId) =>{
        e.stopPropagation()
        setShowSetting((prev) => ({
            ...prev,
            [listId]: !prev[listId],
        }))
    }
    
    //show form card
    const handleShowForm = (e, listId)=>{
        console.log('fungsi handle show berhasil di klik:')
        e.stopPropagation();
        setShowForm((prev) => ({
            ...prev,
            [listId]: !prev[listId],
        }))
    }
    const handleCloseForm = ()=>{
        setShowForm(false)
    }

    //Edit name lists
    const handleEditName = (e, listId, currentName) =>{
        e.stopPropagation()
        setEditName(listId)
        setNewName(currentName)
    }

    const handleSaveName = async(listId) =>{
        try{
            await updateLists(listId, {name:newName})
            setEditName(null);
            fetchLists();
        }catch(error){
            console.error('Error updating name board:,', error);
        }
    }

    const handleKeyPressName = (e, listId) =>{
        if(e.key === 'Enter'){
            handleSaveName(listId)
            e.stopPropagation();
        }
    }

    const handleCardCreated = (newCard) => {
        setCards((prevCards) => ({
          ...prevCards,
          [newCard.list_id]: [...(prevCards[newCard.list_id] || []), newCard],
        }));
        fetchCardList(listId)
        setShowForm(false)
      };

        
    //fungsi duplicate list 

    const duplicateBoardToWorkspace = async (boardId, workspaceId) => {
    try {
        const response = await duplicateBoards(boardId,workspaceId)
        console.log('Board duplicated:', response.data);
        alert('Board berhasil diduplikasi!');
        return response.data;
    } catch (error) {
        console.error('Error duplicating board:', error);
        alert('Gagal menduplikasi board!');
        throw error;
    }
};
//fungsi delete
  const handleDeleteClick = (listId) => {
    setSelectedListId(listId);
    setShowConfirmModal(true);
    setShowSetting(false)
  };

  const confirmDelete = async () => {
    try {
      console.log('Deleting list with ID:', selectedListId);
      const response = await deleteLists(selectedListId);
      showSnackbar('List deleted successfully','success')
      console.log('List deleted successfully:', response.data);
      fetchLists();
    } catch (error) {
        showSnackbar('Failed to delete list','error')
        console.error('Failed to delete list:', error);
    } finally {
      setShowConfirmModal(false);
      setSelectedListId(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setSelectedListId(null);
  };


//archive lists
const handleArchiveLists = async(listId)=>{
    console.log('Archiving list with id:',listId)
    try{
        const response = await archiveList(listId)
        console.log('lists archived successfully:', response.data)
        showSnackbar('List berhasil diarsipkan','success')
        fetchLists()
    }catch(error){
        console.error('Error archiving lists:', error)
        showSnackbar('Gagal mengarsipkan list','error')
    }
}

//NAVIGATION
// <Route path='/workspaces/:workspaceId' element={<WorkspacePage/>}/>
const handleNavigateToWorkspace = (workspaceId) => {
    navigate(`/workspaces/${workspaceId}`);
    console.log("Navigating to board:", boardId);
}
const handleNavigateToBoard = (workspaceId,boardId) =>{
    navigate(`/workspaces/${workspaceId}/board/${boardId}`);
}

  return (
    <div className='bl-container'>
        <div className="bl-header">
            <div className="blnav">
                <button onClick={()=>handleNavigateToWorkspace(workspaceId)}>
                    <HiOutlineChartBar className='blnav-icon'/>
                    {boards.name}
                </button>
                <HiOutlineChevronRight className='blnav-arrow'/>
                <button className='bln-active'>
                    <HiOutlineListBullet className='bln-icon'/>
                    Board List
                </button>
            </div>
            <div className="more-action">
                <button
                    className='btn-create-list'
                    onClick={handleShowListForm}
                >CREATE NEW LIST</button>
                {/* <button onClick={handleRefetchBoard}>REFRESH</button> */}
            </div>
            {showListForm && (
               <div className='fl-container' ref={listFormRef}>
                    <FormNewLists boardId={boardId} onListCreated={handleListCreated}/>
               </div>
            )}

        </div>
        <div className="bl-body">
            <div className="bl-content">
                {lists.map((list) =>(
                    <div key={list.id} className='bl-card'>
                        <div className="bl-box">
                            <div className="list-title">
                                <div className="l-name">
                                    <HiMiniListBullet className='licon'/>
                                    {editName === list.id ? (
                                        <input
                                            type='text'
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            onBlur={()=> handleSaveName(list.id)}
                                            onKeyDown={(e)=> handleKeyPressName(e, list.id)}
                                            autoFocus
                                        />
                                    ):(
                                        <h5 onClick={(e)=> handleEditName(e, list.id, list.name)}>{list.name}</h5>
                                    )}
                                    {/* <h5>{list.name}</h5> */}
                                </div>
                                <BootstrapTooltip title='List setting' placement='top'>
                                    <button onClick={(e)=> handleShowSetting(e, list.id)}>
                                        <HiOutlineEllipsisHorizontal size={20}/>
                                    </button>
                                </BootstrapTooltip>
                                
                                {showSetting[list.id] && (
                                    <div className='list-setting' ref={settingRef}>
                                        <button onClick={()=> handleShowMovePopup(list.id)}>
                                          <HiMiniArrowLeftStartOnRectangle className='cs-icon'/>
                                          Move
                                        </button>
                                        <button onClick={()=> handleShowDuplicate(list.id)}>
                                          <HiOutlineSquare2Stack className='cs-icon'/>
                                          Duplicate
                                        </button>
                                        <button onClick={()=> handleArchiveLists(list.id)}>
                                          <HiOutlineArchiveBox className='cs-icon'/>
                                          Archive
                                        </button>
                                        <div className="delete">
                                          <button onClick={()=> handleDeleteClick(list.id)} className="flex items-center gap-1 text-red-500 hover:text-red-700">
                                            <HiOutlineTrash className='cs-delete'/>
                                            Delete
                                          </button>
                                        </div>
                                    </div>
                                )}
                                <ListDeleteConfirm
                                    isOpen={showConfirmModal}
                                    listId={list.id}
                                    onConfirm={confirmDelete}
                                    onCancel={cancelDelete}
                                    listName={list.name}
                                />
                                {showMovePopup[list.id] && (
                                    <div className="move-modal">
                                        <MoveList userId={userId} currentBoardId={boardId} listId={list.id} workspaceId={workspaceId} onClose={()=> handleCloseMovePopup(list.id)}/>
                                    </div>
                                )}
                                {showDuplicatePopup[list.id] && (
                                    <div className="move-modal">
                                        <DuplicateList userId={userId} boardId={boardId} listId={list.id} workspaceId={workspaceId} onClose={()=> handleCloseDuplicate(list.id)} fetchLists={fetchLists}/>
                                    </div>
                                )}
                                </div>
                                <div className="list-body">
                                {cards[list.id]?.map((card) => (
                                    <>
                                    <Card 
                                        key={card.id} 
                                        userId={userId}
                                        card={card} 
                                        cardId={card.id}
                                        listId={list.id}
                                        handleNavigate = {()=>handleNavigateToBoard(workspaceId, boardId)} 
                                        onClick={() => handleOpenPopup(card.id)}
                                        onRefetch={handleRefetchBoard}
                                        fetchBoardDetail={fetchBoardDetail}
                                        fetchLists={fetchLists}
                                        fetchCardList={fetchCardList}
                                        boards={boards}
                                        lists={lists}
                                        listName={list.name}
                                        // onCardMoved={() => {
                                        //     fetchLists(); // kalau ingin update list juga
                                        //     fetchCardList(); // atau fetch semua cards
                                        //   }}
                                    />
                                    {/* <CardDetailPopup isOpen={showDetail} onClose={handleShowDetail} cardId={card.id} /> */}
                                    </>
                                ))}
                            </div> 

                            <div className="form-card-wrapper">
                                <div className="form-card">
                                    <button  className='fc-cont' onClick={(e)=> handleShowForm(e, list.id)}>
                                        <HiPlus/>
                                        Add Card
                                    </button>
                                    
                                    <button className='card-count'>
                                        <HiOutlineCreditCard style={{marginRight:'5px'}}/>
                                    </button>
                                </div>
                                {showForm[list.id]&&(
                                    <div className='cc-form-card' ref={formRef}>
                                        {/* <div className="ccf-conten"> */}
                                            <CreateCard listId={list.id} onCardCreated={handleCardCreated} onClose={handleCloseForm} />   
                                        {/* </div> */}
                                    </div>
                                )}
                            </div>
                        </div>
                    
                    </div>
                ))}
            </div>
            
        </div>
        {/* <CardDetailPopup 
            isOpen={isPopupOpen} 
            onClose={handleClosePopup} 
            cardId={selectedCardId} 
        /> */}

    </div>
  )
}

// export default BoardList

// PERBAIKI DELETE LIST ID, KARENA HANYA MENDELETE SATU DATA SAJA 
