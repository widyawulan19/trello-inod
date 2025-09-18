import { useState, useEffect } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { updateDescCard } from "../services/ApiServices";
import { HiXMark } from "react-icons/hi2";

const CardDescriptionExample=({ card , onClose})=> {
  const [description, setDescription] = useState(card.description || "");
  const [isSaving, setIsSaving] = useState(false);

  // kalau card berubah (misal fetch baru), sync state
  useEffect(() => {
    setDescription(card.description || "");
  }, [card]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateDescCard(card.id, description);
      alert("Deskripsi berhasil diperbarui!");
    } catch (error) {
      console.error("Gagal update deskripsi:", error);
      alert("Gagal menyimpan deskripsi");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Deskripsi</h3>
      {/* <HiXMark onClick={onClose}/> */}

      {/* ReactQuill editor */}
      <ReactQuill
        theme="snow"
        value={description}
        onChange={setDescription}
        modules={{
          toolbar: [
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["blockquote", "code-block"],
            ["link"],
            ["clean"],
          ],
        }}
        className="bg-white rounded-md"
      />

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="px-4 py-2 text-white bg-blue-600 rounded-md disabled:opacity-50"
      >
        {isSaving ? "Menyimpan..." : "Simpan"}
      </button>
    </div>
  );
}

export default CardDescriptionExample