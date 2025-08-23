<<<<<<< HEAD
//RESTORE DATA ARCHIVE
app.post('/api/restore/:entity/:id', async (req, res) => {
  const { entity, id } = req.params;

  const entityMap = {
    data_marketing: { table: 'data_marketing' },
    workspace: { table: 'workspaces' },
    cards: { table: 'cards' },
    board: { table: 'boards' },
    // tambah sesuai entity kamu
  };

  const config = entityMap[entity];
  if (!config) return res.status(400).json({ error: 'Entity tidak dikenali' });

  try {
    // 1. Ambil data dari archive_universal
    const archiveResult = await client.query(
      `SELECT data FROM archive_universal WHERE entity_type = $1 AND entity_id = $2`,
      [entity, id]
    );

    if (archiveResult.rows.length === 0) {
      return res.status(404).json({ error: `Data ${entity} dengan id ${id} tidak ditemukan di archive` });
    }

    const data = archiveResult.rows[0].data;
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

    // 2. Insert kembali ke tabel aslinya
    const insertQuery = `
      INSERT INTO ${config.table} (${keys.join(', ')})
      VALUES (${placeholders})
    `;
    await client.query(insertQuery, values);

    // 3. Hapus dari archive_universal
    await client.query(
      `DELETE FROM archive_universal WHERE entity_type = $1 AND entity_id = $2`,
      [entity, id]
    );

    res.status(200).json({ message: `Data ${entity} berhasil direstore.` });
  } catch (err) {
    console.error('Restore error:', err);
    res.status(500).json({ error: err.message });
  }
});

//GET ALL DATA ARCHIVE
app.get('/api/archive', async (req, res) => {
  try {
    const result = await client.query(`SELECT * FROM archive_universal ORDER BY archived_at DESC`);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching archive:', error);
    res.status(500).json({ error: error.message });
  }
});


//DELETE DATA ARCHIVE
app.delete('/api/archive/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query(`DELETE FROM archive_universal WHERE id = $1`, [id]);
    if (result.rowCount > 0) {
      res.status(200).json({ message: `Archive with id ${id} deleted` });
    } else {
      res.status(404).json({ error: `Archive with id ${id} not found` });
    }
  } catch (error) {
    console.error('Error deleting archive:', error);
    res.status(500).json({ error: error.message });
  }
});
=======
<div className="mcb-dropdown">
  <button 
    className="mcb-btn"
    onClick={(e) => {
      e.stopPropagation();
      setShowBoardDropdown(!showBoardDropdown);
    }}
  >
    {selectedBoardId
      ? boards.find((b) => b.id === selectedBoardId)?.name
      : 'Select a board'}
    <HiOutlineChevronDown />
  </button>

  {showBoardDropdown && (
    <div className="mcb-menu-wrapper">
      {/* Input Search */}
      <input
        type="text"
        placeholder="Search boards..."
        value={searchBoard}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => setSearchBoard(e.target.value)}
        className="mcb-search-input"
      />

      <ul className="mcb-menu">
        {boards
          .filter((board) =>
            board.name.toLowerCase().includes(searchBoard.toLowerCase())
          )
          .map((board) => (
            <li
              key={board.id}
              className="mcb-item"
              onClick={() => {
                setSelectedBoardId(board.id);
                setSelectedList(null); // Reset list
                setShowBoardDropdown(false); // ✅ dropdown auto tertutup
              }}
            >
              {board.name}
            </li>
          ))}
      </ul>
    </div>
  )}
</div>
>>>>>>> feature
