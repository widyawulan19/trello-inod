// src/hooks/SortableCardItem.jsx
import React, { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";

function SortableCardItem({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition,
    zIndex: isDragging ? 999 : "auto",
    position: "relative",
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      animate={{
        scale: isDragging ? 1.02 : 1,
        rotate: isDragging ? 0.5 : 0,
        boxShadow: isDragging
          ? "0 8px 18px rgba(0,0,0,0.15)"
          : "0 2px 8px rgba(0,0,0,0.05)",
      }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="sortable-card-item"
    >
      {/* kirim dragHandleProps ke anak */}
      {children({ dragHandleProps: { ...attributes, ...listeners } })}
    </motion.div>
  );
}

export default memo(SortableCardItem);
