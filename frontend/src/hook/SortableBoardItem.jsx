import React, { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";

function SortableBoardItem({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition,
    zIndex: isDragging ? 999 : "auto",
    position: "relative",
  };

  // children bisa function agar kita bisa kasih dragHandleProps hanya ke element tertentu
  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      animate={{
        scale: isDragging ? 1.07 : 1,
        rotate: isDragging ? 1 : 0,
        backgroundColor: isDragging ? "#e8f6ff" : "#fff",
        boxShadow: isDragging
          ? "0 8px 25px rgba(0,0,0,0.15)"
          : "0 2px 8px rgba(0,0,0,0.05)",
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
      }}
      className="sortable-board-item"
    >
      {typeof children === "function"
        ? children({ dragHandleProps: { ...attributes, ...listeners }, isDragging })
        : children}
    </motion.div>
  );
}

export default memo(SortableBoardItem);


// import React, { memo } from "react";
// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import { motion } from "framer-motion";

// function SortableBoardItem({ id, children }) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
//     useSortable({ id });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition: isDragging ? "none" : transition,
//     zIndex: isDragging ? 999 : "auto",
//     cursor: isDragging ? "grabbing" : "grab",
//     touchAction: "none",
//     position: "relative",
//   };

//   return (
//     <motion.div
//       ref={setNodeRef}
//       style={style}
//       {...attributes}
//       {...listeners}
//       animate={{
//         scale: isDragging ? 1.07 : 1,
//         rotate: isDragging ? 1 : 0,
//         backgroundColor: isDragging ? "#e8f6ff" : "#fff",
//         boxShadow: isDragging
//           ? "0 8px 25px rgba(0,0,0,0.15)"
//           : "0 2px 8px rgba(0,0,0,0.05)",
//       }}
//       transition={{
//         type: "spring",
//         stiffness: 400,
//         damping: 30,
//       }}
//       className="sortable-board-item"
//     >
//       {children}
//     </motion.div>
//   );
// }

// export default memo(SortableBoardItem);
