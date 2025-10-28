// src/hooks/SortableCardItem.jsx
import React, { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";

function SortableCardItem({ id, listId, children}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id,
      data: {
        type: "card",
         listId: Number(listId),
      },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition,
    zIndex: isDragging ? 999 : "auto",
    position: "relative",
    cursor: isDragging ? "grabbing" : "grab",
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      animate={{
        scale: isDragging ? 1.03 : 1,
        rotate: isDragging ? 1 : 0,
        boxShadow: isDragging
          ? "0 8px 20px rgba(0,0,0,0.15)"
          : "0 2px 8px rgba(0,0,0,0.05)",
      }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="sortable-card-item"
    >
      {typeof children === "function"
        ? children({ dragHandleCardProps: { ...attributes, ...listeners } })
        : children}
    </motion.div>
  );
}

export default memo(SortableCardItem);
