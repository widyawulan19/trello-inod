import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy, // ✅ pakai horizontal strategy
} from "@dnd-kit/sortable";
import {
  getBoardsTesting,
  getListsByBoardTesting,
  reorderListsTesting,
} from "../services/ApiServices";
import SortListItem from "../example/SortListItem";

export default function Develop() {
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [lists, setLists] = useState([]);

  const sensors = useSensors(useSensor(PointerSensor));

  // 🔹 Ambil semua board
  useEffect(() => {
    getBoardsTesting()
      .then((res) => setBoards(res.data))
      .catch((err) => console.error(err));
  }, []);

  // 🔹 Ambil list milik board yang dipilih
  useEffect(() => {
    if (selectedBoard) {
      getListsByBoardTesting(selectedBoard)
        .then((res) => setLists(res.data))
        .catch((err) => console.error(err));
    }
  }, [selectedBoard]);

  // 🔹 Fungsi saat drag selesai
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = lists.findIndex((l) => l.id === active.id);
    const newIndex = lists.findIndex((l) => l.id === over.id);
    const newOrder = arrayMove(lists, oldIndex, newIndex);

    // update state di frontend
    setLists(newOrder);

    // kirim urutan baru ke backend
    const updatedLists = newOrder.map((item, index) => ({
      id: item.id,
      position: index + 1,
    }));

    try {
      await reorderListsTesting(updatedLists);
    } catch (err) {
      console.error("Failed to reorder:", err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold text-blue-600">
        🧩 Testing Board - Drag & Drop
      </h1>

      {/* 🔘 Pilih Board */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">Select Board:</label>
        <select
          className="p-2 border rounded-md"
          onChange={(e) => setSelectedBoard(e.target.value)}
          value={selectedBoard || ""}
        >
          <option value="" disabled>
            -- Choose a Board --
          </option>
          {boards.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* 🧱 List Area */}
      {selectedBoard && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={lists.map((list) => list.id)}
            strategy={horizontalListSortingStrategy} // ✅ ubah ke horizontal
          >
            <div className="flex gap-4 pb-4 overflow-x-auto" style={{border:'1px solid red'}}>
              {lists.map((list) => (
                <SortListItem key={list.id} id={list.id} name={list.name} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
