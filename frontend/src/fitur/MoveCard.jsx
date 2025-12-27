import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getBoards,
  moveCardToList,
  // moveCardToListTesting,
  getListByBoard,
  getCardsByList,
  getBoardsWorkspaces,
} from '../services/ApiServices';
import {
  HiMiniArrowLeftStartOnRectangle,
  HiOutlineChevronDown,
  HiOutlineXMark,
} from 'react-icons/hi2';
import BootstrapTooltip from '../components/Tooltip';
import '../style/fitur/MoveCard.css';
import { useSnackbar } from '../context/Snackbar';
import { useUser } from '../context/UserContext';

const MoveCard = ({
  cardId,
  workspaceId,
  onClose,
  boardId,
  listId,
  onCardMoved,
  fetchCardList,
}) => {
  const [boards, setBoards] = useState([]);
  const [lists, setLists] = useState([]);
  const [cards, setCards] = useState([]);
  const [searchBoard, setSearchBoard] = useState('');
  const [searchList, setSearchList] = useState('');
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [selectedList, setSelectedList] = useState(null);
  const [targetPosition, setTargetPosition] = useState('');
  const [showBoardDropdown, setShowBoardDropdown] = useState(false);
  const [showListDropdown, setShowListDropdown] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
    const { user } = useUser();
  const userId = user?.id;

  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  // 🔹 Load semua board
  useEffect(() => {
    if (!workspaceId) return;

    getBoardsWorkspaces(workspaceId)
      .then((res) => setBoards(res))
      .catch((err) => console.error('❌ Error fetching workspace boards:', err));
  }, [workspaceId]);
  // useEffect(() => {
  //   getBoards()
  //     .then((res) => setBoards(res.data))
  //     .catch((err) => console.error('❌ Error fetching boards:', err));
  // }, []);

  // 🔹 Load lists berdasarkan board
  useEffect(() => {
    if (selectedBoardId) {
      getListByBoard(selectedBoardId)
        .then((res) => setLists(res.data))
        .catch((err) => console.error('❌ Error fetching lists:', err));
    }
  }, [selectedBoardId]);

  // 🔹 Load cards berdasarkan list
  useEffect(() => {
    if (selectedList?.id) {
      getCardsByList(selectedList.id)
        .then((res) => setCards(res.data))
        .catch((err) => console.error('❌ Error fetching cards:', err));
    }
  }, [selectedList]);

  // 🔹 Fungsi pindahkan card
  const handleMoveCard = async () => {
    if (!cardId || !selectedList?.id) {
      alert('Please select both board and list!');
      return;
    }

    if (!targetPosition || targetPosition < 1) {
      alert('Please enter a valid position!');
      return;
    }

    setIsMoving(true);

    try {
      // const result = await moveCardToList(
      const result = await moveCardToList(
        cardId,
        userId,
        selectedList.id,
        targetPosition
      );
      console.log('✅ Card moved successfully:', result.data);
      showSnackbar('Card moved successfully!', 'success');

      // Refresh data parent
      if (onCardMoved) onCardMoved();
      if (fetchCardList) {
        fetchCardList(listId); // list asal
        fetchCardList(selectedList.id); // list tujuan
      }

      // Navigasi ke board tujuan
      // navigate(`/layout/workspaces/${workspaceId}/board/${selectedBoardId}`);

      onClose();
    } catch (error) {
      console.error('❌ Error moving card:', error);
      showSnackbar('Failed to move the card!', 'error');
    } finally {
      setIsMoving(false);
    }
  };

  return (
    <div className="mc-container">
      <div className="mc-header">
        <div className="mc-left">
          <div className="left-icon">
            <HiMiniArrowLeftStartOnRectangle className="mini-icon" />
          </div>
          <p>MOVE CARD</p>
        </div>
        <div className="mc-right">
          <BootstrapTooltip title="Close" placement="top">
            <HiOutlineXMark className="mc-icon" onClick={onClose} />
          </BootstrapTooltip>
        </div>
      </div>

      <div className="mc-body">
        {/* 🧭 Select Board */}
        <div className="mc-board">
          <label>Choose Board</label>
          <div className="mcb-dropdown">
            <button
              className="mcb-button"
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
                <input
                  type="text"
                  placeholder="Search boards..."
                  value={searchBoard}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setSearchBoard(e.target.value)}
                  className="dropdown-search-input"
                />

                <ul className="mcb-menu">
                  {boards
                    .filter((board) =>
                      board.name.toLowerCase().includes(searchBoard.toLowerCase())
                    )
                    .map((board) => (
                      <li
                        key={board.id}
                        className="move-card-item"
                        onClick={() => {
                          setSelectedBoardId(board.id);
                          setSelectedList(null);
                          setCards([]);
                          setTargetPosition('');
                          setShowBoardDropdown(false);
                        }}
                      >
                        {board.name}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* 🧩 Select List */}
        {selectedBoardId && (
          <div className="mc-select-list">
            <label>Choose List</label>
            <div className="mc-list-dropdown">
              <button
                className="move-card-list-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowListDropdown(!showListDropdown);
                }}
              >
                {selectedList ? selectedList.name : 'Select a list'}
                <HiOutlineChevronDown />
              </button>

              {showListDropdown && (
                <div className="mcl-menu-wrapper">
                  <input
                    type="text"
                    placeholder="Search lists..."
                    value={searchList}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setSearchList(e.target.value)}
                    className="move-card-search-input"
                  />
                  <ul className="move-card-menu">
                    {lists
                      .filter((list) =>
                        list.name.toLowerCase().includes(searchList.toLowerCase())
                      )
                      .map((list) => (
                        <li
                          key={list.id}
                          className={`move-card-list-item ${
                            selectedList?.id === list.id ? 'selected' : ''
                          }`}
                          onClick={() => {
                            setSelectedList(list);
                            setShowListDropdown(false);
                            setTargetPosition('');
                          }}
                        >
                          {list.name}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 🔢 Input posisi card */}
        {selectedList && (
          <div className="move-card-position">
            <label>Card Position :</label>
            {/* <label>Card Position (1 - {cards.length + 1})</label> */}
            <input
              type="number"
              min="1"
              max={cards.length + 1}
              value={targetPosition}
              onChange={(e) => setTargetPosition(e.target.value)}
              placeholder="Position number"
              className="mc-position-input"
            />
          </div>
        )}
      </div>

      <div className="move-card-button">
        <button
          className="mcl-move-btn"
          onClick={handleMoveCard}
          disabled={!selectedList || isMoving}
        >
          <HiMiniArrowLeftStartOnRectangle className="mcl-icon" />
          {isMoving ? 'Moving...' : 'Move Card'}
        </button>
      </div>
    </div>
  );
};

export default MoveCard;

