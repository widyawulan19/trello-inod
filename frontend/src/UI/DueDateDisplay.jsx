import React, { useState, useEffect } from "react";
import { getAllDueDateByCardId } from "../services/ApiServices";
import { HiOutlineCalendar, HiOutlineClock } from "react-icons/hi2";
import '../style/modules/DueDate.css'

const DueDateDisplay = ({ cardId, dueDates, setDueDates, loading, setLoading,fetchDueDates  }) => {
  // if(!currentStatus) return null;
  if(!dueDates) return null;
  // const [dueDates, setDueDates] = useState([]);
  // const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   if (cardId) {
  //     fetchDueDates();
  //   }
  // }, [cardId]);

  // const fetchDueDates = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await getAllDueDateByCardId(cardId);
  //     console.log("Fetched Due Dates:", response.data);

  //     if (response.data.length > 0) {
  //       setDueDates(response.data);
  //     } else {
  //       setDueDates([]);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching due dates:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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

  return (
    <div className="due-date-display">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="date-show">
          {dueDates.map((date) => (
            <div key={date.id} style={{display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${getDueStatusColor(date.due_date)}`,borderRadius:'6px', padding:'3px'}}>
              <HiOutlineClock style={{marginRight:'5px', color: getDueStatusColor(date.due_date), fontSize:'12px'}}/>
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
          ))}

        </div>
      )}
    </div>
  );
};

export default DueDateDisplay;
