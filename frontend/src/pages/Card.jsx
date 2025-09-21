import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { deleteCard, getCardById, getCardByList,updateTitleCard , onCardMove, archiveCard, getCardPriority, getDueDateById, getAllDueDateByCardId, getStatusByCardId, getAllStatus, getStatusCard, getTotalMessageInCard, getTotalFile, getNotifications, patchReadNotification} from '../services/ApiServices';
import '../style/pages/Card.css'
import '../style/modules/BoxStatus.css'
import {    HiOutlineEllipsisHorizontal,
            HiOutlineChatBubbleLeftRight,
            HiOutlinePaperClip,
            HiOutlineClock,
            HiOutlineUsers,
            HiOutlineCreditCard,
            HiMiniArrowLeftStartOnRectangle,
            HiOutlineSquare2Stack,
            HiOutlineArchiveBox,
            HiOutlineTrash,
            HiMiniLightBulb,
            HiOutlineCheckCircle,
            HiMiniEye,
            HiMiniXCircle,
            HiCheckCircle,
            HiArrowUturnLeft
        } from 'react-icons/hi2';
import BootstrapTooltip from '../components/Tooltip';
import CoverCard from '../modules/CoverCard';
import CoverSelect from '../UI/CoverSelect';
import SelectedLabels from '../UI/SelectedLabels';
import SelectedLabelCard from '../UI/SelectedLabelCard';
import SelectPriority from '../UI/SelectPriority';
import CardDetail from '../pages/CardDetail'
import CardDetailPopup from '../hook/CardDetailPopup';
import StatusDisplay from '../UI/StatusDisplay';
import OutsideClick from '../hook/OutsideClick';
import DuplicateCard from '../fitur/DuplicateCard';
import MoveCard from '../fitur/MoveCard';
import CardMoveModal from '../modals/CardMoveModal';
import { useSnackbar } from '../context/Snackbar';
import CardDeleteConfirm from '../modals/CardDeleteConfirm';
import DueDateDisplay from '../UI/DueDateDisplay';
import CardDetailModals from '../modals/CardDetailModals';
import CardSelectedProperties from '../modules/CardSelectedProperties';
import CardCoverDisplay from '../modules/CardCoverDisplay';
import CardDueDateDisplay from '../modules/CardDueDateDisplay';
import CardFooter from '../modules/CardFooter';
import NewCardDetail from './NewCardDetail';
import { handleArchive } from '../utils/handleArchive';

const Card=({card,boards, lists,userId,listName, listId,fetchBoardDetail,fetchLists,fetchCardList,onRefetch})=> {
    // console.log('cards diterima:', card)
    const { workspaceId, boardId} = useParams();
    //DEBUG
    // console.log('workspace id:', workspaceId);
    // console.log('board id diterima pada file card', boardId)
    // console.log('list id diterima:', listId);
    console.log('File card menerima userId:', userId);
    console.log('File Card menerima list name:',listName)
    const [cardId, setCardId] = useState([]);
    //edit card
    const [editCardName, setEditCardName] = useState(null);
    const [newCardName, setNewCardName] = useState('')
    const [cardData, setCardData] = useState(card);
    const navigate = useNavigate();
    const [showDetail, setShowDetail] = useState(false)
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
    // total file 
    const [totalFile, setTotalFile] = useState(0);
    //state to create mark notif
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

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

    //navigate to newCardDetail
    const handleNavigateToCardDetail = () =>{
        navigate(`/layout/workspaces/${workspaceId}/board/${boardId}/lists/${listId}/cards/${card.id} `)
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

    //EDIT NAME CARD
    const handleEditCardName = (e, cardId, currentName) => {
        e.stopPropagation()
        setEditCardName(cardId)
        setNewCardName(currentName)
    }
    const handleSaveName = async(cardId)=>{
        try{
            await updateTitleCard(cardId, { title: newCardName.trim() });
            setCardData(prevCard => ({
                ...prevCard,
                title: newCardName
            }));
            setEditCardName(null);
            
        }catch(error){
            console.error('Error updating name card:', error)
        }
    }

    const handleKeyPressName = (e, cardId) =>{
        if(e.key === 'Enter'){
            handleSaveName(cardId)
            e.stopPropagation();
        }
    }

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
    const handleArchiveCard = (cardId)=>{
        handleArchive({
            entity:'cards',
            id: cardId,
            refetch: fetchCardList,
            showSnackbar: showSnackbar,
        })
    }
    // const handleArchiveCard = async(cardId)=>{
    //     console.log('Arciving card with id:', cardId)
    //     try{
    //         const response = await archiveCard(cardId)
    //         console.log('Card archiving successfully:', response.data)
    //         // fetchCardList(cardId)
    //         fetchCardList(listId)
    //         setShowSetting(false)
    //         showSnackbar('Card archived successfully','success')
    //     }catch(error){
    //         console.error('Error archiving cards:', error)
    //         showSnackbar('Failed to archive card', 'error')
    //     }
    // }

    //fungsi menampilkan icon 
    const ICON_STATUS = {
        Reviewed: <HiMiniEye/>,
        Approved:<HiCheckCircle/>,
        Rejected:<HiMiniXCircle/>,
        Returned: <HiArrowUturnLeft/>
    }


  return (
    <div className='card-box-container' >
     <div className='card-container'>
        <div className="cc-top-header">
            <div className="cctop-status">
                <CardSelectedProperties cardId={card.id}/>
                {currentStatus ?(
                    <div className='status-cont'>
                        <h5
                            style={{
                                backgroundColor:currentStatus.background_color,
                                color:currentStatus.text_color,
                            }}
                        >
                            {ICON_STATUS[currentStatus.status_name]}
                            {currentStatus.status_name}</h5>
                    </div>
                ):(
                    <div></div>
                )}
            </div>
            <BootstrapTooltip title='Card setting' placement='top'>
                <div className="cc-setting" onClick={(e)=> handleShowSetting(e, card.id)}>
                    <HiOutlineEllipsisHorizontal/> 
                </div>
            </BootstrapTooltip>

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
                    <button onClick={()=> handleArchiveCard(card.id)}>
                        <HiOutlineArchiveBox className='cs-icon'/>
                        Archive
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
                    <DuplicateCard cardId={card.id} boardId={boardId} listId={listId} workspaceId={workspaceId} onClose={()=> handleCloseDuplicate(card.id)} fetchCardList={fetchCardList}/>
                </div>
            )}

            {showMove[card.id]&&(
                <div className="card-move-modal">
                    <MoveCard cardId={card.id} currentBoardId={boardId} listId={listId} workspaceId={workspaceId} onClose={()=> handleCloseMove(card.id)}  fetchCardList={fetchCardList}/>
                </div>
            )}

        <div className="cc-cover">
            <div className="cc-cover">
                {/* <p>contoh cover</p> */}
                {/* <CoverSelect cardId={card.id}/> */}
                <CardCoverDisplay cardId={card.id}/>
                {/* <CoverCard cardId={card.id}/> */}
            </div>
        </div>
        <div className="cc-header-card">
            <div className="cc-title">
                {editCardName ? (
                    <input
                        type='text'
                        value={newCardName}
                        onChange={(e) => setNewCardName(e.target.value)}
                        onBlur={()=> handleSaveName(card.id)}
                        onKeyDown={(e)=> handleKeyPressName(e, card.id)}
                        autoFocus
                    />
                ):(
                    <h5 onClick={(e) => handleEditCardName(e, card.id, card.title)}>{cardData.title}</h5>
                )}
                {/* <h5>{card.title}</h5> */}
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
                <button onClick={handleNavigateToCardDetail}>View Detail</button>
            </div>
        </div>
        <div className="cfooter">
           <CardFooter cardId={card.id} totalFile={totalFile} unreadCount={getUnreadCountByCard(card.id)} notifications={notifications} handleMarkAsRead={handleMarkAsRead}/>
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
                />
            </div>
        </div>
    )}
    {/* {showDetail && (
    <div className="cc-detail">
        <div className="modal-overlay" onClick={handleShowDetail}> show</div>
        <div className="modal-content">
            <CardDetail cardId={card.id} onClose={handleClose} workspaceId={workspaceId} boardId={boardId} listId={listId} fetchCardList={fetchCardList}/>
         </div>
    </div>
    )} */}
    </div>
  )
}

export default Card