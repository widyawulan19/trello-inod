import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { HiMiniSlash,HiOutlineListBullet,HiMiniChatBubbleLeftRight,HiOutlineClock, HiFlag,HiUserCircle,HiUserGroup, HiOutlineChevronRight, HiMiniXMark, HiMiniPhoto, HiOutlineDocument, HiOutlineCalendar, HiMiniUser, HiOutlineDocumentPlus, HiOutlineDocumentText, HiOutlinePaperClip, HiPaperClip, HiDocumentText, HiPlus } from 'react-icons/hi2';
import '../style/pages/CardDetail.css'
import { AiOutlineLineChart } from "react-icons/ai";
import { BsCalendar2Fill } from "react-icons/bs";
import { getAllCardUsers, getAllDueDateByCardId, getAllStatus, getAllUserAssignToCard, getCardById, getCardPriority, getCoverByCard, getLabelByCard, getStatusByCardId, updateDescCard, updateTitleCard } from '../services/ApiServices';
import SelectedLabels from '../UI/SelectedLabels';
import SelectPriority from '../UI/SelectPriority';
import DueDateDisplay from '../UI/DueDateDisplay';
import CardDetailPanel from '../modules/CardDetailPanel';
import StatusDisplay from '../UI/StatusDisplay';
import CoverSelect from '../UI/CoverSelect';
import BootstrapTooltip from '../components/Tooltip';
import CoverCard from '../modules/CoverCard';
import CardAssignedUsers from '../modules/CardAssignedUsers';
import Checklist from '../modules/Checklist';
import { FaCheckCircle, FaUpload } from 'react-icons/fa';
import { BiSolidUserCheck } from 'react-icons/bi';
import CardAssigment from '../modules/CardAssigment';
import RoomCardChat from '../fitur/RoomCardChat';
import Label from '../modules/Label';

const CardDetail=({listId,cardId,userId,onClose,onCardMoved,fetchBoardDetail,fetchLists,fetchCardList})=> {
    // STATE 
    const { workspaceId, boardId} = useParams();
    console.log('cardId diterima:', cardId)
    console.log('workspaceId diterima:', workspaceId)
    console.log('boardID diterima:', boardId)
    console.log('Card Detail menerima listId:',listId)
    console.log('Card detail menerima userId:', userId)
    const [cards, setCards] = useState({})
    const navigate = useNavigate()
    const [showCover, setShowCover] = useState(false)
    //EDIT DESCRIPTION
    const [editingDescription, setEditingDescription] = useState(null)
    const [newDescription, setNewDescription] = useState('')

    //LABELS
    const [labels, setLabels] = useState([]);
    const [selectedProperties, setSelectedProperties] = useState([])
    const [showLabel, setShowLabel] = useState(false);
    //CARD PRIORITIES
    const [selectedPriority, setSelectedPriority] = useState(null)
    //CARD COVER
    const [selectedCover, setSelectedCover] = useState(null)
    //ASSIGMENT
    const [assignedUsers, setAssignedUsers] = useState([]);
    const [assignableUsers, setAssignableUsers] = useState([]);
    const [showAssigment, setShowAssigment] = useState(false);
    //STATUS
    const [currentStatus, setCurrentStatus] = useState(null)
    const [allStatuses, setAllStatuses] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('')
    //DUE
    const [dueDates, setDueDates] = useState([])
    const [selectedDate, setSelectedDate] = useState(null)
    const [selectedDueDateId, setSelectedDueDateId] = useState(null);
    const [loading, setLoading] = useState(false);
    //EDIT TITLE CARD
    const [editingTitle, setEditingTitle] = useState(null)
    const [newTitle, setNewTitle] = useState('')
    //CHAT ROOM
    const [showChatRoom, setShowChatRoom] = useState(false);

    //FUNGSI SHOW LABEL
    const handleShowLabel = () =>{
      setShowLabel(!showLabel)
    }

    //FUNGSI MENAMPILKAN CHAT ROOM
    const handleShowChatRoom = () =>{
      setShowChatRoom(!showChatRoom)
    }

    //FUNGSI EDITING TITLE DESCRIPTION
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

    //FUNGSI EDITING CARD DESCTIPTION
    const handleEditDescription = (e, cardId, currentCardDesc) => {
      console.log("handleEditDescription triggered", { cardId, currentCardDesc });
      if (!cardId) {
        console.warn("Card ID is invalid");
        return;
      }
      e.stopPropagation();
      setEditingDescription(cardId);
      setNewDescription(currentCardDesc);
    };
    

    const handleSaveDescription = async(cardId)=>{
      try{
        await updateDescCard(cardId, {description:newDescription})
        setEditingDescription(null);
        fetchCardById(cardId)
      }catch(error){
        console.error('Error updating card description:', error)
      }
    }

    const handleKeyPressDescription = (e, cardId) =>{
      if(e.key === 'Enter' && !e.shiftKey){
        handleSaveDescription(cardId)
        e.stopPropagation();
      }
    }

    //FUNGSI CARD DUE
    const fetchDueDates = async()=>{
      try{
        setLoading(true);
        const response = await getAllDueDateByCardId(cardId);
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
        setLoading(false);
      }
    }
      useEffect(() => {
        fetchDueDates();
      }, [cardId]);


    //FUNGSI CARD STATUS
    const fetchCardStatus = async () => {
      try {
            const response = await getStatusByCardId(cardId);
            if (response.data.length > 0) {
                setCurrentStatus(response.data[0]);
                setSelectedStatus(response.data[0].status_id);
            }
        } catch (error) {
            console.error('Gagal mengambil status kartu:', error);
        }
      };
    const fetchAllStatuses = async () => {
      try {
            const response = await getAllStatus();
            setAllStatuses(response.data);
        } catch (error) {
            console.error('Gagal mengambil daftar status:', error);
        }
      };
    
    useEffect(() => {
        fetchCardStatus();
        fetchAllStatuses();
    }, [cardId]);
    


    //FUNGSI CARD ASSIGN
    const fetchAssignedUsers = async()=>{
      const response = await getAllCardUsers(cardId)
      setAssignedUsers(response.data)
    }
    const fetchAssignableUsers = async () =>{
      const response = await getAllUserAssignToCard(cardId);
      setAssignableUsers(response.data)
    }

    useEffect(() => {
      if (cardId) {
        fetchAssignedUsers();
        fetchAssignableUsers();
      }
    }, [cardId]);

    //show card assigment
    const handleShowAssign = () =>{
      setShowAssigment(!showAssigment)
    }
    const handleCloseAssign = () =>{
      setShowAssigment(false)
    }

    //FUNGSI CARD COVER
    const fetchCardCover = async () =>{
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

    //FUNGSI CARD PRIORITIES
    const fetchPriority = async () =>{
      try{
        const result = await getCardPriority(cardId);
        setSelectedPriority(result.data[0] || null)
      }catch(error){
        console.error('Error get card priorities', error)
      }
    }

    useEffect(()=>{
      fetchPriority();
    },[cardId])
    

    //FUNCTION
    //1. fetch card by id
    const fetchCardById = async (cardId) => {
      if (!cardId) {
        console.warn('Card ID is invalid');
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
    
    useEffect(() => {
      if (cardId) {
        fetchCardById(cardId);
      }
    }, [cardId]);
    

    // NAVIGATE 
    const handleNavigateToBoardList = (workspaceId, boardId)=>{
      navigate(`/workspaces/${workspaceId}/board/${boardId}`)
    }

    const handleGoToMarketing = ()=>{
      navigate(`/data-marketing?workspaceId=${workspaceId}&boardId=${boardId}&listId=${listId}&cardId=${cardId}`);
    }

    //show cover
    const handleShowCover = () =>{
      setShowCover(!showCover)
    }
    const handleCloseCover = () =>{
      setShowCover(false)
    }

    //FETCH LABELS 
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

  return (
    <div className="cdc">
    <div className='cd-container'>
        <div className="cd-header">
          <div className="cd-nav">
            <button onClick={()=>handleNavigateToBoardList(workspaceId,boardId)}>
              <HiOutlineListBullet className='cdnav-icon'/>
              Board Lists
            </button>
            <HiOutlineChevronRight size={12}/>
            <button className='cdn-active'>Card Detail</button>
          </div>
          <div className="nav-right">
            <BootstrapTooltip title='Data Marketing' placement='top'>
              <button onClick={handleGoToMarketing}>
                <AiOutlineLineChart className='nr-icon'/>
                View Data Marketing
              </button>
            </BootstrapTooltip>
            <BootstrapTooltip title='Close Detail' placement='top'>
              <HiMiniXMark  className='nr-btn' onClick={onClose}/>
            </BootstrapTooltip>
          </div>
        </div>
        <div className="cd-cc">
          <CoverSelect cardId={cardId} fetchCardDetail={fetchCardById} selectedCover={selectedCover}/>
        </div>

        <div className="cd-body">
          <div className="cd-title">
            {/* <h5>{cards.title}</h5> */}
            {cards && cards.id && (
              <div className="ct-box">
                {editingTitle === cards.id ? (
                  <input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onBlur={()=> handleSaveTitle(cards.id)}
                    onKeyDown={(e) =>handleKeyPressTitle(e, cards.id)}
                    autoFocus
                  />
                ):(
                  <h5 onClick={(e)=>handleEditingTitle(e, cards.id, cards.title)}>
                    {cards.title}
                  </h5>
                )}
              </div>
            )}
            <div className="more-title">
              {/* <CoverCard cardId={cardId}/> */}
              <SelectPriority cardId={cardId} selectedProperties={selectedProperties} setSelectedProperties={setSelectedProperties} selectedPriority={selectedPriority}/>
              <BootstrapTooltip title='Select Cover' placement='top'>
                <button onClick={handleShowCover}>
                  <HiMiniPhoto className='t-icon'/>
                  SELECT COVER
                </button>
              </BootstrapTooltip>

              <button onClick={handleShowLabel}>LABEL</button>

              <BootstrapTooltip title='Room Chat' placement='top'>
                <button onClick={handleShowChatRoom}>
                  <HiMiniChatBubbleLeftRight className='t-icon'/>
                  CHAT
                </button>
              </BootstrapTooltip>

              {/* SHOW LABEL  */}
              {showLabel && (
                <div className='label-modal'>
                  <Label/>
                </div>
              )}
              {/* END SHOW LABEL  */}

              {/* SHOW CHAT ROOM  */}
              {showChatRoom && (
                <div className='cr-container'>
                  <RoomCardChat userId={userId} cardId={cardId}/>
                </div>
              )}
              {/* END SHOW CHAT ROOM  */}
            </div>
          </div>
          <div className="cd-label">
            <SelectedLabels 
              cardId={cardId} 
              fetchCardDetail={fetchCardById}
              labels={labels}
              fetchLabels={fetchLabels}
            />
          </div>

          {/* show cover  */}
          {showCover && (
            <div className='s-cover'>
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

          {/* MENU  */}
          <div className="cd-main-container">
            <div className="cmc-left">

              {/* ACTION1  */}
              <div className="cmc-action1">
                <div className="action-box1">
                  <div className="ab-content">
                    {/* <HiFlag className='abc-icon'/> */}
                    <FaCheckCircle className='abc-icon'/>
                    <h5>Status</h5>
                  </div>
                  <div className="ab-res">
                    <StatusDisplay cardId={cardId} currentStatus={currentStatus} />
                  </div>
                </div>
                <div className="action-box1">
                  <div className="ab-content">
                    {/* <HiFlag className='abc-icon'/> */}
                    <BsCalendar2Fill className='abc-icon'/>
                    <h5>Due Date</h5>
                  </div>
                  <div className="ab-res">
                    <DueDateDisplay 
                      cardId={cardId}
                      dueDates={dueDates}
                      setDueDates={setDueDates}
                      loading={loading}
                      setLoading={setLoading}
                      fetchDueDates={fetchDueDates}
                    />
                  </div>
                </div>
              </div>
              {/* END ACTION1 */}

              {/* ACTION 2  */}
              <div className="cmc-action2">
              <CardDetailPanel 
                    cardId={cardId} 
                    fetchCardDetail={fetchCardById}
                    //LABEL
                    labels={labels}
                    setLabels={setLabels}
                    fetchLabels={fetchLabels}
                    //PRIORITY
                    selectedProperties={selectedProperties}
                    setSelectedProperties={setSelectedProperties}
                    selectedPriority={selectedPriority}
                    refreshPriority={fetchPriority}
                    onCardMoved={onCardMoved}
                    //ASSIGN
                    assignedUsers={assignedUsers}
                    setAssignedUsers={setAssignedUsers}
                    fetchAssignedUsers={fetchAssignedUsers}
                    assignableUsers={assignableUsers}
                    setAssignableUsers={setAssignableUsers}
                    fetchAssignableUsers={fetchAssignableUsers}
                    onClose={() => {
                      // setShowAssign(false);
                      fetchAssignedUsers(); // <-- 🔥 tambahkan ini
                      fetchAssignableUsers();
                    }}
                    //STATUS
                    currentStatus={currentStatus}
                    setCurrentStatus={setCurrentStatus}
                    allStatuses={allStatuses}
                    setAllStatuses={setAllStatuses}
                    selectedStatus={selectedStatus}
                    setSelectedStatus={setSelectedStatus}
                    fetchCardStatus={fetchCardStatus}
                    fetchAllStatuses={fetchAllStatuses}
                    //DUE
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
              {/* END ACTION 2  */}
              
              {/* CHECKLIST  */}
              <div className="checklist-con">
                <Checklist cardId={cardId}/>
              </div>
              {/* END CHECKLIST  */}

              {/* DESCRIPTION  */}
              <div className="description-con">
                <div className="desc-header">
                    {/* <HiOutlineDocumentText className='dh-icon'/> */}
                    <h5>DESCRIPTION</h5>
                </div>
                <div className="desc-content">
                  {cards && cards.id && (
                    <div className="des-main">
                      {editingDescription === cards.id ? (
                        <div className="ta-cont">
                          <textarea
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            onBlur={() => handleSaveDescription(cards.id)}
                            onKeyDown={(e) => handleKeyPressDescription(e, cards.id)}
                            autoFocus
                            rows={5}
                          />
                          <small className="text-muted">
                            **Tekan Enter untuk simpan || Shift + Enter untuk baris baru
                          </small>
                        </div>
                      ) : (
                        <div
                          onClick={(e) => handleEditDescription(e, cards.id, cards.description)}
                          style={{ whiteSpace: "pre-wrap", cursor: "pointer" }}
                          className='div-p'
                        >
                          {cards.description?.split('\n').map((line, index) => (
                            <div key={index}>
                              {line.trim() === '' ? <>&nbsp;</> : line}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>
              {/* END DESCRIPTION  */}

            </div>
            <div className="cmc-right">
              {/* ATTACHMENT  */}
              <div className="action-box2">
                <div className="ab2-header">
                  <div className="abh-left">
                    <HiOutlinePaperClip className='abc-icon'/>
                    <h5>Attachment</h5>
                  </div>
                  <div className="abh-right">
                    <button>0 files</button>
                  </div>
                </div>
                <div className="ab2-cont">
                  <div className="show-attch">
                    {/* TEMPAT UNTUK MENAMPILKAN FILE YANG ADA PADA CARD  */}
                  </div>
                  <button>
                    <FaUpload className='abc-icon'/>
                    Add Attachment
                  </button>
                </div>
              </div>
              {/* END ATTACHMENT  */}

              {/* CARD ASSIGNED  */}
              <div className="action-box2">
                <div className="ab2-header">
                  <div className="abh-left">
                    <BiSolidUserCheck className='abc-icon'/>
                    <h5>Assigne to</h5>
                  </div>
                  <div className="abh-right">
                    <button>{assignedUsers.length} users</button>
                  </div>
                </div>
                <div className="ab2-cont" style={{marginTop:'5px'}}>
                  <CardAssignedUsers assignedUsers={assignedUsers}/>
                  <button className='ca-btn' onClick={handleShowAssign}>
                    <HiPlus className='abc-icon'/>
                    Add Assignee
                  </button>
            
                </div>
              </div>
              {/* END CARD ASSIGNED  */}
            </div>
          </div>
          
        </div>
    </div>
    </div>
  )
}

export default CardDetail

// Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sunt natus voluptates vitae voluptatum nemo consectetur nihil, at pariatur rerum perspiciatis excepturi numquam itaque aspernatur recusandae.