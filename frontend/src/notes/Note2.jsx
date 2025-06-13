import React, { useEffect, useState } from 'react'
import { FiUsers } from "react-icons/fi";
import { HiCog8Tooth, HiMiniArrowLeftStartOnRectangle, HiMiniChatBubbleLeftRight, HiMiniListBullet, HiMiniPhoto, HiOutlineArchiveBox, HiOutlineArrowsPointingOut, HiOutlineCalendar, HiOutlineChevronRight, HiOutlineCreditCard, HiOutlineListBullet, HiOutlineSquare2Stack, HiOutlineTrash, HiPaperClip, HiPlus, HiTag, HiXMark } from 'react-icons/hi2';
import { useNavigate, useParams } from 'react-router-dom'
import '../style/pages/NewCardDetail.css'
import BootstrapTooltip from '../components/Tooltip';
import { AiOutlineLineChart } from 'react-icons/ai';
import { archiveCard, deleteUserFromCard, getAllCardUsers, getAllDueDateByCardId, getAllStatus, getAllUserAssignToCard, getCardById, getCardPriority, getCoverByCard, getLabelByCard, getListById, getStatusByCardId, updateTitleCard } from '../services/ApiServices';
import SelectedLabels from '../UI/SelectedLabels';
import CardDetailPanel from '../modules/CardDetailPanel';
import DetailCard from '../modules/DetailCard';
import Checklist from '../modules/Checklist';
import CardActivity from '../modules/CardActivity';
import CoverSelect from '../UI/CoverSelect';
import CoverCard from '../modules/CoverCard';
import { IoCloudUpload, IoCloudUploadOutline } from 'react-icons/io5';
import CardAssignedUsers from '../modules/CardAssignedUsers';
import CardAssigment from '../modules/CardAssigment';
import { useSnackbar } from '../context/Snackbar';
import DuplicateCard from '../fitur/DuplicateCard';
import CardDetailDuplicate from '../fitur/CardDetailDuplicate';
import MoveCard from '../fitur/MoveCard';
import CardDetailMove from '../fitur/CardDetailMove';
import RoomCardChat from '../fitur/RoomCardChat';
import { useUser } from '../context/UserContext';
import Label from '../modules/Label';
import DetailOrder from '../modules/DetailOrder';
import OutsideClick from '../hook/OutsideClick';

const NewCardDetail=()=> {
    //STATE
    const {user} = useUser();
    const userId = user.id;
    const {workspaceId, boardId, listId, cardId} = useParams();
    const navigate = useNavigate();
    const {showSnackbar} = useSnackbar();
    const [layoutOpen, setLayoutOpen] = useState(false);
    const [cards, setCards] = useState({});
    const [activeTab, setActiveTab] = useState('Detail')
    //EDIT CARD TITLE
    const [editingTitle, setEditingTitle] = useState(null)
    const [newTitle, setNewTitle] = useState('')
    //LABEL
    const [labels, setLabels] = useState([]);
    const [selectedProperties, setSelectedProperties] = useState([]);
    const [showLabel, setShowLabel] = useState(false);
    //LIST
    const [listName, setListName] = useState('');
    //STATUS
    const [currentStatus, setCurrentStatus] = useState(null)
    const [allStatuses, setAllStatuses] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('')
    //PRIORITY
    const [selectedPriority, setSelectedPriority] = useState(null)
    //DUE DATE
    const [dueDates, setDueDates] = useState([])
    const [selectedDate, setSelectedDate] = useState(null)
    const [selectedDueDateId, setSelectedDueDateId] = useState(null);
    const [loading, setLoading] = useState(false);
    //COVER
    const [selectedCover, setSelectedCover] = useState(null)
    const [showCover, setShowCover] = useState(false)
    //ASIIGMENT 
    const [assignedUsers, setAssignedUsers] = useState([]);
    const [assignableUsers, setAssignableUsers] = useState([]);
    const [showAssigment, setShowAssigment] = useState(false);
    //DUPLICATE AND MOVE
    const [showDuplicate, setShowDuplicate] = useState(false)
    const [showMove, setShowMove] = useState(false)
    //SHOW ACTION/SETTING CARD
    const [showAction, setShowAction] = useState(false);
    const refShowAction = OutsideClick(()=>setShowAction(false));

    //DEBUG
    // console.log('file new card detail menerima workspaceId:', workspaceId);
    // console.log('file new card detail menerima cardId:', cardId);
    // console.log('File new card menerima data user Id:', userId);
    // console.log('file new card detail menerima list name:', listName);
    // console.log('file new card menerima card:', cards)

    //FUNCTION
    //1. fetch Card by id
        const fetchCardById = async(cardId)=>{
            if(!cardId){
                console.warn('Card Id is invalid')
                return;
            }

            try {
              console.log('FetchCardById menerima cardId', cardId);
              const response = await getCardById(cardId);
              setCards(response.data);
            } catch (error) {
              console.error('Failed fetch card data:', error);
            }
        } 

        useEffect(()=>{
            if (cardId) {
                fetchCardById(cardId);
            }
        },[cardId])
    //2. edit card title
        const handleEditingTitle = (e, cardId, currentCardTitle) =>{
          console.log('HandleEdit title triggered', {cardId, currentCardTitle});
          if(!cardId){
            console.log('cardId tidak ada')
            return;
          }
          e.stopPropagation();
          setEditingTitle(cardId);
          setNewTitle(currentCardTitle);
        }
    
        const handleSaveTitle = async(cardId)=>{
          try{
            await updateTitleCard(cardId, {title:newTitle})
            setEditingTitle(null);
            fetchCardById(cardId)
          }catch(error){
            console.error('Error updating card title:', error)
          }
        }
    
        const handleKeyPressTitle = (e, cardId) =>{
          if(e.key === 'Enter'){
            handleSaveTitle(cardId)
            e.stopPropagation();
          }
        } 

    //3. fetch label
        const fetchLabels = async () =>{
          try{
            const response = await getLabelByCard(cardId)
            setLabels(response.data)
            fetchCardById(cardId)
          }catch(error){
            console.error('Error fetching label:', error)
          }
        }
        useEffect(()=>{
          if(cardId) fetchLabels()
        },[cardId])

    //4. function time 
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
      
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
      
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
      
        return `${day}/${month}/${year} | ${hours}.${minutes}`;
    };

    //5. fetch list untuk mendapatkan list name
    useEffect(() => {
        const fetchListName = async () => {
          try {
            const response = await getListById(listId); // kamu harus punya service ini
            setListName(response.data.name);
          } catch (error) {
            console.error("Failed to fetch list name", error);
          }
        };
      
        if (listId) fetchListName();
      }, [listId]);
      
    //6. fetch Card status
    const fetchCardStatus = async() =>{
        try{
            const response = await getStatusByCardId(cardId);
            if(response.data.length > 0){
                setCurrentStatus(response.data[0]);
                setSelectedStatus(response.data[0].status_id);
            }
        }catch(error){
            console.error('Gagal mengambil status kartu:', error);
        }
    };

    //7. fetch all status
    const fetchAllStatuses = async () =>{
        try{
            const response = await getAllStatus();
            setAllStatuses(response.data);
        }catch(error){
            console.error('Gagal mengambil daftar status:', error)
        }
    }
    useEffect(() => {
        fetchCardStatus();
        fetchAllStatuses();
    }, [cardId]);

    //8. fetch card priority
    const fetchPriority = async() =>{
        try{
            const result = await getCardPriority(cardId);
            setSelectedPriority(result.data[0] || null)
        }catch(error){
            console.error('Error get card priority:', error);
        }
    }

    useEffect(()=>{
        fetchPriority();
    },[cardId])

    
    //9. fetchCardCover
    const fetchCardCover = async ()=>{
        try{
          const response = await getCoverByCard(cardId);
          if(response.data.length > 0){
            setSelectedCover(response.data[0]);
          }else{
            setSelectedCover(null);
          }
        }catch(error){
          console.error('Error fetch card cover:', error)
        }
    }
     useEffect(()=>{
          fetchCardCover()
        },[cardId])

    //10. fetch DUE DATE
    const fetchDueDates = async()=>{
        try{
            setLoading(true);
            const response = await getAllDueDateByCardId(cardId)
            console.log('Fetching due date data:', response.data)

            if (response.data.length > 0) {
                setDueDates(response.data);
                setSelectedDate(new Date(response.data[0].due_date));
                setSelectedDueDateId(response.data[0].id);
              } else {
                setDueDates([]);
                setSelectedDate(null);
                setSelectedDueDateId(null);
              }
        }catch(error){
            console.error('Error fetching due dates:', error);
        }finally{
            setLoading(false)
        }
    }

    useEffect(()=>{
        fetchDueDates();
    },[cardId])

    //11. FETCH ASSIGMENT
    const fetchAssignedUsers = async()=>{
        const response = await getAllCardUsers(cardId)
        setAssignedUsers(response.data)
    }
    const fetchAssignableUsers = async()=>{
        const response = await getAllUserAssignToCard(cardId)
        setAssignableUsers(response.data)
    }
    useEffect(()=>{
        if(cardId){
            fetchAssignedUsers();
            fetchAssignableUsers();
        }
    },[cardId])

    //12. function remove user from card
    const handleRemoveUser = async(userId) =>{
        try{
            await deleteUserFromCard(cardId, userId);
            fetchAssignedUsers();
            fetchAssignableUsers();
            showSnackbar('User removed successfully!', 'success');
        }catch(error){
            console.error('Error deleting userId from card:', error)
            showSnackbar('Failed deleting user from card:', 'error');
        }
    }

    //13. function duplicate card
    const handleDuplicateCard = (cardId) =>{
        setShowDuplicate((prevState)=>({
            ...prevState,
            [cardId]: !prevState[cardId],
        }))
        // setShowAction(false);
    }

    const handleCloseDuplicate = (cardId) =>{
        setShowDuplicate((prevState)=>({
            ...prevState,
            [cardId]: false,
        }))
    }

    //14. function to move card
    const handleMoveCard = (cardId) =>{
        setShowMove((prevState)=>({
            ...prevState,
            [cardId]: !prevState[cardId],
        }))
    }

    const handleCloseMove = (cardId) =>{
        setShowMove((prevState)=>({
          ...prevState,
            [cardId]: false,
        }))
    }

    //15. function archive card
    const handleArchiveCard = async(cardId)=>{
        console.log('Arciving card with id:', cardId)
        try{
            const response = await archiveCard(cardId)
            console.log('Card archiving successfully:', response.data)
            // fetchCardList(cardId)
            // fetchCardList(listId)
            // setShowSetting(false)
            showSnackbar('Card archived successfully','success')
        }catch(error){
            console.error('Error archiving cards:', error)
            showSnackbar('Failed to archive card', 'error')
        }
    }
      

    //FUNCTION NAVIGATE
    const handleNavigateToBoardList = () =>{
        navigate(`/workspaces/${workspaceId}/board/${boardId}`)
    }

    //SHOW FUNCTION
    //1. show cover
    const handleShowCover = () =>{
        setShowCover(!showCover)
      }
      const handleCloseCover = () =>{
        setShowCover(false)
      }

    //2. show assigment
    const handleShowAssign = () =>{
        setShowAssigment(!showAssigment)
    }
    const handleCloseAssign = () =>{
        setShowAssigment(false)
    }

    //3. show label 
    const handleShowLabel = () =>{
        setShowLabel(!showLabel)
    }

    const handleCloseLabel = () =>{
        setShowLabel(false)
    }

    //4. show action / card setting
    const handleShowAction = ()=>{
        setShowAction(!showAction)
    }


    
  

  return (
    <div className='new-card-detail'>
        <div className="ncd-header">
            <div className="ncd-left">
                <button onClick={handleNavigateToBoardList}>
                    <HiOutlineListBullet className='ncd-icon'/>
                    Board Lists
                </button>
                <HiOutlineChevronRight/>
                <button className='ncd-active'>
                    Card Detail
                </button>
            </div>  
           <div className="ncd-right">
            <BootstrapTooltip title="View Data Marketing" placement='top'>
                <button >
                    <AiOutlineLineChart className='nr-icon'/>
                    View Data Marketing
                </button>
            </BootstrapTooltip>
           </div>
        </div>

        {/* BODY  */}
        <div className="ncd-body">
            <div className={`ncd-container ${layoutOpen ? 'split-view' : ''}`}>
                <div className="card-detail-left">
                    <div className='cdl-header'>
                        <div className="card-title">
                            {/* {cards.title} */}
                        {cards && cardId && (
                            <div className="ct-box">
                                <HiOutlineCreditCard className='ct-icon'/>
                                {editingTitle === cardId ? (
                                <input
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    onBlur={()=> handleSaveTitle(cardId)}
                                    onKeyDown={(e) =>handleKeyPressTitle(e, cardId)}
                                    autoFocus
                                />
                                ):(
                                <h5 onClick={(e)=>handleEditingTitle(e, cardId, cards.title)}>
                                    {cards.title}
                                </h5>
                                )}
                            </div>
                            )}
                        </div>
                        <div className="cdl-right">
                            <BootstrapTooltip title='Select Cover' placement='top'>
                                <button onClick={handleShowCover}> 
                                    <HiMiniPhoto className='cdl-icon'/>
                                    {/* SELECT COVER */}
                                </button>
                            </BootstrapTooltip>
                            <BootstrapTooltip title='Select Label' placement='top'>
                                <button onClick={handleShowLabel}>
                                    <HiTag className='cdl-icon'/>
                                    {/* SELECT LABEL */}
                                </button>
                            </BootstrapTooltip>
                             <BootstrapTooltip title='Open Room Chat' placement='top'>
                                <button onClick={() => setLayoutOpen(true)}>
                                    <HiMiniChatBubbleLeftRight className='cdl-icon'/>
                                    {/* ROOM CHAT */}
                                </button>
                             </BootstrapTooltip>
                        </div>

                        {/* SHOW COVER  */}
                        {showCover && (
                            <div className='cover-modal'>
                                <CoverCard
                                    cardId={cardId}
                                    fetchCardDetail={fetchCardById}
                                    selectedCover={selectedCover}
                                    setSelectedCover={setSelectedCover}
                                    fetchCardCover={fetchCardCover}
                                    onClose={handleCloseCover}
                                />
                            </div>
                        )}
                        {/* END SHOW COVER  */}

                        {/* SHOW LABEL  */}
                        {showLabel && (
                            <div className="label-modals">
                                <Label
                                    cardId={cardId}
                                    labels={labels}
                                    setLabels={setLabels}
                                    fetchLabels={fetchLabels}
                                    onClose={handleCloseLabel}
                                    fetchCardDetail={fetchCardById}
                                />
                            </div>
                        )}
                        {/* END SHOW LABEL  */}
                   </div>
                   <div className="card-label">
                    <SelectedLabels
                        cardId={cardId}
                        fetchCardDetail={fetchCardById}
                        labels={labels}
                        fetchLabels={fetchLabels}
                    />
                   </div>

                   <div className="card-main-box">

                    {/* LEFT  */}
                    <div className="cmb-left">
                        <div className="cm-conten">
                            <div className="cm-button">
                            {['Detail','Activity','Checklist'].map((tab) =>(
                                <button 
                                    key={tab}
                                    className={activeTab === tab ? 'active' : ''}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab}
                                </button>
                            ))}
                            </div>
                    
                            <div className="tab-content">
                                {activeTab === 'Detail' && <DetailCard 
                                                                cards={cards}
                                                                cardId={cardId}
                                                                fetchCardById={fetchCardById} 
                                                                currentStatus={currentStatus}
                                                                setCurrentStatus={setCurrentStatus}
                                                                allStatuses={allStatuses}
                                                                setAllStatuses={setAllStatuses}
                                                                selectedStatus={selectedStatus}
                                                                setSelectedStatus={setSelectedStatus}
                                                                fetchCardStatus={fetchCardStatus}
                                                                fetchAllStatuses={fetchAllStatuses}
                                                                //PRIORITY
                                                                selectedProperties={selectedProperties}
                                                                setSelectedProperties={setSelectedProperties}
                                                                selectedPriority={selectedPriority}
                                                                refreshPriority={fetchPriority}
                                                                //DUE DATE
                                                                dueDates= {dueDates}
                                                                setDueDates={setDueDates}
                                                                selectedDate={selectedDate}
                                                                setSelectedDate={setSelectedDate}
                                                                selectedDueDateId={selectedDueDateId}
                                                                setSelectedDueDateId={setSelectedDueDateId}
                                                                loading={loading}
                                                                setLoading={setLoading}
                                                                fetchDueDates={fetchDueDates}
                                                            />
                                }
                                {/* {activeTab === 'Detail Order' && <DetailOrder cardId={cardId}/>} */}
                                {activeTab === 'Checklist' && <Checklist cardId={cardId}/>}
                                {activeTab === 'Activity' && <CardActivity/>}
                            </div>
                        </div>
                    </div>

                    

                    {/* RIGHT  */}
                    <div className="cmb-right">
                        <div className="cmb-label">
                            <CoverSelect cardId={cardId} fetchCardDetail={fetchCardById} selectedCover={selectedCover} />
                        </div>
                        <div className="c-info">
                            <div className="c-info-title">
                                <p>Card Information</p>
                                <BootstrapTooltip title='Card Setting' placement='top'>
                                 <button onClick={handleShowAction}>
                                    <HiCog8Tooth/>
                                </button>
                                </BootstrapTooltip>
                            </div>
                            
                            <div className="c-create">
                                <HiOutlineCalendar className='cc-icon'/>
                                <div className="cc-date">
                                    <p>Created</p>
                                    {cards.create_at && formatTimestamp(cards.create_at)}
                                </div>
                           </div>
                           <div className="c-create">
                                <HiMiniListBullet className='cc-icon'/>
                                <div className="cc-date" style={{fontWeight:'bold'}}>
                                    <p>List</p>
                                    {listName}
                                </div>
                           </div>

                           {/* SHOW ACTION CARD  */}
                            {showAction && (
                                <div className='acm-container' >
                                    <div className='action-card-modal' ref={refShowAction}>
                                        <button onClick={()=> handleDuplicateCard(cardId)}>
                                            <HiOutlineSquare2Stack className='cmba-icon'/>
                                            DUPLICATE CARD
                                        </button>
                                        <button onClick={()=> handleMoveCard(cardId)}>
                                            <HiMiniArrowLeftStartOnRectangle className='cmba-icon'/>
                                            MOVE CARD
                                        </button>
                                        <button onClick={()=> handleArchiveCard(cardId)}>
                                            <HiOutlineArchiveBox className='cmba-icon'/>
                                            ARCHIVE CARD
                                        </button>

                                        {showDuplicate[cardId] && (
                                            <div className='duplicate-modal'>
                                                <CardDetailDuplicate cardId={cardId} boardId={boardId} listId={listId} workspaceId={workspaceId} onClose={()=> handleCloseDuplicate(cardId)}/>
                                            </div>
                                        )}
                                        {showMove[cardId]&&(
                                            <div className='cd-move-modal'>
                                                <CardDetailMove cardId={cardId} currentBoardId={boardId} listId={listId} workspaceId={workspaceId} onClose={()=> handleCloseMove(cardId)}/>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                           {/* END SHOW ACTION CARD  */}
                        </div>

                        {/* <div className="cmb-container"> */}
                            {/* ATTACHMENT  */}
                            <div className="cmb-attachment">
                                <div className="attach-header">
                                    <div className="ah-left">
                                        {/* <HiPaperClip className='ah-icon'/> */}
                                        <h5>Attachment</h5>
                                    </div>
                                    <div className="ah-right">
                                        <p>0 Files</p>
                                    </div>
                                </div>
                                <div className="attach-body">
                                    <button>
                                        <IoCloudUploadOutline className='ab-icon'/>
                                        Add Attachment
                                    </button>
                                </div>
                            </div>

                             {/* ASSIGN  */}
                            <div className="cmb-assign">
                                <div className="assign-header">
                                    <div className="ah-left">
                                        {/* <FiUsers className='ah-icon'/> */}
                                        Assigned To
                                    </div>
                                    <div className="ah-right">
                                        <p>{assignedUsers.length}  users
                                        </p>
                                    </div>
                                </div>
                                <div className="assign-body">
                                    <CardAssignedUsers 
                                         cardId={cardId}
                                         onClose={handleCloseAssign}
                                         assignedUsers={assignedUsers}
                                         setAssignedUsers={setAssignedUsers}
                                         fetchAssignedUsers={fetchAssignedUsers}
                                         assignableUsers={assignableUsers}
                                         setAssignableUsers={setAssignableUsers}
                                         fetchAssignableUsers={fetchAssignableUsers}
                                         handleRemoveUser={handleRemoveUser}
                                    />
                                </div>
                                <div className="assign-btn-add">
                                    <button onClick={handleShowAssign}>
                                        <HiPlus className='ab-icon'/>
                                        Add Assignee
                                    </button>
                                </div>

                                {/* SHOW USER ASSIGMENT  */}
                                {showAssigment && (
                                    <div className='assign-modal'>
                                        <CardAssigment
                                            cardId={cardId}
                                            onClose={handleCloseAssign}
                                            assignedUsers={assignedUsers}
                                            setAssignedUsers={setAssignedUsers}
                                            fetchAssignedUsers={fetchAssignedUsers}
                                            assignableUsers={assignableUsers}
                                            setAssignableUsers={setAssignableUsers}
                                            fetchAssignableUsers={fetchAssignableUsers}
                                        />
                                    </div>   
                                )}
                            </div>

                           
                            {/* <div className="cmb-action">
                                <div className="cmba-header">
                                    <h5>Action</h5>
                                </div>
                                <div className="cmba-body">
                                    <button onClick={()=> handleDuplicateCard(cardId)}>
                                        <HiOutlineSquare2Stack className='cmba-icon'/>
                                        DUPLICATE CARD
                                    </button>
                                    <button onClick={()=> handleMoveCard(cardId)}>
                                        <HiMiniArrowLeftStartOnRectangle className='cmba-icon'/>
                                        MOVE CARD
                                    </button>
                                    <button onClick={()=> handleArchiveCard(cardId)}>
                                        <HiOutlineArchiveBox className='cmba-icon'/>
                                        ARCHIVE CARD
                                    </button>
                                    
                                </div>

                                {showDuplicate[cardId] && (
                                    <div className='duplicate-modal'>
                                        <CardDetailDuplicate cardId={cardId} boardId={boardId} listId={listId} workspaceId={workspaceId} onClose={()=> handleCloseDuplicate(cardId)}/>
                                    </div>
                                )}
                                {showMove[cardId]&&(
                                    <div className='cd-move-modal'>
                                        <CardDetailMove cardId={cardId} currentBoardId={boardId} listId={listId} workspaceId={workspaceId} onClose={()=> handleCloseMove(cardId)}/>
                                    </div>
                                )}
                                 
                            </div> */}

                        {/* </div>  */}
                    </div>
                   </div>
                </div>



                {layoutOpen && (
                    <div className="cdr-container">
                        <div className="chat-header">
                            <div className="chat-title">
                                <h4>ROOM CHAT</h4>
                                <p>{cards.title}</p>
                            </div>
                            
                            <div className="btn-header">
                                <BootstrapTooltip title='Open Roomchat' placement='top'>
                                    <button>
                                        <HiOutlineArrowsPointingOut/>
                                    </button>
                                </BootstrapTooltip>
                                <BootstrapTooltip title='Close Roomchat' placement='top'>
                                     <button onClick={() => setLayoutOpen(false)}>
                                        <HiXMark/>
                                    </button>
                                </BootstrapTooltip>
                               
                            </div>
                            
                        </div>
                    {/* ...isi chat */}
                    {/* <div className="chat-body">Chat messages here...</div> */}
                        <div className="chat-body">
                            <RoomCardChat cards={cards} cardId={cardId} userId={userId} assignedUsers={assignedUsers} assignableUsers={assignableUsers}/>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  )
}

export default NewCardDetail

{/* <div className="card-detail-left">
                    <h2>Card Detail</h2>
                    <button onClick={() => setLayoutOpen(true)}>Open Chat</button>
                </div> */}


return (
        <div
            style={{
                width:'100%',
                height:'100%',
                display:'flex',
                flexDirection:'column',
                justifyContent:'flex-start',
            }}
        >
            STATUS

            {/* <h5>Status Kartu:</h5> */}
            {currentStatus ? (
                <button 
                    style={{
                        backgroundColor: currentStatus.background_color,
                        color: currentStatus.text_color,
                        border:`1px solid ${currentStatus.text_color}`,
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        fontSize:'10px',
                        margin:'0px',
                        padding:'3px 8px',
                        display:'flex',
                        alignItems:'center',
                        justifyContent:'flex-start',
                        gap:'5px',
                        width:'100%',
                        height:'100%'
                    }}
                >
                    {ICON_STATUS[currentStatus.status_name]}
                    {currentStatus.status_name}
                </button>
            ) : (
                <p
                    style={{fontSize:'12px', margin:'0px'}}
                ></p>
            )}
        </div>
    );


//=====================
<div className="ds-header" style={{ position: 'relative' }}>
  <div style={{
    gap:'5px',
    fontSize:'12px',
    display:'flex',
    alignItems:'center', 
    justifyContent:'flex-start',
    color: getDueStatusColor(date.due_date),
  }}>
    <HiOutlineClock />
    DUE DATE
  </div>
  <div style={{ position: 'relative' }}>
    <HiChevronRight
      onClick={handleShowDueDate}
      style={{ cursor: 'pointer' }}
    />
    {showDueDate && (
      <div
        style={{
          position:'absolute',
          top:'100%', // langsung di bawah ikon
          right: 0,
          padding:'5px',
          border:'1px solid #ddd',
          boxShadow: '0px 4px 8px #5e12eb1e',
          borderRadius:'4px',
          backgroundColor:'white',
          zIndex:'999',
          width:'250px',
        }}
      >
        <DueDate
          cardId={cardId}
          onClose={handleCloseDueDate}
          dueDates={dueDates}
          setDueDates={setDueDates}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedDueDateId={selectedDueDateId}
          setSelectedDueDateId={setSelectedDueDateId}
          loading={loading}
          setLoading={setLoading}
          fetchDueDates={fetchDueDates}
        />
      </div>
    )}
  </div>
</div>
