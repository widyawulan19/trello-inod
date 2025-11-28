import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSnackbar } from '../context/Snackbar'
import { duplicateCardToList,duplicateCard, getBoards, getListByBoard, getCardsByList, getBoardsWorkspaces } from '../services/ApiServices'
import BootstrapTooltip from '../components/Tooltip'
import { HiOutlineChevronDown, HiOutlineSquare2Stack, HiOutlineXMark } from 'react-icons/hi2'
import '../style/fitur/DuplicateCard.css'

const DuplicateCard = ({ userId,cardId, boardId, listId, workspaceId, onClose, fetchCardList }) => {
  const [boards, setBoards] = useState([])
  const [lists, setLists] = useState([])
  const [positions, setPositions] = useState([]) // 🆕 daftar posisi card dalam list
  const [selectedPosition, setSelectedPosition] = useState(null) // 🆕 posisi terpilih

  const [searchBoard, setSearchBoard] = useState('')
  const [searchList, setSearchList] = useState('')
  const [searchPosition, setSearchPosition] = useState('') // 🆕 search untuk posisi

  const [selectedBoardId, setSelectedBoardId] = useState(null)
  const [selectedList, setSelectedList] = useState(null)
  const [showBoardDropdown, setShowBoardDropdown] = useState(false)
  const [showListDropdown, setShowListDropdown] = useState(false)
  const [showPositionDropdown, setShowPositionDropdown] = useState(false) // 🆕 dropdown posisi
  const [isDuplicating, setIsDuplicating] = useState(false)
  const [targetPosition, setTargetPosition] = useState(null)


  const navigate = useNavigate()
  const { showSnackbar } = useSnackbar()

  // 1️⃣ Load semua board
  useEffect(() => {
    if (!workspaceId) return

    getBoardsWorkspaces(workspaceId)
      .then((res) => {
        setBoards(res)
      })
      .catch((err) => console.error('Error fetching boards:', err))
  }, [workspaceId])
  // useEffect(() => {
  //   getBoards()
  //     .then((res) => setBoards(res.data))
  //     .catch((err) => console.error('Error fetching boards:', err))
  // }, [])

  // 2️⃣ Fetch list berdasarkan board yang dipilih
  useEffect(() => {
    if (selectedBoardId) {
      getListByBoard(selectedBoardId)
        .then((res) => setLists(res.data))
        .catch((err) => console.error('Error fetching lists:', err))
    }
  }, [selectedBoardId])

  // 3️⃣ Fetch posisi berdasarkan list yang dipilih
  useEffect(() => {
    if (selectedList?.id) {
      getCardsByList(selectedList.id)
        .then((res) => {
          const cards = res.data
          // Posisi di Trello biasanya “Top”, “Bottom”, dan “After [nama card]”
          const newPositions = [
            { label: 'Top (position 1)', value: 1 },
            ...cards.map((c, i) => ({
              label: `After "${c.title}"`,
              value: i + 2, // posisi setelah card ini
            })),
          ]
          setPositions(newPositions)
        })
        .catch((err) => console.error('Error fetching cards for positions:', err))
    }
  }, [selectedList])

  // 4️⃣ Duplicate card
  const handleDuplicateCard = async () => {
    if (!cardId || !selectedList?.id || !userId) { // pastikan userId ada
      console.error("❌ Missing cardId, listId, or userId!");
      return;
    }

    setIsDuplicating(true);
    try {
      const body = targetPosition
        ? { position: Number(targetPosition) }
        : {}; // opsional kalau user pilih posisi

      // ✅ Panggil API service
      const result = await duplicateCardToList(
        cardId,
        selectedList.id,
        userId,
        body
      );

      console.log("✅ Card duplicated:", result);
      showSnackbar("Card duplicated successfully!", "success");

      // Refresh list & tutup modal
      fetchCardList(selectedList.id);
      onClose();
    } catch (error) {
      console.error("❌ Error duplicating card:", error);
      showSnackbar("Failed to duplicate the card!", "error");
    } finally {
      setIsDuplicating(false);
    }
  };

  return (
    <div className='dc-container'>
      {/* 🧭 HEADER */}
      <div className='dc-header'>
        <div className='dc-left'>
          <div className='left-icon'>
            <HiOutlineSquare2Stack className='mini-icon' />
          </div>
          <p>Duplicate Card</p>
        </div>
        <div className='dc-right'>
          <BootstrapTooltip title='Close' placement='top'>
            <HiOutlineXMark className='dc-icon' onClick={onClose} />
          </BootstrapTooltip>
        </div>
      </div>

      {/* 🧩 BODY */}
      <div className='dc-body'>
        {/* 🗂️ Select Board */}
        <div className='dc-board'>
          <label>Choose Board</label>
          <div className='dcb-dropdown'>
            <button
              className='dcb-btn'
              onClick={(e) => {
                e.stopPropagation()
                setShowBoardDropdown((prev) => !prev)
              }}
            >
              {selectedBoardId
                ? boards.find((b) => b.id === selectedBoardId)?.name
                : 'Select a board'}
              <HiOutlineChevronDown />
            </button>

            {showBoardDropdown && (
              <div className='dcb-menu-wrapper'>
                <input
                  type='text'
                  placeholder='Search boards...'
                  value={searchBoard}
                  onChange={(e) => setSearchBoard(e.target.value)}
                  className='dcb-search-input'
                />
                <ul className='dcb-menu'>
                  {boards
                    .filter((b) =>
                      b.name.toLowerCase().includes(searchBoard.toLowerCase())
                    )
                    .map((board) => (
                      <li
                        key={board.id}
                        className='dcb-item'
                        onClick={() => {
                          setSelectedBoardId(board.id)
                          setSelectedList(null)
                          setSelectedPosition(null)
                          setShowBoardDropdown(false)
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

        {/* 📝 Select List */}
        {selectedBoardId && (
          <div className='dcb-select-list'>
            <label>Choose List</label>
            <div className='dcb-list-dropdown'>
              <button
                className='dcb-btn'
                onClick={(e) => {
                  e.stopPropagation()
                  setShowListDropdown(!showListDropdown)
                }}
              >
                {selectedList ? selectedList.name : 'Select a list'}
                <HiOutlineChevronDown />
              </button>

              {showListDropdown && (
                <div className='dcb-menu-wrapper'>
                  <input
                    type='text'
                    placeholder='Search lists...'
                    value={searchList}
                    onChange={(e) => setSearchList(e.target.value)}
                    className='dcb-search-input'
                  />
                  <ul className='dcb-menu'>
                    {lists
                      .filter((list) =>
                        list.name.toLowerCase().includes(searchList.toLowerCase())
                      )
                      .map((list) => (
                        <li
                          key={list.id}
                          className={`dcb-item ${
                            selectedList?.id === list.id ? 'selected' : ''
                          }`}
                          onClick={() => {
                            setSelectedList(list)
                            setShowListDropdown(false)
                            setSelectedPosition(null)
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

        {selectedList && (
          <div className="mc-position">
            {/* <label>Card Position (1 - {positions.length + 1})</label> */}
            <label>Card Position</label>
            <input
              type="number"
              min="1"
              max={positions.length + 1}
              value={targetPosition || ''}
              onChange={(e) => setTargetPosition(e.target.value)}
              placeholder="Position number"
              className="mc-position-input"
            />
          </div>
        )}

        
      </div>

      {/* 🚀 BUTTON */}
      <div className='div-btn'>
        <button
          className='dcb-move-btn'
          onClick={handleDuplicateCard}
          disabled={!selectedList || isDuplicating}
        >
          <HiOutlineSquare2Stack className='dcb-icon' />
          {isDuplicating ? 'Duplicating...' : 'Duplicate Card'}
        </button>
      </div>
    </div>
  )
}

export default DuplicateCard

