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

// LIST 
// Soft delete list
app.delete('/api/lists/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // tandai list sebagai terhapus
    const result = await client.query(
      "UPDATE lists SET is_deleted = true WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "List not found" });
    }

    // log aktivitas penghapusan
    await logActivity(
      'list',
      id,
      'soft_delete',
      userId,
      `List with id '${id}' marked as deleted`,
      'board',
      id
    );

    res.json({ message: "List moved to recycle bin successfully", data: result.rows[0] });
  } catch (error) {
    console.error("Soft delete list error:", error);
    res.status(500).json({ error: error.message });
  }
});

//1. get all board by workspace id
app.get('/api/workspaces/:workspaceId/boards', async (req, res) => {
  const { workspaceId } = req.params;
  try {
    const result = await client.query(
      'SELECT * FROM boards WHERE workspace_id = $1 AND is_deleted = FALSE ORDER BY position ASC',
      [workspaceId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Restore deleted list
app.patch('/api/lists/:id/restore', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await client.query(
      "UPDATE lists SET is_deleted = false WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "List not found or already active" });
    }

    await logActivity(
      'list',
      id,
      'restore',
      userId,
      `List with id '${id}' restored`,
      'board',
      id
    );

    res.json({ message: "List restored successfully", data: result.rows[0] });
  } catch (error) {
    console.error("Restore list error:", error);
    res.status(500).json({ error: error.message });
  }
});

// END LIST 

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


// DATA MAREKING MUSIK 
// Soft delete data marketing
app.delete("/api/marketing/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await client.query(
      "UPDATE data_marketing SET is_deleted = true WHERE marketing_id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    res.json({ message: "Data berhasil dipindahkan ke Recycle Bin", data: result.rows[0] });
  } catch (err) {
    console.error("Soft delete error:", err.message);
    res.status(500).send("Server error");
  }
});


// Restore data marketing
app.patch("/api/marketing/:id/restore", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await client.query(
      "UPDATE data_marketing SET is_deleted = false WHERE marketing_id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan atau sudah aktif" });
    }

    res.json({ message: "Data berhasil direstore", data: result.rows[0] });
  } catch (err) {
    console.error("Restore error:", err.message);
    res.status(500).send("Server error");
  }
});

// END DATA MARKETING MUSIK 

// WHERE s.status_name = 'Not Accepted' AND dm.is_deleted = false


import dayjs from "dayjs";

// Tambah data marketing_design baru (lengkap dengan order_type + project_number)
app.post("/api/marketing-design/joined", async (req, res) => {
  const {
    buyer_name,
    code_order,
    order_number,
    jumlah_design,
    deadline,
    jumlah_revisi,
    price_normal,
    price_discount,
    discount_percentage,
    required_files,
    file_and_chat,
    detail_project,
    input_by,
    acc_by,
    account,
    offer_type,
    order_type_id,
    resolution,
    reference,
    project_type_id,
    style_id,
    status_project_id
  } = req.body;

  try {
    // 🧠 Ambil bulan sekarang
    const createAt = new Date();
    const monthStart = dayjs(createAt).startOf("month").toDate();
    const monthEnd = dayjs(createAt).endOf("month").toDate();
    const monthName = dayjs(createAt).format("MMMM");

    // 🧾 Ambil project_number terakhir di bulan ini
    const lastProjectQuery = await client.query(
      `
            SELECT project_number 
            FROM marketing_design
            WHERE create_at BETWEEN $1 AND $2
            ORDER BY marketing_design_id DESC
            LIMIT 1;
            `,
      [monthStart, monthEnd]
    );

    let nextNumber;

    if (lastProjectQuery.rows.length > 0) {
      // 🔢 Ambil angka terakhir dari format "P035 Oktober"
      const lastNumberPart = lastProjectQuery.rows[0].project_number.match(/P(\d+)/);
      const lastNumber = lastNumberPart ? parseInt(lastNumberPart[1]) : 0;
      nextNumber = lastNumber + 1;
    } else {
      // 🔄 Kalau belum ada di bulan ini, mulai dari 1
      nextNumber = 1;
    }

    // 🧮 Buat format project number baru
    const projectNumber = `P${String(nextNumber).padStart(3, "0")} ${monthName}`;

    // 💾 Simpan ke DB
    const result = await client.query(
      `
            INSERT INTO marketing_design (
                buyer_name,
                code_order,
                order_number,
                jumlah_design,
                deadline,
                jumlah_revisi,
                price_normal,
                price_discount,
                discount_percentage,
                required_files,
                file_and_chat,
                detail_project,
                input_by,
                acc_by,
                account,
                offer_type,
                order_type_id,
                resolution,
                reference,
                project_type_id,
                style_id,
                status_project_id,
                project_number,
                create_at
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22, NOW())
            RETURNING *;
            `,
      [
        buyer_name,
        code_order,
        order_number,
        jumlah_design,
        deadline,
        jumlah_revisi,
        price_normal,
        price_discount,
        discount_percentage,
        required_files,
        file_and_chat,
        detail_project,
        input_by,
        acc_by,
        account,
        offer_type,
        order_type_id,
        resolution,
        reference,
        project_type_id,
        style_id,
        status_project_id,
        projectNumber
      ]
    );

    // Ambil data dengan join biar langsung lengkap tampilannya
    const joined = await client.query(
      `
            SELECT 
                md.marketing_design_id,
                md.buyer_name,
                md.code_order,
                md.order_number,
                md.jumlah_design,
                md.deadline,
                md.jumlah_revisi,
                md.price_normal,
                md.price_discount,
                md.discount_percentage,
                md.required_files,
                md.file_and_chat,
                md.detail_project,
                md.resolution,
                md.reference,
                md.project_number,

                mdu.id AS input_by,
                mdu.nama_marketing AS input_by_name,
                mdu.divisi AS input_by_divisi,

                kdd.id AS acc_by,
                kdd.nama AS acc_by_name,

                ad.id AS account,
                ad.nama_account AS account_name,

                ot.id AS offer_type,
                ot.offer_name AS offer_type_name,

                pt.id AS project_type,
                pt.project_name AS project_type_name,

                sd.id AS style,
                sd.style_name AS style_name,

                sp.id AS status_project,
                sp.status_name AS status_project_name,

                dot.id AS order_type_id,
                dot.order_name AS order_type_name
            FROM marketing_design md
            LEFT JOIN marketing_desain_user mdu ON md.input_by = mdu.id
            LEFT JOIN kepala_divisi_design kdd ON md.acc_by = kdd.id
            LEFT JOIN account_design ad ON md.account = ad.id
            LEFT JOIN offer_type_design ot ON md.offer_type = ot.id
            LEFT JOIN project_type_design pt ON md.project_type_id = pt.id
            LEFT JOIN style_design sd ON md.style_id = sd.id
            LEFT JOIN status_project_design sp ON md.status_project_id = sp.id
            LEFT JOIN design_order_type dot ON md.order_type_id = dot.id
            WHERE md.marketing_design_id = $1
            `,
      [result.rows[0].marketing_design_id]
    );

    res.status(201).json({
      message: "✅ Marketing design created successfully",
      data: joined.rows[0],
    });
  } catch (err) {
    console.error("❌ Error creating marketing_design:", err);
    res.status(500).json({ error: "Failed to create marketing_design" });
  }
});

//coba simpan ya apakah ilang 