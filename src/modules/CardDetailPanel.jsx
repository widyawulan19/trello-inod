import React, { useState } from 'react'
import { FaCheckCircle } from 'react-icons/fa';
import { BsCalendar2Fill } from "react-icons/bs";
import { BiSolidUserCheck } from "react-icons/bi";
import { HiFlag, HiMiniCalendar, HiMiniLightBulb, HiOutlineTag, HiOutlineUserPlus, HiTag } from 'react-icons/hi2'
import DueDate from '../modules/DueDate'
import CardPriorities from './CardPriorities'
import Label from '../modules/Label'
import CardStatus from '../modules/CardStatus'
import CardAssigment from '../modules/CardAssigment'
import '../style/modules/CardDetailPanel.css'


const CardDetailPanel=({
  cardId,
  fetchCardDetail,
  labels,
  setLabels,
  fetchLabels,
  //PROPERTIES
  selectedProperties,
  setSelectedProperties,
  selectedPriority,
  refreshPriority,
  //ASSIGN
  assignedUsers,
  setAssignedUsers,
  fetchAssignedUsers,
  assignableUsers,
  setAssignableUsers,
  fetchAssignableUsers,
  //STATUS
  currentStatus,
  setCurrentStatus,
  allStatuses,
  setAllStatuses,
  selectedStatus,
  setSelectedStatus,
  fetchCardStatus,
  fetchAllStatuses,
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
  const [showDue, setShowDue] = useState(false)
  const [showPriorities, setShowPriorities] = useState(false)
  const [showLabel, setShowLabel] = useState(false)
  const [showStatus, setShowStatus] = useState(false)
  const [showAssigment, setShowAssigment] = useState(false)
  

  //FUNCTION
  //1. DUE
  const handleShowDue = () =>{
    setShowDue(!showDue)
  }
  const handleCloseDue = () =>{
    setShowDue(false)
  }

  //2. PRIORITIES
  const handleShowPrio = ()=>{
    setShowPriorities(!showPriorities)
  }

  const handleClosePrio = () =>{
    setShowPriorities(false)
  }

  //3. TAG
  const handleShowTag = () =>{
    setShowLabel(!showLabel)
  }
  const handleCloseTag = () =>{
    setShowLabel(false)
  }

  //4. STATUS
  const handleShowStatus = () =>{
    setShowStatus(!showStatus)
  }
  const handleCloseStatus = () =>{
    setShowStatus(false)
  }

  //5. ASSIGMENT
  const handleShowAssign = () =>{
    setShowAssigment(!showAssigment)
  }

  const handleCloseAssign = () =>{
    setShowAssigment(false)
  } 

  return (
    <div className='card-details-panel'>
      {/* <h5>ACTIONS</h5> */}
      <div className="button-container">
        <button onClick={handleShowDue}>
            <BsCalendar2Fill className='bc-icon' size={10}/>
            Due Date
        </button>
        <button onClick={handleShowPrio}>
          <HiMiniLightBulb className='bc-icon'/>
          Priorities
        </button>
        <button onClick={handleShowTag}>
          <HiTag className='bc-icon'/>
          Label
        </button>
        <button onClick={handleShowStatus}>
          <FaCheckCircle className='bc-icon'/>
          Status
        </button>
        <button onClick={handleShowAssign}>
          <BiSolidUserCheck className='bc-icon' size={14}/>
          Assignment
        </button>

        {/* SHOW Button */}
        {showDue && (
          <div className='due-modal'>
            <DueDate 
              cardId={cardId} 
              onClose={handleCloseDue}
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
        {showPriorities && (
          <div className="prio-modal">
            <CardPriorities cardId={cardId} fetchCardDetail={fetchCardDetail} onClose={handleClosePrio} selectedProperties={selectedProperties} setSelectedProperties={setSelectedProperties} selectedPriority={selectedPriority} refreshPriority={refreshPriority}/>
          </div>
        )}
        {showLabel && (
          <div className="label-modal">
            <Label 
              cardId={cardId} 
              labels={labels}
              setLabels={setLabels}
              fetchLabels={fetchLabels}
              fetchCardDetail={fetchCardDetail}
              onClose={handleCloseTag}
            />
          </div>
        )}
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
        {showAssigment && (
          <div className="assign-modal">
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
    </div>
  )
}

export default CardDetailPanel