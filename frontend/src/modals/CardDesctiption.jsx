import React, { useState, useRef } from "react";
import ReactQuill from "react-quill-new";   // ✅ react-quill-new
import "react-quill-new/dist/quill.snow.css";
import { updateDescCard } from "../services/ApiServices";
import "../style/modals/CardDescription.css";

const CardDescription = ({ card, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [desc, setDesc] = useState(card.description || "");
  const [loading, setLoading] = useState(false);
  const quillRef = useRef(null);

//   const handleSave = async () => {
//     if (!desc || desc.trim() === "") return; // biar gak kirim kosong
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
const handleSave = async () => {
  try {
    setLoading(true);
    const res = await updateDescCard(card.id, desc);
    setDesc(res.data.description); // ✅ sync ke data backend
    // props.onUpdate(res.data.description);
    setIsEditing(false);
  } catch (err) {
    console.error("❌ Gagal update desc:", err);
  } finally {
    setLoading(false);
  }
};

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "code-block"],
      [{ align: [] }],
      ["link"],
      ["clean"],
    ],
    keyboard: {
      bindings: {
        tab: {
          key: 9,
          handler: function () {
            this.quill.insertText(this.quill.getSelection().index, "    ");
            return false;
          },
        },
      },
    },
  };

  return (
    <div className="card-desc">
      {isEditing ? (
        <div>
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={desc}
            onChange={setDesc}
            onBlur={handleSave} // ✅ auto-save saat blur
            modules={modules}
            className="toolbar-box"
          />

          <div className="mt-2 flex gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div
          className="desc-body"
          onClick={() => setIsEditing(true)}
          dangerouslySetInnerHTML={{
            __html:
              desc ||
              "<span class='text-gray-400'>Click to add description...</span>",
          }}
        />
      )}
    </div>
  );
};

export default CardDescription;
