import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableCardItem = ({ card, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: card.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Clone Card dan kirim props drag-n-drop ke dalamnya
  const childWithProps = React.cloneElement(children, {
    attributes,
    listeners,
    setNodeRef,
  });

  return <div style={style}>{childWithProps}</div>;
};

export default SortableCardItem;
