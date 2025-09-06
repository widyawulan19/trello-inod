// const CardDescription = ({ card }) => {
//   const [isEditing, setIsEditing] = useState(false);
//   const [desc, setDesc] = useState(card.description || "");
//   const [loading, setLoading] = useState(false);
//   const quillRef = useRef(null);

//   const handleSave = async () => {
//     try {
//       setLoading(true);
//       await updateDescCard(card.id, desc);
//       setIsEditing(false);
//     } catch (err) {
//       console.error("❌ Gagal update desc:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const modules = {
//     toolbar: [
//       [{ header: [1, 2, false] }],
//       ["bold", "italic", "underline", "strike"],
//       [{ list: "ordered" }, { list: "bullet" }],
//       ["blockquote", "code-block"],
//       [{ align: [] }],
//       ["link"],
//       ["clean"],
//     ],
//     keyboard: {
//       bindings: {
//         tab: {
//           key: 9,
//           handler: function () {
//             this.quill.insertText(this.quill.getSelection().index, "    ");
//           },
//         },
//       },
//     },
//   };

//   return (
//     <div className="card-desc">
//       {isEditing ? (
//         <div>
//           <ReactQuill
//             ref={quillRef}
//             theme="snow"
//             value={desc}
//             onChange={setDesc}
//             onBlur={handleSave} // ✅ auto-save saat blur
//             modules={modules}
//             className="toolbar-box"
//           />
//           {loading && <p className="text-sm text-gray-500 mt-1">Saving...</p>}
//         </div>
//       ) : (
//         <div
//           className="description-body"
//           onClick={() => setIsEditing(true)}
//           dangerouslySetInnerHTML={{
//             __html:
//               desc ||
//               "<span class='text-gray-400'>Click to add description...</span>",
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default CardDescription;


// import React, { useState, useRef } from "react";
// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css";
// import { RiExpandDiagonalLine } from "react-icons/ri";
// import { HiChevronUp, HiChevronDown } from "react-icons/hi";
// import BootstrapTooltip from "@mui/material/Tooltip";

// const DescriptionCard = ({
//   cards,
//   cardId,
//   editingDescription,
//   newDescription,
//   setNewDescription,
//   handleSaveDescription,
//   handleEditDescription,
//   renderDescription,
//   maxChars,
//   showMore,
//   toggleShowMore,
//   handleShowModalDes,
// }) => {
//   const quillRef = useRef(null);

//   // ✅ Toolbar custom, selalu tampil
//   const modules = {
//     toolbar: {
//       container: "#toolbar",
//     },
//     keyboard: {
//       bindings: {
//         tab: {
//           key: 9,
//           handler: () => true,
//         },
//         enter: {
//           key: 13,
//           handler: () => {
//             handleSaveDescription(cardId);
//             return false; // jangan newline
//           },
//         },
//         shift_enter: {
//           key: 13,
//           shiftKey: true,
//           handler: () => {
//             const editor = quillRef.current.getEditor();
//             editor.insertText(editor.getSelection().index, "\n");
//           },
//         },
//       },
//     },
//   };

//   return (
//     <div className="ncd-desc">
//       <div className="des-header">
//         <div className="des-left">Description</div>
//         <BootstrapTooltip title="Detail Description" placement="top">
//           <div className="des-right" onClick={handleShowModalDes}>
//             <RiExpandDiagonalLine className="des-icon" />
//           </div>
//         </BootstrapTooltip>
//       </div>

//       {/* ✅ Toolbar global */}
//       <div id="toolbar" className="mb-2 border-b pb-1">
//         <select className="ql-header" defaultValue={""} onChange={(e) => e.persist()}>
//           <option value="1"></option>
//           <option value="2"></option>
//           <option value=""></option>
//         </select>
//         <button className="ql-bold"></button>
//         <button className="ql-italic"></button>
//         <button className="ql-underline"></button>
//         <button className="ql-list" value="ordered"></button>
//         <button className="ql-list" value="bullet"></button>
//         <button className="ql-link"></button>
//       </div>

//       <div className="des-content">
//         {cards && cardId && (
//           <div className="des-content" style={{ height: "fit-content" }}>
//             {editingDescription === cardId ? (
//               <div className="ta-cont">
//                 <ReactQuill
//                   ref={quillRef}
//                   theme="snow"
//                   value={newDescription}
//                   onChange={setNewDescription}
//                   onBlur={() => handleSaveDescription(cardId)}
//                   modules={modules}
//                 />
//                 <small className="text-muted">
//                   ** Tekan <b>Enter</b> untuk simpan || <b>Shift + Enter</b> untuk baris baru
//                 </small>
//               </div>
//             ) : (
//               <div
//                 onClick={(e) =>
//                   handleEditDescription(e, cardId, cards.description)
//                 }
//                 style={{ whiteSpace: "pre-wrap", cursor: "pointer" }}
//                 className="div-p"
//               >
//                 {cards.description && cards.description.trim() !== "" ? (
//                   <>
//                     <div
//                       dangerouslySetInnerHTML={{
//                         __html: cards.description,
//                       }}
//                     />
//                     {cards.description.length > maxChars && (
//                       <span
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           toggleShowMore();
//                         }}
//                         style={{
//                           color: "#5557e7",
//                           fontWeight: "500",
//                           cursor: "pointer",
//                           display: "flex",
//                           alignItems: "center",
//                           justifyContent: "flex-start",
//                           marginTop: "8px",
//                           gap: "5px",
//                         }}
//                       >
//                         {showMore ? "Show Less" : "Show More"}
//                         {showMore ? <HiChevronUp /> : <HiChevronDown />}
//                       </span>
//                     )}
//                   </>
//                 ) : (
//                   <div className="placeholder-desc">
//                     <p>(click to add description)</p>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default DescriptionCard;


// import React, { useRef } from "react";
// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css";
// import { RiExpandDiagonalLine } from "react-icons/ri";
// import { HiChevronUp, HiChevronDown } from "react-icons/hi";
// import BootstrapTooltip from "@mui/material/Tooltip";

// {/* DESCRIPTION CARD */}
// <div className="ncd-desc">
//   <div className="des-header">
//     <div className="des-left">Description</div>
//     <BootstrapTooltip title="Detail Description" placement="top">
//       <div className="des-right" onClick={handleShowModalDes}>
//         <RiExpandDiagonalLine className="des-icon" />
//       </div>
//     </BootstrapTooltip>
//   </div>

//   <div className="des-content">
//     {cards && cardId && (
//       <div className="des-content" style={{ height: "fit-content" }}>
//         {editingDescription === cardId ? (
//           <div className="ta-cont">
//             {/* ✅ ReactQuill sebagai editor */}
//             <ReactQuill
//               ref={useRef(null)}
//               theme="snow"
//               value={newDescription}
//               onChange={setNewDescription}
//               onBlur={() => handleSaveDescription(cardId)}
//               modules={{
//                 toolbar: [
//                   [{ header: [1, 2, false] }],
//                   ["bold", "italic", "underline", "strike"],
//                   [{ list: "ordered" }, { list: "bullet" }],
//                   ["blockquote", "code-block"],
//                   [{ align: [] }],
//                   ["link"],
//                   ["clean"],
//                 ],
//                 keyboard: {
//                   bindings: {
//                     tab: {
//                       key: 9,
//                       handler: function () {
//                         this.quill.insertText(
//                           this.quill.getSelection().index,
//                           "    "
//                         );
//                       },
//                     },
//                     enter: {
//                       key: 13,
//                       handler: () => {
//                         handleSaveDescription(cardId);
//                         return false; // jangan newline
//                       },
//                     },
//                     shift_enter: {
//                       key: 13,
//                       shiftKey: true,
//                       handler: () => {
//                         const editor = this.quill;
//                         editor.insertText(editor.getSelection().index, "\n");
//                       },
//                     },
//                   },
//                 },
//               }}
//             />
//             <small className="text-muted">
//               ** Tekan <b>Enter</b> untuk simpan ||{" "}
//               <b>Shift + Enter</b> untuk baris baru
//             </small>
//           </div>
//         ) : (
//           <div
//             onClick={(e) =>
//               handleEditDescription(e, cardId, cards.description)
//             }
//             style={{ whiteSpace: "pre-wrap", cursor: "pointer" }}
//             className="div-p"
//           >
//             {/* ✅ tetap pakai renderDescription biar tampilan lama aman */}
//             {cards.description && cards.description.trim() !== "" ? (
//               <>
//                 {renderDescription(cards.description)}

//                 {cards.description.length > maxChars && (
//                   <span
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       toggleShowMore();
//                     }}
//                     style={{
//                       color: "#5557e7",
//                       fontWeight: "500",
//                       cursor: "pointer",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "flex-start",
//                       marginTop: "8px",
//                       gap: "5px",
//                     }}
//                   >
//                     {showMore ? "Show Less" : "Show More"}
//                     {showMore ? <HiChevronUp /> : <HiChevronDown />}
//                   </span>
//                 )}
//               </>
//             ) : (
//               <div className="placeholder-desc">
//                 <p>(click to add description)</p>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     )}
//   </div>
// </div>;



// const handleSave = async () => {
//   try {
//     setLoading(true);
//     const res = await updateDescCard(card.id, desc);
//     setDesc(res.data.description); // ✅ pakai data yang sudah benar-benar dari DB
//     setIsEditing(false);
//   } catch (err) {
//     console.error("❌ Gagal update desc:", err);
//   } finally {
//     setLoading(false);
//   }
// };


// const handleSave = async () => {
//   try {
//     setLoading(true);
//     const res = await updateDescCard(card.id, desc);
//     setDesc(res.data.description);   // ✅ sync ke database value
//     setIsEditing(false);

//     // kalau parent butuh update juga:
//     if (onUpdate) onUpdate(res.data.description);
//   } catch (err) {
//     console.error("❌ Gagal update desc:", err);
//   } finally {
//     setLoading(false);
//   }
// };


// <div
//   onClick={(e) => handleEditDescription(e, cardId, cards.description)}
//   style={{ whiteSpace: "pre-wrap", cursor: "pointer" }}
//   className="div-p"
// >
//   {cards.description && cards.description.trim() !== "" ? (
//     <>
//       <div
//         dangerouslySetInnerHTML={{
//           __html: showMore
//             ? cards.description
//             : cards.description.substring(0, maxChars),
//         }}
//         style={{ cursor: "text" }} // biar bisa select text & klik link
//       />
//       {cards.description.length > maxChars && (
//         <span
//           onClick={(e) => {
//             e.stopPropagation();
//             toggleShowMore();
//           }}
//           style={{
//             color: "#5557e7",
//             fontWeight: "500",
//             cursor: "pointer",
//             display: "flex",
//             alignItems: "center",
//             gap: "5px",
//           }}
//         >
//           {showMore ? "Show Less" : "Show More"}
//         </span>
//       )}
//     </>
//   ) : (
//     <div className="placeholder-desc">
//       <p>(click to add description)</p>
//     </div>
//   )}
// </div>
