import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSnackbar } from '../context/Snackbar'
import { duplicateCard, getBoards, getListByBoard } from '../services/ApiServices'
import BootstrapTooltip from '../components/Tooltip'
import { HiOutlineChevronDown, HiOutlineSquare2Stack, HiOutlineXMark } from 'react-icons/hi2'
import '../style/fitur/DuplicateCard.css'

const DuplicateCard=({cardId, boardId, listId, workspaceId, onClose,fetchCardList})=> {
  //STATE
  console.log('File duplicate card menerima boardId:', boardId)
  const [boards, setBoards] = useState([])
  const [lists, setLists] = useState([])
  const [searchBoard, setSearchBoard] = useState('')
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [selectedList, setSelectedList] = useState(null);
  const [showBoardDropdown, setShowBoardDropdown] = useState(false);
  const [showListDropdown, setShowListDropdown] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const navigate = useNavigate()
  const {showSnackbar} = useSnackbar()

  //FUNGSI
  //1. load board
  useEffect(()=>{
    getBoards()
        .then((res)=>{
            setBoards(res.data);
        })
        .catch((err)=>{
            console.error('Error fetching boards data:', err)
        })
  },[]);
  //2. fetch list berdasarkan boards
   useEffect(() => {
          if (selectedBoardId) {
              getListByBoard(selectedBoardId)
                  .then((res) => {
                      setLists(res.data);
                  })
                  .catch((err) => {
                      console.error('❌ Error fetching lists:', err);
                  });
          }
      }, [selectedBoardId]);

    //3. function card duplicate
    const handleDuplicateCard = async () => {
        console.log('Card ID:', cardId); // Log to check the card ID
        console.log('List ID (Target):', selectedList.id); // Ensure this is the target list ID

    
        if (!cardId || ! selectedList.id) {
            console.error('❌ cardId or selectedListId is missing!');
            return;
        }
    
        try {
            const result = await duplicateCard(cardId,  selectedList.id); // Pass the target listId
            console.log('✅ Card duplicated to target list:', result.data);
            showSnackbar('Card duplicated successfully!', 'success');
            navigate(`/workspaces/${workspaceId}/board/${selectedBoardId}`);
            fetchCardList(selectedList.id)
            onClose()
        } catch (error) {
            console.error('❌ Error duplicating card:', error);
            showSnackbar('Failed to fuplicate the card!', 'error');
        }finally{
            setIsMoving(false)
        }
    };
  
    return (
    <div className='dc-container'>
        <div className="dc-header">
            <p>Duplicate Card</p>
            <BootstrapTooltip title='Close' placement='top'>
                <HiOutlineXMark className='dc-icon' onClick={onClose}/>
            </BootstrapTooltip>
        </div>
        <div className="dc-body">
            {/* SELECT BOARD  */}
            <div className="dc-board">
                <label>Choose Board</label>
                <div className="dcb-dropdown" onClick={(e)=>{e.stopPropagation(); setShowBoardDropdown(true)}}>
                    <button className='dcb-btn' onClick={(e)=>{e.stopPropagation(); setShowBoardDropdown((prev)=> !prev)}}>
                        {selectedBoardId ? boards.find((b)=> b.id === selectedBoardId)?.name : 'Select a board'}
                        <HiOutlineChevronDown/>
                    </button>
                    {showBoardDropdown && (
                            <div className="dcb-menu-wrapper">
                                {/* Input Search */}
                                <input
                                    type="text"
                                    placeholder="Search boards..."
                                    value={searchBoard}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => setSearchBoard(e.target.value)}
                                    className="dcb-search-input"
                                />

                                <ul className="dcb-menu">
                                    {boards
                                        .filter((board) =>
                                            board.name.toLowerCase().includes(searchBoard.toLowerCase())
                                        )
                                        .map((board) => (
                                        <li
                                            key={board.id}
                                            className="dcb-item"
                                            onClick={() => {
                                                setSelectedBoardId(board.id);
                                                setSelectedList(null); // Reset list
                                                setShowBoardDropdown(false);
                                                setSearchBoard('');
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
            {/* SELECT LIST  */}
            {selectedBoardId && (
                <div className="dcb-select-list">
                    <label>Choose List</label>
                    <div className='dcb-list-dropdown' onClick={() => setShowListDropdown(!showListDropdown)}>
                    <button className="dcb-btn">
                        {selectedList
                            ? selectedList.name
                            : 'Select a list'}
                        <HiOutlineChevronDown />
                    </button>
                    {showListDropdown && (
                        <ul className="dcb-menu">
                            {lists.map((list) => (
                                <li
                                    key={list.id}
                                    className={`dcb-item ${selectedList?.id === list.id ? 'selected' : ''}`}
                                    onClick={() => {
                                        setSelectedList(list);
                                        setShowListDropdown(false);
                                    }}
                                >
                                    {list.name}
                                </li>
                            ))}
                        </ul>
                    )}
                    </div>
                </div>
            )}
        </div>
        <div className="div-btn">
            <button
                className="dcb-move-btn"
                onClick={handleDuplicateCard}
                disabled={!selectedList || isMoving}
            >
                <HiOutlineSquare2Stack className='dcb-icon'/>
                {isMoving ? 'Duplicating...' : 'Duplicate Card'}
            </button>
        </div>
    </div>
  )
}

export default DuplicateCard
