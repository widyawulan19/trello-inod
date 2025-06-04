import React, { useEffect, useState } from 'react'
import { SlRefresh } from "react-icons/sl";
import { HiBars3BottomLeft, HiFlag, HiOutlineCalendarDateRange, HiOutlineCheckCircle, HiOutlineCircleStack, HiOutlineEllipsisHorizontalCircle, HiOutlineFlag } from 'react-icons/hi2'
import StatusDisplay from '../UI/StatusDisplay'
import '../style/modules/DetailCard.css'
import CardStatus from './CardStatus'
import SelectPriority from '../UI/SelectPriority'
import CardProperties from './CardPriorities'
import DueDateDisplay from '../UI/DueDateDisplay'
import DueDate from './DueDate'
import { HiOutlineSwitchHorizontal } from 'react-icons/hi';
import BootstrapTooltip from '../components/Tooltip';
import { getAllDataMarketingCard, updateDescCard } from '../services/ApiServices';

const DetailCard=({
  cards,
  cardId, 
  //Card status
  currentStatus,
  setCurrentStatus,
  allStatuses,
  setAllStatuses,
  selectedStatus,
  setSelectedStatus,
  fetchCardStatus,
  fetchAllStatuses,
  fetchCardById,
  //PRIORITY
  selectedProperties,
  setSelectedProperties,
  selectedPriority,
  refreshPriority,
  //DUE DATE
  dueDates,
  setDueDates,
  selectedDate,
  setSelectedDate,
  selectedDueDateId,
  setSelectedDueDateId,
  loading,
  setLoading,
  fetchDueDates
})=> {
  //STATE
  const [showStatus, setShowStatus] = useState(false)
  const [showPriorities, setShowPriorities] = useState(false)
  const [showDueDate, setShowDueDate] = useState(false)
  //EDITING DESCRIPTION
  const [editingDescription, setEditingDescription] = useState(null);
  const [newDescription, setNewDescription] = useState('');
  const [detailOrder, setDetailOrder] = useState(null);

  //DEBUG
  console.log('File detail card menerima cardId', cardId);
  console.log('File detail card menerima data current status', currentStatus);
  console.log('File detail card menerima data cards:', cards)
  console.log('detail card menerima DetailOrder:', detailOrder);

  //FUNCTION
  //1.STATUS  
  const handleShowStatus = () =>{
    setShowStatus(!showStatus)
  }
  const handleCloseStatus = () =>{
    setShowStatus(false)
  }

   //2. PRIORITIES
   const handleShowPrio = ()=>{
    setShowPriorities(!showPriorities)
  }

  const handleClosePrio = () =>{
    setShowPriorities(false)
  }

  //3.DUE DATE
  const handleShowDueDate = () =>{
    setShowDueDate(!showDueDate)
  }
  const handleCloseDueDate = () =>{
    setShowDueDate(false)
  }

  //4.FUNGSI EDITING CARD DESCTIPTION
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

  //5. GET ALL DATA MARKETING BERDASARKAN CARDID YANG SAMA
//   const getOrderDetail = async(cardId)=>{
//     try{
//       const response = await getAllDataMarketingCard(cardId);
//       setDetailOrder(response.data);
     
//     }catch(error){
//       console.error('Gagal mengambil data marketing:', error);
//       throw error;
//     }
//   }

// useEffect(()=>{
//     if(cardId){
//       getOrderDetail(cardId);
//     }
//   },[cardId])

  return (
    <div className='dc-contain'>
    <div className='detail-card-container'>
      {/* STATUS  */}
      <div className="dcc-content">
        <div className="dcc-box">
        <div className="dcl">
            <HiOutlineCheckCircle className='dcc-icon'/>
            <h5>STATUS</h5>
          </div>
          <div className="dcr">
            <BootstrapTooltip title='Change Priority' placement='top'>
              <HiOutlineSwitchHorizontal className='change-icon' onClick={handleShowStatus}/>
            </BootstrapTooltip>
          </div>
          
        </div>
        <div className="dcc-result">
          <StatusDisplay cardId={cardId} currentStatus={currentStatus}/>
        </div>
        {/* SHOW  */}
        {showStatus && (
          <div className="status-modal">
            <CardStatus
              cardId={cardId}
              onClose={handleCloseStatus}
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
        )}
      </div>

      
      {/* PRIORITY  */}
      <div className="dcc-content">
        <div className="dcc-box">
          <div className="dcl">
            <HiOutlineFlag className='dcc-icon'/>
            <h5>PRIORITY</h5>
          </div>
          <div className="dcr">
            <BootstrapTooltip title='Change Priority' placement='top'>
              <HiOutlineSwitchHorizontal className='change-icon' onClick={handleShowPrio}/>
            </BootstrapTooltip>
          </div>
        </div>
        <div className="dcc-result">
          <SelectPriority cardId={cardId} selectedProperties={selectedProperties} setSelectedProperties={setSelectedProperties} selectedPriority={selectedPriority}/>
        </div>
        {/* SHOW PRIO  */}
        {showPriorities && (
          <div className='prio-modal'>
              <CardProperties 
                cardId={cardId}  
                onClose={handleClosePrio} 
                selectedProperties={selectedProperties} 
                setSelectedProperties={setSelectedProperties}
                selectedPriority={selectedPriority} 
                refreshPriority={refreshPriority}
              />
          </div>
        )}
      </div>

      

      {/* DUE DATE  */}
      <div className="dcc-content">
        <div className="dcc-box" style={{width:'100%'}}>
          <div className="dcl" >
            <HiOutlineCalendarDateRange className='dcc-icon'/>
            <h5>DUE DATE</h5>
          </div>
          <div className="dcr">
            <BootstrapTooltip title='Change Due Date' placement='top'>
              <HiOutlineSwitchHorizontal className='change-icon' onClick={handleShowDueDate}/>
            </BootstrapTooltip>
          </div>
        </div>
        <div className="dcc-result">
          <DueDateDisplay
            cardId={cardId}
            dueDates={dueDates}
            setDueDates={setDueDates}
            loading={loading}
            setLoading={setLoading}
            fetchDueDates={fetchDueDates}
          />
        </div>

        {/* SHOW DUE DATE  */}
        {showDueDate && (
          <div className='due-date-modal'>
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
      {/* END STATUS  */}
    </div>

    {/* DESCRIPTION  */}
    <div className="dcc-desc">
      <div className="dcc-desc-header">
        <HiBars3BottomLeft className='dcc-icon'/>
        <h5>DESCRIPTION</h5>
      </div>
       <div className="dcc-desc-content">
        {cards && cardId && (
          <div className="des-content">
           {editingDescription === cardId ? (
            <div className="ta-cont">
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                onBlur={() => handleSaveDescription(cardId)}
                onKeyDown={(e) => handleKeyPressDescription(e, cardId)}
                autoFocus
                rows={5}
              />
              <small className="text-muted">
                **Tekan Enter untuk simpan || Shift + Enter untuk baris baru
              </small>
          </div>
           ):(
            <div
              onClick={(e) => handleEditDescription(e, cardId, cards.description)}
              style={{ whiteSpace: "pre-wrap", cursor: "pointer"}}
              className='div-p'
            >
              {cards.description?.split('\n').map((line, index) => (
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
              ))}

            </div>
           )}
          </div>
        )}
       </div>
      </div>
      {/* END DESCRIPTION  */}

      {/* DETAIL ORDER  */}
      {/* <div className="dcc-order">
        <div className="dcco-header">
          <HiOutlineCircleStack/>
          <h5>DETAIL ORDER</h5>
        </div>

        <div className="dcco-body">
          {detailOrder?.map((item,index)=>(
            <div key={index}>
              <p><strong>Type:</strong> {item.type}</p>
              <p><strong>Buyer Name:</strong> {item.buyer_name}</p>
              <p><strong>Code Order:</strong> {item.code_order}</p>
              <p><strong>Order Number:</strong> {item.order_number}</p>
              <p><strong>Deadline:</strong> {new Date(item.deadline).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div> */}
      {/* END DETAIL ORDER  */}
    </div>
  )
}

export default DetailCard

