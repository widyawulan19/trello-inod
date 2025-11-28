// import React, { useEffect, useState } from 'react'
// import '../style/pages/MasterDataMusik.css'
// import { HiOutlineSearch } from 'react-icons/hi'
// import TabelDataMaster from '../fitur/TabelDataMaster';
// import axios from 'axios';
// import { useSnackbar } from '../context/Snackbar';

// function MasterDataMusik() {
//   const [activeData, setActiveData] = useState('input');
//   const [tableData, setTableData] = useState([]);
//   const [selectedData, setSelectedData] = useState(null);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [selectedColumns, setSelectedColumns] = useState([]);
//   const [currentEndpoint, setCurrentEndpoint] = useState("");
//   const [currentEdnpoinAdd, setCurrentEndpointAdd] = useState("");
//   const {showSnackbar} = useSnackbar();

//   const API_URL = process.env.REACT_APP_API_URL;

//   // FETCH ALL DATA BASED ON ACTIVE MENU
//   const fetchAll = async (type) => {
//     try {
//       let endpoint = "";

//       if (type === "input") endpoint = "marketing-users";
//       if (type === "kadiv") endpoint = "kepala-divisi";

//       const res = await axios.get(`${API_URL}/${endpoint}`);
//       setTableData(res.data);

//     } catch (err) {
//       console.error("Gagal fetch data:", err);
//     }
//   };

//   // INITIAL LOAD + SAAT MENU DIGANTI
//   useEffect(() => {
//     fetchAll(activeData);
//   }, [activeData]);

//   const handleAdd = (endpoint, cols) => {
//     setCurrentEndpointAdd(endpoint);
//     setSelectedColumns(cols);
//     setSelectedData({});  // data kosong untuk input
//     setShowEditModal(true);
//   };

//   const handleSaveAdd = async () => {
//     try {
//       const payload = {};
//       selectedColumns.forEach(col => {
//         payload[col.key] = selectedData[col.key];
//       });

//       await axios.post(`${API_URL}/${currentEdnpoinAdd}`, payload);
//       showSnackbar('Berhasil tambah data', 'success');

//       setShowEditModal(false);
//       fetchAll(activeData);

//     } catch (err) {
//       showSnackbar('Gagal tambah data', 'error');
//     }
//   };

//   // GENERIC DELETE
//   const handleDelete = async (endpoint, id) => {
//     if (window.confirm("Yakin mau hapus data ini?")) {
//       await axios.delete(`${API_URL}/${endpoint}/${id}`);
//       alert("Berhasil hapus data");
//       showSnackbar("Data Berhasil dihapus!",'success')
//       fetchAll(activeData);
//     }
//   };

//   // GENERIC EDIT
//   const handleEdit = async (endpointEdit, id, cols) => {
//     setCurrentEndpoint(endpointEdit);
//     const detail = await axios.get(`${API_URL}/${endpointEdit}/${id}`);
//     setSelectedData(detail.data);
//     setSelectedColumns(cols);
//     setShowEditModal(true);
//   };

//   // GENERIC SAVE / UPDATE
//   const handleSave = async () => {
//     try {
//       // buat object baru hanya berisi kolom yang boleh diupdate
//       const payload = {};
//       selectedColumns.forEach(col => {
//         payload[col.key] = selectedData[col.key];
//       });

//       await axios.put(`${API_URL}/${currentEndpoint}/${selectedData.id}`, payload);
//       showSnackbar('Berhasil update data','success');

//       setShowEditModal(false);
//       fetchAll(activeData)

//     } catch (err) {
//       console.error("❌ Gagal update:", err);
//       showSnackbar('Gagal update data!', 'error')
//     }
// };

// // pilih action save
//   const handlePickSave = () => {
//     selectedData.id ? handleSave() : handleSaveAdd();
//   };

//   const renderDataMaster = () => {
//     switch (activeData) {
//       case 'input':
//         return (
//           <TabelDataMaster
//             title="Marketing User"
//             endpoint={`${API_URL}/marketing-users`}
//             data={tableData}
//             btnName="Marketing User"
//             // fetchData={fetchData}
//             columns={[
//               { key: "nama_marketing", label: "Nama" },
//               { key: "divisi", label: "Divisi" }
//             ]}
//             onAdd={() => handleAdd("marketing-users", [
//               { key: "nama_marketing", label: "Nama" },
//               { key: "divisi", label: "Divisi" }
//             ])}
//             onEdit={(row) => handleEdit("marketing-users", row.id, [
//               { key: "nama_marketing", label: "Nama" },
//               { key: "divisi", label: "Divisi" }
//             ])}
//             onDelete={(row) => handleDelete("marketing-users", row.id)}
//           />
//         );

//       case 'kadiv':
//         return (
//           <TabelDataMaster
//             title="Kepala Divisi"
//             endpoint={`${API_URL}/kepala-divisi`}
//             columns={[
//               { key: "nama", label: "Nama" },
//               { key: "divisi", label: "Divisi" }
//             ]}
//           />
//         );

//       case 'status':
//         return <div className="fade">Status Project</div>;
//       case 'account':
//         return <div className="fade">Account Name</div>;
//       case 'ot':
//         return <div className="fade">Order Type</div>;
//       case 'of':
//         return <div className="fade">Offer Type</div>;
//       case 'jt':
//         return <div className="fade">Jenis Track</div>;
//       case 'genre':
//         return <div className="fade">Genre Music</div>;
//       case 'pt':
//         return <div className="fade">Project Type</div>;
//       case 'kupon':
//         return <div className="fade">Jenis Kupon</div>;
//     }
//   };

//   return (
//     <div className='master-page'>
//       <div className="mp-sidebar">
//         <div className="mp-title">
//           <h4>Data Master</h4>
//           <div className="mp-search">
//             <HiOutlineSearch className='mps-icon' />
//             <input type="search" placeholder='Search ' />
//           </div>

//           <div className="main-sidebar">
//             <button className={activeData === 'input' ? 'active' : ''} onClick={() => setActiveData('input')}>Marketing User</button>
//             <button className={activeData === 'kadiv' ? 'active' : ''} onClick={() => setActiveData('kadiv')}>Kepala Divisi</button>
//             <button className={activeData === 'status' ? 'active' : ''} onClick={() => setActiveData('status')}>Status Project</button>
//             <button className={activeData === 'account' ? 'active' : ''} onClick={() => setActiveData('account')}>Account Name</button>
//             <button className={activeData === 'ot' ? 'active' : ''} onClick={() => setActiveData('ot')}>Order Type</button>
//             <button className={activeData === 'of' ? 'active' : ''} onClick={() => setActiveData('of')}>Offer Type</button>
//             <button className={activeData === 'jt' ? 'active' : ''} onClick={() => setActiveData('jt')}>Jenis Track</button>
//             <button className={activeData === 'genre' ? 'active' : ''} onClick={() => setActiveData('genre')}>Genre Music</button>
//             <button className={activeData === 'pt' ? 'active' : ''} onClick={() => setActiveData('pt')}>Project Type</button>
//             <button className={activeData === 'kupon' ? 'active' : ''} onClick={() => setActiveData('kupon')}>Jenis Kupon</button>
//           </div>
//         </div>
//       </div>

//       <div className="mp-body">
//         <div className="master-name">{renderDataMaster()}</div>
//         <div className="master-data"></div>
//       </div>

//       {showEditModal && (
//         <div className="modal-overlay">
//           <div className="modal-content">
//             <h3>{selectedData.id ? "Edit Data": 'Add New Data'}</h3>

//             {selectedColumns.map(col => (
//               <div className="form-group" key={col.key}>
//                 <label>{col.label}</label>
//                 <input
//                   type="text"
//                   value={selectedData[col.key] || ""}
//                   onChange={(e) =>
//                     setSelectedData({ ...selectedData, [col.key]: e.target.value })
//                   }
//                 />
//               </div>
//             ))}

//             <div className="btn-modal">
//               <button onClick={() => setShowEditModal(false)}>Close</button>
//               <button className="btn-modal-save" onClick={handlePickSave}>Save</button>
//             </div>
            
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// export default MasterDataMusik;



// import React, { useEffect, useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useSnackbar } from '../context/Snackbar'
// import { duplicateCardToList, getBoardsWorkspace, getListByBoard, getCardsByList } from '../services/ApiServices'
// import BootstrapTooltip from '../components/Tooltip'
// import { HiOutlineChevronDown, HiOutlineSquare2Stack, HiOutlineXMark } from 'react-icons/hi2'
// import '../style/fitur/DuplicateCard.css'

// const DuplicateCard = ({ userId, cardId, boardId, listId, workspaceId, onClose, fetchCardList }) => {
//   const [boards, setBoards] = useState([])
//   const [lists, setLists] = useState([])
//   const [positions, setPositions] = useState([])
//   const [selectedPosition, setSelectedPosition] = useState(null)

//   const [searchBoard, setSearchBoard] = useState('')
//   const [searchList, setSearchList] = useState('')
//   const [searchPosition, setSearchPosition] = useState('')

//   const [selectedBoardId, setSelectedBoardId] = useState(null)
//   const [selectedList, setSelectedList] = useState(null)
//   const [showBoardDropdown, setShowBoardDropdown] = useState(false)
//   const [showListDropdown, setShowListDropdown] = useState(false)
//   const [showPositionDropdown, setShowPositionDropdown] = useState(false)
//   const [isDuplicating, setIsDuplicating] = useState(false)
//   const [targetPosition, setTargetPosition] = useState(null)

//   const navigate = useNavigate()
//   const { showSnackbar } = useSnackbar()

//   // ✅ 1. Load board berdasarkan workspace ID
//   useEffect(() => {
//     if (!workspaceId) return

//     getBoardsWorkspace(workspaceId)
//       .then((res) => {
//         setBoards(res)
//       })
//       .catch((err) => console.error('Error fetching boards:', err))
//   }, [workspaceId])

//   // 2. Fetch list berdasarkan board yang dipilih
//   useEffect(() => {
//     if (selectedBoardId) {
//       getListByBoard(selectedBoardId)
//         .then((res) => setLists(res.data))
//         .catch((err) => console.error('Error fetching lists:', err))
//     }
//   }, [selectedBoardId])

//   // 3. Fetch posisi card
//   useEffect(() => {
//     if (selectedList?.id) {
//       getCardsByList(selectedList.id)
//         .then((res) => {
//           const cards = res.data
//           const newPositions = [
//             { label: 'Top (position 1)', value: 1 },
//             ...cards.map((c, i) => ({
//               label: `After "${c.title}"`,
//               value: i + 2,
//             })),
//           ]
//           setPositions(newPositions)
//         })
//         .catch((err) => console.error('Error fetching cards for positions:', err))
//     }
//   }, [selectedList])

//   // 4. Duplicate card
//   const handleDuplicateCard = async () => {
//     if (!cardId || !selectedList?.id) {
//       console.error("❌ Missing cardId or listId!")
//       return
//     }

//     setIsDuplicating(true)

//     try {
//       const body = targetPosition ? { position: Number(targetPosition) } : {}

//       const result = await duplicateCardToList(
//         cardId,
//         selectedList.id,
//         userId,
//         body
//       )

//       showSnackbar("Card duplicated successfully!", "success")

//       fetchCardList(selectedList.id)
//       onClose()
//     } catch (error) {
//       console.error("❌ Error duplicating card:", error)
//       showSnackbar("Failed to duplicate the card!", "error")
//     } finally {
//       setIsDuplicating(false)
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
//         {/* Select Board */}
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
//                 <input
//                   type='text'
//                   placeholder='Search boards...'
//                   value={searchBoard}
//                   onChange={(e) => setSearchBoard(e.target.value)}
//                   className='dcb-search-input'
//                 />
//                 <ul className='dcb-menu'>
//                   {boards
//                     .filter((b) => b.name.toLowerCase().includes(searchBoard.toLowerCase()))
//                     .map((board) => (
//                       <li
//                         key={board.id}
//                         className='dcb-item'
//                         onClick={() => {
//                           setSelectedBoardId(board.id)
//                           setSelectedList(null)
//                           setSelectedPosition(null)
//                           setShowBoardDropdown(false)
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

//         {/* Select List */}
//         {selectedBoardId && (
//           <div className='dcb-select-list'>
//             <label>Choose List</label>
//             <div className='dcb-list-dropdown'>
//               <button
//                 className='dcb-btn'
//                 onClick={() => setShowListDropdown(!showListDropdown)}
//               >
//                 {selectedList ? selectedList.name : 'Select a list'}
//                 <HiOutlineChevronDown />
//               </button>

//               {showListDropdown && (
//                 <div className='dcb-menu-wrapper'>
//                   <input
//                     type='text'
//                     placeholder='Search lists...'
//                     value={searchList}
//                     onChange={(e) => setSearchList(e.target.value)}
//                     className='dcb-search-input'
//                   />
//                   <ul className='dcb-menu'>
//                     {lists
//                       .filter((list) => list.name.toLowerCase().includes(searchList.toLowerCase()))
//                       .map((list) => (
//                         <li
//                           key={list.id}
//                           className={`dcb-item ${selectedList?.id === list.id ? 'selected' : ''}`}
//                           onClick={() => {
//                             setSelectedList(list)
//                             setShowListDropdown(false)
//                             setSelectedPosition(null)
//                           }}
//                         >
//                           {list.name}
//                         </li>
//                       ))}
//                   </ul>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Select Position */}
//         {selectedList && (
//           <div className="mc-position">
//             <label>Card Position</label>
//             <input
//               type="number"
//               min="1"
//               max={positions.length + 1}
//               value={targetPosition || ''}
//               onChange={(e) => setTargetPosition(e.target.value)}
//               placeholder="Position number"
//               className="mc-position-input"
//             />
//           </div>
//         )}
//       </div>

//       {/* Button */}
//       <div className='div-btn'>
//         <button
//           className='dcb-move-btn'
//           onClick={handleDuplicateCard}
//           disabled={!selectedList || isDuplicating}
//         >
//           <HiOutlineSquare2Stack className='dcb-icon' />
//           {isDuplicating ? 'Duplicating...' : 'Duplicate Card'}
//         </button>
//       </div>
//     </div>
//   )
// }

// export default DuplicateCard


// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';

// import {
//   getBoardsWorkspace,
//   moveCardToList,
//   getListByBoard,
//   getCardsByList,
// } from '../services/ApiServices';

// import {
//   HiMiniArrowLeftStartOnRectangle,
//   HiOutlineChevronDown,
//   HiOutlineXMark,
// } from 'react-icons/hi2';

// import BootstrapTooltip from '../components/Tooltip';
// import '../style/fitur/MoveCard.css';
// import { useSnackbar } from '../context/Snackbar';
// import { useUser } from '../context/UserContext';

// const MoveCard = ({
//   cardId,
//   workspaceId,
//   onClose,
//   boardId,
//   listId,
//   onCardMoved,
//   fetchCardList,
// }) => {
//   const [boards, setBoards] = useState([]);
//   const [lists, setLists] = useState([]);
//   const [cards, setCards] = useState([]);

//   const [searchBoard, setSearchBoard] = useState('');
//   const [searchList, setSearchList] = useState('');
//   const [selectedBoardId, setSelectedBoardId] = useState(null);
//   const [selectedList, setSelectedList] = useState(null);
//   const [targetPosition, setTargetPosition] = useState('');

//   const [showBoardDropdown, setShowBoardDropdown] = useState(false);
//   const [showListDropdown, setShowListDropdown] = useState(false);
//   const [isMoving, setIsMoving] = useState(false);

//   const { user } = useUser();
//   const userId = user?.id;

//   const navigate = useNavigate();
//   const { showSnackbar } = useSnackbar();

//   // 🔹 Load semua board berdasarkan workspace
//   useEffect(() => {
//     if (!workspaceId) return;

//     getBoardsWorkspace(workspaceId)
//       .then((res) => setBoards(res))
//       .catch((err) => console.error('❌ Error fetching workspace boards:', err));
//   }, [workspaceId]);

//   // 🔹 Load lists berdasarkan board
//   useEffect(() => {
//     if (selectedBoardId) {
//       getListByBoard(selectedBoardId)
//         .then((res) => setLists(res.data))
//         .catch((err) => console.error('❌ Error fetching lists:', err));
//     }
//   }, [selectedBoardId]);

//   // 🔹 Load cards berdasarkan list
//   useEffect(() => {
//     if (selectedList?.id) {
//       getCardsByList(selectedList.id)
//         .then((res) => setCards(res.data))
//         .catch((err) => console.error('❌ Error fetching cards:', err));
//     }
//   }, [selectedList]);

//   // 🔹 Fungsi pindahkan card
//   const handleMoveCard = async () => {
//     if (!cardId || !selectedList?.id) {
//       alert('Please select both board and list!');
//       return;
//     }

//     if (!targetPosition || targetPosition < 1) {
//       alert('Please enter a valid position!');
//       return;
//     }

//     setIsMoving(true);

//     try {
//       const result = await moveCardToList(
//         cardId,
//         userId,
//         selectedList.id,
//         targetPosition
//       );

//       console.log('✅ Card moved successfully:', result.data);
//       showSnackbar('Card moved successfully!', 'success');

//       if (onCardMoved) onCardMoved();

//       if (fetchCardList) {
//         fetchCardList(listId); // list asal
//         fetchCardList(selectedList.id); // list tujuan
//       }

//       onClose();
//     } catch (error) {
//       console.error('❌ Error moving card:', error);
//       showSnackbar('Failed to move the card!', 'error');
//     } finally {
//       setIsMoving(false);
//     }
//   };

//   return (
//     <div className="mc-container">
//       <div className="mc-header">
//         <div className="mc-left">
//           <div className="left-icon">
//             <HiMiniArrowLeftStartOnRectangle className="mini-icon" />
//           </div>
//           <p>Move Card</p>
//         </div>
//         <div className="mc-right">
//           <BootstrapTooltip title="Close" placement="top">
//             <HiOutlineXMark className="mc-icon" onClick={onClose} />
//           </BootstrapTooltip>
//         </div>
//       </div>

//       <div className="mc-body">
//         {/* 🧭 Select Board */}
//         <div className="mc-board">
//           <label>Choose Board</label>
//           <div className="mcb-dropdown">
//             <button
//               className="mcb-btn"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setShowBoardDropdown(!showBoardDropdown);
//               }}
//             >
//               {selectedBoardId
//                 ? boards.find((b) => b.id === selectedBoardId)?.name
//                 : 'Select a board'}
//               <HiOutlineChevronDown />
//             </button>

//             {showBoardDropdown && (
//               <div className="mcb-menu-wrapper">
//                 <input
//                   type="text"
//                   placeholder="Search boards..."
//                   value={searchBoard}
//                   onClick={(e) => e.stopPropagation()}
//                   onChange={(e) => setSearchBoard(e.target.value)}
//                   className="mcb-search-input"
//                 />

//                 <ul className="mcb-menu">
//                   {boards
//                     .filter((board) =>
//                       board.name.toLowerCase().includes(searchBoard.toLowerCase())
//                     )
//                     .map((board) => (
//                       <li
//                         key={board.id}
//                         className="mcb-item"
//                         onClick={() => {
//                           setSelectedBoardId(board.id);
//                           setSelectedList(null);
//                           setCards([]);
//                           setTargetPosition('');
//                           setShowBoardDropdown(false);
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

//         {/* 🧩 Select List */}
//         {selectedBoardId && (
//           <div className="mc-select-list">
//             <label>Choose List</label>
//             <div className="mc-list-dropdown">
//               <button
//                 className="mcl-btn"
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setShowListDropdown(!showListDropdown);
//                 }}
//               >
//                 {selectedList ? selectedList.name : 'Select a list'}
//                 <HiOutlineChevronDown />
//               </button>

//               {showListDropdown && (
//                 <div className="mcl-menu-wrapper">
//                   <input
//                     type="text"
//                     placeholder="Search lists..."
//                     value={searchList}
//                     onClick={(e) => e.stopPropagation()}
//                     onChange={(e) => setSearchList(e.target.value)}
//                     className="mcb-search-input"
//                   />
//                   <ul className="mcl-menu">
//                     {lists
//                       .filter((list) =>
//                         list.name.toLowerCase().includes(searchList.toLowerCase())
//                       )
//                       .map((list) => (
//                         <li
//                           key={list.id}
//                           className={`mcl-item ${
//                             selectedList?.id === list.id ? 'selected' : ''
//                           }`}
//                           onClick={() => {
//                             setSelectedList(list);
//                             setShowListDropdown(false);
//                             setTargetPosition('');
//                           }}
//                         >
//                           {list.name}
//                         </li>
//                       ))}
//                   </ul>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* 🔢 Input posisi card */}
//         {selectedList && (
//           <div className="mc-position">
//             <label>Card Position (1 - {cards.length + 1})</label>
//             <input
//               type="number"
//               min="1"
//               max={cards.length + 1}
//               value={targetPosition}
//               onChange={(e) => setTargetPosition(e.target.value)}
//               placeholder="Position number"
//               className="mc-position-input"
//             />
//           </div>
//         )}
//       </div>

//       <div className="div-btn">
//         <button
//           className="mcl-move-btn"
//           onClick={handleMoveCard}
//           disabled={!selectedList || isMoving}
//         >
//           <HiMiniArrowLeftStartOnRectangle className="mcl-icon" />
//           {isMoving ? 'Moving...' : 'Move Card'}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default MoveCard;
