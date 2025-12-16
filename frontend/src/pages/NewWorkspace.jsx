import React, { useState, useEffect } from 'react';

/* ============================== ICONS ============================== */
import {
  HiOutlineEllipsisHorizontal,
  HiOutlineArchiveBox,
  HiOutlineTrash,
  HiOutlineChevronRight,
  HiOutlinePlus,
  HiSquaresPlus,
} from 'react-icons/hi2';
import { TbListCheck } from 'react-icons/tb';
import { IoHome, IoLayers} from 'react-icons/io5';
import { HiViewBoards } from 'react-icons/hi';
import { PiCardsFill } from 'react-icons/pi';

/* ============================== ROUTER & HOOKS ============================== */
import { useNavigate } from 'react-router-dom';
import OutsideClick from '../hook/OutsideClick';

/* ============================== STYLES ============================== */
import '../style/pages/Workspace.css';

/* ============================== API SERVICES ============================== */
import {
  createWorkspace,
  getWorkspacesByUserId,
  getWorkspaceUsers,
  getAdminFromWorkspace,
  updateWorkspaceName,
  updateWorkspaceDescription,
  getAllUsersWorkspaceAndProfil,
  getAllUsers,
  addUserToWorkspace,
  removeUserFromWorkspace,
  deleteWorkspaceUser,
  getWorkspaceSummaryByWorkspaceId,
} from '../services/ApiServices';

/* ============================== COMPONENTS / MODULES ============================== */
import CustomAlert from '../hook/CustomAlert';
import Assigment from '../modules/Assigment';
import FormNewWorkspace from '../modules/FormNewWorkspace';
import BootstrapTooltip from '../components/Tooltip';
import WorkspaceDeleteConfirm from '../modals/WorkspaceDeleteConfirm';
import UsersTotal from '../modules/UsersTotal';

/* ============================== CONTEXT ============================== */
import { useSnackbar } from '../context/Snackbar';
import { useUser } from '../context/UserContext';

/* ============================== UTILS ============================== */
import { handleArchive } from '../utils/handleArchive';
import { generateSlug } from '../utils/Slug';
import LoadingSpinnerDot from '../utils/LoadingSpinnerDot';

function NewWorkspace() {
  /* ============================== USER CONTEXT ============================== */
  const { user } = useUser();
  const userId = user?.id;

  /* ============================== NAVIGATION ============================== */
  const navigate = useNavigate();

  /* ============================== UI STATE ============================== */
  const [showForm, setShowForm] = useState(false);          // toggle form create workspace
  const [showSetting, setShowSetting] = useState(false);    // toggle workspace setting menu
  const [showUser, setShowUser] = useState({});              // toggle user list per workspace
  const [detailWorkspace, setDetailWorkspace] = useState(false); // toggle workspace detail

  /* Outside click handler */
  const showRef = OutsideClick(() => setShowForm(false));
  const settingRef = OutsideClick(() => setShowSetting(false));
  const userRef = OutsideClick(() => setShowUser(false));
  const detailRef = OutsideClick(() => setDetailWorkspace(false));

  /* ============================== WORKSPACE FORM ============================== */
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  /* ============================== WORKSPACE DATA ============================== */
  const [workspaces, setWorkspaces] = useState([]);        // list workspace
  const [workspaceId, setWorkspaceId] = useState(null);    // active workspace id
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [admin, setAdmin] = useState({});                  // admin per workspace
  const [workspaceSummaries, setWorkspaceSummaries] = useState({});

  /* ============================== USERS ============================== */
  const [users, setUsers] = useState([]);                  // users in workspace
  const [allUsers, setAllUsers] = useState([]);            // all users in system

  /* ============================== EDIT WORKSPACE ============================== */
  const [editingName, setEditingName] = useState(null);
  const [editingDescription, setEditingDescription] = useState(null);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  /* ============================== DELETE CONFIRM ============================== */
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);
  const [selectedWorkspaceName, setSelectedWorkspaceName] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  /* ============================== SNACKBAR ============================== */
  const { showSnackbar } = useSnackbar();
  const [loading,setLoading] = useState(false);

  /* ============================== ASSIGN USER ============================== */
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  /* ============================== ALERT STATE ============================== */
  const [alertInfo, setAlertInfo] = useState({
    severity: '',
    title: '',
    message: '',
    showAlert: false,
  });

  /* ============================== DEBUG ============================== */
  console.log('NewWorkspace userId:', userId);
  console.log('Workspace data:', workspaces);
  console.log('Active workspaceId:', workspaceId);

  /* ============================== NAVIGATION HANDLER ============================== */
  const navigateToHome = () => navigate('/layout');
  
  //navigate to workspace id
  const handleWorkspaceClick = (workspaceId, userId) =>{
    navigate(`/layout/workspaces/${workspaceId}`,{ state: { userId } })
  }

  /* ============================== UI SHOW HANDLERS ============================== */
  const handleShowForm = (e) => {
    e.stopPropagation();
    setShowForm((prev) => !prev);
  };

  const handleShowSetting = (e, workspaceId) => {
    e.stopPropagation();
    setActiveWorkspace(workspaceId);
    setShowSetting((prev) => ({
      ...prev,
      [workspaceId]: !prev[workspaceId],
    }));
  };

  const handleShowUser = (e, workspaceId) => {
    e.stopPropagation();
    setActiveWorkspace(workspaceId);
    setShowUser((prev) => ({
      ...prev,
      [workspaceId]: !prev[workspaceId],
    }));
  };

  const handleShowWorkspace = (workspaceId) => {
    setDetailWorkspace((prev) => ({
      ...prev,
      [workspaceId]: !prev[workspaceId]  // toggle show/hide
    }));
  };

  /* ============================== UI CLOSE HANDLERS ============================== */
  const onCloseForm =()=>{
    setShowForm(false);
  }

  /* ============================== CREATE WORKSPACE ============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createWorkspace({ name, description });
      setName('');
      setDescription('');

      setAlertInfo({
        severity: 'success',
        title: 'Success',
        message: 'Successfully create a new workspace!',
        showAlert: true,
      });

      const workspaceResult = await getWorkspacesByUserId(userId);
      setWorkspaces(workspaceResult.data);
    } catch (error) {
      setAlertInfo({
        severity: 'error',
        title: 'Error',
        message: 'Failed to create workspace!',
        showAlert: true,
      });
      console.error('Create workspace error:', error);
    }
  };

  const handleCloseAlert = () => {
    setAlertInfo((prev) => ({ ...prev, showAlert: false }));
  };

  /* ============================== FETCH WORKSPACES ============================== */
  const fetchWorkspaceUser = async () => {
    setLoading(true);
    try {
      const res = await getWorkspacesByUserId(userId);
      setWorkspaces(res.data);
      fetchAdmins(res.data);
    } catch (error) {
      console.error('Fetch workspace error:', error);
    } finally{
      setLoading(false)
    }
  };

  useEffect(() => {
    if (userId) fetchWorkspaceUser();
  }, [userId]);

  /* ============================== FETCH USERS IN WORKSPACE ============================== */
  const fetchUsers = async () => {
    try {
      const res = await getAllUsersWorkspaceAndProfil(workspaceId);
      setUsers(res.data);
    } catch (error) {
      console.error('Fetch users error:', error);
    }
  };

  useEffect(() => {
    if (workspaceId) fetchUsers();
  }, [workspaceId]);

  /* ============================== FETCH ALL USERS ============================== */
  useEffect(() => {
    const fetchAllUser = async () => {
      try {
        const res = await getAllUsers();
        setAllUsers(res.data);
      } catch (error) {
        console.error('Fetch all users error:', error);
      }
    };
    fetchAllUser();
  }, []);

  /* ============================== SEARCH USER ============================== */
  useEffect(() => {
    if (searchTerm) {
      const filtered = allUsers.filter((u) =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [searchTerm, allUsers]);

/* ============================== DATE FORMAT ============================== */
  const formatDate = (dateString) => {
    const date = new Date(dateString); 
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };  
    
    return date.toLocaleDateString('id-ID', options);
  };

  /* ============================== ADD / REMOVE USER ============================== */
  const handleSelectUser = async (user) => {
    try {
      await addUserToWorkspace(workspaceId, user.id, { role: 'member' });
      showSnackbar(`${user.username} added to workspace`, 'success');
      setSearchTerm('');
      setShowDropdown(false);
      fetchUsers();
      fetchWorkspaceUser();
    } catch (error) {
      console.error('Add user error:', error);
      showSnackbar('Failed to add user', 'error');
    }
  };

  const handleRemoveUser = async (userId) => {
    try {
      await removeUserFromWorkspace(workspaceId, userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      showSnackbar('User removed successfully', 'success');
      fetchWorkspaceUser();
    } catch (error) {
      console.error('Remove user error:', error);
      showSnackbar('Failed to remove user', 'error');
    }
  };

  /* ============================== FETCH ADMIN ============================== */
  const fetchAdmins = async (workspaces) => {
    const adminData = {};
    await Promise.all(
      workspaces.map(async (ws) => {
        try {
          const res = await getAdminFromWorkspace(ws.id);
          adminData[ws.id] = res.data.admins?.[0] || null;
        } catch {
          adminData[ws.id] = null;
        }
      })
    );
    setAdmin(adminData);
  };

  /* ============================== FETCH SUMMARY ============================== */
  const fetchSummaries = async (workspaces) => {
    const summaryData = {};
    await Promise.all(
      workspaces.map(async (ws) => {
        try {
          const res = await getWorkspaceSummaryByWorkspaceId(userId, ws.id);
          summaryData[ws.id] = res.data;
        } catch {
          summaryData[ws.id] = null;
        }
      })
    );
    setWorkspaceSummaries(summaryData);
  };

  useEffect(() => {
    if (userId && workspaces.length) {
      fetchSummaries(workspaces);
      fetchAdmins(workspaces);
    }
  }, [userId, workspaces]);

  /* ============================== DELETE WORKSPACE ============================== */
  const handleDeleteClick = (e, wsId, wsName, userId) => {
    e.stopPropagation();
    setSelectedWorkspaceId(wsId);
    setSelectedWorkspaceName(wsName);
    setSelectedUserId(userId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteWorkspaceUser(selectedWorkspaceId, selectedUserId);
      showSnackbar('Workspace deleted', 'success');
      fetchWorkspaceUser();
    } catch (error) {
      console.error('Delete workspace error:', error);
      showSnackbar('Delete failed', 'error');
    } finally {
      setShowDeleteModal(false);
      setSelectedWorkspaceId(null);
      setSelectedUserId(null);
      setSelectedWorkspaceName(null);
    }
  };

  const handleCancleDelete = (e) => {
    e.stopPropagation();
    setShowDeleteModal(false);
    setSelectedWorkspaceId(null);
    setSelectedUserId(null);
    setSelectedWorkspaceName('');
  };
  

  /* ============================== EDIT WORKSPACE NAME ============================== */  
  const handleEditName = (e, workspaceId, currentName) =>{
    e.stopPropagation()
    setEditingName(workspaceId);
    setNewName(currentName);
  }

  const handleSaveName = async(workspaceId) =>{
    try{
      await updateWorkspaceName(workspaceId, {name:newName})
      setEditingName(null);
      fetchWorkspaceUser();
    }catch(error){
      console.error('Error updating workspace name:', error)
    }
  }

  // Fungsi untuk menangani saat tombol Enter ditekan
    const handleKeyPressName = (e, workspaceId) => {
      if (e.key === 'Enter') {
        handleSaveName(workspaceId); // Simpan nama jika Enter ditekan
        e.stopPropagation();
      }
    };

  /* ============================== EDIT WORKSPACE DESC ============================== */  
  const handleSaveDescription = async(workspaceId)=>{
    try{
      await updateWorkspaceDescription(workspaceId, {description:newDescription})
      setEditingDescription(null)
      fetchWorkspaceUser();
    }catch(error){
      console.error('Error updating workspace description:', error)
    }
  }

  const handleEditDescription = (e, workspaceId, currentDescription) => {
    e.stopPropagation();
    setEditingDescription(workspaceId);
    setNewDescription(currentDescription); // Mengatur nilai awal input deskripsi
  };

  const handleKeyPressDescription = (e, workspaceId) => {
    if (e.key === 'Enter') {
      handleSaveDescription(workspaceId); // Simpan deskripsi jika Enter ditekan
      e.stopPropagation();
    }
  };



  /* ============================== ARCHIVE ============================== */
  const archiveWorkspaceUserData = (workspaceId) => {
    handleArchive({
      entity: 'workspaces',
      id: workspaceId,
      userId,
      refetch: fetchWorkspaceUser,
      showSnackbar,
    });
  };

  if (!userId) return <p>Loading workspace user...</p>;

  /* ============================== RENDER ============================== */
  return (
    <div className="workspace-container">
      {/* ============================== HEADER / NAVIGATION ============================== */}
      <div className="workspace-header">
        {/* Breadcrumb navigation */}
        <div className="wnav">
          <div className="wnav-btn-con">
            <div className="wnav-btn">
              <IoHome className="nav-icon" onClick={navigateToHome} />
            </div>
            <HiOutlineChevronRight size={13} />
            <div className="wnav-active">WORKSPACE PAGES</div>
          </div>
        </div>

        {/* Button create workspace */}
        <div className="wform">
          <button onClick={handleShowForm}>
            <HiOutlinePlus className="wform-icon" />
            CREATE WORKSPACE
          </button>
        </div>

        {/* ============================== CREATE WORKSPACE FORM ============================== */}
        <CustomAlert
          severity={alertInfo.severity}
          title={alertInfo.title}
          message={alertInfo.message}
          showAlert={alertInfo.showAlert}
          onClose={handleCloseAlert}
        />

        {showForm && (
          <FormNewWorkspace
            userId={userId}
            fetchWorkspaceUser={fetchWorkspaceUser}
            onCloseForm={onCloseForm}
          />
        )}
        {/* ============================== END CREATE WORKSPACE FORM ============================== */}
      </div>

      {/* ============================== WELCOME SECTION ============================== */}
      <div className="workspace-welcome">
        <h3>Welcome to {user.username}'s Workspace</h3>
        <p>
          Mulailah mengelola proyek, tim, dan ide hebatmu di sini. Buat board baru,
          undang anggota, dan capai target bersama.
        </p>
      </div>

      {/* ============================== WORKSPACE LIST ============================== */}
      <div className="workspace-body">
      {loading ? (
          <LoadingSpinnerDot text='Preparing your workspaces'/>
        ):(
          <div className="workspace-content">
            {workspaces.map((workspace) => (
              <div
                key={workspace.id}
                className="workspace-card"
                onClick={() => setWorkspaceId(workspace.id)}
              >
                {/* ============================== CARD HEADER ============================== */}
                <div className="wc-header">
                  <div className="wc-name">
                    <div className="name-icon">
                      <HiSquaresPlus className="ni-mini" />
                    </div>

                    {/* Editable workspace name */}
                    {editingName === workspace.id ? (
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onBlur={() => handleSaveName(workspace.id)}
                        onKeyDown={(e) => handleKeyPressName(e, workspace.id)}
                        autoFocus
                      />
                    ) : (
                      <h5
                        onClick={(e) =>
                          handleEditName(e, workspace.id, workspace.name)
                        }
                      >
                        {workspace.name}
                      </h5>
                    )}
                  </div>

                  {/* Workspace setting menu */}
                  <BootstrapTooltip title="Workspace Setting" placement="top">
                    <HiOutlineEllipsisHorizontal
                      className="setting-icon"
                      onClick={(e) => handleShowSetting(e, workspace.id)}
                    />
                  </BootstrapTooltip>
                </div>

                {/* ============================== SETTING DROPDOWN ============================== */}
                {showSetting[workspace.id] && activeWorkspace === workspace.id && (
                  <div className="setting-wc" ref={settingRef}>
                    <button
                      onClick={() => archiveWorkspaceUserData(workspace.id)}
                    >
                      <HiOutlineArchiveBox className="swc-icon" />
                      Archive
                    </button>
                    
                    <button
                      onClick={(e) =>
                        handleDeleteClick(
                          e,
                          workspace.id,
                          workspace.name,
                          userId
                        )
                      }
                      className='delete'
                    >
                      <HiOutlineTrash className="swc-delete" />
                      Delete
                    </button>
                    
                  </div>
                )}

                {/* ============================== DELETE CONFIRM MODAL ============================== */}
                <WorkspaceDeleteConfirm
                  isOpen={showDeleteModal}
                  workspaceId={selectedWorkspaceId}
                  workspaceName={selectedWorkspaceName}
                  onConfirm={confirmDelete}
                  onCancel={handleCancleDelete}
                />

                {/* ============================== CARD BODY ============================== */}
                <div className="workspace-card-body">
                  {/* Editable description */}
                  <div className="workspace-card-desc">
                    {editingDescription === workspace.id ? (
                      <textarea
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        onBlur={() => handleSaveDescription(workspace.id)}
                        onKeyDown={(e) =>
                          handleKeyPressDescription(e, workspace.id)
                        }
                        autoFocus
                      />
                    ) : (
                      <p
                        onClick={(e) =>
                          handleEditDescription(
                            e,
                            workspace.id,
                            workspace.description
                          )
                        }
                      >
                        {workspace.description}
                      </p>
                    )}
                  </div>

                  {/* ============================== WORKSPACE INFO ============================== */}
                  <div className="workspace-info">
                    {/* Admin & member info */}
                    <div
                      className="user-admin"
                      onClick={(e) => handleShowUser(e, workspace.id)}
                    >
                      {admin[workspace.id] && (
                        <div className="prof-user">
                          <img
                            src={
                              admin[workspace.id].photo_url ||
                              'default-avatar.png'
                            }
                            alt={admin[workspace.id].username}
                          />
                          <p>
                            {admin[workspace.id].username} &{' '}
                            <UsersTotal workspaceId={workspace.id} />
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Created date */}
                    <div className="info-date">
                      {formatDate(workspace.create_at)}
                    </div>

                    {/* ============================== USER ASSIGNMENT ============================== */}
                    {showUser[workspace.id] && (
                      <div
                        className="user-container"
                        ref={userRef}
                        onClick={(e) => e.stopPropagation()}
                      >
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

                {/* ============================== SUMMARY & NAVIGATION ============================== */}
                <div className="summary-counts">
                  {workspaceSummaries[workspace.id] ? (
                    <BootstrapTooltip title="Detail Workspace" placement="top">
                      <div
                        className="detail-icon"
                        onClick={() => handleShowWorkspace(workspace.id)}
                      >
                        <div className="mini-icon">
                          <IoLayers className="mi" />
                        </div>
                        <p>Workspace Detail</p>
                      </div>
                    </BootstrapTooltip>
                  ) : (
                    <p>Loading summary...</p>
                  )}

                  {/* Navigate to board list */}
                  <div
                    className="btn-nav-board"
                    onClick={() => handleWorkspaceClick(workspace.id, userId)}
                  >
                    View Board
                  </div>

                  {/* Workspace detail popup */}
                  {detailWorkspace[workspace.id] && (
                    <ul className="detail-ul" ref={detailRef}>
                      <li>
                        <HiViewBoards className="detail-icon" />{' '}
                        {workspaceSummaries[workspace.id].board_count} boards
                      </li>
                      <li>
                        <TbListCheck className="detail-icon" />{' '}
                        {workspaceSummaries[workspace.id].list_count} lists
                      </li>
                      <li>
                        <PiCardsFill className="detail-icon" />{' '}
                        {workspaceSummaries[workspace.id].card_count} cards
                      </li>
                    </ul>
                  )}
                </div>
              </div>
            ))}

            {/* ============================== CREATE WORKSPACE CARD ============================== */}
            <div className="form-workspace-card" onClick={handleShowForm}>
              <div className="fwc-icon">
                <HiOutlinePlus />
              </div>
              <h4>CREATE A WORKSPACE</h4>
              <p>Start a new project and collaborate with your team</p>
            </div>
          </div>
        )}
       
      </div>
    </div>
  );
}

export default NewWorkspace;
