return (
  <div className="due-date-display">
    {loading ? (
      <p className="due-date-loading">Loading...</p>
    ) : dueDates.length === 0 ? (
      <div className="due-date-empty">
        <p className="due-date-empty-text">No due date set</p>
        <button
          className="due-date-empty-btn"
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
            className="due-date-card"
          >
            {/* Header */}
            <div className="due-date-card-header">
              <div className="due-date-card-title">
                <HiOutlineClock />
                <span>DUE DATE</span>
              </div>

              <HiChevronRight
                className="due-date-setting-icon"
                onClick={handleShowDueDate}
              />
            </div>

            {/* Content */}
            <div className="due-date-card-content">
              <div className="due-date-card-datetime">
                {new Date(date.due_date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                <span className="due-date-separator">|</span>
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
