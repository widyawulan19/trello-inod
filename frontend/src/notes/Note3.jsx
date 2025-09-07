<div className="mcb-dropdown">
  <button 
    className="mcb-btn"
    onClick={(e) => {
      e.stopPropagation();
      setShowBoardDropdown(!showBoardDropdown);
    }}
  >
    {selectedBoardId
      ? boards.find((b) => b.id === selectedBoardId)?.name
      : 'Select a board'}
    <HiOutlineChevronDown />
  </button>

  {showBoardDropdown && (
    <div className="mcb-menu-wrapper">
      {/* Input Search */}
      <input
        type="text"
        placeholder="Search boards..."
        value={searchBoard}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => setSearchBoard(e.target.value)}
        className="mcb-search-input"
      />

      <ul className="mcb-menu">
        {boards
          .filter((board) =>
            board.name.toLowerCase().includes(searchBoard.toLowerCase())
          )
          .map((board) => (
            <li
              key={board.id}
              className="mcb-item"
              onClick={() => {
                setSelectedBoardId(board.id);
                setSelectedList(null); // Reset list
                setShowBoardDropdown(false); // ✅ dropdown auto tertutup
              }}
            >
              {board.name}
            </li>
          ))}
      </ul>
    </div>
  )}
</div>
