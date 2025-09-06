// ✅ Mulai edit deskripsi baru
const startEditingDescription = (e, cardId, currentDesc) => {
  console.log("startEditingDescription triggered", { cardId, currentDesc });
  if (!cardId) {
    console.warn("Card ID is invalid");
    return;
  }
  e.stopPropagation();
  setEditingDescription(cardId);
  setNewDescription(currentDesc);
};

// ✅ Simpan perubahan deskripsi baru
const saveEditedDescription = async (cardId) => {
  try {
    await updateDescCard(cardId, { description: newDescription });
    setEditingDescription(null);
    fetchCardById(cardId); // refresh data dari API
  } catch (error) {
    console.error("Error updating card description:", error);
  }
};

// ✅ Handle keyboard input saat edit deskripsi baru
const handleDescriptionKeyPress = (e, cardId) => {
  if (e.key === "Enter" && !e.shiftKey) {
    saveEditedDescription(cardId);
    e.stopPropagation();
  }
};


{editingDescription === cardId ? (
  <div className="ta-cont" style={{ border: "1px solid red" }}>
    <textarea
      value={newDescription}
      onChange={(e) => setNewDescription(e.target.value)}
      onBlur={() => saveEditedDescription(cardId)}
      onKeyDown={(e) => handleDescriptionKeyPress(e, cardId)}
      autoFocus
    />
    <small className="text-muted">
      **Tekan Enter untuk simpan || Shift + Enter untuk baris baru
    </small>
  </div>
) : (
  <div
    onClick={(e) => startEditingDescription(e, cardId, cards.description)}
    style={{ whiteSpace: "pre-wrap", cursor: "pointer" }}
    className="div-p"
  >
    {cards.description && cards.description.trim() !== "" ? (
      <>
        {renderDescription(cards.description)}
        {cards.description.length > maxChars && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              toggleShowMore();
            }}
            style={{
              color: "#5557e7",
              fontWeight: "500",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              marginTop: "8px",
              gap: "5px",
            }}
          >
            {showMore ? "Show Less" : "Show More"}
            {showMore ? <HiChevronUp /> : <HiChevronDown />}
          </span>
        )}
      </>
    ) : (
      <div className="placeholder-desc">
        <p>(click to add description)</p>
      </div>
    )}
  </div>
)}
