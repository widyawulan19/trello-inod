import React, { useEffect, useState,useCallback } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import '../style/pages/WorkspacePage.css';
import {HiOutlineSquaresPlus,HiMiniSlash, HiOutlineEllipsisHorizontal,HiOutlineClock,HiMiniLightBulb,HiChevronRight, HiOutlinePlus, HiMiniXMark, HiOutlineSquare2Stack,HiMiniArrowLeftStartOnRectangle, HiOutlineArchiveBox, HiOutlineTrash, HiOutlineChevronRight, HiOutlineXMark, HiMiniCalendar, HiPlus,  } from 'react-icons/hi2';
import { FaPlus } from "react-icons/fa";
import { CiAlignTop } from "react-icons/ci";
import { addPriorityToBoard, createBoard, deletePropertyFromBoard, duplicateBoards, getALlPriorities, getBoardById, getBoardPriorities, getBoardsWorkspace,getBoardsByWorkspace, getWorkspaceById, updateBoardDescription, updateBoardName, archiveBoard, deleteBoard, reorderBoardPosition } from '../services/ApiServices';
import OutsideClick from '../hook/OutsideClick';
import BootstrapTooltip from '../components/Tooltip';
import MoveBoard from '../fitur/MoveBoard';
import DuplicateBoard from '../fitur/DuplicateBoard';
import { useSnackbar } from '../context/Snackbar';
import BoardDeleteConfirm from '../modals/BoardDeleteConfirm';
import BoardProperties from '../modules/BoardProperties';
import { IoTime } from 'react-icons/io5';
import { handleArchive } from '../utils/handleArchive';
import { HiViewBoards } from "react-icons/hi";
import { useUser } from '../context/UserContext';
import { PiAlignTopFill } from 'react-icons/pi';
import { GiCardExchange } from 'react-icons/gi';

const WorkspacePage=()=> {
  const location = useLocation();
  // const userId = location.state?.userId;
  // const userId = 3;
  const {user} = useUser();
  const userId = user?.id;
  console.log("File workspace page berhasil menerima userId", userId)
  const navigate = useNavigate();
  const {workspaceId} = useParams();
  console.log('workspace id diterima:', workspaceId)
  // console.log('user id diterima:', userId)
  const [workspace, setWorkspace] = useState({});
  const [showForm, setShowForm] = useState(false)
  const [showPropertiForm, setShowPropertiForm] = useState({});
  const showProperti = OutsideClick(()=> setShowPropertiForm(false));
  const showRef = OutsideClick(()=> setShowForm(false));
  const [boards, setBoards] = useState([])
  const [showBoardSetting, setShowBoardSetting] = useState({})
  const showBoard = OutsideClick(()=> setShowBoardSetting(false))
  //priority
  const [boardId, setBoardId] = useState(null);
  const [priorities, setPriorities] = useState([]);
  const [allPriorities, setAllPriorities] = useState([]);
  const [boardPriorities, setBoardPriorities] = useState({});
  const [loading, setLoading] = useState(true);
  //edit board
  const [editingName, setEditingName] = useState(null);
  const [newName, setNewName] = useState('');
  const [editingDescription, setEditingDescription] = useState(null);
  const [newDescription, setNewDescription] = useState('');
  //create board
  const [boardName, setBoardName] = useState('');
  const [boardDescription, setBoardDescription] = useState('');
  //show
  const [showMovePopup, setShowMovePopup] = useState({});
  const [showDuplicatePopup,setShowDuplicatePopup] = useState({});
  const {showSnackbar} = useSnackbar()
  //delete
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  //board position
  const [showBoardPosition, setShowBoardPosition] = useState({})
  const [boardPositionDropdown, setBoardPositionDropdown] = useState(null);

  const handleDeleteClick = (boardId) =>{
    setSelectedBoardId(boardId);
    setShowDeleteModal(true)
    setShowBoardSetting(false)
  }

  const confirmDelete = async()=>{
    try{
      const response = await deleteBoard(selectedBoardId)
      showSnackbar('Board deleted successfully','success')
      console.log('Board delete sukses', response.data)
      fetchBoards()
    }catch(error){
      console.log('Error delete board', error)
      showSnackbar('Failed to delete board','error')
    }finally{
      setShowDeleteModal(false)
      setSelectedBoardId(null)
    }
  }
  const handleCancleDelete = (e) =>{
    e.stopPropagation();
    setShowDeleteModal(false)
    setSelectedBoardId(null)
  }

  //DUPLICATE FUNCTION
  const handleDuplicatePopup = (boardId) =>{
    setShowDuplicatePopup((prevState)=>({
      ...prevState,
      [boardId]: !prevState[boardId], 
    }))
    setShowBoardSetting(false)
    console.log('Duplicate fitur berhasil diklik')
  }

  const handleCloseDuplicatePopup = (boardId) => {
    setShowDuplicatePopup((prevState) => ({
        ...prevState,
        [boardId]: false, // Menutup popup dengan mengatur state ke false
    }));
};
//END DUPLICATE


//FUNCTION MOVE
  const handleShowMovePopup = (boardId) =>{
    setShowMovePopup((prevState) => ({
      ...prevState,
      [boardId]: !prevState[boardId],  // Toggle true/false untuk board tersebut
  }));
  setShowBoardSetting(false)
  }

  const handleCloseMovePopup = (boardId) =>{
    setShowMovePopup((prevState)=>({
      ...prevState,
        [boardId]: false,
    }))
  }

  //END MOVE

  //FUNCTION
  //1.function get detail workpace
  useEffect(()=>{
    const fetchWorkspaceDetails = async()=>{
      try{
        const response = await getWorkspaceById(workspaceId);
        setWorkspace(response.data);
      }catch(error){
        console.error('Error fetching workspace detail:', error)
      }
    }
    if(workspaceId){
      fetchWorkspaceDetails();
    }
  },[workspaceId])
  //2. function toggle form
  const handleShowForm = (e)=>{
    e.stopPropagation()
    setShowForm((prev) => !prev)
  }

  const handleCloseForm = () =>{
    setShowForm(false)
  }

  const handleShowBoardSetting = (e, boardId) =>{
    e.stopPropagation();
    setShowBoardSetting((prev) => ({
      ...prev,
      [boardId]: !prev[boardId]
    }))
  }

  const handleShowProperty = (e, boardId) =>{
    e.stopPropagation()
    setShowPropertiForm((prev) => ({
      ...prev,
      [boardId]: !prev[boardId], // Toggle hanya board yang diklik
    }));
    // setShowPropertiForm(!showPropertiForm)
  }

  const handleCloseProperty = () =>{
    setShowPropertiForm(false)
  }
  //3. featch boards
  // const fetchBoards = useCallback(async () => {
  //   try {
  //     const response = await getBoardsByWorkspace(workspaceId, userId);
  //     setBoards(response.data);
  //     if(response.data.length > 0){
  //       setBoardId(response.data[0].id)
  //     }
  //   } catch (error) {
  //     console.error('Failed to fetch boards:', error);
  //   }
  // }, [workspaceId]);

  // useEffect(()=>{
  //   if(workspaceId){
  //     fetchBoards();
  //   }
  // },[workspaceId]);
  //3. fetch boards
  const fetchBoards = useCallback(async () => {
      try {
        setLoading(true);
        const data = await getBoardsWorkspace(workspaceId, userId);
        setBoards(data);
      } catch (error) {
        console.error('Failed to fetch boards:', error);
      } finally {
        setLoading(false);
      }
    }, [workspaceId, userId]); // tergantung workspace & userId

    // 🔹 useEffect hanya memanggil fungsi
    useEffect(() => {
      if (workspaceId && userId) {
        fetchBoards();
      }
    }, [workspaceId, userId, fetchBoards]);


  //4. fungsi format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);  // Membuat objek Date dari string tanggal
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };  // Menentukan format yang diinginkan: "Day Month Year"
    
    return date.toLocaleDateString('id-ID', options); // Format tanggal Indonesia
  };

  //5. fetch priotities for selected board
  const fetchBoardPriorities = useCallback(async (boardId) => {
    try {
      const response = await getBoardPriorities(boardId);
      setBoardPriorities(prev => ({ ...prev, [boardId]: response.data }));
    } catch (error) {
      console.error(`Failed to fetch priorities for board ${boardId}:`, error);
    }
  }, []);
  
  // Fetch priorities setiap kali `boards` berubah
  useEffect(() => {
    if (boards.length > 0) {
      boards.forEach(board => fetchBoardPriorities(board.id));
    }
  }, [boards]);

  //6. get all properties 
  const fetchAllPriorities = useCallback(async () => {
    try{
      const response = await getALlPriorities();
      setAllPriorities(response.data);
    }catch(error){
      console.error('Error fetching all priority data:', error)
    }
  })
  useEffect(() => {
    fetchAllPriorities();
  },[])

  //7. Fetch all priorities
  useEffect(() => {
    const fetchAllPriorities = async () => {
      try {
        const response = await getALlPriorities();
        setAllPriorities(response.data);
      } catch (error) {
        console.error('Failed to fetch all priorities:', error);
      }
    };
    fetchAllPriorities();
  }, []);

  //8. delete priority from board
const handleDeletePriority = async (boardId, priorityId) => {
  try {
    await deletePropertyFromBoard(boardId, priorityId);
    setBoardPriorities(prev => ({
      ...prev,
      [boardId]: prev[boardId].filter(priority => priority.id !== priorityId),
    }));
  } catch (error) {
    console.error('Failed to delete priority:', error);
  }
};

//9. add priority to board
const handleAddPriority = async (boardId, priorityId) => {
  try {
    await addPriorityToBoard(boardId, priorityId);
    const addedPriority = allPriorities.find(p => p.id === priorityId);
    if (addedPriority) {
      setBoardPriorities(prev => ({
        ...prev,
        [boardId]: [...(prev[boardId] || []), addedPriority],
      }));
    }
  } catch (error) {
    console.error('Failed to add priority:', error);
  }
};
//10. edit name board
const handleEditName = (e, boardId, currentName) =>{
  e.stopPropagation()
  setEditingName(boardId)
  setNewName(currentName)
}

const handleSaveName = async(boardId) =>{
  try{
    await updateBoardName(boardId, {name:newName})
    setEditingName(null);
    fetchBoards();
  }catch(error){
    console.error('Error updating name board:', error);
  }
}


const handleKeyPressName = (e, boardId) =>{
  if(e.key === 'Enter'){
    handleSaveName(boardId);
    e.stopPropagation();
  }
}
//edit description board
const handleEditDescription = (e, boardId, currentDescription) =>{
  e.stopPropagation()
  setEditingDescription(boardId)
  setNewDescription(currentDescription)
}

const handleSaveDescription = async(boardId) =>{
  try{
    await updateBoardDescription(boardId, {description:newDescription})
    setEditingDescription(null);
    fetchBoards();
  }catch(error){
    console.error('Error updating description board:', error);
  }
}


const handleKeyPressDescription = (e, boardId) =>{
  if(e.key === 'Enter'){
    handleSaveDescription(boardId);
    e.stopPropagation();
  }
}

//create board
const handleSubmit = async (e) =>{
  e.preventDefault();

  if(!boardName || !workspaceId){
    return;
  }

  const boardData = {
    user_id:userId,
    name:boardName,
    description:boardDescription,
    workspace_id:workspaceId
  }

  try{
    await createBoard(boardData);
    fetchBoards();  // Perbarui daftar board setelah membuat board
    setShowForm(false); // Tutup form setelah submit
    setBoardName(''); 
    setBoardDescription('');
    showSnackbar('Succesfully create a new board','success')
  }catch(error){
    console.error('Error create a new board:', error);
    showSnackbar('Failed to create a new board','error')
  }
}


//fungsi archive board
const handleArchiveBoard = (boardId) =>{
  handleArchive({
    entity:'boards',
    id: boardId,
    refetch:fetchBoards,
    showSnackbar: showSnackbar,
  })
}

// fungsi ubah urutan board manual 
const handleChangeBoardPosition = async (boardId, newPosition) => {
  try {
    await reorderBoardPosition(boardId, newPosition, workspaceId);
    setBoardPositionDropdown(null);
    await fetchBoards();
    showSnackbar('Success change board position!', 'success');
  } catch (error) {
    console.error('Error changing board position:', error);
    showSnackbar('Failed to change board position', 'error');
  }
};


//navigate to board list
const handleNavigateToBoardList = (workspaceId, boardId) =>{
  // navigate(`/workspaces/${workspaceId}/board/${boardId}`);
  console.log("User ID sebelum navigate:", userId); //
  navigate(`/layout/workspaces/${workspaceId}/board/${boardId}`, {
    state: { userId }  // Kirim userId ke BoardList
  });
}

//navigate to workspace
const handleNavigateToWorkspace = () =>{
  navigate(`/layout/workspaces`);
}

  if (!userId) {
    return <p>Loading workspace user...</p>; // atau navigate("/login")
  }

  return (
    <div className='wp-container'>
      <div className="wp-header">
        <div className="nav">
          <h5> WORKSPACE {workspace.name}</h5>
          <div className="nav-title">
            <p className='nav-p' onClick={handleNavigateToWorkspace}>{workspace.name}</p>
            <HiChevronRight/>
            <p style={{fontWeight:'normal'}}>Boards Page</p>
          </div>
        </div>
        <div className="more-action">
          <div className="create-board-btn" onClick={handleShowForm}>
            <HiPlus className='cbb-icon'/>
            <p>Create Board</p>
          </div>
        </div>
      </div>
      {/* CREATE A NEW BOARD  */}
      {showForm && (
        <form className='bform-workspace' onSubmit={handleSubmit} ref={showRef}>
          <div className="bheader">
            <div className="bheader-left">
              <div className="board-icon">
              <HiViewBoards/>
            </div>
            <p>CREATE NEW BOARD</p>
            </div>
            
            <BootstrapTooltip title='Close' placement='top'>
              <HiMiniXMark className='bheader-icon' onClick={handleCloseForm}/>
            </BootstrapTooltip>
          </div>
          <div className="bbody">
            <div className="fname">
                <label>Board Name <span>*</span></label>
                <input 
                  type="text" 
                  value={boardName}
                  onChange={(e)=> setBoardName(e.target.value)}
                  required
                />
            </div>
            <div className="fdesc">
              <label>Board Description</label>
              <textarea
                type="text" 
                value={boardDescription}
                onChange={(e)=> setBoardDescription(e.target.value)}
                // required
              />
            </div>
            <button type='submit'>
              CREATE BOARD
            </button>
          </div>
        </form>
      )}
      {/* END CREATE A NEW BOARD  */}

      <div className="board-title">
        <h3>Your Board, Your Space</h3>
        <p>
          Organize tasks, collaborate with your team, and keep projects moving forward — all in one place.
        </p>
      </div>

      <div className="wp-body-container" >
        <div className="wp-content">
          {boards.length > 0 ? (
        boards.map((board) => (
          <div key={board.id} className='wp-card'>
            <div className="wp-name">
              <div className="wp-name-text">
                <div className="name-icon">
                  <PiAlignTopFill className='ni-mini'/>
                </div>
                {/* <h5>{board.name}</h5> */}
                {editingName === board.id ? (
                  <input 
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onBlur={()=> handleSaveName(board.id)}
                    onKeyDown={(e) => handleKeyPressName(e, board.id)}
                    autoFocus 
                  />
                ):(
                  <h5 onClick={(e)=> handleEditName(e, board.id, board.name)}>{board.name}</h5>
                )}
              </div>

              <BootstrapTooltip title='Board setting' placement='top'>
                <div className="wp-setting" onClick={(e) => handleShowBoardSetting(e, board.id)}>
                  <HiOutlineEllipsisHorizontal/>
                </div>
              </BootstrapTooltip>
            </div>

            {/* BOARD SETTING  */}
            {showBoardSetting[board.id] && (
              <div className='bs-pop' ref={showBoard}>
                <button onClick={() => handleShowMovePopup(board.id)}>
                  <HiMiniArrowLeftStartOnRectangle className='bs-icon'/>
                  Move
                </button>
                  <button  onClick={() => handleDuplicatePopup(board.id)}>
                    <HiOutlineSquare2Stack className='bs-icon'/>
                    Duplicate
                  </button>
                  <button onClick={() => handleArchiveBoard(board.id)}>
                    <HiOutlineArchiveBox className='bs-icon'/>
                    Archive
                  </button>

                  <button
                    onClick={() =>
                      setBoardPositionDropdown(
                        boardPositionDropdown === board.id ? null : board.id
                      )
                    }
                  >
                    <GiCardExchange className='bs-icon'/>
                    Posisi : {board.position}
                  </button>

                  <hr />
                  <button 
                    className='delete'
                    onClick={() => handleDeleteClick(board.id)}
                  >
                    <HiOutlineTrash className='bs-delete'/>
                    Delete
                  </button>
              </div>
            )}
            {showMovePopup[board.id] && (
              <div className="workspace-move-modal">
                  <MoveBoard fetchBoards={fetchBoards} boardId={board.id} userId={userId} onClose={()=>handleCloseMovePopup(board.id)}/>
              </div>
            )}
            {showDuplicatePopup[board.id] && (
              <div className="duplicate-modal">
                  <DuplicateBoard fetchBoards={fetchBoards} boardId={board.id} userId={userId} onClose={() => handleCloseDuplicatePopup(board.id)}/>
              </div>
            )}
            {boardPositionDropdown === board.id && (
              <div className="duplocat-modal">
                <ul
                  style={{
                    listStyle: "none",
                    padding: "5px",
                    margin: "5px 0 0 0",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    position: "absolute",
                    background: "#fff",
                    zIndex: 10,
                    minWidth: "100px",
                  }}
                >
                  {boards.map((_, i) => (
                    <li
                      key={i}
                      style={{
                        padding: "5px 10px",
                        cursor: "pointer",
                        background: i + 1 === board.position ? "#eee" : "#fff",
                      }}
                      onClick={() => handleChangeBoardPosition(board.id, i + 1)} // +1 biar mulai dari 1
                    >
                      {i + 1}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <BoardDeleteConfirm boardId={board.id} isOpen={showDeleteModal} onConfirm={confirmDelete} onCancle={handleCancleDelete} boardName={boards.find(b => b.id === selectedBoardId)?.name}/>
            

            {/* END BOARD SETTING  */}
            <div className="wp-body">
              <div className="priority">
                <BoardProperties boardId={board.id}/>
              </div>
                {/* DESCRIPTION  */}
                {editingDescription === board.id ? (
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    onBlur={()=> handleSaveDescription(board.id)}
                    onKeyDown={(e) => handleKeyPressDescription(e, board.id)}
                    autoFocus
                  />
                ):(
                  <p onClick={(e) => handleEditDescription(e, board.id, board.description)}>{board.description}</p>
                )}

                {/* <p>{board.description}</p> */}
                {/* <p>{formatDate(board.create_at)}</p> */}
                <div className="wp-btm">
                  <div className='wp-create'>
                    <IoTime className='wp-icon'/>
                    {formatDate(board.create_at)}
                  </div>
                  <button 
                    className='view'
                    onClick={()=>handleNavigateToBoardList(workspaceId, board.id)}
                    // onClick={handleNavigateToBoardList} 
                  >
                    View List
                    <HiChevronRight/>
                  </button>
                </div>
              </div>
            </div>
          ))
        ):(
          <></>
        )}

          <div className="wpf-create">
            <div className="wpf-content" onClick={handleShowForm}>
              <HiOutlinePlus className='wpf-icon'/>
              <p>CREATE A NEW BOARD</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkspacePage
