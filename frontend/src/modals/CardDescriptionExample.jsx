import { useRef } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { HiChevronDown, HiChevronUp, HiXMark } from "react-icons/hi2";
import '../style/modals/CardDescriptionExample.css'
// import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const CardDescriptionExample = ({ 
  card, 
  setCard,
  onClose,
  cardId, 
  newDescription,
  setNewDescription,
  handleSaveDescription,
  loading,
  setLoading,
  setEditingDescription,
  editingDescription,
  showMore,
  setShowMore,
  linkify,
  handleEditDescription,
  maxChars,
  modules,
}) => {
  const quillRef = useRef(null);

  // 👉 Pastikan saat klik edit, state newDescription diisi dengan data lama
  const handleStartEdit = (e) => {
    setNewDescription(card.description || "");
    handleEditDescription(e, cardId, card.description);
  };

  return (
    <div className='card-description-container'>
      {/* HEADER */}
      <div className="cd-header">
        <h3>Detail Description</h3>
        <HiXMark onClick={onClose} className="cd-icon"/>
      </div>

      {/* CONTENT */}
      {card && cardId && (
        <div className="des-content">
          {editingDescription === cardId ? (
            <div className="ta-content">
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={newDescription}
                onChange={setNewDescription}
                modules={modules}
                className="my-editor"
              />

              <div className="action-btn">
                <button
                  className="btn-desc-save"
                  onClick={() => handleSaveDescription(cardId)}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </button>

                <button
                  className="btn-desc-cancel"
                  onClick={() => {
                    setEditingDescription(null);
                    setNewDescription(card.description || "");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={handleStartEdit}   // ✅ pakai handleStartEdit biar isi newDescription dulu
              style={{ cursor: "pointer", whiteSpace: "pre-wrap", minHeight:'50vh', maxHeight:'78vh', overflowY:'auto' }}
              className="div-p"
            >
              {card.description && card.description.trim() !== "" ? (
                <>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: showMore
                        ? linkify(card.description)
                        : linkify(card.description.substring(0, maxChars)),
                    }}
                    style={{ cursor: "text" }}
                    onClick={(e) => {
                      if (e.target.tagName === "A") e.stopPropagation();
                    }}
                  />
                  {card.description.length > maxChars && (
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
    </div>
  );
};

export default CardDescriptionExample;
