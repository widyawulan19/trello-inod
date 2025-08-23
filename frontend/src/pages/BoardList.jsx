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
import { FaChevronRight, FaPlus } from 'react-icons/fa6'
import { handleArchive } from '../utils/handleArchive'
import SearchCard from '../fitur/SearchCard'

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
const handleArchiveLists = (listId) =>{
    handleArchive({
        entity:'lists',
        id: listId,
        refetch:fetchLists,
        showSnackbar: showSnackbar,
    })
}
// const handleArchiveLists = async(listId)=>{
//     console.log('Archiving list with id:',listId)
//     try{
//         const response = await archiveList(listId)
//         console.log('lists archived successfully:', response.data)
//         showSnackbar('List berhasil diarsipkan','success')
//         fetchLists()
//     }catch(error){
//         console.error('Error archiving lists:', error)
//         showSnackbar('Gagal mengarsipkan list','error')
//     }
// }

//NAVIGATION
// <Route path='/workspaces/:workspaceId' element={<WorkspacePage/>}/>
const handleNavigateToWorkspace = (workspaceId) => {
    navigate(`/layout/workspaces/${workspaceId}`);
    console.log("Navigating to board:", boardId);
}
const handleNavigateToBoard = (workspaceId,boardId) =>{
    navigate(`/layout/workspaces/${workspaceId}/board/${boardId}`);
}

  return (
    <div className='bl-container'>
        <div className="bl-header">
            <div className="blnav">
                <h4 className='ellipsis-text'>{boards.name} Boards</h4>
                <div className="blnav-sub" onClick={()=>handleNavigateToWorkspace(workspaceId)}>
                    <p className='back'>{boards.name}</p>
                    <HiOutlineChevronRight/>
                    <p>Board List</p>
                </div>
            </div>
            <div className="more-action">
                <div className="search-btn">
                    <SearchCard workspaceId={workspaceId}/>
                </div>
                <div className="btn-create-list" onClick={handleShowListForm}>
                    <FaPlus className='cl-icon'/>
                    <p>Create List</p>
                </div>
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
                                    <div className="new-move-list-modal">
                                        <MoveList userId={userId} currentBoardId={boardId} listId={list.id} workspaceId={workspaceId} onClose={()=> handleCloseMovePopup(list.id)}/>
                                    </div>
                                )}
                                {showDuplicatePopup[list.id] && (
                                    <div className="new-move-list-modal">
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
                                    <div className="fc-cont" onClick={(e)=> handleShowForm(e, list.id)}>
                                         <HiPlus/>
                                        Add Card
                                    </div>
                                    <div className="card-count">
                                        <HiOutlineCreditCard style={{marginRight:'5px'}}/>
                                    </div>
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

export default BoardList

// PERBAIKI DELETE LIST ID, KARENA HANYA MENDELETE SATU DATA SAJA 
