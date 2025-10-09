// 4. soft delete card (bisa direstore lagi)
app.delete('/api/cards/:cardId', async (req, res) => {
  const { cardId } = req.params;
  const userId = req.user.id;

  try {
    const { rows } = await client.query(
      "SELECT list_id, position FROM cards WHERE id = $1 AND is_deleted = FALSE",
      [cardId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Card not found or already deleted" });
    }

    const { list_id, position } = rows[0];

    // 1️⃣ Update card jadi 'deleted'
    await client.query(
      "UPDATE cards SET is_deleted = TRUE WHERE id = $1",
      [cardId]
    );

    // 2️⃣ Update posisi card lain dalam list
    await client.query(
      `UPDATE cards
             SET position = position - 1
             WHERE list_id = $1 AND position > $2 AND is_deleted = FALSE`,
      [list_id, position]
    );

    // 3️⃣ Log activity
    await logActivity(
      'card',
      cardId,
      'soft_delete',
      userId,
      `Card with id ${cardId} moved to recycle bin`,
      'list',
      cardId
    );

    res.json({ message: "Card moved to recycle bin (soft deleted)" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// 5. restore soft-deleted card
app.patch('/api/cards/:cardId/restore', async (req, res) => {
  const { cardId } = req.params;
  const userId = req.user.id;

  try {
    // Ambil list_id card yang mau direstore
    const { rows } = await client.query(
      "SELECT list_id FROM cards WHERE id = $1 AND is_deleted = TRUE",
      [cardId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Card not found or not deleted" });
    }

    const { list_id } = rows[0];

    // Dapatkan posisi terakhir di list untuk card aktif
    const { rows: activeCards } = await client.query(
      "SELECT COUNT(*) AS count FROM cards WHERE list_id = $1 AND is_deleted = FALSE",
      [list_id]
    );
    const newPosition = parseInt(activeCards[0].count) + 1;

    // Restore card
    await client.query(
      "UPDATE cards SET is_deleted = FALSE, position = $1 WHERE id = $2",
      [newPosition, cardId]
    );

    // Log activity
    await logActivity(
      'card',
      cardId,
      'restore',
      userId,
      `Card with id ${cardId} restored from recycle bin`,
      'list',
      cardId
    );

    res.json({ message: "Card restored successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/cards/deleted', async (req, res) => {
  try {
    const { rows } = await client.query(
      "SELECT * FROM cards WHERE is_deleted = TRUE ORDER BY updated_at DESC"
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ✅ Get cards by listId (tanpa card yang dihapus)
app.get('/api/cards/list/:listId', async (req, res) => {
  const { listId } = req.params;
  try {
    const result = await client.query(
      "SELECT * FROM cards WHERE list_id = $1 AND is_deleted = FALSE ORDER BY position",
      [listId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🗑️ Get all cards including deleted (opsional)
app.get('/api/cards/list/:listId/all', async (req, res) => {
  const { listId } = req.params;
  try {
    const result = await client.query(
      "SELECT * FROM cards WHERE list_id = $1 ORDER BY position",
      [listId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// 4. Soft delete workspace user
app.delete('/api/workspace-user/:workspaceId/user/:userId', async (req, res) => {
  const { workspaceId, userId } = req.params;
  try {
    // Pastikan user ada dan belum dihapus
    const { rows } = await client.query(
      `SELECT * FROM workspaces_users WHERE workspace_id = $1 AND user_id = $2 AND is_deleted = FALSE`,
      [workspaceId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found or already removed from this workspace' });
    }

    // Soft delete user
    const result = await client.query(
      `UPDATE workspaces_users
             SET is_deleted = TRUE, deleted_at = NOW()
             WHERE workspace_id = $1 AND user_id = $2
             RETURNING *`,
      [workspaceId, userId]
    );

    // Log activity untuk soft delete
    await logActivity(
      'workspace user',
      workspaceId,
      'soft_delete',
      userId,
      `Workspace user soft deleted`,
      null,
      null
    );

    res.status(200).json({
      message: 'User soft deleted (removed logically) from workspace',
      deletedUser: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




//WORKSAPCE 
//4. delete workspace user -> works
app.delete('/api/workspace-user/:workspaceId/user/:userId', async (req, res) => {
  const { workspaceId, userId } = req.params;
  try {
    // Pastikan user ada dan belum dihapus
    const { rows } = await client.query(
      `SELECT * FROM workspaces_users WHERE workspace_id = $1 AND user_id = $2 AND is_deleted = FALSE`,
      [workspaceId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found or already removed from this workspace' });
    }

    // Soft delete user
    const result = await client.query(
      `UPDATE workspaces_users
             SET is_deleted = TRUE, deleted_at = NOW()
             WHERE workspace_id = $1 AND user_id = $2
             RETURNING *`,
      [workspaceId, userId]
    );

    // Log activity untuk soft delete
    await logActivity(
      'workspace user',
      workspaceId,
      'soft_delete',
      userId,
      `Workspace user soft deleted`,
      null,
      null
    );

    res.status(200).json({
      message: 'User soft deleted (removed logically) from workspace',
      deletedUser: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Restore soft deleted workspace user
app.patch('/api/workspace-user/:workspaceId/user/:userId/restore', async (req, res) => {
  const { workspaceId, userId } = req.params;
  try {
    // Pastikan user ada dan sudah dihapus (soft delete)
    const { rows } = await client.query(
      `SELECT * FROM workspaces_users 
             WHERE workspace_id = $1 AND user_id = $2 AND is_deleted = TRUE`,
      [workspaceId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No deleted user found for this workspace' });
    }

    // Restore data
    const result = await client.query(
      `UPDATE workspaces_users
             SET is_deleted = FALSE, deleted_at = NULL
             WHERE workspace_id = $1 AND user_id = $2
             RETURNING *`,
      [workspaceId, userId]
    );

    // Log activity
    await logActivity(
      'workspace user',
      workspaceId,
      'restore',
      userId,
      `Workspace user restored`,
      null,
      null
    );

    res.status(200).json({
      message: 'User restored successfully to workspace',
      restoredUser: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// END WORKSPACE 


// BOARDS 
// 5. Soft delete a board
app.delete('/api/boards/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    await client.query('BEGIN');

    // Ambil workspace_id & posisi board sebelum dihapus
    const { rows } = await client.query(
      `SELECT workspace_id, position FROM boards 
             WHERE id = $1 AND is_deleted = FALSE`,
      [id]
    );

    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Board not found or already deleted' });
    }

    const { workspace_id } = rows[0];

    // Soft delete board (tidak dihapus permanen)
    await client.query(
      `UPDATE boards 
             SET is_deleted = TRUE, deleted_at = NOW() 
             WHERE id = $1`,
      [id]
    );

    // Reorder posisi board yang tersisa di workspace
    await client.query(
      `WITH reordered AS (
                SELECT id, ROW_NUMBER() OVER (ORDER BY position) AS new_pos
                FROM boards 
                WHERE workspace_id = $1 AND is_deleted = FALSE
            )
            UPDATE boards b
            SET position = r.new_pos
            FROM reordered r
            WHERE b.id = r.id`,
      [workspace_id]
    );

    // Log activity
    await logActivity(
      'board',
      id,
      'soft_delete',
      userId,
      `Board with id ${id} soft deleted`,
      'workspace',
      workspace_id
    );

    await client.query('COMMIT');
    res.json({ message: 'Board soft deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// 6. Restore soft deleted board
app.patch('/api/boards/:id/restore', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    await client.query('BEGIN');

    // Pastikan board memang terhapus (soft delete)
    const { rows } = await client.query(
      `SELECT workspace_id FROM boards WHERE id = $1 AND is_deleted = TRUE`,
      [id]
    );

    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'No soft-deleted board found' });
    }

    const { workspace_id } = rows[0];

    // Hitung posisi terakhir agar board dikembalikan ke urutan akhir
    const { rows: posRows } = await client.query(
      `SELECT COALESCE(MAX(position), 0) + 1 AS new_position 
             FROM boards WHERE workspace_id = $1 AND is_deleted = FALSE`,
      [workspace_id]
    );
    const newPosition = posRows[0].new_position;

    // Restore board
    const result = await client.query(
      `UPDATE boards 
             SET is_deleted = FALSE, deleted_at = NULL, position = $2
             WHERE id = $1 
             RETURNING *`,
      [id, newPosition]
    );

    // Log activity
    await logActivity(
      'board',
      id,
      'restore',
      userId,
      `Board with id ${id} restored`,
      'workspace',
      workspace_id
    );

    await client.query('COMMIT');
    res.json({
      message: 'Board restored successfully',
      restoredBoard: result.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// END BOARDS 

// CARD 
//4. delete card
app.delete('/api/cards/:cardId', async (req, res) => {
  const { cardId } = req.params;
  const userId = req.user.id;

  try {
    const { rows } = await client.query(
      "SELECT list_id, position FROM cards WHERE id = $1 AND is_deleted = FALSE",
      [cardId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Card not found or already deleted" });
    }

    const { list_id, position } = rows[0];

    // 1️⃣ Update card jadi 'deleted'
    await client.query(
      "UPDATE cards SET is_deleted = TRUE WHERE id = $1",
      [cardId]
    );

    // 2️⃣ Update posisi card lain dalam list
    await client.query(
      `UPDATE cards
             SET position = position - 1
             WHERE list_id = $1 AND position > $2 AND is_deleted = FALSE`,
      [list_id, position]
    );

    // 3️⃣ Log activity
    await logActivity(
      'card',
      cardId,
      'soft_delete',
      userId,
      `Card with id ${cardId} moved to recycle bin`,
      'list',
      cardId
    );

    res.json({ message: "Card moved to recycle bin (soft deleted)" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// restore soft-deleted card
app.patch('/api/cards/:cardId/restore', async (req, res) => {
  const { cardId } = req.params;
  const userId = req.user.id;

  try {
    // Ambil list_id card yang mau direstore
    const { rows } = await client.query(
      "SELECT list_id FROM cards WHERE id = $1 AND is_deleted = TRUE",
      [cardId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Card not found or not deleted" });
    }

    const { list_id } = rows[0];

    // Dapatkan posisi terakhir di list untuk card aktif
    const { rows: activeCards } = await client.query(
      "SELECT COUNT(*) AS count FROM cards WHERE list_id = $1 AND is_deleted = FALSE",
      [list_id]
    );
    const newPosition = parseInt(activeCards[0].count) + 1;

    // Restore card
    await client.query(
      "UPDATE cards SET is_deleted = FALSE, position = $1 WHERE id = $2",
      [newPosition, cardId]
    );

    // Log activity
    await logActivity(
      'card',
      cardId,
      'restore',
      userId,
      `Card with id ${cardId} restored from recycle bin`,
      'list',
      cardId
    );

    res.json({ message: "Card restored successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// END CARD 