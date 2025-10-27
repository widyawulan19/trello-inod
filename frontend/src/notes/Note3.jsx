
// import {
//   DndContext,
//   closestCenter,
//   PointerSensor,
//   useSensor,
//   useSensors,
// } from "@dnd-kit/core";
// import {
//   SortableContext,
//   horizontalListSortingStrategy,
//   arrayMove,
// } from "@dnd-kit/sortable";
// import SortableBoardItem from "./SortableBoardItem";



// //DALAM komponen
// const sensors = useSensors(useSensor(PointerSensor));

// // 🔹 Fungsi saat drag selesai
// const handleDragEnd = async (event) => {
//   const { active, over } = event;
//   if (!over || active.id === over.id) return;

//   const oldIndex = boards.findIndex((b) => b.id === active.id);
//   const newIndex = boards.findIndex((b) => b.id === over.id);
//   const reordered = arrayMove(boards, oldIndex, newIndex);
//   setBoards(reordered);

//   try {
//     // update posisi di backend
//     for (let i = 0; i < reordered.length; i++) {
//       await reorderBoardPosition(reordered[i].id, i + 1, workspaceId);
//     }
//     showSnackbar("Success reorder boards!", "success");
//     await fetchBoards();
//   } catch (error) {
//     console.error("Error changing board position:", error);
//     showSnackbar("Failed to reorder boards", "error");
//   }
// };




// <div className="wp-content">
//   {boards.length > 0 && (
//     <DndContext
//       sensors={sensors}
//       collisionDetection={closestCenter}
//       onDragEnd={handleDragEnd}
//     >
//       <SortableContext
//         items={boards.map((b) => b.id)}
//         strategy={horizontalListSortingStrategy}
//       >
//         <div className="flex gap-4 pb-4 overflow-x-auto">
//           {boards.map((board) => (
//             <SortableBoardItem key={board.id} id={board.id}>
//               {/* 🧩 SEMUA ISI CARD LAMA DIPINDAH KE SINI */}
//               <div className="wp-card">
//                 <div className="wp-name">
//                   <div className="wp-name-text">
//                     <div className="name-icon">
//                       <PiAlignTopFill className="ni-mini" />
//                     </div>

//                     {editingName === board.id ? (
//                       <input
//                         type="text"
//                         value={newName}
//                         onChange={(e) => setNewName(e.target.value)}
//                         onBlur={() => handleSaveName(board.id)}
//                         onKeyDown={(e) => handleKeyPressName(e, board.id)}
//                         autoFocus
//                       />
//                     ) : (
//                       <h5 onClick={(e) => handleEditName(e, board.id, board.name)}>
//                         {board.name}
//                       </h5>
//                     )}
//                   </div>

//                   <BootstrapTooltip title="Board setting" placement="top">
//                     <div
//                       className="wp-setting"
//                       onClick={(e) => handleShowBoardSetting(e, board.id)}
//                     >
//                       <HiOutlineEllipsisHorizontal />
//                     </div>
//                   </BootstrapTooltip>
//                 </div>

//                 {/* semua menu, modal, description, dll tetap sama */}
//                 {/* ... */}
//               </div>
//             </SortableBoardItem>
//           ))}
//         </div>
//       </SortableContext>
//     </DndContext>
//   )}

//   <div className="wpf-create">
//     <div className="wpf-content" onClick={handleShowForm}>
//       <HiOutlinePlus className="wpf-icon" />
//       <p>CREATE A NEW BOARD</p>
//     </div>
//   </div>
// </div>








//   return (
//     <div className='wp-container'>
//       <div className="wp-header">
//         <div className="nav">
//           <h5> WORKSPACE {workspace.name}</h5>
//           <div className="nav-title">
//             <p className='nav-p' onClick={handleNavigateToWorkspace}>{workspace.name}</p>
//             <HiChevronRight/>
//             <p style={{fontWeight:'normal'}}>Boards Page</p>
//           </div>
//         </div>
//         <div className="more-action">
//           <div className="create-board-btn" onClick={handleShowForm}>
//             <HiPlus className='cbb-icon'/>
//             <p>Create Board</p>
//           </div>
//         </div>
//       </div>
//       {/* CREATE A NEW BOARD  */}
//       {showForm && (
//         <form className='bform-workspace' onSubmit={handleSubmit} ref={showRef}>
//           <div className="bheader">
//             <div className="bheader-left">
//               <div className="board-icon">
//               <HiViewBoards/>
//             </div>
//             <p>CREATE NEW BOARD</p>
//             </div>
            
//             <BootstrapTooltip title='Close' placement='top'>
//               <HiMiniXMark className='bheader-icon' onClick={handleCloseForm}/>
//             </BootstrapTooltip>
//           </div>
//           <div className="bbody">
//             <div className="fname">
//                 <label>Board Name <span>*</span></label>
//                 <input 
//                   type="text" 
//                   value={boardName}
//                   onChange={(e)=> setBoardName(e.target.value)}
//                   required
//                 />
//             </div>
//             <div className="fdesc">
//               <label>Board Description</label>
//               <textarea
//                 type="text" 
//                 value={boardDescription}
//                 onChange={(e)=> setBoardDescription(e.target.value)}
//                 // required
//               />
//             </div>
//             <button type='submit'>
//               CREATE BOARD
//             </button>
//           </div>
//         </form>
//       )}
//       {/* END CREATE A NEW BOARD  */}

//       <div className="board-title">
//         <h3>Your Board, Your Space</h3>
//         <p>
//           Organize tasks, collaborate with your team, and keep projects moving forward — all in one place.
//         </p>
//       </div>

//       <div className="wp-body-container" >
//         <div className="wp-content">
//           {boards.length > 0 ? (
//           boards.map((board) => (
//           <div key={board.id} className='wp-card'>
//             <div className="wp-name">
//               <div className="wp-name-text">
//                 <div className="name-icon">
//                   <PiAlignTopFill className='ni-mini'/>
//                 </div>
//                 {/* <h5>{board.name}</h5> */}
//                 {editingName === board.id ? (
//                   <input 
//                     type="text"
//                     value={newName}
//                     onChange={(e) => setNewName(e.target.value)}
//                     onBlur={()=> handleSaveName(board.id)}
//                     onKeyDown={(e) => handleKeyPressName(e, board.id)}
//                     autoFocus 
//                   />
//                 ):(
//                   <h5 onClick={(e)=> handleEditName(e, board.id, board.name)}>{board.name}</h5>
//                 )}
//               </div>

//               <BootstrapTooltip title='Board setting' placement='top'>
//                 <div className="wp-setting" onClick={(e) => handleShowBoardSetting(e, board.id)}>
//                   <HiOutlineEllipsisHorizontal/>
//                 </div>
//               </BootstrapTooltip>
//             </div>

//             {/* BOARD SETTING  */}
//             {showBoardSetting[board.id] && (
//               <div className='bs-pop' ref={showBoard}>
//                 <button onClick={() => handleShowMovePopup(board.id)}>
//                   <HiMiniArrowLeftStartOnRectangle className='bs-icon'/>
//                   Move
//                 </button>
//                   <button  onClick={() => handleDuplicatePopup(board.id)}>
//                     <HiOutlineSquare2Stack className='bs-icon'/>
//                     Duplicate
//                   </button>
//                   <button onClick={() => handleArchiveBoard(board.id)}>
//                     <HiOutlineArchiveBox className='bs-icon'/>
//                     Archive
//                   </button>

//                   <button
//                     onClick={() =>
//                       setBoardPositionDropdown(
//                         boardPositionDropdown === board.id ? null : board.id
//                       )
//                     }
//                   >
//                     <GiCardExchange className='bs-icon'/>
//                     Posisi : {board.position}
//                   </button>

//                   <hr />
//                   <button 
//                     className='delete'
//                     onClick={() => handleDeleteClick(board.id)}
//                   >
//                     <HiOutlineTrash className='bs-delete'/>
//                     Delete
//                   </button>
//               </div>
//             )}
//             {showMovePopup[board.id] && (
//               <div className="workspace-move-modal">
//                   <MoveBoard fetchBoards={fetchBoards} boardId={board.id} userId={userId} onClose={()=>handleCloseMovePopup(board.id)}/>
//               </div>
//             )}
//             {showDuplicatePopup[board.id] && (
//               <div className="duplicate-modal">
//                   <DuplicateBoard fetchBoards={fetchBoards} boardId={board.id} userId={userId} onClose={() => handleCloseDuplicatePopup(board.id)}/>
//               </div>
//             )}
//             {boardPositionDropdown === board.id && (
//               <div className="duplocat-modal">
//                 <ul
//                   style={{
//                     listStyle: "none",
//                     padding: "5px",
//                     margin: "5px 0 0 0",
//                     border: "1px solid #ccc",
//                     borderRadius: "4px",
//                     position: "absolute",
//                     background: "#fff",
//                     zIndex: 10,
//                     minWidth: "100px",
//                   }}
//                 >
//                   {boards.map((_, i) => (
//                     <li
//                       key={i}
//                       style={{
//                         padding: "5px 10px",
//                         cursor: "pointer",
//                         background: i + 1 === board.position ? "#eee" : "#fff",
//                       }}
//                       onClick={() => handleChangeBoardPosition(board.id, i + 1)} // +1 biar mulai dari 1
//                     >
//                       {i + 1}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}

//             <BoardDeleteConfirm boardId={board.id} isOpen={showDeleteModal} onConfirm={confirmDelete} onCancle={handleCancleDelete} boardName={boards.find(b => b.id === selectedBoardId)?.name}/>
            

//             {/* END BOARD SETTING  */}
//             <div className="wp-body">
//               <div className="priority">
//                 <BoardProperties boardId={board.id}/>
//               </div>
//                 {/* DESCRIPTION  */}
//                 {editingDescription === board.id ? (
//                   <textarea
//                     value={newDescription}
//                     onChange={(e) => setNewDescription(e.target.value)}
//                     onBlur={()=> handleSaveDescription(board.id)}
//                     onKeyDown={(e) => handleKeyPressDescription(e, board.id)}
//                     autoFocus
//                   />
//                 ):(
//                   <p onClick={(e) => handleEditDescription(e, board.id, board.description)}>{board.description}</p>
//                 )}

//                 {/* <p>{board.description}</p> */}
//                 {/* <p>{formatDate(board.create_at)}</p> */}
//                 <div className="wp-btm">
//                   <div className='wp-create'>
//                     <IoTime className='wp-icon'/>
//                     {formatDate(board.create_at)}
//                   </div>
//                   <button 
//                     className='view'
//                     onClick={()=>handleNavigateToBoardList(workspaceId, board.id)}
//                     // onClick={handleNavigateToBoardList} 
//                   >
//                     View List
//                     <HiChevronRight/>
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))
//         ):(
//           <></>
//         )}

//           <div className="wpf-create">
//             <div className="wpf-content" onClick={handleShowForm}>
//               <HiOutlinePlus className='wpf-icon'/>
//               <p>CREATE A NEW BOARD</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default WorkspacePage




// import React from 'react';
// import {
//   DndContext,
//   closestCenter,
//   PointerSensor,
//   useSensor,
//   useSensors,
// } from "@dnd-kit/core";
// import {
//   SortableContext,
//   horizontalListSortingStrategy,
//   arrayMove,
// } from "@dnd-kit/sortable";
// import SortableBoardItem from "./SortableBoardItem"; // file baru nanti ya bestie

// // ... semua import kamu sebelumnya tetap

// const WorkspacePage = () => {
//   const sensors = useSensors(useSensor(PointerSensor));

//   // 🔹 Fungsi handle drag end
//   const handleDragEnd = async (event) => {
//     const { active, over } = event;
//     if (!over || active.id === over.id) return;

//     const oldIndex = boards.findIndex((b) => b.id === active.id);
//     const newIndex = boards.findIndex((b) => b.id === over.id);
//     const reordered = arrayMove(boards, oldIndex, newIndex);
//     setBoards(reordered);

//     try {
//       for (let i = 0; i < reordered.length; i++) {
//         await reorderBoardPosition(reordered[i].id, i + 1, workspaceId);
//       }
//       showSnackbar("Success reorder boards!", "success");
//       await fetchBoards();
//     } catch (error) {
//       console.error("Error changing board position:", error);
//       showSnackbar("Failed to reorder boards", "error");
//     }
//   };

//   return (
//     <div className='wp-container'>
//       <div className="wp-header">
//         <div className="nav">
//           <h5> WORKSPACE {workspace.name}</h5>
//           <div className="nav-title">
//             <p className='nav-p' onClick={handleNavigateToWorkspace}>{workspace.name}</p>
//             <HiChevronRight />
//             <p style={{ fontWeight: 'normal' }}>Boards Page</p>
//           </div>
//         </div>
//         <div className="more-action">
//           <div className="create-board-btn" onClick={handleShowForm}>
//             <HiPlus className='cbb-icon' />
//             <p>Create Board</p>
//           </div>
//         </div>
//       </div>

//       {/* CREATE NEW BOARD FORM */}
//       {showForm && (
//         <form className='bform-workspace' onSubmit={handleSubmit} ref={showRef}>
//           <div className="bheader">
//             <div className="bheader-left">
//               <div className="board-icon"><HiViewBoards /></div>
//               <p>CREATE NEW BOARD</p>
//             </div>
//             <BootstrapTooltip title='Close' placement='top'>
//               <HiMiniXMark className='bheader-icon' onClick={handleCloseForm} />
//             </BootstrapTooltip>
//           </div>

//           <div className="bbody">
//             <div className="fname">
//               <label>Board Name <span>*</span></label>
//               <input
//                 type="text"
//                 value={boardName}
//                 onChange={(e) => setBoardName(e.target.value)}
//                 required
//               />
//             </div>
//             <div className="fdesc">
//               <label>Board Description</label>
//               <textarea
//                 value={boardDescription}
//                 onChange={(e) => setBoardDescription(e.target.value)}
//               />
//             </div>
//             <button type='submit'>CREATE BOARD</button>
//           </div>
//         </form>
//       )}

//       <div className="board-title">
//         <h3>Your Board, Your Space</h3>
//         <p>Organize tasks, collaborate with your team, and keep projects moving forward — all in one place.</p>
//       </div>

//       <div className="wp-body-container">
//         <div className="wp-content">
//           {boards.length > 0 && (
//             <DndContext
//               sensors={sensors}
//               collisionDetection={closestCenter}
//               onDragEnd={handleDragEnd}
//             >
//               <SortableContext
//                 items={boards.map((b) => b.id)}
//                 strategy={horizontalListSortingStrategy}
//               >
//                 <div className="flex gap-4 pb-4 overflow-x-auto">
//                   {boards.map((board) => (
//                     <SortableBoardItem key={board.id} id={board.id}>
//                       <div className='wp-card'>
//                         <div className="wp-name">
//                           <div className="wp-name-text">
//                             <div className="name-icon"><PiAlignTopFill className='ni-mini' /></div>

//                             {editingName === board.id ? (
//                               <input
//                                 type="text"
//                                 value={newName}
//                                 onChange={(e) => setNewName(e.target.value)}
//                                 onBlur={() => handleSaveName(board.id)}
//                                 onKeyDown={(e) => handleKeyPressName(e, board.id)}
//                                 autoFocus
//                               />
//                             ) : (
//                               <h5 onClick={(e) => handleEditName(e, board.id, board.name)}>
//                                 {board.name}
//                               </h5>
//                             )}
//                           </div>

//                           <BootstrapTooltip title='Board setting' placement='top'>
//                             <div className="wp-setting" onClick={(e) => handleShowBoardSetting(e, board.id)}>
//                               <HiOutlineEllipsisHorizontal />
//                             </div>
//                           </BootstrapTooltip>
//                         </div>

//                         {/* BOARD SETTING */}
//                         {showBoardSetting[board.id] && (
//                           <div className='bs-pop' ref={showBoard}>
//                             <button onClick={() => handleShowMovePopup(board.id)}>
//                               <HiMiniArrowLeftStartOnRectangle className='bs-icon' />
//                               Move
//                             </button>
//                             <button onClick={() => handleDuplicatePopup(board.id)}>
//                               <HiOutlineSquare2Stack className='bs-icon' />
//                               Duplicate
//                             </button>
//                             <button onClick={() => handleArchiveBoard(board.id)}>
//                               <HiOutlineArchiveBox className='bs-icon' />
//                               Archive
//                             </button>

//                             <button
//                               onClick={() =>
//                                 setBoardPositionDropdown(
//                                   boardPositionDropdown === board.id ? null : board.id
//                                 )
//                               }
//                             >
//                               <GiCardExchange className='bs-icon' />
//                               Posisi : {board.position}
//                             </button>

//                             <hr />
//                             <button className='delete' onClick={() => handleDeleteClick(board.id)}>
//                               <HiOutlineTrash className='bs-delete' /> Delete
//                             </button>
//                           </div>
//                         )}

//                         {showMovePopup[board.id] && (
//                           <div className="workspace-move-modal">
//                             <MoveBoard
//                               fetchBoards={fetchBoards}
//                               boardId={board.id}
//                               userId={userId}
//                               onClose={() => handleCloseMovePopup(board.id)}
//                             />
//                           </div>
//                         )}
//                         {showDuplicatePopup[board.id] && (
//                           <div className="duplicate-modal">
//                             <DuplicateBoard
//                               fetchBoards={fetchBoards}
//                               boardId={board.id}
//                               userId={userId}
//                               onClose={() => handleCloseDuplicatePopup(board.id)}
//                             />
//                           </div>
//                         )}

//                         {boardPositionDropdown === board.id && (
//                           <div className="duplocat-modal">
//                             <ul style={{
//                               listStyle: "none",
//                               padding: "5px",
//                               margin: "5px 0 0 0",
//                               border: "1px solid #ccc",
//                               borderRadius: "4px",
//                               position: "absolute",
//                               background: "#fff",
//                               zIndex: 10,
//                               minWidth: "100px",
//                             }}>
//                               {boards.map((_, i) => (
//                                 <li
//                                   key={i}
//                                   style={{
//                                     padding: "5px 10px",
//                                     cursor: "pointer",
//                                     background: i + 1 === board.position ? "#eee" : "#fff",
//                                   }}
//                                   onClick={() => handleChangeBoardPosition(board.id, i + 1)}
//                                 >
//                                   {i + 1}
//                                 </li>
//                               ))}
//                             </ul>
//                           </div>
//                         )}

//                         <BoardDeleteConfirm
//                           boardId={board.id}
//                           isOpen={showDeleteModal}
//                           onConfirm={confirmDelete}
//                           onCancle={handleCancleDelete}
//                           boardName={boards.find(b => b.id === selectedBoardId)?.name}
//                         />

//                         <div className="wp-body">
//                           <div className="priority">
//                             <BoardProperties boardId={board.id} />
//                           </div>

//                           {editingDescription === board.id ? (
//                             <textarea
//                               value={newDescription}
//                               onChange={(e) => setNewDescription(e.target.value)}
//                               onBlur={() => handleSaveDescription(board.id)}
//                               onKeyDown={(e) => handleKeyPressDescription(e, board.id)}
//                               autoFocus
//                             />
//                           ) : (
//                             <p onClick={(e) => handleEditDescription(e, board.id, board.description)}>
//                               {board.description}
//                             </p>
//                           )}

//                           <div className="wp-btm">
//                             <div className='wp-create'>
//                               <IoTime className='wp-icon' />
//                               {formatDate(board.create_at)}
//                             </div>
//                             <button
//                               className='view'
//                               onClick={() => handleNavigateToBoardList(workspaceId, board.id)}
//                             >
//                               View List
//                               <HiChevronRight />
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     </SortableBoardItem>
//                   ))}
//                 </div>
//               </SortableContext>
//             </DndContext>
//           )}

//           <div className="wpf-create">
//             <div className="wpf-content" onClick={handleShowForm}>
//               <HiOutlinePlus className='wpf-icon' />
//               <p>CREATE A NEW BOARD</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default WorkspacePage;



// import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core";
// import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
// import SortableBoardItem from "../hook/SortableBoardItem";
// import { useState } from "react";

// function WorkspacePage() {
//   const [activeId, setActiveId] = useState(null);

//   const handleDragStart = (event) => {
//     setActiveId(event.active.id);
//   };

//   const handleDragEnd = (event) => {
//     const { active, over } = event;
//     if (active.id !== over?.id) {
//       const oldIndex = boards.findIndex((b) => b.id === active.id);
//       const newIndex = boards.findIndex((b) => b.id === over.id);
//       const reordered = arrayMove(boards, oldIndex, newIndex);
//       setBoards(reordered);
//     }
//     setActiveId(null);
//   };

//   return (
//     <DndContext
//       collisionDetection={closestCenter}
//       onDragStart={handleDragStart}
//       onDragEnd={handleDragEnd}
//     >
//       <SortableContext
//         items={boards.map((b) => b.id)}
//         strategy={horizontalListSortingStrategy}
//       >
//         <div className="wp-content" style={{ display: "flex", gap: "8px" }}>
//           {boards.map((board) => (
//             <SortableBoardItem key={board.id} id={board.id}>
//               <div className="wp-card">
//                 <h5>{board.name}</h5>
//                 <p>{board.description}</p>
//               </div>
//             </SortableBoardItem>
//           ))}
//         </div>
//       </SortableContext>

//       {/* 🪄 Ghost (Drag Overlay) */}
//       <DragOverlay>
//         {activeId ? (
//           <div
//             style={{
//               width: "260px",
//               background: "#e8f6ff",
//               borderRadius: "8px",
//               padding: "12px",
//               boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
//               transform: "rotate(1deg)",
//             }}
//           >
//             <strong>
//               {boards.find((b) => b.id === activeId)?.name || "Dragging..."}
//             </strong>
//             <p style={{ marginTop: "4px", fontSize: "14px", color: "#555" }}>
//               {boards.find((b) => b.id === activeId)?.description}
//             </p>
//           </div>
//         ) : null}
//       </DragOverlay>
//     </DndContext>
//   );
// }


// {boards.map((board) => (
//   <SortableBoardItem key={board.id} id={board.id}>
//     {({ dragHandleProps, isDragging }) => (
//       <div className='wp-card'>
//         <div className="wp-name-text">
//           {/* 🎯 hanya icon ini yang bisa drag */}
//           <div className="name-icon" {...dragHandleProps}>
//             <PiAlignTopFill className='ni-mini' />
//           </div>

//           {editingName === board.id ? (
//             <input
//               type="text"
//               value={newName}
//               onChange={(e) => setNewName(e.target.value)}
//               onBlur={() => handleSaveName(board.id)}
//               onKeyDown={(e) => handleKeyPressName(e, board.id)}
//               autoFocus
//             />
//           ) : (
//             <h5 onClick={(e) => handleEditName(e, board.id, board.name)}>
//               {board.name}
//             </h5>
//           )}
//         </div>

//         {/* semua elemen lain tetap bisa di klik */}
//         <div className="wp-body">
//           <div className="priority">
//             <BoardProperties boardId={board.id} />
//           </div>
//           {editingDescription === board.id ? (
//             <textarea
//               value={newDescription}
//               onChange={(e) => setNewDescription(e.target.value)}
//               onBlur={() => handleSaveDescription(board.id)}
//               onKeyDown={(e) => handleKeyPressDescription(e, board.id)}
//               autoFocus
//             />
//           ) : (
//             <p onClick={(e) => handleEditDescription(e, board.id, board.description)}>
//               {board.description}
//             </p>
//           )}
//         </div>
//       </div>
//     )}
//   </SortableBoardItem>
// ))}



// import React, { useState } from "react";
// import { DndContext, closestCenter } from "@dnd-kit/core";
// import {
//   SortableContext,
//   horizontalListSortingStrategy,
//   arrayMove,
// } from "@dnd-kit/sortable";
// import SortableListItem from "../hook/SortableListItem";
// import { reorderListPosition } from "../api/listApi"; // pastikan path-nya benar
// import { showSnackbar } from "../utils/snackbar"; // kalau kamu pakai snackbar

// function BoardView({ lists, setLists, boardId, fetchLists }) {
//   const [activeId, setActiveId] = useState(null);

//   // handle drag end
//   const handleDragEnd = async (event) => {
//     const { active, over } = event;
//     if (!over || active.id === over.id) return;

//     const oldIndex = lists.findIndex((l) => l.id === active.id);
//     const newIndex = lists.findIndex((l) => l.id === over.id);
//     const newLists = arrayMove(lists, oldIndex, newIndex);

//     setLists(newLists);

//     try {
//       // update posisi di DB
//       await reorderListPosition(active.id, newIndex, boardId);
//       showSnackbar("List order updated!", "success");
//     } catch (error) {
//       console.error("Error updating list order:", error);
//       showSnackbar("Failed to update order", "error");
//       // refresh ulang kalau gagal
//       await fetchLists();
//     }
//   };

//   return (
//     <DndContext
//       collisionDetection={closestCenter}
//       onDragEnd={handleDragEnd}
//       onDragStart={(e) => setActiveId(e.active.id)}
//       onDragCancel={() => setActiveId(null)}
//     >
//       <SortableContext
//         items={lists.map((l) => l.id)}
//         strategy={horizontalListSortingStrategy}
//       >
//         <div className="bl-content">
//           {lists.map((list) => (
//             <SortableListItem key={list.id} id={list.id}>
//               {({ dragHandleProps }) => (
//                 <div className="bl-card">
//                   <div className="bl-box">
//                     <div className="list-title">
//                       <div className="l-name" {...dragHandleProps}>
//                         <HiMiniListBullet className="licon" />
//                         {editName === list.id ? (
//                           <input
//                             type="text"
//                             value={newName}
//                             onChange={(e) => setNewName(e.target.value)}
//                             onBlur={() => handleSaveName(list.id)}
//                             onKeyDown={(e) => handleKeyPressName(e, list.id)}
//                             autoFocus
//                           />
//                         ) : (
//                           <h5 onClick={(e) => handleEditName(e, list.id, list.name)}>
//                             {list.name}
//                           </h5>
//                         )}
//                       </div>
//                       {/* ... sisanya tetap, tombol setting, delete, dll ... */}
//                     </div>

//                     {/* body list */}
//                     <div className="list-body">
//                       {/* render cards di sini */}
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </SortableListItem>
//           ))}
//         </div>
//       </SortableContext>
//     </DndContext>
//   );
// }

// export default BoardView;



// import React, { useState } from "react";
// import {
//   DndContext,
//   closestCorners,
//   DragOverlay,
// } from "@dnd-kit/core";
// import {
//   SortableContext,
//   verticalListSortingStrategy,
//   arrayMove,
// } from "@dnd-kit/sortable";
// import SortableCardItem from "./SortableCardItem";
// import { updateCardPosition } from "../api/apiService";

// const BoardView = ({ lists, fetchLists, fetchCardList }) => {
//   // bentuknya: { [listId]: [array of cards] }
//   const [cardsByList, setCardsByList] = useState({});
//   const [activeCard, setActiveCard] = useState(null);

//   // panggil ini tiap kali list/card di-load
//   const handleSetCards = (listId, cards) => {
//     setCardsByList((prev) => ({ ...prev, [listId]: cards }));
//   };

//   const handleDragStart = (event) => {
//     const { active } = event;
//     const { id } = active;
//     // cari card aktif
//     for (const listId in cardsByList) {
//       const found = cardsByList[listId].find((c) => c.id === id);
//       if (found) {
//         setActiveCard(found);
//         break;
//       }
//     }
//   };

//   const handleDragEnd = async (event) => {
//     const { active, over } = event;
//     setActiveCard(null);
//     if (!over) return;

//     const activeListId = findContainer(active.id);
//     const overListId = findContainer(over.id);

//     if (!activeListId || !overListId) return;

//     // kalau beda list
//     if (activeListId !== overListId) {
//       const activeCards = [...cardsByList[activeListId]];
//       const overCards = [...cardsByList[overListId]];

//       const activeIndex = activeCards.findIndex((c) => c.id === active.id);
//       const newCard = { ...activeCards[activeIndex], list_id: overListId };

//       // hapus dari list lama
//       activeCards.splice(activeIndex, 1);
//       // taruh ke list baru di akhir
//       overCards.push(newCard);

//       const newCardsByList = {
//         ...cardsByList,
//         [activeListId]: activeCards,
//         [overListId]: overCards,
//       };
//       setCardsByList(newCardsByList);

//       try {
//         await updateCardPosition(active.id, overCards.length - 1, overListId);
//         console.log("Moved to new list successfully");
//       } catch (err) {
//         console.error("Error moving card:", err);
//       }
//       return;
//     }

//     // kalau di list yang sama → reorder
//     const listCards = cardsByList[activeListId];
//     const oldIndex = listCards.findIndex((c) => c.id === active.id);
//     const newIndex = listCards.findIndex((c) => c.id === over.id);

//     if (oldIndex !== newIndex) {
//       const newCards = arrayMove(listCards, oldIndex, newIndex);
//       setCardsByList((prev) => ({ ...prev, [activeListId]: newCards }));

//       try {
//         await updateCardPosition(active.id, newIndex, activeListId);
//       } catch (err) {
//         console.error("Error updating position:", err);
//       }
//     }
//   };

//   const findContainer = (cardId) => {
//     return Object.keys(cardsByList).find((listId) =>
//       cardsByList[listId].some((card) => card.id === cardId)
//     );
//   };

//   return (
//     <DndContext
//       collisionDetection={closestCorners}
//       onDragStart={handleDragStart}
//       onDragEnd={handleDragEnd}
//     >
//       <div className="board-lists">
//         {lists.map((list) => (
//           <div key={list.id} className="board-list">
//             <h3>{list.name}</h3>

//             <SortableContext
//               items={(cardsByList[list.id] || []).map((card) => card.id)}
//               strategy={verticalListSortingStrategy}
//             >
//               <div className="card-list">
//                 {(cardsByList[list.id] || []).map((card) => (
//                   <SortableCardItem key={card.id} card={card}>
//                     <YourCardComponent card={card} />
//                   </SortableCardItem>
//                 ))}
//               </div>
//             </SortableContext>
//           </div>
//         ))}
//       </div>

//       <DragOverlay>
//         {activeCard ? (
//           <div
//             style={{
//               width: "240px",
//               background: "#f8fbff",
//               borderRadius: "8px",
//               padding: "12px",
//               boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
//             }}
//           >
//             <strong>{activeCard.title}</strong>
//             <p style={{ fontSize: "14px", color: "#666" }}>
//               {activeCard.description || "(no description)"}
//             </p>
//           </div>
//         ) : null}
//       </DragOverlay>
//     </DndContext>
//   );
// };

// export default BoardView;
