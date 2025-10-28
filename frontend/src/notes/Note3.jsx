// 📂 List.jsx
import React, { useState } from "react";
import { closestCorners } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { reorderCards } from "../services/ApiServices";
import Card from "./Card";

const List = ({ listId, cardsInList, fetchCardList }) => {
  const [cards, setCards] = useState(cardsInList);
  const [activeCard, setActiveCard] = useState(null);

  // 🔹 Saat drag dimulai
  const handleDragStart = (event) => {
    const { active } = event;
    setActiveCard(active.id);
  };

  // 🔹 Saat drag selesai
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    const activeListId = active.data.current?.listId;
    const overListId = over.data.current?.listId;

    // Dalam list yang sama
    if (activeListId === overListId) {
      const oldIndex = cards.findIndex((c) => c.id === active.id);
      const newIndex = cards.findIndex((c) => c.id === over.id);
      const newCards = arrayMove(cards, oldIndex, newIndex);
      setCards(newCards);

      try {
        await reorderCards({
          sourceListId: listId,
          destinationListId: listId,
          cardId: active.id,
          newPosition: newIndex,
        });
      } catch (err) {
        console.error("Error reorder cards:", err);
      }
    } else {
      // Antar list
      try {
        await reorderCards({
          sourceListId: activeListId,
          destinationListId: overListId,
          cardId: active.id,
        });
        fetchCardList();
      } catch (err) {
        console.error("Error moving cards:", err);
      }
    }

    setActiveCard(null);
  };

  return (
    <div className="list-container">
      {cards.map((card) => (
        <Card
          key={card.id}
          card={card}
          listId={listId}
          cardsInList={cards}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          activeCard={activeCard}
          setCards={setCards}
        />
      ))}
    </div>
  );
};

export default List;


import React from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableCardItem from "../hooks/SortableCardItem"; // path sesuai strukturmu
import Card from "./Card";

const CardContainer = ({ cards, onDragEnd }) => {
  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
        {cards.map((card) => (
          <SortableCardItem key={card.id} id={card.id}>
            <Card data={card} />
          </SortableCardItem>
        ))}
      </SortableContext>
    </DndContext>
  );
};

export default CardContainer;
