import React, { useState, useEffect } from "react";
import { getAllDueDateByCardId } from "../services/ApiServices";
import { HiChevronRight, HiOutlineCalendar, HiOutlineClock } from "react-icons/hi2";
import '../style/modules/DueDate.css'
import DueDate from "../modules/DueDate";

const DueDateDisplay = ({ 
  cardId,
  dueDates, 
  setDueDates,
  selectedDate, 
  setSelectedDate,
  selectedDueDateId,
  setSelectedDueDateId,
  loading, 
  setLoading,
  fetchDueDates,

}) => {

  //state
  const [showDueDate, setShowDueDate] = useState(false);

  if(!dueDates) return null;

  const getDueStatusColor = (date) => {
    const now = new Date();
    const dueDate = new Date(date);
    const timeDiff = dueDate.getTime() - now.getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    if (timeDiff <= oneDay) {
      return "red";
    } else if (timeDiff <= 2 * oneDay) {
      return "orange";
    } else if (timeDiff <= 3 * oneDay) {
      return "blue";
    } else {
      return "#333";
    }
  };

  //function show and close due date
  const handleShowDueDate = () =>{
    setShowDueDate(!showDueDate);
  }

  const handleCloseDueDate = () =>{
    setShowDueDate(false);
  }

  return (
    <div className="due-date-display" style={{position:'relative'}}>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="date-show">
          {dueDates.map((date) => (
            <div 
              style={{ 
                border:`2px solid ${getDueStatusColor(date.due_date)}`,
                borderRadius:'8px',
                width:'100%',
                height:'100%',
                display:'flex',
                padding:'10px',
                paddingBottom:'3px',
                flexDirection:'column',
                alignItems:'center',
                justifyContent:'center',
                color: getDueStatusColor(date.due_date)
              }}>
                <div className="ds-header">
                  <div style={{
                      gap:'5px',
                      fontSize:'12px',
                      display:'flex',
                      alignItems:'center', 
                      justifyContent:'flex-start',
                      color: getDueStatusColor(date.due_date),
                      position:'relative'
                    }}>
                    <HiOutlineClock/>
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
                          zIndex:'99',
                          width:'300px',
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
              
              <div key={date.id} style={{width:'100%',height:'100%',display:'flex', alignItems:'center', justifyContent:'flex-start',borderRadius:'6px', padding:'3px', fontSize:'12px'}}>
                {/* <HiOutlineClock style={{marginRight:'5px', color: getDueStatusColor(date.due_date), fontSize:'12px'}}/> */}
                <div className="date" style={{ color: getDueStatusColor(date.due_date), fontWeight:'bold' }}>
                  {/* <HiOutlineCalendar className="date-icon" /> */}
                  {new Date(date.due_date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  <div style={{color: getDueStatusColor(date.due_date), margin:'1px'}}>|</div>
                  <div className="time" style={{ color: getDueStatusColor(date.due_date) }}>
                    {/* <HiOutlineClock className="time-icon" /> */}
                    {new Date(date.due_date).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                </div>
                </div> 
              </div>
            </div>
          ))}
        </div>
      )}
      
    </div>
  );
};

export default DueDateDisplay;


// return (
//     <div className="due-date-display">
//       {loading ? (
//         <p>Loading...</p>
//       ) : (
//         <div className="date-show">
//           {dueDates.map((date) => (
//             <div key={date.id} style={{width:'100%',display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${getDueStatusColor(date.due_date)}`,borderRadius:'6px', padding:'3px'}}>
//               <HiOutlineClock style={{marginRight:'5px', color: getDueStatusColor(date.due_date), fontSize:'12px'}}/>
//               <div className="date" style={{ color: getDueStatusColor(date.due_date), fontWeight:'bold' }}>
//                 {/* <HiOutlineCalendar className="date-icon" /> */}
//                 {new Date(date.due_date).toLocaleDateString("id-ID", {
//                   day: "numeric",
//                   month: "long",
//                   year: "numeric",
//                 })}
//                 <div style={{color: getDueStatusColor(date.due_date), margin:'1px'}}>|</div>
//                 <div className="time" style={{ color: getDueStatusColor(date.due_date) }}>
//                   {/* <HiOutlineClock className="time-icon" /> */}
//                   {new Date(date.due_date).toLocaleTimeString("id-ID", {
//                     hour: "2-digit",
//                     minute: "2-digit",
//                     hour12: false,
//                   })}
//               </div>
//               </div> 
//             </div>
//           ))}

//         </div>
//       )}
//     </div>
//   );