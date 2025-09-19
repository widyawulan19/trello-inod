import { useState, useEffect } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { updateDescCard } from "../services/ApiServices";
import { HiXMark } from "react-icons/hi2";

const CardDescriptionExample=({ card , onClose})=> {
  const [description, setDescription] = useState(card.description || "");
  const [isSaving, setIsSaving] = useState(false);
  const [editingDescription, setEditingDescription] = useState(null);
  const [newDescription, setNewDescription] = useState('');

  // debug 
  console.log('card deskripsi menerima data card:', card);

  // kalau card berubah (misal fetch baru), sync state
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
            handler: function (range, context) {
            this.quill.insertText(range.index, "    "); // ⬅️ tambahin 4 spasi
            this.quill.setSelection(range.index + 4, 0); // ⬅️ cursor geser setelah spasi
            return false; // cegah pindah fokus
          },
          },
        },
      },
    };

  return(
    <div className='card-description-container'>
      
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