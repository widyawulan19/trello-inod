import React, { useState } from "react";
import { HiChevronRight, HiOutlineClock } from "react-icons/hi2";
import '../style/modules/DueDate.css';
import DueDate from "../modules/DueDate";
import { FaClock } from "react-icons/fa6";

const DueDateDisplay = ({ 
  cardId,
  dueDates = [], 
  setDueDates,
  selectedDate, 
  setSelectedDate,
  selectedDueDateId,
  setSelectedDueDateId,
  loading, 
  setLoading,
  fetchDueDates,
}) => {
  const [showDueDate, setShowDueDate] = useState(false);


const getDueDateClass = (dueDateString) => {
  if (!dueDateString) return "due-normal";

  const now = new Date();
  const dueDate = new Date(dueDateString);
  const timeDiff = dueDate.getTime() - now.getTime();
  const oneDay = 24 * 60 * 60 * 1000;

  if (timeDiff < 0) return "due-overdue";
  if (timeDiff <= oneDay) return "due-red";
  if (timeDiff <= 2 * oneDay) return "due-orange";
  if (timeDiff <= 3 * oneDay) return "due-blue";
  return "due-normal";
};



  const handleShowDueDate = () => setShowDueDate(true);
  const handleCloseDueDate = () => setShowDueDate(false);

  return (
    <div className="due-date-display">
      {loading ? (
        <p className="due-date-loading">Loading...</p>
      ) : dueDates.length === 0 ? (
        <div className="due-date-empty">
          <p>No due date set</p>
          <button
            className="no-due-date-btn"
            onClick={handleShowDueDate}
          >
            + Set Due Date
          </button>
        </div>
      ) : (
        <div className="due-date-list">
          {dueDates.map((date) => (
            <div 
              key={date.id}
              className={`due-date-card ${getDueDateClass(date.due_date)}`}
            >
              <div className="due-date-card-header">
                <div
                  className={`due-date-card-title ${getDueDateClass(date.due_date)}`}
                >
                  <FaClock/>
                  DUE DATE
                </div>
                <HiChevronRight
                  className="due-setting-icon"
                  onClick={handleShowDueDate}
                />
              </div>

              {/* CONTENT */}

              <div className="due-date-card-content">
                <div className="due-date-card-datetime">
                  {new Date(date.due_date).toLocaleDateString("id-ID", {
                    day: "numeric", month: "long", year: "numeric"
                  })}
                  <span>|</span>
                  {new Date(date.due_date).toLocaleTimeString("id-ID", {
                    hour: "2-digit", minute: "2-digit", hour12: false
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDueDate && (
        <div className="due-date-popup">
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
  );
};

export default DueDateDisplay;
