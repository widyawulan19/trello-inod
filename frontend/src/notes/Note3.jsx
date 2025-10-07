import React, { useEffect, useState } from "react";
import axios from "axios";
import { reorderListPosition } from "../api/listApi";

const BoardView = ({ boardId }) => {
  const [lists, setLists] = useState([]);
  const [positions, setPositions] = useState({}); // simpan posisi baru per list

  // 🔹 Ambil semua list berdasarkan board
  useEffect(() => {
    const fetchLists = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/lists?board_id=${boardId}`);
        setLists(res.data);
      } catch (err) {
        console.error("Error fetching lists:", err);
      }
    };
    fetchLists();
  }, [boardId]);

  // 🔹 Fungsi untuk ubah posisi
  const handlePositionChange = (listId, value) => {
    setPositions((prev) => ({
      ...prev,
      [listId]: value,
    }));
  };

  // 🔹 Simpan perubahan posisi
  const handleUpdatePosition = async (listId) => {
    const newPosition = parseInt(positions[listId]);
    if (isNaN(newPosition)) {
      alert("Masukkan angka posisi yang valid!");
      return;
    }

    try {
      await reorderListPosition(listId, newPosition, boardId);
      alert("List position updated successfully!");

      // ambil ulang urutan list
      const res = await axios.get(`http://localhost:5000/api/lists?board_id=${boardId}`);
      setLists(res.data);
    } catch (err) {
      console.error("Failed to update list position:", err);
      alert("Gagal memperbarui posisi list.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="font-bold text-xl mb-4">Board Lists</h2>
      <div className="grid grid-cols-3 gap-4">
        {lists.map((list) => (
          <div key={list.id} className="bg-white shadow-md rounded-xl p-4">
            <h3 className="font-semibold text-lg mb-2">{list.title}</h3>
            <p className="text-sm text-gray-600 mb-2">
              Current Position: <b>{list.position}</b>
            </p>

            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="New position"
                className="border rounded px-2 py-1 w-24"
                value={positions[list.id] || ""}
                onChange={(e) => handlePositionChange(list.id, e.target.value)}
              />
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg"
                onClick={() => handleUpdatePosition(list.id)}
              >
                Update
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BoardView;
