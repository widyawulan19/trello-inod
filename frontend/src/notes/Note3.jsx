import { useRef } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { HiChevronDown, HiChevronUp, HiXMark } from "react-icons/hi2";
import '../style/modals/CardDescriptionExample.css';

const CardDescriptionExample = ({ 
  card, 
  onClose,
  cardId, 
  newDescription,
  setNewDescription,
  handleSaveDescription,
  loading,
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

  const handleStartEdit = (e) => {
    setNewDescription(card.description || "");
    handleEditDescription(e, cardId, card.description);
  };

  const parsedHTML = showMore
    ? linkify(card.description || "")
    : linkify((card.description || "").substring(0, maxChars));

  return (
    <div className='card-description-container'>
      
      {/* HEADER */}
      <div className="cd-header">
        <h3>Detail Description</h3>
        <HiXMark onClick={onClose} className="cd-icon"/>
      </div>

      {/* CONTENT */}
      {card && cardId && (
        <div className="des-modal-content">
          
          {/* ===========================
              MODE EDIT - ReactQuill
          ============================ */}
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

          /* ===========================
               MODE VIEW - pure HTML
          ============================ */
            <div
              onClick={handleStartEdit}
              className="view-mode-wrapper"
              style={{ cursor: "pointer" }}
            >
              {card.description && card.description.trim() !== "" ? (
                <>
                  <div
                    className="my-view-html"
                    dangerouslySetInnerHTML={{ __html: parsedHTML }}
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
