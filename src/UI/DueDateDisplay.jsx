import React, { useState } from "react";
import { HiChevronRight, HiOutlineClock } from "react-icons/hi2";
import '../style/modules/DueDate.css';
import DueDate from "../modules/DueDate";

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

  const getDueStatusColor = (date) => {
    const now = new Date();
    const dueDate = new Date(date);
    const timeDiff = dueDate.getTime() - now.getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    if (timeDiff <= oneDay) return "red";
    if (timeDiff <= 2 * oneDay) return "orange";
    if (timeDiff <= 3 * oneDay) return "blue";
    return "#333";
  };

  const handleShowDueDate = () => setShowDueDate(true);
  const handleCloseDueDate = () => setShowDueDate(false);

  return (
    <div className="due-date-display" style={{ position: 'relative' }}>
      {loading ? (
        <p>Loading...</p>
      ) : dueDates.length === 0 ? (
        <div
          style={{
            border: '1px dashed #ccc',
            borderRadius: '8px',
            // padding: '12px',
            padding:'5px 10px',
            textAlign: 'center',
            fontSize: '12px',
            color: '#888',
            backgroundColor: '#f9f9f9',
          }}
        >
          <p style={{ margin: '0 0 8px 0' }}>No due date set</p>
          <button
            onClick={handleShowDueDate}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              cursor: 'pointer',
              backgroundColor: '#eef',
              border: '1px solid #ccd',
              borderRadius: '4px',
            }}
          >
            + Set Due Date
          </button>
        </div>
      ) : (
        <div className="date-show">
          {dueDates.map((date) => (
            <div 
              key={date.id}
              style={{ 
                border: `2px solid ${getDueStatusColor(date.due_date)}`,
                borderRadius: '8px',
                width: '100%',
                padding: '10px',
                paddingBottom: '3px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: getDueStatusColor(date.due_date),
                position: 'relative'
              }}
            >
              <div className="ds-header">
                <div
                  style={{
                    gap: '5px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    color: getDueStatusColor(date.due_date),
                  }}
                >
                  <HiOutlineClock />
                  DUE DATE
                </div>
                <HiChevronRight
                  className="due-setting"
                  onClick={handleShowDueDate}
                  style={{ cursor: 'pointer' }}
                />
              </div>

              <div style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                fontSize: '12px',
                paddingTop: '12px'
              }}>
                <div style={{ fontWeight: 'bold' }}>
                  {new Date(date.due_date).toLocaleDateString("id-ID", {
                    day: "numeric", month: "long", year: "numeric"
                  })}
                  <span style={{ margin: '0 4px' }}>|</span>
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
        <div
          className="due-setting"
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            padding: '5px',
            border: '1px solid #ddd',
            boxShadow: '0px 4px 8px #5e12eb1e',
            borderRadius: '8px',
            backgroundColor: 'white',
            zIndex: '99',
            width: '300px',
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
  );
};

export default DueDateDisplay;
