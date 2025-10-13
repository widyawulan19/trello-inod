import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSnackbar } from '../context/Snackbar'
import { duplicateCard, getBoards, getListByBoard, getCardsByList } from '../services/ApiServices'
import BootstrapTooltip from '../components/Tooltip'
import { HiOutlineChevronDown, HiOutlineSquare2Stack, HiOutlineXMark } from 'react-icons/hi2'
import '../style/fitur/DuplicateCard.css'

const DuplicateCard = ({ cardId, boardId, listId, workspaceId, onClose, fetchCardList }) => {
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

  const navigate = useNavigate()
  const { showSnackbar } = useSnackbar()

  // 1️⃣ Load semua board
  useEffect(() => {
    getBoards()
      .then((res) => setBoards(res.data))
      .catch((err) => console.error('Error fetching boards:', err))
  }, [])

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
    if (!cardId || !selectedList?.id) {
      console.error('❌ cardId or selectedListId is missing!')
      return
    }

    setIsDuplicating(true)
    try {
      const result = await duplicateCard(cardId, selectedList.id, selectedPosition?.value)
      console.log('✅ Card duplicated:', result.data)
      showSnackbar('Card duplicated successfully!', 'success')

      navigate(`/layout/workspaces/${workspaceId}/board/${selectedBoardId}`)
      fetchCardList(selectedList.id)
      onClose()
    } catch (error) {
      console.error('❌ Error duplicating card:', error)
      showSnackbar('Failed to duplicate the card!', 'error')
    } finally {
      setIsDuplicating(false)
    }
  }

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

        {/* 🎯 Select Position */}
        {selectedList && positions.length > 0 && (
          <div className='dcb-select-position'>
            <label>Choose Position</label>
            <div className='dcb-list-dropdown'>
              <button
                className='dcb-btn'
                onClick={(e) => {
                  e.stopPropagation()
                  setShowPositionDropdown(!showPositionDropdown)
                }}
              >
                {selectedPosition ? selectedPosition.label : 'Select position'}
                <HiOutlineChevronDown />
              </button>

              {showPositionDropdown && (
                <div className='dcb-menu-wrapper'>
                  <input
                    type='text'
                    placeholder='Search positions...'
                    value={searchPosition}
                    onChange={(e) => setSearchPosition(e.target.value)}
                    className='dcb-search-input'
                  />
                  <ul className='dcb-menu'>
                    {positions
                      .filter((pos) =>
                        pos.label.toLowerCase().includes(searchPosition.toLowerCase())
                      )
                      .map((pos, index) => (
                        <li
                          key={index}
                          className={`dcb-item ${
                            selectedPosition?.value === pos.value ? 'selected' : ''
                          }`}
                          onClick={() => {
                            setSelectedPosition(pos)
                            setShowPositionDropdown(false)
                          }}
                        >
                          {pos.label}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
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


// import React, { useEffect, useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useSnackbar } from '../context/Snackbar'
// import { duplicateCard, getBoards, getListByBoard } from '../services/ApiServices'
// import BootstrapTooltip from '../components/Tooltip'
// import { HiOutlineChevronDown, HiOutlineSquare2Stack, HiOutlineXMark } from 'react-icons/hi2'
// import '../style/fitur/DuplicateCard.css'

// const DuplicateCard = ({ cardId, boardId, listId, workspaceId, onClose, fetchCardList }) => {
//   const [boards, setBoards] = useState([])
//   const [lists, setLists] = useState([])
//   const [searchBoard, setSearchBoard] = useState('')
//   const [searchList, setSearchList] = useState('') // 🔍 state baru untuk search list
//   const [selectedBoardId, setSelectedBoardId] = useState(null)
//   const [selectedList, setSelectedList] = useState(null)
//   const [showBoardDropdown, setShowBoardDropdown] = useState(false)
//   const [showListDropdown, setShowListDropdown] = useState(false)
//   const [isMoving, setIsMoving] = useState(false)
//   const navigate = useNavigate()
//   const { showSnackbar } = useSnackbar()

//   // 1️⃣ Load semua board
//   useEffect(() => {
//     getBoards()
//       .then((res) => {
//         setBoards(res.data)
//       })
//       .catch((err) => {
//         console.error('Error fetching boards data:', err)
//       })
//   }, [])

//   // 2️⃣ Fetch list berdasarkan board yang dipilih
//   useEffect(() => {
//     if (selectedBoardId) {
//       getListByBoard(selectedBoardId)
//         .then((res) => {
//           setLists(res.data)
//         })
//         .catch((err) => {
//           console.error('❌ Error fetching lists:', err)
//         })
//     }
//   }, [selectedBoardId])

//   // 3️⃣ Duplicate card
//   const handleDuplicateCard = async () => {
//     if (!cardId || !selectedList?.id) {
//       console.error('❌ cardId or selectedListId is missing!')
//       return
//     }

//     setIsMoving(true)
//     try {
//       const result = await duplicateCard(cardId, selectedList.id)
//       console.log('✅ Card duplicated to target list:', result.data)
//       showSnackbar('Card duplicated successfully!', 'success')

//       navigate(`/layout/workspaces/${workspaceId}/board/${selectedBoardId}`)
//       fetchCardList(selectedList.id)
//       onClose()
//     } catch (error) {
//       console.error('❌ Error duplicating card:', error)
//       showSnackbar('Failed to duplicate the card!', 'error')
//     } finally {
//       setIsMoving(false)
//     }
//   }

//   return (
//     <div className='dc-container'>
//       <div className='dc-header'>
//         <div className='dc-left'>
//           <div className='left-icon'>
//             <HiOutlineSquare2Stack className='mini-icon' />
//           </div>
//           <p>Duplicate Card</p>
//         </div>
//         <div className='dc-right'>
//           <BootstrapTooltip title='Close' placement='top'>
//             <HiOutlineXMark className='dc-icon' onClick={onClose} />
//           </BootstrapTooltip>
//         </div>
//       </div>

//       <div className='dc-body'>
//         {/* 🗂️ Select Board */}
//         <div className='dc-board'>
//           <label>Choose Board</label>
//           <div className='dcb-dropdown'>
//             <button
//               className='dcb-btn'
//               onClick={(e) => {
//                 e.stopPropagation()
//                 setShowBoardDropdown((prev) => !prev)
//               }}
//             >
//               {selectedBoardId
//                 ? boards.find((b) => b.id === selectedBoardId)?.name
//                 : 'Select a board'}
//               <HiOutlineChevronDown />
//             </button>

//             {showBoardDropdown && (
//               <div className='dcb-menu-wrapper'>
//                 {/* 🔍 Search Board */}
//                 <input
//                   type='text'
//                   placeholder='Search boards...'
//                   value={searchBoard}
//                   onClick={(e) => e.stopPropagation()}
//                   onChange={(e) => setSearchBoard(e.target.value)}
//                   className='dcb-search-input'
//                 />

//                 <ul className='dcb-menu'>
//                   {boards
//                     .filter((board) =>
//                       board.name.toLowerCase().includes(searchBoard.toLowerCase())
//                     )
//                     .map((board) => (
//                       <li
//                         key={board.id}
//                         className='dcb-item'
//                         onClick={() => {
//                           setSelectedBoardId(board.id)
//                           setSelectedList(null)
//                           setShowBoardDropdown(false)
//                           setSearchList('') // reset search list pas ganti board
//                         }}
//                       >
//                         {board.name}
//                       </li>
//                     ))}
//                 </ul>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* 📝 Select List */}
//         {selectedBoardId && (
//           <div className='dcb-select-list'>
//             <label>Choose List</label>
//             <div className='dcb-list-dropdown'>
//               <button
//                 className='dcb-btn'
//                 onClick={(e) => {
//                   e.stopPropagation()
//                   setShowListDropdown(!showListDropdown)
//                 }}
//               >
//                 {selectedList ? selectedList.name : 'Select a list'}
//                 <HiOutlineChevronDown />
//               </button>

//               {showListDropdown && (
//                 <div className='dcb-menu-wrapper'>
//                   {/* 🔍 Search List */}
//                   <input
//                     type='text'
//                     placeholder='Search lists...'
//                     value={searchList}
//                     onClick={(e) => e.stopPropagation()}
//                     onChange={(e) => setSearchList(e.target.value)}
//                     className='dcb-search-input'
//                   />

//                   <ul className='dcb-menu'>
//                     {lists
//                       .filter((list) =>
//                         list.name.toLowerCase().includes(searchList.toLowerCase())
//                       )
//                       .map((list) => (
//                         <li
//                           key={list.id}
//                           className={`dcb-item ${
//                             selectedList?.id === list.id ? 'selected' : ''
//                           }`}
//                           onClick={() => {
//                             setSelectedList(list)
//                             setShowListDropdown(false)
//                           }}
//                         >
//                           {list.name}
//                         </li>
//                       ))}

//                     {/* ❗ Kalau hasil kosong */}
//                     {lists.filter((list) =>
//                       list.name.toLowerCase().includes(searchList.toLowerCase())
//                     ).length === 0 && (
//                       <li className='dcb-item no-result'>No lists found</li>
//                     )}
//                   </ul>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       <div className='div-btn'>
//         <button
//           className='dcb-move-btn'
//           onClick={handleDuplicateCard}
//           disabled={!selectedList || isMoving}
//         >
//           <HiOutlineSquare2Stack className='dcb-icon' />
//           {isMoving ? 'Duplicating...' : 'Duplicate Card'}
//         </button>
//       </div>
//     </div>
//   )
// }

// export default DuplicateCard
