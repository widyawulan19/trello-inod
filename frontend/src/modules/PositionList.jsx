import React, { useState } from "react";
import { GiCardExchange } from "react-icons/gi";
import { updateListPositions } from "../services/ApiServices";


const PositionList = ({ boardId, lists, setLists }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChangeListPosition = async (listId, newIndex) => {
    setLoading(true);

    try {
      // ubah urutan list di frontend dulu
      const currentIndex = lists.findIndex((l) => l.id === listId);
      const updatedLists = [...lists];
      const [movedList] = updatedLists.splice(currentIndex, 1);
      updatedLists.splice(newIndex, 0, movedList);

      // perbarui nilai position-nya
      const reorderedLists = updatedLists.map((l, idx) => ({
        ...l,
        position: idx + 1,
      }));

      // update state lokal agar UI langsung berubah
      setLists(reorderedLists);
      setActiveDropdown(null);

      // panggil API service untuk update ke backend
      await updateListPositions(
        boardId,
        reorderedLists.map((l) => ({ id: l.id, position: l.position }))
      );

      console.log("✅ List positions updated successfully!");
    } catch (error) {
      console.error("❌ Gagal ubah posisi list:", error);
      alert("Gagal memperbarui posisi list.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {lists.map((list) => (
        <div
          key={list.id}
          className="flex items-center justify-between p-3 border bg-gray-50 rounded-xl"
        >
          <span className="font-medium text-gray-700">
            {list.name}{" "}
            <span className="ml-2 text-blue-500">(Posisi: {list.position})</span>
          </span>

          <button
            onClick={() =>
              setActiveDropdown(activeDropdown === list.id ? null : list.id)
            }
            className="relative flex items-center gap-1 px-2 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            <GiCardExchange className="text-gray-700" />
            {loading && activeDropdown === list.id
              ? "Loading..."
              : "Ubah Posisi"}

            {activeDropdown === list.id && (
              <div
                className="absolute right-0 z-50 w-40 mt-2 bg-white border rounded-lg shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-3 py-2 text-sm font-semibold bg-gray-100 border-b">
                  Pilih Posisi
                </div>
                <ul className="overflow-y-auto max-h-40">
                  {lists.map((_, i) => (
                    <li
                      key={i}
                      className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChangeListPosition(list.id, i);
                      }}
                    >
                      {i + 1}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </button>
        </div>
      ))}
    </div>
  );
};

export default PositionList;
