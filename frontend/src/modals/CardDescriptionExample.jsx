import { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { updateDescCard } from "../services/ApiServices";
import { HiChevronDown, HiChevronUp, HiXMark } from "react-icons/hi2";

const CardDescriptionExample=({ 
  card, 
  cardId, 
  setCard, 
  onClose,
  // setNewDescription,
  handleSaveDescription,
  loading,
  setLoading,
  // setEditingDescription,
  showMore,
  setShowMore,
  linkify,
  handleEditDescription,
  maxChars,
  modules
})=> {
  const [cards, setCards] = useState({});
  const [description, setDescription] = useState(card.description || "");
  const [isSaving, setIsSaving] = useState(false);
  const [editingDescription, setEditingDescription] = useState(null);
  const [newDescription, setNewDescription] = useState('');
  const quillRef = useRef(null);

  // debug 
  console.log('card deskripsi menerima data card:', card);
  console.log('card deskripsi menerima data cardId:', cardId);
    

  return(
    <div className='card-description-container'>
      <div className="desc-header">
        
        <HiXMark onClick={onClose}/>
      </div>
      <div className="des-content">
        {card.description}
      </div>
      {/* <div className="des-content">
          {cards && cardId && (
          <div className="des-content" style={{ height: "fit-content" }}>
              {editingDescription === cardId ? (
              <div className="ta-cont">
                  <ReactQuill
                      ref={quillRef}
                      theme="snow"
                      value={newDescription}
                      onChange={setNewDescription}
                      modules={modules}
                      className="toolbar-box"
                  />
      
                  <div className="desc-actions">
                  <button
                      className="btn-save"
                      onClick={() => handleSaveDescription(cardId)}
                      disabled={loading}
                      style={{
                      background: "#4caf50",
                      color: "white",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      width:'10vw',
                      textAlign:'center'
                      }}
                  >
                      {loading ? "Saving..." : "Save"}
                  </button>
      
                  <button
                      className="btn-cancel"
                      onClick={() => {
                      setEditingDescription(null);
                      setNewDescription(cards.description || "");
                      }}
                      style={{
                      background: "#f44336",
                      color: "white",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      width:'10vw',
                      }}
                  >
                      Cancel
                  </button>
                  </div>
              </div>
              ) : (
              <div
                  onClick={(e) => handleEditDescription(e, cardId, cards.description)}
                  style={{ cursor: "pointer", whiteSpace: "pre-wrap" }}
                  className="div-p"
              >
                  {cards.description && cards.description.trim() !== "" ? (
                  <>
                      <div
                      dangerouslySetInnerHTML={{
                          __html: showMore
                          ? linkify(cards.description)
                          : linkify(cards.description.substring(0, maxChars)),
                      }}
                      style={{ cursor: "text" }}
                      onClick={(e) => {
                          if (e.target.tagName === "A") e.stopPropagation();
                      }}
                      />
                      {cards.description.length > maxChars && (
                      <span
                          onClick={(e) => {
                          e.stopPropagation();
                          setShowMore((prev) => !prev);
                          }}
                          style={{
                          color: "#5557e7",
                          fontWeight: "500",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-start",
                          marginTop: "8px",
                          gap: "5px",
                          }}
                      >
                          {showMore ? "Show Less" : "Show More"}
                          {showMore ? <HiChevronUp /> : <HiChevronDown />}
                      </span>
                      )}
                  </>
                  ) : (
                  <div className="placeholder-desc">
                      <p>(click to add description)</p>
                  </div>
                  )}
              </div>
              )}
          </div>
      )}
    </div> */}
    
    </div>
  )



}

export default CardDescriptionExample


// return (
//     <div className="space-y-3">
//       <h3 className="text-lg font-semibold">Deskripsi</h3>
//       {/* <HiXMark onClick={onClose}/> */}

//       {/* ReactQuill editor */}
//       <ReactQuill
//         theme="snow"
//         value={description}
//         onChange={setDescription}
//         modules={{
//           toolbar: [
//             ["bold", "italic", "underline", "strike"],
//             [{ list: "ordered" }, { list: "bullet" }],
//             ["blockquote", "code-block"],
//             ["link"],
//             ["clean"],
//           ],
//         }}
//         className="bg-white rounded-md"
//       />

//       <button
//         onClick={handleSave}
//         disabled={isSaving}
//         className="px-4 py-2 text-white bg-blue-600 rounded-md disabled:opacity-50"
//       >
//         {isSaving ? "Menyimpan..." : "Simpan"}
//       </button>
//     </div>
//   );