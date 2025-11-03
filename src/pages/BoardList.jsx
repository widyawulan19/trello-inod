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
import { archiveList, deleteLists, duplicateBoards, getAllLists, getBoardById, getCardByList, getListByBoard, updateLists,updateCardPosition, reorderListPosition, getListPositions, updateListPositions,getCardListTotal, reorderCards, getWorkspaceById } from '../services/ApiServices'
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
import { FaChevronRight, FaPlus, FaXmark } from 'react-icons/fa6'
import { handleArchive } from '../utils/handleArchive'
import SearchCard from '../fitur/SearchCard'
import PositionList from '../modules/PositionList'
import { GiCardExchange } from 'react-icons/gi'
import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
//   verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableListItem from '../hook/SortableListItem'
import SortableCardItem from '../hook/SortableCardItem'
// import SortableCardItem from '../hook/SortableCardItem'


const BoardList=()=> {
    //STATE
    const location = useLocation();
    const {user} = useUser();
    const userId = user?.id;
    console.log('File Board List menerima data user:', user)
    console.log('berhasil menerima userId:', userId)
    const {boardId, workspaceId} = useParams();
    console.log('boardId diterima pada file board list:',boardId)
    console.log('workspace id diterima:', workspaceId)
    const [boards, setBoards] = useState({});
    const [lists, setLists] = useState([]);
    const [listId, setListId] = useState([]);
    const [positions, setPositions] = useState({});
    const [clickedListId, setClickedListId] = useState(null);
    const [cards, setCards] = useState({});
    const [cardPositionDropdown, setCardPositionDropdown] = useState(null);
    const [showPosition,setShowPosition] = useState({});
    const [listPositionDropdown, setListPositionDropdown] = useState(null);
    //workspace
    const [workspaceName, setWorkspaceName] = useState('');
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
    const [activeId, setActiveId] = useState(null);




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

    //card position 
    const [cardsByList, setCardsByList] = useState({});
    const [activeCard, setActiveCard] = useState(null);


    //total card in list
    const [totalCard, setTotalCard] = useState({});
    
    //FUNCTION TO GET TOTAL CARD IN LIST
    useEffect(() => {
    const fetchTotals = async () => {
        const totals = {};
        for (const list of lists) {
        try {
            const response = await getCardListTotal(list.id);
            totals[list.id] = response.data.card_count || 0;
        } catch {
            totals[list.id] = 0;
        }
        }
        setTotalCard(totals);
    };

    if (lists.length > 0) fetchTotals();
    }, [lists]);

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
    //1.1 fetch workspace
    useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const workspaceData = await getWorkspaceById(workspaceId);
        console.log("workspace data:", workspaceData);

        // Misal backend kamu balikin { id: 1, name: "Design Team", ... }
        setWorkspaceName(workspaceData.name);
      } catch (error) {
        console.error("Gagal ambil nama workspace:", error);
      }
    };

    if (workspaceId) fetchWorkspace();
  }, [workspaceId]);


    //1.2fetch board 
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
    const fetchAllCardList = useCallback(() => {
    lists.forEach(list => fetchCardList(list.id));
    }, [lists, fetchCardList]);

    const handleRefetchBoard = () => {
    fetchBoardDetail();
    fetchLists();   // otomatis setelah fetchLists selesai → lists berubah → useEffect jalan → fetchAllCardList
    fetchAllCardList();
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

// FUNCTION CARD POSITION 
const handleChangeCardPosition = async (cardId, newPosition) => {
  const listId = Object.keys(cards).find(id => 
    cards[id].some(c => c.id === cardId)
  );
  if (!listId) return;

  try {
    await updateCardPosition(cardId, newPosition, listId);
    setCardPositionDropdown(null);
    fetchCardList(listId);
    showSnackbar('Success change card position!', 'success');
  } catch (error) {
    console.error(error);
    showSnackbar('Error change card posititon, Try Again Bro!', 'error');
  }
};


const handleShowPosition = (e, listId) => {
  e.stopPropagation();
  setShowPosition((prev) => ({
    ...prev,
    [listId]: !prev[listId],
  }));
};

// Fungsi ubah urutan list manual (tanpa drag)
const handleChangeListPosition = async (listId, newPosition) => {
    try {
      await reorderListPosition(listId, newPosition, boardId);

      setListPositionDropdown(null); // Tutup dropdown setelah update
      await fetchLists(); // Refresh list setelah posisi diubah
      showSnackbar("Success change list position!", "success");
    } catch (error) {
      console.error("Error changing list position:", error);
      showSnackbar("Failed to change list position, try again!", "error");
    }
  };

  // fungsi drag end
const handleListDragEnd = async (event) => {
  const { active, over } = event;

  // Cegah error saat drag di area kosong atau posisi sama
  if (!over || active.id === over.id) return;

  const oldIndex = lists.findIndex((l) => l.id === active.id);
  const newIndex = lists.findIndex((l) => l.id === over.id);

  // Update urutan di UI secara langsung (optimistic update)
  const newLists = arrayMove(lists, oldIndex, newIndex);
  setLists(newLists);

  try {
    // Kirim posisi baru ke backend
    await reorderListPosition(active.id, newIndex, boardId);

    // Ambil ulang dari backend biar posisi sinkron 100%
    const response = await getListByBoard(boardId);
    const sortedLists = response.data.sort((a, b) => a.position - b.position);
    setLists(sortedLists);

    showSnackbar("List order updated!", "success");
  } catch (error) {
    console.error("Error updating list order:", error);
    showSnackbar("Failed to update list position", "error");

    // Kembalikan urutan awal dari server kalau gagal
    await fetchLists();
  }
};



  //CARD POSITION
//   / 🔹 Saat drag dimulai
    const handleDragStart = (event) => {
         console.log("Drag start:", active);
      const { active } = event;
      setActiveCard(active.id);
    };
    const handleCardDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    // ambil id asli
    const activeCardId = typeof active.id === "object" ? active.id.id : active.id;
    const overCardId = typeof over.id === "object" ? over.id.id : over.id;

    // ambil listId dari active & over
    const activeListId = active.data.current?.listId ?? active.id.list_id;
    const overListId = over.data.current?.listId ?? over.id.list_id ?? over.id;

    if (!activeCardId || !activeListId || !overListId) return;

    console.log("🧩 activeCardId:", activeCardId);
    console.log("🧩 overCardId:", overCardId);
    console.log("🧩 activeListId:", activeListId);
    console.log("🧩 overListId:", overListId);

    const sourceCards = cards[activeListId] || [];
    const targetCards = cards[overListId] || [];

    const movedCard = sourceCards.find((c) => c.id === activeCardId);
    if (!movedCard) return;

    let newCards, newSourceCards, newTargetCards;

    if (activeListId === overListId) {
        // ✅ Drag di list yang sama: reorder
        newCards = [...sourceCards];
        const oldIndex = newCards.findIndex(c => c.id === activeCardId);
        const newIndex = newCards.findIndex(c => c.id === overCardId);

        // hapus dulu dari posisi lama
        const [removed] = newCards.splice(oldIndex, 1);
        // insert di posisi baru
        newCards.splice(newIndex, 0, removed);

        newSourceCards = newCards;
        newTargetCards = newCards;
    } else {
        // ✅ Drag ke list berbeda: pindah card
        newSourceCards = sourceCards.filter(c => c.id !== activeCardId);
        newTargetCards = [...targetCards];

        const overIndex = newTargetCards.findIndex(c => c.id === overCardId);
        const insertAt = overIndex >= 0 ? overIndex : newTargetCards.length;
        newTargetCards.splice(insertAt, 0, movedCard);
    }

    setCards(prev => ({
        ...prev,
        [activeListId]: newSourceCards,
        [overListId]: newTargetCards,
    }));

    const payload = {
        sourceListId: Number(activeListId),
        targetListId: Number(overListId),
        sourceCards: newSourceCards.map(c => ({ id: Number(c.id) })),
        targetCards: newTargetCards.map(c => ({ id: Number(c.id) })),
    };

    console.log("📦 payload ke backend:", JSON.stringify(payload, null, 2));

    try {
        await reorderCards(payload);
        showSnackbar("Card order updated!", "success");
    } catch (err) {
        console.error("❌ Error updating list position:", err.response?.data || err.message);
        showSnackbar("Failed to update card position", "error");
        fetchCardList(activeListId);
        fetchCardList(overListId);
    }

    setActiveCard(null);
};


//NAVIGATION


// <Route path='/workspaces/:workspaceId' element={<WorkspacePage/>}/>
const handleNavigateToWorkspace = (workspaceId) => {
    navigate(`/layout/workspaces/${workspaceId}`);
    console.log("Navigating to board:", boardId);
}
const handleNavigateToBoard = (workspaceId,boardId) =>{
    navigate(`/layout/workspaces/${workspaceId}/board/${boardId}`);
}

if (!userId) {
    return <p>Loading board list page</p>; // atau navigate("/login")
}


  return (
    <div className='bl-container'>
        <div className="bl-header">
            <div className="blnav">
                <h4 className='ellipsis-text'>{boards.name} <span style={{color:'#6a11cb'}}>Boards</span></h4>
                {/* <h4 className='ellipsis-text'>{workspaceName.name} Boards</h4> */}
                <div className="blnav-sub">
                    <p className='back' onClick={()=>handleNavigateToWorkspace(workspaceId)}>All Boards</p>
                    {/* <p className='back' onClick={()=>handleNavigateToWorkspace(workspaceId)}>{boards.name}</p> */}
                    <HiOutlineChevronRight className='back-icon'/>
                    <p>Board List</p>
                </div>
            </div>
            <div className="more-action">
                {/* <div className="search-btn">
                    <SearchCard workspaceId={workspaceId}/>
                </div> */}
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
            <DndContext
                collisionDetection={closestCenter}
                onDragStart={(e) => setActiveId(e.active.id)}
                onDragEnd={(event) => {
                    console.log("🧩 DragEnd event:", event); // ← log utama
                    handleListDragEnd(event);
                    handleCardDragEnd(event);                // panggil function asli
                    
                }}
                onDragCancel={() => setActiveId(null)}
            >
            {/* <DndContext
                collisionDetection={closestCenter}
                onDragEnd={async (event) => {
                    const { active } = event;
                    const type = active.data.current?.type;

                    if (type === "card") {
                    await handleCardDragEnd(event);
                    } else if (type === "list") {
                    await handleListDragEnd(event);
                    }
                }}
                > */}
                <SortableContext
                    items={lists.map((l) => l.id)}
                    strategy={horizontalListSortingStrategy}
                >
                    <div className="bl-content">
                        {lists.map((list) =>(
                            <SortableListItem key={list.id} id={list.id} data={{ type: "list" }}>
                                {({dragHandleProps}) =>(
                                    <div key={list.id} className='bl-card-card' style={{boxShadow:'none'}}>
                                        <div className="bl-box">
                                            <div className="list-title">
                                                <div className="l-name">
                                                    <div className="icon-i" {...dragHandleProps} >
                                                        <HiMiniListBullet className='licon'/>
                                                    </div>
                                                    
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
                                                        <MoveList userId={userId} currentBoardId={boardId} listId={list.id} workspaceId={workspaceId} onClose={()=> handleCloseMovePopup(list.id)} fetchLists={fetchLists}/>
                                                    </div>
                                                )}
                                                {showDuplicatePopup[list.id] && (
                                                    <div className="new-move-list-modal">
                                                        <DuplicateList userId={userId} boardId={boardId} listId={list.id} workspaceId={workspaceId} onClose={()=> handleCloseDuplicate(list.id)} fetchLists={fetchLists}/>
                                                    </div>
                                                )}
                                                
                                                
                                                </div>

                                                {/* <DndContext
                                                    collisionDetection={closestCenter}
                                                    onDragStart={handleDragStart}
                                                    onDragEnd={handleCardDragEnd}
                                                    > */}
                                                    {/* <SortableContext items={(cards[list.id] || []).map((c) => c.id)}> */}
                                                    <SortableContext
                                                        items={(cards[list.id] || []).map((card) => card.id)} // ⬅️ Hanya ID-nya aja ya
                                                    >
                                                        <div className="list-body">
                                                        {cards[list.id]?.map((card) => (
                                                            <SortableCardItem key={card.id} id={card} listId={list.id} data={{ type: "card", listId: list.id }} style={{borderRadius:'16px'}}>
                                                            {({ dragHandleCardProps }) => (
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
                                                                    cardsInList={cards[list.id] || []}
                                                                    boards={boards}
                                                                    lists={lists}
                                                                    listName={list.name}
                                                                    cardPositionDropdown={cardPositionDropdown}
                                                                    setCardPositionDropdown={setCardPositionDropdown}
                                                                    handleChangeCardPosition={handleChangeCardPosition}
                                                                    onDragStart={handleDragStart}
                                                                    onDragEnd={handleCardDragEnd}
                                                                    cardsByList={cardsByList}
                                                                    activeCard={activeCard}
                                                                    dragHandleCardProps={dragHandleCardProps}
                                                                />
                                                            )}
                                                            </SortableCardItem>
                                                        ))}
                                                        </div>
                                                    </SortableContext>
                                                {/* </DndContext> */}

                                            <div className="form-card-wrapper">
                                                <div className="form-card">
                                                    <div className="fc-cont" onClick={(e)=> handleShowForm(e, list.id)}>
                                                        <HiPlus/>
                                                        Add Card
                                                    </div>
                                                    <div className="card-count">
                                                    <p>{totalCard[list.id] || 0}</p> 
                                                    <div><HiOutlineCreditCard style={{marginRight:'5px'}}/></div>
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

                                )}                            
                            </SortableListItem>
                        ))}
                        {/* <div className="list-box">
                            <div className="list-box-content" onClick={handleShowListForm}>
                                <HiOutlinePlus className=''/>
                                CREATE A NEW LIST
                            </div>
                        </div> */}
                    </div>
                    

                </SortableContext>

                {/* 🪄 Ghost (Drag Overlay) */}
                    <DragOverlay className="dnd-kit-overlay">
                        {activeId ? (
                        <div
                            style={{
                            width: "280px",
                            background: "#f2faff",
                            borderRadius: "8px",
                            padding: "12px",
                            boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                            transform: "rotate(1deg)",
                            }}
                        >
                            <strong>
                            {lists.find((l) => l.id === activeId)?.name || "Dragging..."}
                            </strong>
                            <p
                            style={{
                                marginTop: "4px",
                                fontSize: "14px",
                                color: "#666",
                            }}
                            >
                            {lists.find((l) => l.id === activeId)?.description ||
                                "No description"}
                            </p>
                        </div>
                        ) : null}
                    </DragOverlay>
            </DndContext>
            
        </div>
    </div>
  )
}

export default BoardList

// PERBAIKI DELETE LIST ID, KARENA HANYA MENDELETE SATU DATA SAJA 