import React, { useEffect, useRef, useState } from 'react'
import { FiUsers } from "react-icons/fi";
import { HiChatBubbleLeftRight, HiChevronDown, HiChevronUp, HiCog8Tooth, HiMiniArrowLeftStartOnRectangle, HiMiniChatBubbleLeftRight, HiMiniListBullet, HiMiniPhoto, HiOutlineArchiveBox, HiOutlineArrowsPointingOut, HiOutlineCalendar, HiOutlineChevronRight, HiOutlineCreditCard, HiOutlineListBullet, HiOutlineSquare2Stack, HiOutlineTrash, HiPaperClip, HiPlus, HiTag, HiXMark } from 'react-icons/hi2';
import { useNavigate, useParams } from 'react-router-dom'
import '../style/pages/NewCardDetail.css'
import BootstrapTooltip from '../components/Tooltip';
import { GiCloudUpload } from "react-icons/gi";
import { addCoverCardTesting, archiveCard, deleteCoverCard, deleteUserFromCard, getActivityCardTesting, getAllCardUsers, getAllCovers, getAllDueDateByCardId, getAllStatus, getAllUploadFiles, getAllUserAssignToCard, getCardById, getCardPriority, getChecklistItemChecked, getChecklistsWithItemsByCardId, getCoverByCard, getLabelByCard, getListById, getStatusByCardId, getTotalChecklistItemByCardId, getTotalFile, updateCardCoverTesting, updateDescCard, updateDescCardTesting, updateTitleCard } from '../services/ApiServices';
import SelectedLabels from '../UI/SelectedLabels';
import CardDetailPanel from '../modules/CardDetailPanel';
import DetailCard from '../modules/DetailCard';
import Checklist from '../modules/Checklist';
import CardActivity from '../modules/CardActivity';
import CoverSelect from '../UI/CoverSelect';
import CoverCard from '../modules/CoverCard';
import { IoDocumentAttachOutline, IoShareOutline } from "react-icons/io5";
import { RiExpandDiagonalLine } from "react-icons/ri";
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
import StatusDisplay from '../UI/StatusDisplay';
import SelectPriority from '../UI/SelectPriority';
import DueDateDisplay from '../UI/DueDateDisplay';
import FormUpload from '../modals/FormUpload';
import UploadFile from '../modals/UploadFile';
import NewRoomChat from '../fitur/NewRoomChat';
import { FaXmark } from 'react-icons/fa6';
import CardDescription from '../modals/CardDesctiption';
import ReactQuill from 'react-quill-new';
import "quill/dist/quill.snow.css";
import CardDescriptionExample from '../modals/CardDescriptionExample';
import NewCardActivity from '../modules/NewCardActivity';

const NewCardDetail=()=> {
    //STATE
    const {user} = useUser();
    const userId = user?.id;
    const {workspaceId, boardId, listId, cardId} = useParams();
    const navigate = useNavigate();
    const {showSnackbar} = useSnackbar();
    const [layoutOpen, setLayoutOpen] = useState(false);
    const [cards, setCards] = useState({});
    const [activeTab, setActiveTab] = useState('Detail')
    //EDIT CARD TITLE
    const [editingTitle, setEditingTitle] = useState(null)
    const [newTitle, setNewTitle] = useState('')
    //EDIT DESCRIPTION
    const [editingDescription, setEditingDescription] = useState(null);
    const [newDescription, setNewDescription] = useState('');
    const [showMore, setShowMore] = useState(false);
    const maxChars = 1000;

    //checklist state
    const [checklistTotal, setChecklistTotal] = useState(0);
    const [checkChecklist, setChecklist] = useState(0);
    const [checklists, setChecklists] = useState([]);
    
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
    const [showSelectedCover, setShowSelectCover]= useState(false);
    const [showCover, setShowCover] = useState(false)
    const [covers, setCovers] = useState([]);
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
    //Chatroom
    const [showChat, setShowChat] = useState(false);
    const [showStatus, setShowStatus] = useState(true);
    const toggleStatus = () => setShowStatus(!showStatus);
    //card activity
    const [cardActivities, setCardActivities] = useState([]);
    const [showFormUpload, setFormUpload] = useState(false);
    const [exampleUpload, setExampleUpload] = useState(false);
    //total file 
    const [totalFile, setTotalFile] = useState(0);
    //status
    const [showStatusInput, setShowStatusInput] = useState(false);
    const [statusVisible, setStatusVisible] = useState(true); // default: visible
    //MODAL DES
    const [showModalDes, setShowModalDes] = useState(false);
    // ATTACHMENT 
    const [allUploadFile, setAllUploadFile] = useState([]);

    const quillRef = useRef(null);

    const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "code-block"],
      [{ align: [] }],
      ["link"],
      ["clean"],
    ],
    keyboard: {
      bindings: {
        tab: {
          key: 9,
          handler: function (range, context) {
          this.quill.insertText(range.index, "    "); // ⬅️ tambahin 4 spasi
          this.quill.setSelection(range.index + 4, 0); // ⬅️ cursor geser setelah spasi
          return false; // cegah pindah fokus
        },
        },
      },
    },
  };


   // Fetch checklists
    const fetchCardChecklists = async () => {
        try {
            const response = await getChecklistsWithItemsByCardId(cardId);
            console.log('Fetched checklists:', response);

            if (Array.isArray(response.data)) {
                setChecklists(response.data);
            } else {
                console.error('Unexpected API response format:', response);
                setChecklists([]);
            }
        } catch (error) {
            console.error('Error fetching checklist data:', error);
            setChecklists([]);
        }
    };

    useEffect(() => {
        fetchCardChecklists();
    }, [cardId]);


    // fetch upload file
    const fetchAllUploadFile = async () => {
      try {
        const result = await getAllUploadFiles(cardId);
        setAllUploadFile(result.data);
      } catch (error) {
        console.error('Error fetching all file:', error);
      }
    };
  
    useEffect(() => {
      fetchAllUploadFile();
    }, [cardId]);

    const handleShowModalDes = () =>{
        setShowModalDes(!showModalDes)
    }

    const handleCloseModalDes = () =>{
        setShowModalDes(false)
    }

    const toggleStatusVisibility = () => {
      setStatusVisible(!statusVisible);
    };




    const handleShowExample = () =>{
        setExampleUpload(!exampleUpload);
        alert('tombol upload berhasil di klik')
    }

    const handleShowFormUpload = () =>{
        setFormUpload(!showFormUpload);
        console.log('button upload berhasil di klik')
    }
    const handleCloseFormUpload = () =>{
        setFormUpload(false);
    }


    const handleShowChatroom = () =>{
        setShowChat(!showChat);
    }

    const handleCloseChatroom = () =>{
        setShowChat(false);
    }

    //text long description
    const toggleShowMore = () => setShowMore(!showMore);

    const renderDescription = (desc) => {
        const textToRender = showMore || desc.length <= maxChars ? desc : desc.slice(0, maxChars) + '...';
        
        return textToRender.split('\n').map((line, index) => (
        <div key={index}>
            {line.trim() === '' ? (
            <>&nbsp;</>
            ) : (
            line.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
                part.match(/https?:\/\/[^\s]+/) ? (
                <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'underline' }}>
                    {part}
                </a>
                ) : (
                <React.Fragment key={i}>{part}</React.Fragment>
                )
            )
            )}
        </div>
        ));
    };


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
    //edit card desc
// EDIT mode trigger
const handleEditDescription = (e, cardId, currentCardDesc) => {
  e.stopPropagation();
  if (!cardId) {
    console.warn("Card ID is invalid");
    return;
  }
  setEditingDescription(cardId);
  setNewDescription(currentCardDesc || "");
};
    
    const handleSaveDescription = async (cardId) => {
        try {
            const res = await updateDescCardTesting(userId, cardId, newDescription);
            fetchCardActivities(cardId); // Refresh aktivitas kalau mau
            setEditingDescription(null);
            fetchCardById(cardId);
            setCards((prev) => ({ ...prev, description: res.data.description }));
            showSnackbar('Description updated successfully!', 'success');
        } catch (error) {
            console.error('Failed to update card description:', error);
            showSnackbar('Failed to update description', 'error');
        }
    };

      // ENTER key listener
    const handleKeyPressDescription = (e, cardId) => {
    if (e.key === "Enter" && !e.shiftKey) {
        handleSaveDescription(cardId);
        e.stopPropagation();
    }
    };



    //another edit desc
    const startEditingDescription = (e, cardId, currentDesc) => {
    console.log("startEditingDescription triggered", { cardId, currentDesc });
    if (!cardId) {
        console.warn("Card ID is invalid");
        return;
    }
    e.stopPropagation();
    setEditingDescription(cardId);
    setNewDescription(currentDesc);
    };

    // ✅ Simpan perubahan deskripsi baru
    const saveEditedDescription = async (cardId) => {
    try {
        await updateDescCard(cardId, { description: newDescription });
        setEditingDescription(null);
        fetchCardById(cardId); // refresh data dari API
    } catch (error) {
        console.error("Error updating card description:", error);
    }
    };

    // ✅ Handle keyboard input saat edit deskripsi baru
    const handleDescriptionKeyPress = (e, cardId) => {
    if (e.key === "Enter" && !e.shiftKey) {
        saveEditedDescription(cardId);
        e.stopPropagation();
    }
    };

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


    // COVER FUNCION 
    
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

    // 9.1 fungsi select vocer 
    const handleSelectCover = async(coverId) =>{
        try{
            const coverData = {card_id: cardId, cover_id: coverId};
            if(selectedCover){
                await updateCardCoverTesting(userId, coverData);
            }else{
                await addCoverCardTesting(userId, coverData);
            }
            showSnackbar('Successfully add cover','success');
            await fetchCardCover(); // refresh dari parent
            fetchCardActivities(cardId)
            fetchCardById(); // refresh detail
        }catch(error){
            console.error('Gagal memilih cover:', error);
            showSnackbar('Gagal memilih cover', 'error');
        }
    }

    //9.2 fungsi cover remove
    const handleRemoveCover = async() =>{
        try{
            await deleteCoverCard(cardId);
            setSelectedCover(null);
            fetchCardById();
            showSnackbar('Successfully remove cover', 'success');
        }catch(error){
            console.error('Gagal menghapus cover:', error);
            showSnackbar('Gagal menghapus cover', 'error');
        }
    }

    //9.3 Ambil semua cover saat komponen mount
        useEffect(() => {
            fetchCovers();
        }, [cardId]);
    
        const fetchCovers = async () => {
            try {
                const response = await getAllCovers();
                setCovers(response.data);
            } catch (error) {
                console.error('Gagal mengambil daftar cover:', error);
            }
        };

    // END COVER FUNCTION 

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

    //16. fetch total file
    const fetchTotalFile = async()=>{
        try{
            const result = await getTotalFile(cardId);
            setTotalFile(result.data.total_files)
        }catch(error){
            console.error('Error fetching total file:', error)
        }
    }
    useEffect(()=>{
        fetchTotalFile()
    },[cardId])
      

    //FUNCTION NAVIGATE
    const handleNavigateToBoardList = () =>{
        navigate(`/layout/workspaces/${workspaceId}/board/${boardId}`)
    }

    //function checklist
    const fetchTotalChecklist = async()=>{
        try{
            const response = await getTotalChecklistItemByCardId(cardId);
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
            const response = await getChecklistItemChecked(cardId);
            setChecklist(response.data);
        }catch(error){
            setChecklist(0)
        }finally{
            setLoading(false);
        }
    }

     useEffect(()=>{
        if(cardId){
            fetchTotalChecklist();
            fetchChecklist();
        }
    },[cardId])

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

    // fetch card activity 
    const fetchCardActivities = async()=>{
        try{
            setLoading(true);
            const response = await getActivityCardTesting(cardId);
            const activitiesWithUser = response.activities.map(act => {
      
                const detail = act.action_detail || {};
            return {
                // ...act,
                // username: act.movedby || detail.movedBy?.username || 'Unknown',
                // detail
                ...act,
                username:
                act.action_detail?.updatedBy?.username ||
                act.movedby ||
                'Unknown',
                detail: act.action_detail || {},
            };
            });

            setCardActivities(activitiesWithUser);
        }catch(error){
            console.error('Failed to fetch card activity:', error);
        }finally{
            setLoading(false);
        }
    }
      useEffect(() => {
        if (cardId) fetchCardActivities();
      }, [cardId]);


    // 🔗 fungsi untuk deteksi dan convert URL ke <a>
    const linkify = (text) => {
    if (!text) return "";
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#5557e7; text-decoration:underline;">${url}</a>`;
    });
    };
    
  

  return (
    <div className='new-card-detail'>
        <div className="ncd-header">
            <div className="ncd-left">
                <div className='ncd-board' onClick={handleNavigateToBoardList}>
                    <HiOutlineListBullet size={15} className='ncd-icon'/>
                    Board Lists
                </div>
                <HiOutlineChevronRight className='ncd-icon'/>
                <div className='ncd-active'>
                    Card Detail
                </div>
            </div>  
            <div className="btn-chatroom">
                <BootstrapTooltip title='Open Room Chat' placement='top'>
                    <button className='chat-btn' onClick={handleShowChatroom}>
                        <HiChatBubbleLeftRight size={20}/>
                    </button>
                </BootstrapTooltip>
            </div>
        </div>
        {/* MODAL CHATROOM  */}
        {/* SHOW CHATROOM  */}
                {showChat && (
                    <div className='modal-chatroom'>
                        <NewRoomChat
                            cardId={cardId}
                            userId={userId} 
                            onClose={handleCloseChatroom}
                        />
                    </div>
                )}

        {/* BODY  */}
        <div className="ncd-body">
                <div className="ncd-main-header">
                    <div className="ncd-title-btn">
                        {/* HEADER TITLE AND LABLE  */}
                        <div className="title-label">
                            {/* HEADER TITLE  */}
                            {cards && cardId && (
                                <div className="ct-box">
                                    {/* <HiOutlineCreditCard className='ct-icon'/> */}
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

                            {/* HEADER LABEL  */}
                            <div className="ncd-label">
                                <SelectedLabels
                                    cardId={cardId}
                                    fetchCardDetail={fetchCardById}
                                    labels={labels}
                                    fetchLabels={fetchLabels}
                                />
                            {/* {cards?.project_type_name === "ORIGINAL" ? (
                                // ✅ Kalau project_type ORIGINAL, paksa render label Mixing & Mastering
                                <div className="labels">
                                <span
                                    className="label"
                                    style={{
                                    backgroundColor: "#ff5733", // sesuaikan warna label di DB
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    marginRight: "4px",
                                    fontSize: "12px",
                                    color: "#fff",
                                    }}
                                >
                                    Mixing & Mastering
                                </span>
                                </div>
                            ) : (
                                // ✅ Kalau bukan ORIGINAL, render normal pakai SelectedLabels
                                <SelectedLabels
                                cardId={cardId}
                                fetchCardDetail={fetchCardById}
                                labels={labels}
                                fetchLabels={fetchLabels}
                                />
                            )} */}
                            </div>

                        </div>

                        {/* HEADER BUTTON  */}
                        <div className="main-header-btn">
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
                        </div>

                        {/* SHOW BUTTON  */}
                        {/* SHOW COVER  */}
                        {showCover && (
                            <div className='cover-modal'>
                                <CoverCard
                                    fetchCovers={fetchCovers}
                                    covers={covers}
                                    setCovers={setCovers}
                                    handleSelectCover={handleSelectCover}
                                    userId={userId}
                                    cardId={cardId}
                                    fetchCardDetail={fetchCardById}
                                    handleRemoveCover={handleRemoveCover}
                                    selectedCover={selectedCover}
                                    setSelectedCover={setSelectedCover}
                                    fetchCardCover={fetchCardCover}
                                    onClose={handleCloseCover}
                                    fetchCardActivities={fetchCardActivities}
                                    showCover={showCover}
                                    setShowCover={setShowCover}
                                    setShowSelectCover={setShowSelectCover}
                                />
                            </div>
                        )}

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
                        {/* END SHOW BUTTON  */}
                    </div>

                    {/* Toggle Button (only for small screen) */}
                    <div className="status-toggle-btn-wrapper">
                        <button 
                            className="status-toggle-btn" 
                            onClick={toggleStatusVisibility}
                        >
                            {statusVisible ? 'Hide Status ▲' : 'Show Status ▼'}
                        </button>
                    </div>
                    
                    {/* STATUS  */}
                     <div className={`ncd-status ${!statusVisible ? 'status-hidden' : ''}`}>
                        <div className="ncd-status-container">
                            <StatusDisplay 
                                cardId={cardId} 
                                // onClose={handleCloseStatus}
                                currentStatus={currentStatus}
                                setCurrentStatus={setCurrentStatus}
                                allStatuses={allStatuses}
                                setAllStatuses={setAllStatuses}
                                selectedStatus={selectedStatus}
                                setSelectedStatus={setSelectedStatus}
                                fetchCardStatus={fetchCardStatus}
                                fetchAllStatuses={fetchAllStatuses}
                            />
                        </div>
                        <div className="ncd-status-priority">
                           <SelectPriority 
                                cardId={cardId} 
                                selectedProperties={selectedProperties} 
                                setSelectedProperties={setSelectedProperties} 
                                selectedPriority={selectedPriority}
                                refreshPriority={fetchPriority}
                                fetchCardDetail={fetchCardById}
                                fetchCardActivities={fetchCardActivities}
                                cardActivities={cardActivities} 
                                setCardActivities={setCardActivities}
                            />
                        </div>
                        <div className="ncd-status-due">
                            <DueDateDisplay
                                cardId={cardId}
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
                    </div>
                </div>

                <div className="ncd-main-content">
                    <div className="ncd-main-left">

                        {/* DESCRIPTION CARD  */}
                        <div className="ncd-desc">
                            <div className="des-header">
                                <div className="des-left">
                                    Description
                                </div>
                                <BootstrapTooltip title='Detail Description' placement='top'>
                                    <div className="des-right" onClick={handleShowModalDes}>
                                        <RiExpandDiagonalLine className='des-icon'/>
                                    </div>
                                </BootstrapTooltip>
                            </div>

                            <div className="des-content">
                                {cards && cardId && (
                                <div className="des-content" style={{ height: "fit-content" }}>
                                    {editingDescription === cardId ? (
                                    <div className="ta-cont">
                                        <ReactQuill
                                            ref={quillRef}
                                            theme="snow"
                                            value={newDescription}
                                            onChange={setNewDescription}
                                            modules={modules}
                                            className="my-editor"
                                        />

                                        <div className="desc-actions">
                                        <button
                                            className="btn-des-save"
                                            onClick={() => handleSaveDescription(cardId)}
                                            disabled={loading}
                                        >
                                            {loading ? "Saving..." : "Save"}
                                        </button>

                                        <button
                                            className="btn-cancel"
                                            onClick={() => {
                                            setEditingDescription(null);
                                            setNewDescription(cards.description || "");
                                            }}
                                            >
                                            Cancel
                                        </button>
                                        </div>
                                    </div>
                                    ) : (
                                    <div
                                        onClick={(e) => handleEditDescription(e, cardId, cards.description)}
                                        style={{ cursor: "pointer", whiteSpace: "pre-wrap" }}
                                        className="div-p"
                                    >
                                        {cards.description && cards.description.trim() !== "" ? (
                                        <>
                                            <div
                                            dangerouslySetInnerHTML={{
                                                __html: showMore
                                                ? linkify(cards.description)
                                                : linkify(cards.description.substring(0, maxChars)),
                                            }}
                                            style={{ cursor: "text" }}
                                            onClick={(e) => {
                                                if (e.target.tagName === "A") e.stopPropagation();
                                            }}
                                            />
                                            {cards.description.length > maxChars && (
                                            <span
                                                onClick={(e) => {
                                                e.stopPropagation();
                                                setShowMore((prev) => !prev);
                                                }}
                                                style={{
                                                color: "#5557e7",
                                                fontWeight: "500",
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "flex-start",
                                                marginTop: "8px",
                                                gap: "5px",
                                                }}
                                            >
                                                {showMore ? "Show Less" : "Show More"}
                                                {showMore ? <HiChevronUp /> : <HiChevronDown />}
                                            </span>
                                            )}
                                        </>
                                        ) : (
                                        <div className="placeholder-desc">
                                            <p>(click to add description)</p>
                                        </div>
                                        )}
                                    </div>
                                    )}


                                </div>
                            )}
                            </div>

                        </div>
                        
                        

                        {/* ATTACHMENT  */}
                        <div className="ncd-attach">
                            <div className="attach-header-cont">
                                <h5>Attachment</h5>
                                <div className="attach-header-btn">
                                <button className="total-file">{totalFile} files</button>
                                <BootstrapTooltip title="add attachment" placement="top">
                                    <button className="add-attach" onClick={handleShowFormUpload}>
                                    <HiPlus />
                                    </button>
                                </BootstrapTooltip>
                                </div>
                            </div>

                            <div className="attach-body">
                                {totalFile > 0 ? (
                                <div className="file-cont">
                                    <UploadFile 
                                        cardId={cardId} 
                                        fetchCardById={fetchCardById} 
                                        allUploadFile={allUploadFile}
                                        fetchAllUploadFile={fetchAllUploadFile}

                                    />
                                </div>
                                ) : (
                                <div className="no-file">
                                    <div className="no-icon">
                                        <IoShareOutline/>
                                    </div>
                                    <div className="no-desc">
                                        <h5>Attachment is empty <span onClick={handleShowFormUpload}>upload here</span></h5>
                                    </div>
                                </div>
                                )}
                            </div>
                            </div>

                            {showFormUpload && (
                            <div className="upload-form-modals">
                                <FormUpload 
                                    cardId={cardId} 
                                    onClose={handleCloseFormUpload} 
                                    fetchCardById={fetchCardById}
                                    fetchAllUploadFile={fetchAllUploadFile}
                                    />
                            </div>
                            )}
                            {/* END ATTACHMENT  */}

                    </div>


                    <div className="ncd-main-right">

                        {/* COVER & DETAIL  */}
                        <div className="ncd-cover-detail">
                            <CoverSelect cardId={cardId} fetchCardDetail={fetchCardById} selectedCover={selectedCover}/>
                            <div className="ncd-detail">
                                <div className="ncd-detail-header">
                                    Card Information
                                </div>
                                <div className="ncd-detail-con">
                                    <div className="c-create">
                                         <HiOutlineCalendar className='cc-icon'/>
                                         <div className="cc-date">
                                             <p>Created</p>
                                             {cards.create_at && formatTimestamp(cards.create_at)}
                                         </div>
                                    </div>
                                    <div className="c-create">
                                         <HiMiniListBullet className='cc-icon'/>
                                         <div className="cc-date" style={{fontWeight:'bold', width:'100%'}}>
                                             <p>List</p>
                                             {listName}
                                         </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* USER ASSIGMENT  */}
                        <div className="ncd-user-assign">
                            <div className="ncd-assign-header">
                                Assigned To
                                <button>{assignedUsers.length} users</button>
                            </div>
                            <div className="ncd-assign-content">
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
                            <div className="ncd-add-btn">
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

                        {/* CHECKLIST  */}
                        <div className="ncd-card-checklist">
                            <div className="ncd-checklist-header">
                                Checklist List
                                <button>
                                    {/* {checkChecklist.checked} /  {checklistTotal.total} */}
                                </button>
                            </div>
                            <div className="ncd-checklist-content">
                                <Checklist 
                                    cardId={cardId}
                                    checklists={checklists}
                                    setChecklist={setChecklist}
                                    fetchCardChecklists={fetchCardChecklists}
                                    fetchCardById={fetchCardById}
                                    fetchTotalChecklist={fetchTotalChecklist}
                                />
                            </div>
                        </div>

                        {/* CARD ACTIVITY */}
                        <div className="ncd-card-activity">
                            <div className="ncd-activity-header">
                                Recent Card Activity
                            </div>
                            <div className="ncd-activiy-content">
                                <NewCardActivity 
                                    cardId={cardId} 
                                    fetchCardById={fetchCardById} 
                                    fetchCardActivities={fetchCardActivities}
                                    cardActivities={cardActivities} 
                                    setCardActivities={setCardActivities}
                                />
                                {/* <CardActivity cardId={cardId} fetchCardById={fetchCardById}/> */}
                            </div>
                        </div>
                    </div>
                </div>

        </div>
        
       {/* MODAL DES  */}
        {showModalDes && (
        <div className="modal-des-container">
            <div className="modals-content">
                <CardDescriptionExample 
                    card={cards} 
                    setCard={setCards} 
                    onClose={handleCloseModalDes} 
                    cardId={cardId} 
                    newDescription={newDescription}
                    setNewDescription={setNewDescription}
                    handleSaveDescription={handleSaveDescription}
                    loading={loading}
                    setLoading={setLoading}
                    showMore={showMore}
                    setShowMore={setShowMore}
                    linkify={linkify}
                    handleEditDescription={handleEditDescription}
                    maxChars={maxChars} 
                    modules={modules}  
                    editingDescription={editingDescription} 
                    setEditingDescription={setEditingDescription}        
                />
            </div>
        </div>
        )}
        {/* END MODAL DES  */}
    </div>
  )
}

export default NewCardDetail
