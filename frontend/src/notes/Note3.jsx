{/* <div
    className="desc-viewer"
    onClick={(e) => handleEditDescription(e, cardId, cards.description)}
    style={{ cursor: "pointer" }}
>
    <ReactQuill
        value={showMore
            ? cards.description
            : cards.description.substring(0, maxChars)
        }
        readOnly={true}
        theme="bubble"
        modules={{ toolbar: false }}
    />

    {cards.description.length > maxChars && (
        <span
            onClick={(e) => {
                e.stopPropagation();
                setShowMore((prev) => !prev);
            }}
            style={{
                color: "#5557e7",
                fontWeight: "500",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                marginTop: "8px",
                gap: "5px",
            }}
        >
            {showMore ? "Show Less" : "Show More"}
            {showMore ? <HiChevronUp /> : <HiChevronDown />}
        </span>
    )}
</div>
 */}

<div
    className="desc-viewer"
    onClick={(e) => {
        // Kalau klik <a>, jangan masuk edit mode
        if (e.target.tagName === "A") {
            e.stopPropagation();
            return;
        }

        handleEditDescription(e, cardId, cards.description);
    }}
    style={{ cursor: "pointer" }}
>
    <ReactQuill
        value={showMore
            ? cards.description
            : cards.description.substring(0, maxChars)
        }
        readOnly={true}
        theme="bubble"
        modules={{ toolbar: false }}
    />

    {cards.description.length > maxChars && (
        <span
            onClick={(e) => {
                e.stopPropagation();
                setShowMore((prev) => !prev);
            }}
            style={{
                color: "#5557e7",
                fontWeight: "500",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                marginTop: "8px",
                gap: "5px",
            }}
        >
            {showMore ? "Show Less" : "Show More"}
            {showMore ? <HiChevronUp /> : <HiChevronDown />}
        </span>
    )}
</div>
