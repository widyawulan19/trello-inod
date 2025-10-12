import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBoards, moveCardToList, getListByBoard } from '../services/ApiServices';
import { HiMiniArrowLeftStartOnRectangle, HiOutlineChevronDown, HiOutlineXMark } from 'react-icons/hi2';
import BootstrapTooltip from '../components/Tooltip';
import '../style/fitur/MoveCard.css';
import { useSnackbar } from '../context/Snackbar';

const MoveCard = ({ cardId, workspaceId, onClose, userId, boardId, onCardMoved, fetchCardList, fetchBoardDetail, listId }) => {
    const [boards, setBoards] = useState([]);
    const [lists, setLists] = useState([]);
    const [searchBoard, setSearchBoard] = useState('');
    const [searchList, setSearchList] = useState(''); // 🔍 state baru buat search list
    const [selectedBoardId, setSelectedBoardId] = useState(null);
    const [selectedList, setSelectedList] = useState(null);
    const [showBoardDropdown, setShowBoardDropdown] = useState(false);
    const [showListDropdown, setShowListDropdown] = useState(false);
    const [isMoving, setIsMoving] = useState(false);

    const navigate = useNavigate();
    const { showSnackbar } = useSnackbar();

    // Close dropdown board kalau klik di luar
    useEffect(() => {
        const handleClickOutside = () => setShowBoardDropdown(false);
        if (showBoardDropdown) {
            document.addEventListener("click", handleClickOutside);
        }
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [showBoardDropdown]);

    // Close dropdown list kalau klik di luar
    useEffect(() => {
        const handleClickOutside = () => setShowListDropdown(false);
        if (showListDropdown) {
            document.addEventListener("click", handleClickOutside);
        }
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [showListDropdown]);

    // Fetch boards
    useEffect(() => {
        getBoards()
            .then((res) => setBoards(res.data))
            .catch((err) => console.error('❌ Error fetching boards:', err));
    }, []);

    // Fetch lists ketika board dipilih
    useEffect(() => {
        if (selectedBoardId) {
            getListByBoard(selectedBoardId)
                .then((res) => setLists(res.data))
                .catch((err) => console.error('❌ Error fetching lists:', err));
        }
    }, [selectedBoardId]);

    const handleMoveCard = async () => {
        if (!cardId || !selectedList?.id) {
            alert('Please select both board and list!');
            return;
        }

        setIsMoving(true);

        try {
            const result = await moveCardToList(cardId, selectedList.id);
            console.log('Card moved to target list:', result.data);
            showSnackbar('Card moved successfully!', 'success');

            // Navigasi ke board tujuan
            navigate(`/layout/workspaces/${workspaceId}/board/${selectedBoardId}`);

            if (onCardMoved) onCardMoved();
            fetchCardList(listId);
            fetchCardList(selectedList.id);
            onClose();
        } catch (error) {
            console.error('Error moving card:', error);
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
                        <HiMiniArrowLeftStartOnRectangle className='mini-icon' />
                    </div>
                    <p>Move Card</p>
                </div>
                <div className="mc-right">
                    <BootstrapTooltip title="Close" placement="top">
                        <HiOutlineXMark className="mc-icon" onClick={onClose} />
                    </BootstrapTooltip>
                </div>
            </div>

            <div className="mc-body">
                {/* Select Board */}
                <div className="mc-board">
                    <label>Choose Board</label>
                    <div className='mcb-dropdown'>
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
                                {/* 🔍 Search Board */}
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
                                                    setSelectedList(null);
                                                    setShowBoardDropdown(false);
                                                    setSearchList(''); // reset search list pas ganti board
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

                {/* Select List */}
                {selectedBoardId && (
                    <div className="mc-select-list">
                        <label>Choose List</label>
                        <div className='mc-list-dropdown'>
                            <button
                                className="mcl-btn"
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
                                    {/* 🔍 Search List */}
                                    <input
                                        type="text"
                                        placeholder="Search lists..."
                                        value={searchList}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => setSearchList(e.target.value)}
                                        className="mcb-search-input"
                                    />
                                    <ul className="mcl-menu">
                                        {lists
                                            .filter((list) =>
                                                list.name.toLowerCase().includes(searchList.toLowerCase())
                                            )
                                            .map((list) => (
                                                <li
                                                    key={list.id}
                                                    className={`mcl-item ${selectedList?.id === list.id ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        setSelectedList(list);
                                                        setShowListDropdown(false);
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
            </div>

            <div className="div-btn">
                <button
                    className="mcl-move-btn"
                    onClick={handleMoveCard}
                    disabled={!selectedList || isMoving}
                >
                    <HiMiniArrowLeftStartOnRectangle className='mcl-icon' />
                    {isMoving ? 'Moving...' : 'Move Card'}
                </button>
            </div>
        </div>
    );
};

export default MoveCard;

// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { getBoards, getAllLists, moveCardToList, getListByBoard } from '../services/ApiServices';
// import { HiMiniArrowLeftStartOnRectangle, HiOutlineChevronDown, HiOutlineXMark } from 'react-icons/hi2';
// import BootstrapTooltip from '../components/Tooltip';
// import '../style/fitur/MoveCard.css';
// import { useSnackbar } from '../context/Snackbar';

// const MoveCard = ({ cardId, workspaceId, onClose, userId, boardId,onCardMoved,fetchCardList,fetchBoardDetail, listId}) => {
//     console.log('File move card menerima board id:', boardId)
//     const [boards, setBoards] = useState([]);
//     const [lists, setLists] = useState([]);
//     const [searchBoard, setSearchBoard] = useState('');
//     const [selectedBoardId, setSelectedBoardId] = useState(null);
//     const [selectedList, setSelectedList] = useState(null);
//     const [showBoardDropdown, setShowBoardDropdown] = useState(false);
//     const [showListDropdown, setShowListDropdown] = useState(false);
//     const [isMoving, setIsMoving] = useState(false);

//     const navigate = useNavigate();
//     const { showSnackbar } = useSnackbar();

//     useEffect(() => {
//         const handleClickOutside = () => setShowBoardDropdown(false);
//         if (showBoardDropdown) {
//             document.addEventListener("click", handleClickOutside);
//         }
//         return () => {
//             document.removeEventListener("click", handleClickOutside);
//         };
//     }, [showBoardDropdown]);

//     // Fetch boards saat komponen dimount
//     useEffect(() => {
//         getBoards()
//             .then((res) => {
//                 setBoards(res.data);
//             })
//             .catch((err) => {
//                 console.error('❌ Error fetching boards:', err);
//             });
//     }, []);

//     // Fetch lists ketika board dipilih
//     useEffect(() => {
//         if (selectedBoardId) {
//             getListByBoard(selectedBoardId)
//                 .then((res) => {
//                     setLists(res.data);
//                 })
//                 .catch((err) => {
//                     console.error('❌ Error fetching lists:', err);
//                 });
//         }
//     }, [selectedBoardId]);

//     const handleMoveCard = async () => {
//     if (!cardId || !selectedList?.id) {
//         alert('Please select both board and list!');
//         return;
//     }

//     setIsMoving(true);

//     try {
//         const result = await moveCardToList(cardId, selectedList.id);
//         console.log('Card moved to target list:', result.data);

//         showSnackbar('Card moved successfully!', 'success');

//         // Navigasi ke board tujuan
//         navigate(`/layout/workspaces/${workspaceId}/board/${selectedBoardId}`);

//         // ✅ panggil refetch dari parent
//         if (onCardMoved) onCardMoved();

//         // kalau masih mau jaga-jaga
//         // if (fetchBoardDetail) fetchBoardDetail();
//         // if (fetchCardList) fetchCardList(selectedList.id);
//         fetchCardList(listId);
//         fetchCardList(selectedList.id)

//         onClose();
//     } catch (error) {
//         console.error('Error moving card:', error);
//         showSnackbar('Failed to move the card!', 'error');
//     } finally {
//         setIsMoving(false);
//     }
//     };


//     return (
//         <div className="mc-container">
//             <div className="mc-header">
//                 <div className="mc-left">
//                     <div className="left-icon">
//                         <HiMiniArrowLeftStartOnRectangle className='mini-icon'/>
//                     </div>
//                     <p>Move Card</p>
//                 </div>
//                 <div className="mc-right">
//                      <BootstrapTooltip title="Close" placement="top">
//                         <HiOutlineXMark className="mc-icon" onClick={onClose} />
//                     </BootstrapTooltip>
//                 </div>
//             </div>
//             <div className="mc-body">
//                 {/* Select Board */}
//                 <div className="mc-board">
//                     <label>Choose Board</label>
//                     <div className='mcb-dropdown'>
//                         <button 
//                             className="mcb-btn"
//                             onClick={(e) => {
//                                 e.stopPropagation();
//                                 setShowBoardDropdown(!showBoardDropdown);
//                               }}
//                         >
//                             {selectedBoardId
//                                 ? boards.find((b) => b.id === selectedBoardId)?.name
//                                 : 'Select a board'}
//                             <HiOutlineChevronDown />
//                         </button>
                        
//                         {showBoardDropdown && (
//                             <div className="mcb-menu-wrapper">
//                                 {/* Input Search */}
//                                 <input
//                                     type="text"
//                                     placeholder="Search boards..."
//                                     value={searchBoard}
//                                     onClick={(e) => e.stopPropagation()}
//                                     onChange={(e) => setSearchBoard(e.target.value)}
//                                     className="mcb-search-input"
//                                 />

//                                 <ul className="mcb-menu">
//                                     {boards
//                                         .filter((board) =>
//                                             board.name.toLowerCase().includes(searchBoard.toLowerCase())
//                                         )
//                                         .map((board) => (
//                                             <li
//                                                 key={board.id}
//                                                 className="mcb-item"
//                                                 onClick={() => {
//                                                     setSelectedBoardId(board.id);
//                                                     setSelectedList(null); // Reset list
//                                                     setShowBoardDropdown(false);
//                                                 }}
//                                             >
//                                                 {board.name}
//                                             </li>
//                                         ))}
//                                 </ul>
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 {/* Select List */}
//                 {selectedBoardId && (
//                     <div className="mc-select-list">
//                         <label>Choose List</label>
//                         <div className='mc-list-dropdown' onClick={() => setShowListDropdown(!showListDropdown)}>
//                             <button className="mcl-btn">
//                                 {selectedList
//                                     ? selectedList.name
//                                     : 'Select a list'}
//                                 <HiOutlineChevronDown />
//                             </button>
//                             {showListDropdown && (
//                                 <ul className="mcl-menu">
//                                     {lists.map((list) => (
//                                         <li
//                                             key={list.id}
//                                             className={`mcl-item ${selectedList?.id === list.id ? 'selected' : ''}`}
//                                             onClick={() => {
//                                                 setSelectedList(list);
//                                                 // setSelectedList(null);
//                                                 setShowListDropdown(false);
//                                             }}
//                                         >
//                                             {list.name}
//                                         </li>
//                                     ))}
//                                 </ul>
//                             )}
//                         </div>
//                     </div>
//                 )}
//             </div>
//             <div className="div-btn">
//                 <button
//                     className="mcl-move-btn"
//                     onClick={handleMoveCard}
//                     disabled={!selectedList || isMoving}
//                 >
//                     <HiMiniArrowLeftStartOnRectangle className='mcl-icon'/>
//                     {isMoving ? 'Moving...' : 'Move Card'}
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default MoveCard;


// // HiMiniArrowLeftStartOnRectangle