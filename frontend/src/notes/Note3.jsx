//1.  get all card in list
app.get('/api/lists/:listId/cards', async (req, res) => {
    const { listId } = req.params;

    try {
        const result = await client.query(
            `SELECT * FROM cards WHERE list_id = $1 ORDER BY position ASC`,
            [listId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//2. update posisi satu card saja
app.patch('/api/cards/:cardId/position', async (req, res) => {
    const { cardId } = req.params;
    const { newPosition, listId } = req.body;

    try {
        await client.query(
            `UPDATE cards 
       SET position = $1, updated_at = NOW() 
       WHERE id = $2 AND list_id = $3`,
            [newPosition, cardId, listId]
        );

        res.json({ success: true, cardId, newPosition });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//3. reorder untuk drag and drop
app.put('/api/lists/:listId/cards/reorder', async (req, res) => {
    const { listId } = req.params;
    const { cards } = req.body;

    try {
        await client.query('BEGIN');

        for (const card of cards) {
            await client.query(
                `UPDATE cards 
         SET position = $1, updated_at = NOW() 
         WHERE id = $2 AND list_id = $3`,
                [card.position, card.id, listId]
            );
        }

        await client.query('COMMIT');
        res.json({ success: true, updated: cards.length });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    }
});

//4. patch satu card untuk semua card dalam list
app.patch('/api/cards/:cardId/new-position', async (req, res) => {
    const { cardId } = req.params;
    const { newPosition, listId } = req.body;

    try {
        await client.query('BEGIN');

        // Ambil posisi lama
        const { rows } = await client.query(
            `SELECT position FROM cards WHERE id = $1 AND list_id = $2`,
            [cardId, listId]
        );
        if (rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Card not found' });
        }
        const oldPosition = rows[0].position;

        if (newPosition > oldPosition) {
            // geser semua card di antara old+1 .. new ke atas (pos -1)
            await client.query(
                `UPDATE cards
         SET position = position - 1
         WHERE list_id = $1 AND position > $2 AND position <= $3`,
                [listId, oldPosition, newPosition]
            );
        } else if (newPosition < oldPosition) {
            // geser semua card di antara new .. old-1 ke bawah (pos +1)
            await client.query(
                `UPDATE cards
         SET position = position + 1
         WHERE list_id = $1 AND position >= $2 AND position < $3`,
                [listId, newPosition, oldPosition]
            );
        }


        // Update card yang dipindah
        await client.query(
            `UPDATE cards
       SET position = $1, update_at = NOW()
       WHERE id = $2 AND list_id = $3`,
            [newPosition, cardId, listId]
        );

        await client.query('COMMIT');
        res.json({ success: true, cardId, newPosition });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    }
});



{cardPositionDropdown === card.id && (
                            <div className="position-modals">
                                <p>Card Position: {card.position}</p>
                                <div className="select-position">
                                    <p>Select Position :</p>
                                    <ul>
                                        {(cardsInList || []).map((_, i) => (
                                        <li
                                            key={i}
                                            onClick={(e) => {
                                            e.stopPropagation();
                                            handleChangeCardPosition(card.id, i);
                                            }}
                                        >
                                            {i}
                                        </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

// fungsi handle utama untuk export design
const handleExportDesign = async (designData) => {
  try {
    // 1. Export ke Google Sheets
    await exportDesignToSheets(designData);

    // 2. Insert ke DB
    await addExportMarketingDesign(designData.marketing_design_id);

    // 3. Update state biar button disable
    setDesignTransfile((prev) => [
      ...prev,
      { marketing_design_id: designData.marketing_design_id }
    ]);

    showSnackbar(`✅ Data "${designData.buyer_name}" berhasil dikirim ke Google Sheets`, "success");
  } catch (error) {
    console.error("❌ Gagal kirim data ke sheets:", error);
    showSnackbar(`❌ Gagal kirim data "${designData.buyer_name}"`, "error");
  }
};
