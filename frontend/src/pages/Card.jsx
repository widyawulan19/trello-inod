import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { RxSwitch } from "react-icons/rx";
import { deleteCard,updateTitleCard , getStatusCard,  getTotalFile, getNotifications, patchReadNotification,checkHasNewChat, getTotalChecklistItemByCardId, getChecklistItemChecked, updateCardActive, updateToggleShow, updateTitleCardTesting} from '../services/ApiServices';
import '../style/pages/Card.css'
import '../style/modules/BoxStatus.css'
import {    HiOutlineEllipsisHorizontal,
            HiMiniArrowLeftStartOnRectangle,
            HiOutlineSquare2Stack,
            HiOutlineArchiveBox,
            HiOutlineTrash,
            HiMiniEye,
            HiMiniXCircle,
            HiCheckCircle,
            HiArrowUturnLeft,
        } from 'react-icons/hi2';
import { GiCardExchange } from "react-icons/gi";
import BootstrapTooltip from '../components/Tooltip';
import SelectedLabelCard from '../UI/SelectedLabelCard';
import OutsideClick from '../hook/OutsideClick';
import DuplicateCard from '../fitur/DuplicateCard';
import MoveCard from '../fitur/MoveCard';
import { useSnackbar } from '../context/Snackbar';
import CardDeleteConfirm from '../modals/CardDeleteConfirm';
import CardSelectedProperties from '../modules/CardSelectedProperties';
import CardCoverDisplay from '../modules/CardCoverDisplay';
import CardDueDateDisplay from '../modules/CardDueDateDisplay';
import CardFooter from '../modules/CardFooter';
import NewCardDetail from './NewCardDetail';
import { handleArchive } from '../utils/handleArchive';
import {
  DndContext,
  closestCenter,
  closestCorners,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { BsCreditCard2FrontFill } from 'react-icons/bs';
import ToggleSwitch from '../fitur/ToggleSwitch';
import StatusBadge from '../fitur/StatusBadge';
import ToggleSwitchBox from '../fitur/ToggleSwitchBox';

const Card=({
    card,
    userId,
    listName,
    listId,
    fetchBoardDetail,
    fetchLists,
    fetchCardList,
    onRefetch,
    cardsInList,
    cardPositionDropdown,
    setCardPositionDropdown,
    handleChangeCardPosition,
    dragHandleCardProps,
    onNavigateToCard,
})=> {
    const { workspaceId, boardId} = useParams();
    console.log('File card menerima userId:', userId);
    console.log('File Card menerima list name:',listName)
    //edit card
    const [editingId, setEditingId] = useState(null);
    const [newTitle, setNewTitle] = useState("");

    const [cardData, setCardData] = useState(card);
    const navigate = useNavigate();
    const [showDetail, setShowDetail] = useState(false)
    const [cardTitle, setCardTitle] = useState(card.title);

    //show
    const [showSetting, setShowSetting] = useState({})
    const settingRef = OutsideClick(()=>setShowSetting(false))
    //show duplicate and move
    const [showDuplicate, setShowDuplicate] = useState(false)
    const [showMove, setShowMove] = useState(false)
    //modals
    const [showModal,setShowModal] = useState(false)
    //delete confirm
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [selectedCardId, setSelectedCardId] = useState(null)
    //alert
    const {showSnackbar} = useSnackbar();
    //card status
    const [currentStatus, setCurrentStatus] = useState(null);
    const [allStatuses, setAllStatuses] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('')
    console.log('file card diterima cardID:', card);
    //checklist state
    const [checklistTotal, setChecklistTotal] = useState(0);
    const [checkChecklist, setChecklist] = useState(0);
    const [loading, setLoading] = useState(false);
    // total file 
    const [totalFile, setTotalFile] = useState(0);
    //state to create mark notif
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [hasNewChat, setHasNewChat] = useState(false);

    // dorpwon card position 
    const [showPosition, setShowPosition] = useState(false);

    useEffect(() => {
    if (!card?.id || !userId) return;

    const fetchNewChat = async () => {
        try {
        const res = await checkHasNewChat(card.id, userId);
        setHasNewChat(res.data.hasNewChat);
        } catch (err) {
            if (err.response?.status !== 404) {
                console.error("Error checking new chat:", err);
            }
        //   console.error("Error checking new chat:", err);
        }
    };

    fetchNewChat();
    const interval = setInterval(fetchNewChat, 10000);
    return () => clearInterval(interval);
    }, [card.id, userId]);


    // SYNK CARD 
    useEffect(() => {
        setCardData(card);
    }, [card]);

    // FUNGSI ON OFF CARDS 
    const toggleActive = async () => {
        await updateCardActive(card.id, !card.is_active);
        fetchCardList(listId);
        showSnackbar('toggle active', 'success');
    };


    //FUNCTION GET MARK NOTIFICATION
      const fetchNotifications = async () => {
        try {
          const res = await getNotifications(userId);
          setNotifications(res.data);
    
          // hitung unread
          const unread = res.data.filter((n) => !n.is_read).length;
          setUnreadCount(unread);
        } catch (err) {
          console.error("Error fetch notifications:", err);
        }
      };
    
      // Tandai notif sudah dibaca
      const handleMarkAsRead = async (notifId) => {
        try {
          await patchReadNotification(notifId);
          fetchNotifications(); // refresh notif
        } catch (err) {
          console.error("Error mark as read:", err);
        }
      };

      const getUnreadCountByCard = (cardId) => {
            return notifications.filter(
                (n) => !n.is_read && n.card_id === cardId // pastikan notif ada card_id
            ).length;
        };
    
      useEffect(() => {
        fetchNotifications();
    
        // optional polling setiap 10 detik
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
      }, []);

    //FUNCTION STATUS CARD
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                if (card?.id) { // pastikan card dan id ada
                    const response = await getStatusCard(card.id); // <== pakai card.id
                    if (response.data.length > 0) {
                        setCurrentStatus(response.data[0]);
                    }
                }
            } catch (error) {
                console.error('Gagal mengambil status:', error);
            }
        };
    
        fetchStatus();
    }, [card.id]);
    

    // FECT TOTAL FILE 
    const fetchTotalFile = async()=>{
        try{
            const result = await getTotalFile(card.id);
            setTotalFile(result.data.total_files)
        }catch(error){
            console.error('Error fetching total file:', error)
        }
    }
   useEffect(() => {
    if (card.id) {
        fetchTotalFile();
    }
    }, [card.id]);

    console.log('total file:', totalFile);



    //FUNCTION SHOW SETTING
    const handleShowSetting = (e, cardId) =>{
        e.stopPropagation()
        setShowSetting((prev) => ({
            ...prev,
            [cardId]: !prev[cardId],
        }))
    }
    

    const handleShowModal = () =>{
        setShowModal(!showModal)
        console.log(' 📍Show modal berhasil di klik')
    }
    const handleCloseModal = () => {
        onRefetch();
        showSnackbar('Card detail berhasil di tutup','success')
        setShowModal(false);
        navigate(0);
      };
    
    const handleShowDetail = () =>{
        setShowDetail(!showDetail)
    }
    const handleClose = () => {
        setShowDetail(false);
        // if (onCardMoved) onCardMoved();
        // fetchCardList(listId); 
        console.log('card detail berhasil di tutup dan list id yang diterima:', listId)
      };

    //FUNCTION DUPLICATE AND MOVE
    const handleDuplicateCard = (cardId)=>{
        setShowDuplicate((prevState) => ({
            ...prevState,
            [cardId]: !prevState[cardId],  // Toggle true/false untuk board tersebut
        }));
        setShowSetting(false)
    }
    const handleCloseDuplicate = (cardId)=>{
        setShowDuplicate((prevState)=>({
            ...prevState,
              [cardId]: false,
          }))
    }
    const handleMoveCard = (cardId)=>{
        setShowMove((prevState) => ({
            ...prevState,
            [cardId]: !prevState[cardId],  // Toggle true/false untuk board tersebut
        }));
        setShowSetting(false)
    }
    const handleCloseMove = (cardId) =>{
        setShowMove((prevState)=>({
            ...prevState,
              [cardId]: false,
          }))
    }

    
    /* =======================
    //EDIT NAME CARD
    ======================= */
    
const handleEditCardName = (e) => {
  e.stopPropagation();
  setEditingId(card.id);
  setNewTitle(card.title);
};

const handleSaveTitle = async () => {
  const title = newTitle.trim();

  if (!title || title === card.title) {
    setEditingId(null);
    return;
  }

  try {
    await updateTitleCardTesting(card.id, userId, { title });

    // 🔥 trigger parent refresh
    await fetchCardList(listId);

    setEditingId(null);
    showSnackbar("Title card berhasil diupdate", "success");
  } catch (err) {
    console.error("UPDATE TITLE ERROR:", err);
    showSnackbar("Gagal update title card", "error");
  }
};

const handleKeyDown = (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleSaveTitle();
  }

  if (e.key === "Escape") {
    setEditingId(null);
  }
};



    //fungsi delete card
    const handleDeleteClick = (cardId) =>{
        setSelectedCardId(cardId)
        setShowDeleteConfirm(true)
        setShowSetting(false)
    }

    const confirmDelete = async ()=>{
        try{
            console.log('Deleting Card with ID:', selectedCardId)
            const response = await deleteCard(selectedCardId);
            showSnackbar('Card deleted successfully','success')
            console.log('Delete card success', response.data)
            fetchCardList(listId)
        }catch(error){
            showSnackbar('Failed to delete card', 'error')
            console.log('Error deleting card:', error)
        }finally{
            setShowDeleteConfirm(false)
            setSelectedCardId(null);
        }
    }

    const cancleDeleteCard = () =>{
        setShowDeleteConfirm(false)
        setSelectedCardId(null)
    }

    //archive card
    const handleArchiveCard = (cardId) => {
        handleArchive({
            entity: 'cards',
            id: cardId,
            userId: userId,
            refetch: fetchCardList,
            showSnackbar,
    });
    };


    // fungsi show toggle on off card 
    const toggleShowToggle = async (cardId, value, listId) => {
        await updateToggleShow(cardId, value); 
        fetchCardList(listId);
        setShowSetting(false)
    };



    //fungsi menampilkan icon 
    const ICON_STATUS = {
        Reviewed: <HiMiniEye/>,
        Approved:<HiCheckCircle/>,
        Rejected:<HiMiniXCircle/>,
        Returned: <HiArrowUturnLeft/>
    }

    const handleShowPosition = () =>{
        setShowPosition(!showPosition)
    }

    //function checklist
    const fetchTotalChecklist = async()=>{
        try{
            const response = await getTotalChecklistItemByCardId(card.id);
            setChecklistTotal(response.data);
        }catch(error){
            console.log('Error fetching total checklist!', error)
            setChecklistTotal(0);
        }finally{
            setLoading(false);
        }
    }

    //function fetch checklist already checklist
    const fetchChecklist = async() =>{
        try{
            const response = await getChecklistItemChecked(card.id);
            setChecklist(response.data);
        }catch(error){
            setChecklist(0)
        }finally{
            setLoading(false);
        }
    }

     useEffect(()=>{
        if(card.id){
            fetchTotalChecklist();
            fetchChecklist();
        }
    },[card.id])



  return (
    <div className='card-box-container' >
     <div className='card-container'>
        <div className="cc-top-header">
            <div className="cctop-status">
                <div className="cctop-icon" {...dragHandleCardProps}>
                    {/* <HiOutlineCreditCard /> */}
                    <BsCreditCard2FrontFill className='mini-cctop'/>
                </div>
                <CardSelectedProperties cardId={card.id}/>
                {currentStatus && (
                <div className="status-cont" >
                    <StatusBadge
                    statusName={currentStatus.status_name}
                    size="sm"
                    />
                </div>
                )}
            </div>
            <div className="toogle-cont">
                {/* ToggleSwitch hanya muncul ketika show_toggle = true */}
                {/* {card.show_toggle && (
                    <ToggleSwitch
                    active={card.is_active}
                    onToggle={() => toggleActive(card.id, !card.is_active)}
                    />
                )} */}

                <BootstrapTooltip title='Card setting' placement='top'>
                    <div className="cc-setting" onClick={(e)=> handleShowSetting(e, card.id)}>
                        <HiOutlineEllipsisHorizontal/> 
                    </div>
                </BootstrapTooltip>
            </div>
            

            {showSetting[card.id] && (
                <div className="card-setting" ref={settingRef}>
                    <button onClick={()=> handleMoveCard(card.id)}>
                        <HiMiniArrowLeftStartOnRectangle className='cs-icon'/>
                        Move
                    </button>
                    <button onClick={()=> handleDuplicateCard(card.id)}>
                        <HiOutlineSquare2Stack className='cs-icon'/>
                        Duplicate
                    </button>
                    <button
                        onClick={() => setCardPositionDropdown(cardPositionDropdown === card.id ? null : card.id)}
                        className="relative"
                        >
                        <GiCardExchange className='cs-icon' />
                        Card Position
                        {/* Card Position <span style={{color:'red', marginLeft:'5px'}}>"{card.position}"</span> */}

                        {cardPositionDropdown === card.id && (
                            <div className="position-modals">
                                <div className="ph">
                                    <p>Select Position</p>
                                </div>
                                <div className="pb">
                                <ul>
                                    {(cardsInList || []).map((_, i) => (
                                    <li
                                        key={i}
                                        onClick={(e) => {
                                        e.stopPropagation();
                                        handleChangeCardPosition(card.id, i);
                                        }}
                                    >
                                        {i}
                                    </li>
                                    ))}
                                </ul>
                                </div>
                                
                            </div>
                        )}
                        </button>
                    <button onClick={()=> handleArchiveCard(card.id)}>
                        <HiOutlineArchiveBox className='cs-icon'/>
                        Archive
                    </button>
                    
                    <button onClick={() => toggleShowToggle(card.id, !card.show_toggle, card.list_id)}>
                        <RxSwitch className='cs-icon'/>
                        {card.show_toggle ? "Hide On/Off" : "Show On/Off"}
                    </button>
                    <button onClick={()=> handleDeleteClick(card.id)} className="flex items-center gap-1 text-red-500 hover:text-red-700">
                        <HiOutlineTrash className='cs-delete'/>
                        Delete
                    </button>
                </div>
            )}
        </div>
            <CardDeleteConfirm
                isOpen={showDeleteConfirm}
                cardId={card.id}
                onConfirm={confirmDelete}
                onCancle={cancleDeleteCard}
                cardName ={card.title}
            />
            {showDuplicate[card.id] && (
                <div className="card-move-modal">
                    <DuplicateCard 
                        userId= {userId}
                        cardId={card.id} 
                        boardId={boardId} 
                        listId={listId} 
                        workspaceId={workspaceId} 
                        onClose={()=> handleCloseDuplicate(card.id)} 
                        fetchCardList={fetchCardList}
                    />
                </div>
            )}

            {showMove[card.id]&&(
                <div className="card-move-modal">
                    <MoveCard 
                        cardId={card.id} 
                        boardId={boardId} 
                        listId={listId} 
                        workspaceId={workspaceId} 
                        onClose={()=> handleCloseMove(card.id)}  
                        fetchCardList={fetchCardList}
                        fetchLists={fetchLists}
                        fetchBoardDetail={fetchBoardDetail}
                        onRefetch={onRefetch}
                    />
                </div>
            )}

        <div className="cc-toggle">
            <div className="cc-toggle-box">
                {card.show_toggle && (
                    <ToggleSwitchBox
                        active={card.is_active}
                        onToggle={() => toggleActive(card.id, !card.is_active)}
                    />
                )}
            </div>
        </div>
        <div className="cc-cover">
            <div className="cc-cover">
                <CardCoverDisplay cardId={card.id}/>
            </div>
        </div>
        <div className="cc-header-card">
            <div className="cc-title">
                {editingId === card.id ? (
                    <input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => setEditingId(null)} // cancel only
                    autoFocus
                    />
                ) : (
                    <h5 onClick={handleEditCardName}>
                    {card.title}
                    </h5>
                )}
            </div>
        </div>
        <div className="cc-label">
            <SelectedLabelCard cardId={card.id} />
        </div>
        <div className="cc-body">
            {card.description ? (
                <div
                className={card.description.trim() ? "p-full" : "p-empty"}
                dangerouslySetInnerHTML={{ __html: card.description }}
                />
            ) : (
                <p className="p-empty">(no description)</p>
            )}
        </div>
        <div className="cc-footer">
            <div className="left">
                <div className="left1">
                    <div className="due-card">
                        <CardDueDateDisplay cardId={card.id}/>
                    </div>
                </div>
            </div>
            <div className="member">
                <button 
                    // onClick={handleNavigateToCardDetail}
                    onClick={() => onNavigateToCard(listId, card.id)}
                    >
                    View Detail
                </button>
            </div>
        </div>
        <div className="cfooter">
           <CardFooter 
                cardId={card.id} 
                totalFile={totalFile} 
                unreadCount={getUnreadCountByCard(card.id)} 
                notifications={notifications} 
                handleMarkAsRead={handleMarkAsRead} 
                hasNewChat={hasNewChat}
                checkChecklist={checkChecklist}
                checklistTotal={checklistTotal}
                // totalMedia={totalMedia}
                // hasNewChat={newChatMarks[card.id] || false}
            />
        </div>
       {/* {card.title} */}
    </div>
    {showModal && (
        <div className='dc-modal'>
            <div className="dcm-conten">
                <NewCardDetail
                     userId={userId}
                     cardId={card.id} 
                     onClose={handleCloseModal} 
                     workspaceId={workspaceId} 
                     boardId={boardId} 
                     listId={listId} 
                     fetchBoardDetail={fetchBoardDetail}
                     fetchLists={fetchLists}
                     fetchCardList={fetchCardList}
                     listName={listName}
                     checkChecklist={checkChecklist}
                     checklistTotal={checklistTotal}
                     //confirm delete
                     onDeleteClick={handleDeleteClick}
                     isOpen={showDeleteConfirm}
                     onConfirm={confirmDelete}
                     onCancle={cancleDeleteCard}
                     cardName ={card.title}
                     //archive

                />
            </div>
        </div>
    )}
    </div>
  )
}

export default Card