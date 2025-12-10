import { useRef } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { HiChevronDown, HiChevronUp, HiXMark } from "react-icons/hi2";
import '../style/modals/CardDescriptionExample.css';
import { IoClose, IoSaveOutline } from "react-icons/io5";

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

  // 👉 ketika mau edit, isi newDescription dulu
  const handleStartEdit = (e) => {
    setNewDescription(card.description || "");
    handleEditDescription(e, cardId, card.description);
  };


  const linkifyClean = (text = "") => {
    if (!text) return "";

    // Fix malformed anchor tags: pastikan href selalu tertutup kutip
    text = text.replace(/href="([^"]*)[\s]/g, 'href="$1" ');

    // Raw URLs → jadi link
    const urlRegex = /(https?:\/\/[^\s<]+)|(www\.[^\s<]+)/g;

    return text.replace(urlRegex, (url) => {
      const clean = url.trim();
      const href = clean.startsWith("http") ? clean : `https://${clean}`;
      return `<a href="${href}" target="_blank" rel="noopener noreferrer">${clean}</a>`;
    });
  };

  // FIX all broken <a> tags from Quill
  const cleanLinkTags = (html = "") => {
    if (!html) return "";

    let fixed = html;

    // 1️⃣ FIX broken href attribute without closing quote
    fixed = fixed.replace(
      /href="([^"]+)"\s+(rel|target)/g,
      (match, url, nextAttr) => `href="${url}" ${nextAttr}`
    );

    // 2️⃣ FIX any URL that accidentally has `" rel=` attached
    fixed = fixed.replace(
      /(https?:\/\/[^\s"<]+)"\s+rel=/g,
      (m, url) => `${url}" rel=`
    );

    // 3️⃣ DETECT plain URL text → convert to <a>
    fixed = fixed.replace(
      /(https?:\/\/[^\s<]+)/g,
      (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
    );

    // 4️⃣ Cleanup duplicated tags
    fixed = fixed.replace(/">"/g, '">');

    return fixed;
  };



  const parsedHTML = showMore
    ? linkifyClean(card.description || "")
    : linkifyClean((card.description || "").substring(0, maxChars));

  // const parsedHTML = showMore
  //   ? cleanLinkTags(linkifyClean(card.description || ""))
  //   : cleanLinkTags(linkifyClean((card.description || "").substring(0, maxChars)));


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
              MODE EDIT (ReactQuill)
          ============================ */}
          {editingDescription === cardId ? (
            <div className="ta-content">

              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={newDescription}
                onChange={setNewDescription}
                modules={modules}
                className="detail-my-editor"
              />

              <div className="action-btn">
                <button
                  className="btn-desc-cancel"
                  onClick={() => {
                    setEditingDescription(null);
                    setNewDescription(card.description || "");
                  }}
                >
                  <IoClose />
                  Cancel
                </button>
                <button
                  className="btn-desc-save"
                  onClick={() => handleSaveDescription(cardId)}
                  disabled={loading}
                >
                  <IoSaveOutline  />
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ) : (
          /* ===========================
               MODE VIEW (ReactQuill)
          ============================ */
            <div
              onClick={handleStartEdit}
              className="view-mode-wrapper"
              style={{ cursor: "pointer" }}
            >
              {card.description && card.description.trim() !== "" ? (
                <>
                  <div
                    className="view-mode-html ql-editor"
                    dangerouslySetInnerHTML={{ __html: card.description }}
                  />


                  {/* {card.description.length > maxChars && (
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
                  )} */}
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
