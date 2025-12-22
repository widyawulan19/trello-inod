import React, { useCallback, useEffect, useState } from 'react'
import '../style/pages/BoardList.css'
import { HiMiniListBullet,
        HiOutlineEllipsisHorizontal,
        HiOutlineSquare2Stack,
        HiOutlineArchiveBox,
        HiOutlineTrash,
        HiOutlineCreditCard,
        HiPlus,
        HiMiniArrowLeftStartOnRectangle,
        HiOutlineChevronRight,
         } from 'react-icons/hi2'

import { RiArchiveStackLine } from 'react-icons/ri'
import { FaPlus } from 'react-icons/fa'
import { deleteLists, duplicateBoards, getBoardById, getCardByList, getListByBoard, updateLists,updateCardPosition, reorderListPosition, getCardListTotal, reorderCards, getWorkspaceById, updateTitleCard } from '../services/ApiServices'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Card from './Card'
import OutsideClick from '../hook/OutsideClick'
import CreateCard from '../modules/CreateCard'
import BootstrapTooltip from '../components/Tooltip'
import FormNewLists from '../modules/FormNewLists'
import MoveList from '../fitur/MoveList'
import DuplicateList from '../fitur/DuplicateList'
import ListDeleteConfirm from '../modals/ListDeleteConfirm'
import { useSnackbar } from '../context/Snackbar'
import { useUser } from '../context/UserContext'
import { handleArchive } from '../utils/handleArchive'
import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core";

import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove
} from "@dnd-kit/sortable";

import SortableListItem from '../hook/SortableListItem'
import SortableCardItem from '../hook/SortableCardItem'


const BoardList=()=> {
 
    /* =======================
    1. routing & context
    ======================= */
    const location = useLocation();
    const navigate = useNavigate();
    const { boardId, workspaceId } = useParams();

    const { user } = useUser();
    const userId = user?.id;

    const { showSnackbar } = useSnackbar();

    /* =======================
   2.  DATA STATE
    ======================= */
    // board & workspace data
    const [boards, setBoards] = useState({});
    const [workspaceName, setWorkspaceName] = useState('');

    // list & card data
    const [lists, setLists] = useState([]);
    const [cardsByList, setCardsByList] = useState({});

    // metadata
    const [totalCard, setTotalCard] = useState({});



    /* =======================
    3. POSITION & ORDERING (DRAG / SORT)
    ======================= */

    // list & card ordering
    const [positions, setPositions] = useState({});
    const [listPositionDropdown, setListPositionDropdown] = useState(null);
    const [cardPositionDropdown, setCardPositionDropdown] = useState(null);

    // drag state
    const [activeId, setActiveId] = useState(null);     // list drag
    const [activeCard, setActiveCard] = useState(null); // card drag

    /* =======================
    4. UI VISIBILITY (DROPDOWN, FORM, SETTING)
    ======================= */
    // list ui
    const [showSetting, setShowSetting] = useState({});
    const [showForm, setShowForm] = useState({});
    const [showPosition, setShowPosition] = useState({});
    const [showListForm, setShowListForm] = useState(false);

    // outside click refs
    const settingRef = OutsideClick(() => setShowSetting(false));
    const formRef = OutsideClick(() => setShowForm(false));
    const listFormRef = OutsideClick(() => setShowListForm(false));

    /* =======================
    5. EDIT MODE (INLINE EDIT)
    ======================= */
    // edit list
    const [editName, setEditName] = useState(null);
    const [newName, setNewName] = useState('');

    // edit card
    const [editCardName, setEditCardName] = useState(null);
    const [newCardName, setNewCardName] = useState('');
    const [editingCardListId, setEditingCardListId] = useState(null);


    /* =======================
    6. POPUP & MODAL STATE
    ======================= */
    // card detail popup
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedCardId, setSelectedCardId] = useState(null);

    // list actions
    const [showMovePopup, setShowMovePopup] = useState({});
    const [showDuplicatePopup, setShowDuplicatePopup] = useState({});

    // delete confirmation
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedListId, setSelectedListId] = useState(null);

    // ========================================================
    const [listId, setListId] = useState([]);      // ❓ bisa derive dari lists
    const [cards, setCards] = useState({});       // ❌ sudah diganti cardsByList
    const [clickedListId, setClickedListId] = useState(null); // ❓ tidak terlihat dipakai


    
 /* =======================
 FUNCTION 
 ======================= */

/* =======================
1. UI TOGGLE SEDERHANA & AMAN
======================= */
/**
 * Toggle form pembuatan list baru
 * e.preventDefault dipakai karena handler ini sering dipanggil dari button / form
 */
const handleShowListForm = (e) => {
  e.preventDefault();
  setShowListForm(prev => !prev);
};

/**
 * Toggle form card (fallback global)
 * ⚠️ Catatan: lebih aman pakai versi berbasis listId (yang sudah kamu pakai)
 */
const handleShow = () => {
  setShowForm(prev => !prev);
};

/* =======================
2. TOTAL CARD PER LIST
======================= */
/* =======================
   FETCH TOTAL CARD PER LIST
   - Jalan setiap kali daftar list berubah
   - Menggunakan Promise.all agar paralel (lebih cepat)
======================= */
useEffect(() => {
  if (!lists.length) return;

  const fetchTotals = async () => {
    try {
      const results = await Promise.all(
        lists.map(async (list) => {
          try {
            const res = await getCardListTotal(list.id);
            return { listId: list.id, total: res.data.card_count || 0 };
          } catch {
            return { listId: list.id, total: 0 };
          }
        })
      );

      // Convert array → object { [listId]: total }
      const totalsMap = results.reduce((acc, item) => {
        acc[item.listId] = item.total;
        return acc;
      }, {});

      setTotalCard(totalsMap);
    } catch (err) {
      console.error("Failed fetching card totals:", err);
    }
  };

  fetchTotals();
}, [lists]);

/* =======================
3. MOVE & DUPLICATE POPUP
======================= */
    /**
     * Toggle popup Move List
     * - Menggunakan object berbasis listId agar popup independen
     * - Tutup setting menu supaya UI bersih
     */
    const handleShowMovePopup = (listId) => {
    setShowMovePopup(prev => ({
        ...prev,
        [listId]: !prev[listId],
    }));
    setShowSetting(false);
    };

    const handleCloseMovePopup = (listId) => {
    setShowMovePopup(prev => ({
        ...prev,
        [listId]: false,
    }));
    };

    /**
     * Toggle popup Duplicate List
     */
    const handleShowDuplicate = (listId) => {
    setShowDuplicatePopup(prev => ({
        ...prev,
        [listId]: !prev[listId],
    }));
    setShowSetting(false);
    };

    const handleCloseDuplicate = (listId) => {
    setShowDuplicatePopup(prev => ({
        ...prev,
        [listId]: false,
    }));
    };

/* =======================
4. CARD DETAIL POPUP
======================= */

/**
 * Buka popup detail card
 * - Simpan cardId yang aktif
 */
const handleOpenPopup = (cardId) => {
  setSelectedCardId(cardId);
  setIsPopupOpen(true);
};

/**
 * Tutup popup & reset state
 */
const handleClosePopup = () => {
  setIsPopupOpen(false);
  setSelectedCardId(null);
};

/* =======================
   FETCH BOARD DETAIL
======================= */
const fetchBoardDetail = async () => {
  if (!boardId) return;

  try {
    const response = await getBoardById(boardId);
    setBoards(response.data);
  } catch {
    console.error("Failed fetching board data");
  }
};

useEffect(() => {
  fetchBoardDetail();
}, [boardId]);

/* =======================
   FETCH LISTS
   - Return data agar bisa dipakai chaining
======================= */
const fetchLists = useCallback(async () => {
  const res = await getListByBoard(boardId);
  setLists(res.data);
  return res.data;
}, [boardId]);

/* =======================
   FETCH CARDS PER LIST
======================= */
// const fetchCardList = useCallback(async (listId) => {
//   try {
//     const res = await getCardByList(listId);
//     setCards(prev => ({
//       ...prev,
//       [listId]: res.data,
//     }));
//     return res.data;
//   } catch (err) {
//     console.error("Failed fetching cards:", err);
//   }
// }, []);

const fetchCardList = useCallback(async (listId) => {
  try {
    const res = await getCardByList(listId);

    // 🔥 PAKSA ARRAY BARU → trigger rerender
    const freshCards = [...res.data];

    setCards(prev => ({
      ...prev,
      [listId]: freshCards,
    }));

    return freshCards;
  } catch (err) {
    console.error("Failed fetching cards:", err);
  }
}, []);


/* =======================
   LOAD BOARD (LIST + CARD)
======================= */
useEffect(() => {
  if (!boardId) return;

  const loadBoard = async () => {
    const listsData = await fetchLists();
    await Promise.all(
      listsData.map(list => fetchCardList(list.id))
    );
  };

  loadBoard();
}, [boardId, fetchLists, fetchCardList]);

/* =======================
7. REFETCH BOARD
======================= */

/**
 * Refetch seluruh board (list + card)
 * Digunakan setelah edit besar (archive, move, dsb)
 */
const handleRefetchBoard = async () => {
  const listsData = await fetchLists();
  await Promise.all(
    listsData.map(list => fetchCardList(list.id))
  );
};

const handleRefetchCard = async (listId) => {
  if (!listId) return;
  await fetchCardList(listId);
};

/* =======================
8. CREATE LIST & CARD
======================= */

/**
 * Setelah card dibuat:
 * - Update state lokal
 * - Fetch ulang card di list tersebut
 */
const handleCardCreated = (newCard) => {
  setCards(prev => ({
    ...prev,
    [newCard.list_id]: [
      ...(prev[newCard.list_id] || []),
      newCard,
    ],
  }));

  fetchCardList(newCard.list_id);
  setShowForm(false);
};



// ============================================
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

    //fungsi editing card name
    const handleEditCardName = (e, cardId, currentName) => {
            e.preventDefault();
            e.stopPropagation();
    
            setEditCardName(cardId);
              setEditingCardListId(listId); 
            setNewCardName(currentName);
        };
    
        const handleSaveCardName = async (cardId) => {
  const title = newCardName.trim();
  if (!title) return;

  try {
    await updateTitleCard(cardId, { title });

    // 🔥 optimistic update (langsung update UI)
    setCards(prev => ({
      ...prev,
      [editingCardListId]: prev[editingCardListId].map(card =>
        card.id === cardId ? { ...card, title } : card
      ),
    }));

    // optional: sync ke backend (kalau mau super aman)
    // await fetchCardList(editingCardListId);

    setEditCardName(null);
    setEditingCardListId(null);

    showSnackbar("success editing title", "success");
  } catch (error) {
    console.error("Error updating name card:", error);
  }
};

    
    
    
        const handleKeyPressCardName = (e, cardId) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSaveName(cardId);
            }
    
            if (e.key === 'Escape') {
                setEditCardName(null);
            }
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
        userId: userId,
        refetch:fetchLists,
        showSnackbar: showSnackbar,
    })
}


    //ARCHIVE ALL CARD DALAM LIST
    const handleArchiveAllCards = async (listId) => {
        try {
            // 1. Ambil semua card di list ini
            const cards = await fetchCardList(listId);

            if (!cards || cards.length === 0) {
            showSnackbar("No cards to archive in this list", "info");
            return;
            }

            // 2. Archive satu-satu
            for (const card of cards) {
            await handleArchive({
                entity: 'cards',
                id: card.id,
                userId,
                showSnackbar: () => {}, // supaya snackbar ga spam
            });
            }

            // 3. Setelah selesai → refresh
            fetchCardList(listId);
            showSnackbar("All cards in this list have been archived", "success");

        } catch (error) {
            console.error("Error archiving all cards:", error);
            showSnackbar("Failed to archive cards in this list", "error");
        }
    };



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


// 🔥 Simpan posisi scroll sebelum pindah ke Card Detail
  const handleNavigateToCard = (listId, cardId) => {
    const container = document.querySelector('.bl-body');
    if (container) {
      sessionStorage.setItem(`boardScroll-${boardId}`, container.scrollLeft);
    }
    navigate(`/layout/workspaces/${workspaceId}/board/${boardId}/lists/${listId}/cards/${cardId}`);
  };

  // 🧠 Restore posisi scroll setelah data list siap
useEffect(() => {
  if (!lists || lists.length === 0) return;

  const savedScroll = sessionStorage.getItem(`boardScroll-${boardId}`);
  if (!savedScroll) return;

  // delay agak lama dikit buat pastiin DOM udah ready
  const timeout = setTimeout(() => {
    const container = document.querySelector('.bl-body');
    if (container) {
      container.scrollLeft = parseInt(savedScroll, 10);
    }
  }, 300); // bisa disesuaikan

  return () => clearTimeout(timeout);
}, [lists, boardId]);



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
// =====================================================


/* =======================
NAVIGATION
======================= */

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
                <h4 className='back' onClick={()=>handleNavigateToWorkspace(workspaceId)}>ALL BOARD</h4>
                <HiOutlineChevronRight className='back-icon'/>
                <h4 className='ellipsis-text'>{boards.name} [BOARD]</h4>
                <HiOutlineChevronRight className='back-icon'/>
                <h4 className='page'>BOARD LISTS</h4>
            </div>
            <div className="more-action">
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
                                                        <button onClick={() => handleArchiveAllCards(list.id)}>
                                                            <RiArchiveStackLine className='cs-icon'/>
                                                            Archive all cards
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
                                                            <SortableCardItem key={card.id} id={card.id} listId={list.id} data={{ type: "card", listId: list.id }} style={{borderRadius:'16px'}}>
                                                            {({ dragHandleCardProps }) => (
                                                                <Card
                                                                    // key={card.id} 
                                                                    key={`${card.id}-${card.title}`} 
                                                                    userId={userId}
                                                                    card={card} 
                                                                    cardId={card.id}
                                                                    listId={list.id}
                                                                    handleNavigate = {()=>handleNavigateToBoard(workspaceId, boardId)} 
                                                                    onClick={() => handleOpenPopup(card.id)}
                                                                    onRefetch={handleRefetchBoard}
                                                                    onRefetchCard={handleRefetchCard}
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
                                                                    onNavigateToCard={handleNavigateToCard}   
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