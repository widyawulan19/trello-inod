import React, { useState, useEffect } from "react";
import { getCardsByList, updateCardPosition } from "../services/ApiServices";

const CardList = () => {
  const [cards, setCards] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null); // simpan card id yang dropdownnya terbuka
  const listId = 346;
  useEffect(() => {
    fetchCards();
  }, [listId]);

  const fetchCards = async () => {
    try {
      const res = await getCardsByList(listId);
      setCards(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangePosition = async (cardId, newPosition) => {
    try {
      await updateCardPosition(cardId, newPosition, listId);
      setOpenDropdown(null); // tutup dropdown
      fetchCards(); // refresh daftar card
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h3>Manage Card Positions</h3>
      {cards.map((card, index) => (
        <div key={card.id} style={{ marginBottom: "15px", position: "relative" }}>
          <strong>{card.title}</strong>
          <button
            style={{ marginLeft: "10px" }}
            onClick={() => setOpenDropdown(openDropdown === card.id ? null : card.id)}
          >
            Posisi: {card.position}
          </button>

          {openDropdown === card.id && (
            <ul
              style={{
                listStyle: "none",
                padding: "5px",
                margin: "5px 0 0 0",
                border: "1px solid #ccc",
                borderRadius: "4px",
                position: "absolute",
                background: "#fff",
                zIndex: 10,
              }}
            >
              {cards.map((_, i) => (
                <li
                  key={i}
                  style={{
                    padding: "5px 10px",
                    cursor: "pointer",
                    background: i === card.position ? "#eee" : "#fff",
                  }}
                  onClick={() => handleChangePosition(card.id, i)}
                >
                  {i}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

export default CardList;
