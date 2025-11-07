import React, { useState, useEffect } from 'react';
import '../style/fitur/FormCreateCardDesign.css';
import { 
  getCardIdMarketingDesignByMarketingId, 
  createCardFromMarketingDesign, 
  getWorkspaceIdAndBoardId, 
  getBoards, 
  getListByBoard 
} from '../services/ApiServices';
import { HiOutlineChevronDown, HiOutlineArrowRight } from 'react-icons/hi2';
import { FaXmark } from 'react-icons/fa6';
import BootstrapTooltip from '../components/Tooltip';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from '../context/Snackbar';
import { IoIosCreate } from "react-icons/io";

const FormCreateCardDesign = ({ marketingDesignId, onClose }) => {
  const [boards, setBoards] = useState([]);
  const [lists, setLists] = useState([]);
  const [filteredBoards, setFilteredBoards] = useState([]);
  const [filteredLists, setFilteredLists] = useState([]);
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [selectedListId, setSelectedListId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showBoardDropdown, setShowBoardDropdown] = useState(false);
  const [showListDropdown, setShowListDropdown] = useState(false);
  const [cardId, setCardId] = useState(null);
  const [searchBoardTerm, setSearchBoardTerm] = useState('');
  const [searchListTerm, setSearchListTerm] = useState('');
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  // === Fetch boards ===
  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await getBoards();
        setBoards(response.data);
        setFilteredBoards(response.data);
      } catch (error) {
        console.error('Terjadi kesalahan saat memuat boards:', error);
        showSnackbar('Gagal memuat boards!', 'error');
      }
    };
    fetchBoards();
  }, []);

  // === Fetch lists by board ===
  const fetchListsByBoard = async (boardId) => {
    try {
      const response = await getListByBoard(boardId);
      setLists(response.data);
      setFilteredLists(response.data);
    } catch (error) {
      console.error('Terjadi kesalahan saat memuat lists:', error);
      showSnackbar('Gagal memuat lists untuk board yang dipilih!', 'error');
    }
  };

  // === Cek apakah card sudah ada untuk marketingDesignId ===
  useEffect(() => {
    const checkCard = async () => {
      try {
        const response = await getCardIdMarketingDesignByMarketingId(marketingDesignId);
        if (response.data && response.data.cardId) {
          setCardId(response.data.cardId);
        }
      } catch (error) {
        console.error('Error fetching cardID:', error);
      }
    };
    if (marketingDesignId) checkCard();
  }, [marketingDesignId]);

  // === Dropdown toggle ===
  const handleShowBoardDropdown = (e) => {
    e.stopPropagation();
    setShowBoardDropdown(!showBoardDropdown);
  };

  // === Search boards ===
  const handleSearchBoard = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchBoardTerm(value);
    const filtered = boards.filter((board) =>
      board.name.toLowerCase().includes(value)
    );
    setFilteredBoards(filtered);
    e.stopPropagation();
  };

  // === Board selection ===
  const handleBoardChange = async (boardId) => {
    setSelectedBoardId(boardId);
    setSelectedListId(null);
    setShowBoardDropdown(false);
    fetchListsByBoard(boardId);
  };

  // === Search list ===
  const handleSearchList = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchListTerm(value);

    if (!value) {
      setFilteredLists(lists);
    } else {
      const filtered = lists.filter((list) =>
        list.name.toLowerCase().includes(value)
      );
      setFilteredLists(filtered);
    }

    e.stopPropagation();
  };

  // === Create card ===
  const handleCreateCard = async () => {
    if (!selectedListId) {
      showSnackbar('Silakan pilih list terlebih dahulu!', 'warning');
      return;
    }

    try {
      setIsLoading(true);
      const response = await createCardFromMarketingDesign(selectedListId, marketingDesignId);

      if (response.status === 201) {
        showSnackbar('Card berhasil dibuat!', 'success');
        const { cardId: newCardId } = response.data;

        const { data } = await getWorkspaceIdAndBoardId({ listId: selectedListId, cardId: newCardId });

        if (data) {
          const { workspaceId, boardId } = data;
          navigate(`/layout/workspaces/${workspaceId}/board/${boardId}`);
        } else {
          showSnackbar('Workspace atau Board tidak ditemukan!', 'error');
        }
      } else {
        showSnackbar('Gagal membuat card!', 'error');
      }
    } catch (error) {
      console.error('Error creating card:', error);
      showSnackbar('Data ini sudah pernah dibuat card sebelumnya!', 'error');
      // showSnackbar('Terjadi kesalahan saat membuat card!', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-card-container">
      <div className="cc-header">
        <div className="cch-title">
          <div className="cch-icon">
            <IoIosCreate className='mini-icon' />
          </div>
          <p>CREATE CARD</p>
        </div>
        <BootstrapTooltip title="Close" placement="top">
          <FaXmark className="cc-icon" onClick={onClose} />
        </BootstrapTooltip>
      </div>

      <div className="cc-content">
        {/* === Board Selection === */}
        <div className="cc-left">
          <div className="cc-select-box">
            <label>Choose Board</label>
            <div className="cc-dropdown" onClick={handleShowBoardDropdown}>
              <button className="ccd-btn">
                {selectedBoardId ? boards.find(board => board.id === selectedBoardId)?.name : "Select a Board"}
                <HiOutlineChevronDown className="dropdown-icon" />
              </button>

              {showBoardDropdown && (
                <div className="form-create-card">
                  <input
                    type="text"
                    placeholder="Search Boards..."
                    value={searchBoardTerm}
                    onChange={handleSearchBoard}
                    onClick={(e) => e.stopPropagation()}
                    className="ccd-search-input"
                  />
                  <ul className="ccd-menu">
                    {filteredBoards.map((board) => (
                      <li
                        key={board.id}
                        onClick={() => handleBoardChange(board.id)}
                        className="ccd-item"
                      >
                        {board.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* === List Selection === */}
          {selectedBoardId && (
            <div className="cc-select-list">
              <label>Choose List</label>
              <div
                className="cc-lists-dropdown"
                onClick={() => setShowListDropdown(!showListDropdown)}
              >
                <button className="cc-lists-btn">
                  {selectedListId
                    ? filteredLists.find(list => list.id === selectedListId)?.name
                    : "Select a List"}
                  <HiOutlineChevronDown className="dropdown-icon" />
                </button>

                {showListDropdown && (
                  <div className="form-list-dropdown">
                    <input
                      type="text"
                      placeholder="Search Lists..."
                      value={searchListTerm}
                      onChange={handleSearchList}
                      onClick={(e) => e.stopPropagation()}
                      className="ccd-search-input"
                    />
                    <ul className="ccl-menu">
                      {filteredLists.map((list) => (
                        <li
                          key={list.id}
                          onClick={() => setSelectedListId(list.id)}
                          className="ccl-item"
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

        {/* === Create Button === */}
        <div className="btn-form-create">
          <button
            className="cc-sub-btn"
            onClick={handleCreateCard}
            disabled={isLoading || !selectedListId}
          >
            Create Card
            {/* <HiOutlineArrowRight className='cc-sub-icon' /> */}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormCreateCardDesign;

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import '../style/fitur/FormCreateCardDesign.css';
// import { getCardIdMarketingDesignByMarketingId, createCardFromMarketingDesign, getWorkspaceIdAndBoardId, getBoards } from '../services/ApiServices';
// import { HiOutlineChevronDown, HiOutlineArrowRight, HiOutlineXMark, HiOutlineCreditCard } from 'react-icons/hi2';
// import BootstrapTooltip from '../components/Tooltip';
// import { useNavigate } from 'react-router-dom';
// import { getListByBoard } from '../services/ApiServices';
// import { useSnackbar } from '../context/Snackbar';
// import { IoIosCreate } from "react-icons/io";

// const FormCreateCardDesign = ({ marketingDesignId, onClose }) => {
//   const [boards, setBoards] = useState([]);
//   const [lists, setLists] = useState([]);
//   const [selectedBoardId, setSelectedBoardId] = useState(null);
//   const [selectedListId, setSelectedListId] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [filteredLists, setFilteredLists] = useState([]);
//   const [showBoardDropdown, setShowBoardDropdown] = useState(false);
//   const [showListDropdown, setShowListDropdown] = useState(false);
//   const navigate = useNavigate();
//   const [cardId, setCardId] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filteredBoards, setFilteredBoards] = useState([]);
//   const {showSnackbar} = useSnackbar();

//   const handleShowBoardDropdown = (e) =>{
//     e.stopPropagation();
//     setShowBoardDropdown(!showBoardDropdown)
//   } 

//   //FETCH BOARDS
//   useEffect(() => {
//     const fetchBoards = async () => {
//       try {
//         const response = await getBoards();
//         setBoards(response.data);
//         setFilteredBoards(response.data);
//       } catch (error) {
//         console.error('Terjadi kesalahan saat memuat boards:', error);
//         alert('Gagal memuat boards!');
//       }
//     };

//     fetchBoards();
//   }, []);

//   // FETCH LISTS 
//   const fetchListsByBoard = async (boardId) => {
//     try{
//       const response = await getListByBoard(boardId);
//       setLists(response.data);
//       setFilteredLists(response.data);
//     }catch(error){
//       console.error('Terjadi kesalahan saat memuat lists:', error);
//     }
//   }

//   useEffect(() => {
//     const checkCard = async () => {
//       try {
//         const response = await getCardIdMarketingDesignByMarketingId(marketingDesignId);
//         if (response.data && response.data.cardId) {
//           setCardId(response.data.cardId);
//         }
//       } catch (error) {
//         console.error('Error fetching cardID:', error);
//       }
//     };
//     if (marketingDesignId) {
//       checkCard();
//     }
//   }, [marketingDesignId]);

//   const handleBoardChange = async (boardId) => {
//     setSelectedBoardId(boardId);
//     setSelectedListId(null);
//     setShowBoardDropdown(!showBoardDropdown);

//     try {
//       const response = await getListByBoard(boardId);
//       setFilteredLists(response.data);
//     } catch (error) {
//       console.error('Terjadi kesalahan saat memuat lists:', error);
//       showSnackbar('Gagal memuat lists untuk board yang dipilih!','error');
//     }
//   };

//   const handleCreateCard = async () => {
//     if (!selectedListId) {
//       alert('Silakan pilih list terlebih dahulu!');
//       return;
//     }

//     try {
//       setIsLoading(true);
//       const response = await createCardFromMarketingDesign(selectedListId, marketingDesignId);

//       if (response.status === 201) {
//         // alert('Card berhasil dibuat!');
//         showSnackbar('Card berhasil dibuat!', 'success');
//         const { cardId: newCardId } = response.data;

//         const { data } = await getWorkspaceIdAndBoardId({ listId: selectedListId, cardId: newCardId });

//         if (data) {
//           const { workspaceId, boardId } = data;
//           navigate(`/layout/workspaces/${workspaceId}/board/${boardId}`);
//         } else {
//           // alert('Workspace atau Board tidak ditemukan');
//           showSnackbar('Workspace atau Board tidak ditemukan!', 'error');
//         }
//       } else {
//         alert('Gagal membuat card!');
//       }
//     } catch (error) {
//       console.error('Error creating card:', error);
//       // alert('Terjadi kesalahan saat membuat card!');
//       showSnackbar('Terjadi kesalahan saat membuat card!', 'error');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   //fungsi filter boards
//   const handleSearchBoard = (e) =>{
//     const value = e.target.value.toLowerCase();
//     setSearchTerm(value);
//     const filtered = boards.filter((board)=>
//       board.name.toLowerCase().includes(value)
//     );
//     setFilteredBoards(filtered)
//     e.stopPropagation();
//   }

//   return (
//     <div className="form-card-design">
//       <div className="cc-head">
//         <div className="cc-title">
//           <div className="cch-icon">
//             <IoIosCreate className='mini-icon'/>
//           </div>
//            <p>CREATE CARD</p>
//         </div>
//         <BootstrapTooltip title="Close" placement="top">
//           <HiOutlineXMark className="cch-icon2" onClick={onClose} />
//         </BootstrapTooltip>
//       </div>

//       <div className="fcd-content">
//         <div className="fcd-select-box">
//           <label>Choose Board</label>
//             <button className="fcd-btn"  onClick={handleShowBoardDropdown}>
//               {selectedBoardId ? boards.find(board => board.id === selectedBoardId)?.name : "Select Board"}
//               <HiOutlineChevronDown className="dropdown-icon" />
//             </button>
//             {showBoardDropdown && (
//               <div className="fcd-dropdown">
//                 <input 
//                   type="text" 
//                   placeholder='Search Boards...'
//                   value={searchTerm}
//                   onChange={handleSearchBoard}
//                   className='fcd-search-input'
//                 />
//                 <ul className="fcd-menu">
//                   {filteredBoards.map((board) => (
//                     <li key={board.id} onClick={() => handleBoardChange(board.id)} className="ccd-item">
//                       {board.name}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//             {selectedBoardId && (
//             <div className="fcd-select-list">
//               <label>Choose List</label>
//                 <button className="fcd-lists-btn" onClick={() => setShowListDropdown(!showListDropdown)}>
//                   {selectedListId ? filteredLists.find(list => list.id === selectedListId)?.name : "Select a List"}
//                   <HiOutlineChevronDown className="dropdown-icon" />
//                 </button>
//                 {showListDropdown && (
//                   <ul className="ccl-menu">
//                     {filteredLists.map((list) => (
//                       <li key={list.id} onClick={() => {setSelectedListId(list.id) ;setShowListDropdown(!showListDropdown)}} className="ccl-item">
//                         {list.name}
//                       </li>
//                     ))}
//                   </ul>
//                 )}
//             </div>
//           )}
//         </div>

//         <div className="fcd-button">
//           <button className="fcd-sub-btn" onClick={handleCreateCard} disabled={isLoading || !selectedListId}>
//             Create Card
//             <HiOutlineArrowRight className='cc-sub-icon' />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FormCreateCardDesign;