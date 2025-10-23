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


// Restore soft-deleted marketing design
app.patch('/api/marketing-design/:id/restore', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query(
      'UPDATE marketing_design SET is_deleted = FALSE, deleted_at = NULL WHERE marketing_design_id = $1 AND is_deleted = TRUE RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Data not found or not deleted' });
    }

    res.json({ message: 'Data restored successfully', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

app.patch("/api/marketing-design/:id/position", async (req, res) => {
  const { id } = req.params;
  const { direction } = req.body; // "up" atau "down"

  try {
    const { rows } = await client.query(
      `SELECT marketing_design_id, position FROM marketing_design WHERE marketing_design_id = $1`,
      [id]
    );

    if (!rows.length) return res.status(404).json({ error: "Data tidak ditemukan" });

    const current = rows[0];
    const newPosition = direction === "up" ? current.position - 1 : current.position + 1;

    // Cari item yang punya posisi target
    const swap = await client.query(
      `SELECT marketing_design_id FROM marketing_design WHERE position = $1`,
      [newPosition]
    );

    if (!swap.rows.length) {
      return res.json({ message: "Sudah di posisi teratas / terbawah" });
    }

    const swapId = swap.rows[0].marketing_design_id;

    // Tukar posisi
    await client.query("BEGIN");
    await client.query(
      `UPDATE marketing_design SET position = $1 WHERE marketing_design_id = $2`,
      [newPosition, current.marketing_design_id]
    );
    await client.query(
      `UPDATE marketing_design SET position = $1 WHERE marketing_design_id = $2`,
      [current.position, swapId]
    );
    await client.query("COMMIT");

    res.json({ success: true, message: "Posisi diperbarui" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Error ubah posisi:", err);
    res.status(500).json({ error: "Gagal ubah posisi" });
  }
});



// 5. Soft delete workspace (arsipkan dan tandai sebagai terhapus)
app.delete('/api/workspace/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Cek dulu apakah workspace ada
    const check = await client.query("SELECT * FROM workspaces WHERE id = $1", [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Workspace not found" });
    }

    // Simpan data ke tabel archive (opsional, bisa dihapus kalau gak perlu)
    await client.query(
      `
        INSERT INTO archive (entity_type, entity_id, name, description, create_at, update_at)
        SELECT 'workspace', id, name, description, create_at, update_at
        FROM workspaces
        WHERE id = $1
      `,
      [id]
    );

    // Update workspace agar jadi soft delete
    const result = await client.query(
      `
        UPDATE workspaces
        SET is_deleted = TRUE, deleted_at = NOW()
        WHERE id = $1
        RETURNING *
      `,
      [id]
    );

    res.json({
      success: true,
      message: "Workspace soft deleted successfully",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Error soft deleting workspace:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// 6. Restore workspace yang dihapus (soft delete restore)
app.put('/api/workspace/restore/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await client.query(
      `
        UPDATE workspaces
        SET is_deleted = FALSE, deleted_at = NULL
        WHERE id = $1
        RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Workspace not found or not deleted" });
    }

    res.json({
      success: true,
      message: "Workspace restored successfully",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Error restoring workspace:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/cards/:cardId/move', async (req, res) => {
  const { cardId } = req.params;
  const { targetListId, newPosition } = req.body;

  if (!actingUserId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    await client.query('BEGIN');

    // ambil info card lama
    const oldCardRes = await client.query(
      `SELECT c.list_id, c.position, c.title, l.board_id 
       FROM cards c 
       JOIN lists l ON c.list_id = l.id
       WHERE c.id = $1`,
      [cardId]
    );
    if (oldCardRes.rows.length === 0)
      return res.status(404).json({ error: 'Card tidak ditemukan' });

    const { list_id: oldListId, board_id: oldBoardId, position: oldPosition, title } = oldCardRes.rows[0];

    // ambil board_id dari list tujuan
    const targetListRes = await client.query(`SELECT board_id FROM lists WHERE id = $1`, [targetListId]);
    if (targetListRes.rows.length === 0)
      return res.status(404).json({ error: 'List tujuan tidak ditemukan' });
    const targetBoardId = targetListRes.rows[0].board_id;

    // geser posisi di list lama
    await client.query(
      `UPDATE cards SET position = position - 1
       WHERE list_id = $1 AND position > $2`,
      [oldListId, oldPosition]
    );

    // hitung posisi baru
    let finalPosition = newPosition;
    if (!finalPosition) {
      const posRes = await client.query(
        `SELECT COALESCE(MAX(position), 0) + 1 AS pos
         FROM cards WHERE list_id = $1`,
        [targetListId]
      );
      finalPosition = posRes.rows[0].pos;
    } else {
      // geser posisi di list tujuan
      await client.query(
        `UPDATE cards SET position = position + 1
         WHERE list_id = $1 AND position >= $2`,
        [targetListId, finalPosition]
      );
    }

    // update posisi dan list card
    await client.query(
      `UPDATE cards
       SET list_id = $1, position = $2, update_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [targetListId, finalPosition, cardId]
    );

    // ambil info board & list lama dan baru
    const oldInfo = await client.query(
      `SELECT l.name AS list_name, b.name AS board_name
       FROM lists l 
       JOIN boards b ON l.board_id = b.id
       WHERE l.id = $1`,
      [oldListId]
    );
    const newInfo = await client.query(
      `SELECT l.name AS list_name, b.name AS board_name
       FROM lists l 
       JOIN boards b ON l.board_id = b.id
       WHERE l.id = $1`,
      [targetListId]
    );



  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Gagal move card:', err);
    res.status(500).json({ error: 'Gagal memindahkan card' });
  }
});


app.get('/api/cards/:cardId/activities', async (req, res) => {
  const { cardId } = req.params;

  try {
    const result = await client.query(`
      SELECT 
        ca.*,
        u.name AS movedBy
      FROM card_activities ca
      LEFT JOIN users u ON ca.user_id = u.id
      WHERE ca.card_id = $1
      ORDER BY ca.created_at DESC
    `, [cardId]);

    res.json({
      message: `Activities for card ID ${cardId}`,
      activities: result.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching card activities' });
  }
});

const handleMoveCard = async () => {
  if (!cardId || !selectedList?.id) {
    alert('Please select both board and list!');
    return;
  }

  if (!targetPosition || targetPosition < 1) {
    alert('Please enter a valid position!');
    return;
  }

  if (!userId) {
    alert('User ID not found!');
    return;
  }

  setIsMoving(true);

  try {
    const result = await moveCardToList(
      cardId,
      userId,            // <-- pakai userId dari props
      selectedList.id,
      targetPosition
    );

    console.log('✅ Card moved successfully:', result);
    showSnackbar('Card moved successfully!', 'success');

    // Refresh data parent
    if (onCardMoved) onCardMoved();
    if (fetchCardList) {
      fetchCardList(listId); // list asal
      fetchCardList(selectedList.id); // list tujuan
    }

    // Navigasi ke board tujuan
    navigate(`/layout/workspaces/${workspaceId}/board/${selectedBoardId}`);

    onClose();
  } catch (error) {
    console.error('❌ Error moving card:', error);
    showSnackbar('Failed to move the card!', 'error');
  } finally {
    setIsMoving(false);
  }
};

await client.query(
  `INSERT INTO card_activities (card_id, user_id, action_type, entity, entity_id, action_detail)
   VALUES ($1, $2, 'moved', 'card', $3, $4)`,
  [cardId, userId, cardId, JSON.stringify({
    cardTitle: title,
    fromListName: oldListName,
    toListName: targetListName,
    fromBoardName: oldBoardName,
    toBoardName: oldBoardName
  })]
);

res.json({ message: 'Card berhasil dipindahkan', actionDetail: { /* sama dengan di atas */ } });


const CardActivity = ({ cardId }) => {
  const [cardActivities, setCardActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCardActivites = async () => {
    try {
      setLoading(true);
      const response = await getActivityCard(cardId);
      setCardActivities(response.data.activities);
    } catch (error) {
      console.error('Failed to fetch card activity:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cardId) fetchCardActivites();
  }, [cardId]);

  return (
    <div className="ca-container">
      {loading ? (
        <p>Loading...</p>
      ) : cardActivities.length === 0 ? (
        <p style={{ textAlign: 'center', fontSize: '12px' }}>No activity yet.</p>
      ) : (
        <ul className="space-y-3">
          {cardActivities.map((activity) => {
            let detail = {};
            try {
              detail = activity.action_detail ? JSON.parse(activity.action_detail) : {};
            } catch {
              detail = { text: activity.action_detail }; // fallback string
            }

            let messageElement = null;
            const borderColor = COLOR_BORDER[activity.action_type] || '#ddd';

            if (activity.action_type === 'move' && detail.cardTitle) {
              if (detail.fromBoardName === detail.toBoardName) {
                messageElement = (
                  <>
                    <strong>{activity.username}</strong> moved <strong>"{detail.cardTitle}"</strong> from <span className="text-red-500">"{detail.fromListName}"</span> to <span className="text-green-600">"{detail.toListName}"</span> on board <em>"{detail.toBoardName}"</em>
                  </>
                );
              } else {
                messageElement = (
                  <>
                    <strong>{activity.username}</strong> moved <strong>"{detail.cardTitle}"</strong> from <span className="text-red-500">"{detail.fromListName}"</span> (board <em>"{detail.fromBoardName}"</em>) to <span className="text-green-600">"{detail.toListName}"</span> (board <em>"{detail.toBoardName}"</em>)
                  </>
                );
              }
            } else {
              // fallback jika bukan move
              messageElement = <>{activity.username} {detail.text || activity.action_type}</>;
            }

            return (
              <li
                key={activity.id}
                className="ca-li"
                style={{
                  padding: '0.25rem',
                  borderLeftWidth: '4px',
                  borderLeftStyle: 'solid',
                  borderLeftColor: borderColor,
                  backgroundColor: '#f8fafc',
                  borderRadius: '0.25rem',
                }}
              >
                <p style={{ fontSize: '10px', margin: 0 }}>{messageElement}</p>
                <p style={{ fontSize: '10px', textAlign: 'right' }}>{new Date(activity.created_at).toLocaleString()}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};




app.put('/api/cards/:cardId/move', async (req, res) => {
  const { cardId } = req.params;
  const { targetListId, newPosition } = req.body;
  const actingUserId = req.user?.id;


  app.put('/api/cards/:cardId/move-testing/:userId', async (req, res) => {
    const { cardId, userId } = req.params; // ambil userId dari URL
    const { targetListId, newPosition } = req.body;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });



    import { useUser } from '../context/UserContext'; // pastikan ada

    const MoveCard = ({
      cardId,
      workspaceId,
      onClose,
      boardId,
      listId,
      onCardMoved,
      fetchCardList,
    }) => {
      const { user } = useUser(); // ambil userId
      const [boards, setBoards] = useState([]);
      const [lists, setLists] = useState([]);
      const [cards, setCards] = useState([]);
      const [searchBoard, setSearchBoard] = useState('');
      const [searchList, setSearchList] = useState('');
      const [selectedBoardId, setSelectedBoardId] = useState(null);
      const [selectedList, setSelectedList] = useState(null);
      const [targetPosition, setTargetPosition] = useState('');
      const [showBoardDropdown, setShowBoardDropdown] = useState(false);
      const [showListDropdown, setShowListDropdown] = useState(false);
      const [isMoving, setIsMoving] = useState(false);

      const navigate = useNavigate();
      const { showSnackbar } = useSnackbar();

      // 🔹 Load semua board
      useEffect(() => {
        getBoards()
          .then((res) => setBoards(res.data))
          .catch((err) => console.error('❌ Error fetching boards:', err));
      }, []);

      // 🔹 Load lists berdasarkan board
      useEffect(() => {
        if (selectedBoardId) {
          getListByBoard(selectedBoardId)
            .then((res) => setLists(res.data))
            .catch((err) => console.error('❌ Error fetching lists:', err));
        }
      }, [selectedBoardId]);

      // 🔹 Load cards berdasarkan list
      useEffect(() => {
        if (selectedList?.id) {
          getCardsByList(selectedList.id)
            .then((res) => setCards(res.data))
            .catch((err) => console.error('❌ Error fetching cards:', err));
        }
      }, [selectedList]);

      // 🔹 Fungsi pindahkan card pakai moveCardToListTesting
      const handleMoveCard = async () => {
        if (!cardId || !selectedList?.id) {
          alert('Please select both board and list!');
          return;
        }

        if (!targetPosition || targetPosition < 1) {
          alert('Please enter a valid position!');
          return;
        }

        if (!user?.id) {
          alert('User not found!');
          return;
        }

        setIsMoving(true);

        try {
          const result = await moveCardToListTesting(
            cardId,
            user.id, // userId di URL
            selectedList.id,
            Number(targetPosition)
          );

          console.log('✅ Card moved successfully:', result);
          showSnackbar('Card moved successfully!', 'success');

          // Refresh data parent
          if (onCardMoved) onCardMoved();
          if (fetchCardList) {
            fetchCardList(listId); // list asal
            fetchCardList(selectedList.id); // list tujuan
          }

          // Navigasi ke board tujuan
          navigate(`/layout/workspaces/${workspaceId}/board/${selectedBoardId}`);

          onClose();
        } catch (error) {
          console.error('❌ Error moving card:', error);
          showSnackbar('Failed to move the card!', 'error');
        } finally {
          setIsMoving(false);
        }
      };

      return (
        <div className="mc-container">
          {/* ...UI dropdown board/list & input posisi tetap sama */}
          <div className="div-btn">
            <button
              className="mcl-move-btn"
              onClick={handleMoveCard}
              disabled={!selectedList || isMoving}
            >
              <HiMiniArrowLeftStartOnRectangle className="mcl-icon" />
              {isMoving ? 'Moving...' : 'Move Card'}
            </button>
          </div>
        </div>
      );
    };

    export default MoveCard;


    // log activity
    await logCardActivity({
      action: 'move',
      card_id: cardId,
      user_ids: userIds,
      entity: 'list',
      entity_id: targetListId,
      details: {
        cardTitle: title,
        fromBoardId: oldBoardId,
        fromBoardName: oldBoardName,
        fromListId: oldListId,
        fromListName: oldListName,
        toBoardId: targetBoardId,
        toBoardName: newBoardName,
        toListId: targetListId,
        toListName: newListName,
        newPosition: finalPosition,
        movedBy: { id: actingUserId, username: actingUserName }
      }
    });

    await client.query('COMMIT');

    // response ke frontend
    res.status(200).json({
      message: 'Card berhasil dipindahkan',
      cardId,
      fromListId: oldListId,
      fromListName: oldListName,
      toListId: targetListId,
      toListName: newListName,
      fromBoardId: oldBoardId,
      fromBoardName: oldBoardName,
      toBoardId: targetBoardId,
      toBoardName: newBoardName,
      position: finalPosition,
      movedBy: { id: actingUserId, username: actingUserName }
    });

        082286347194




    // Endpoint untuk duplikasi card ke list tertentu
    app.post('/api/duplicate-card-to-list/:cardId/:listId/:userId/testing', async (req, res) => {
      const { cardId, listId, userId } = req.params;
      const { position } = req.body;
      const actingUserId = parseInt(userId, 10);

      try {
        // ... kode logika duplikasi card (misalnya ambil data card lama, insert card baru, dll.)

        // 🔥 Simpan activity langsung ke tabel card_activities
        await client.query(`
      INSERT INTO card_activities 
        (card_id, user_id, action_type, entity, entity_id, action_detail)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
          newCardId,
          actingUserId,
          'duplicate',
          'list',
          listId,
          JSON.stringify({
            cardTitle: newCardTitle,
            fromListId,
            fromListName,
            fromBoardId,
            fromBoardName,
            toListId: listId,
            toListName,
            toBoardId,
            toBoardName,
            position: position || null,
            duplicatedBy: { id: actingUserId, username: userName }
          })
        ]);

        res.status(200).json({
          message: 'Card berhasil diduplikasi',
          cardId: newCardId,
          fromListId,
          fromListName,
          toListId: listId,
          toListName,
          fromBoardId,
          fromBoardName,
          toBoardId,
          toBoardName,
          position: position || null,
          duplicatedBy: { id: actingUserId, username: userName }
        });
      } catch (error) {
        console.error('❌ Error duplicating card:', error);
        res.status(500).json({ message: 'Error duplicating card', error: error.message });
      }
    });



    cardId, // card_id
      actingUserId, // user_id
      'moved', // action_type
      'list', // entity
      targetListId, // entity_id
      JSON.stringify({ // action_detail valid JSON
        cardTitle: title,
        fromBoardId: oldBoardId,
        fromBoardName: oldBoardName,
        fromListId: oldListId,
        fromListName: oldListName,
        toBoardId: targetBoardId,
        toBoardName: newBoardName,
        toListId: targetListId,
        toListName: newListName,
        newPosition: finalPosition,
        movedBy: { id: actingUserId, username: actingUserName }
      })
            ]);

  await client.query('COMMIT');

  // ✅ Respon sukses
  res.status(200).json({
    message: 'Card berhasil dipindahkan',
    cardId,
    fromListId: oldListId,
    fromListName: oldListName,
    toListId: targetListId,
    toListName: newListName,
    fromBoardId: oldBoardId,
    fromBoardName: oldBoardName,
    toBoardId: targetBoardId,
    toBoardName: newBoardName,
    position: finalPosition,
    movedBy: { id: actingUserId, username: actingUserName }
  });



  // ADD NEW DATA MARKETING MUSIK
  app.post("/api/marketing-testing", async (req, res) => {
    try {
      const {
        input_by,
        acc_by,
        buyer_name,
        code_order,
        jumlah_track,
        account,
        deadline,
        jumlah_revisi,
        order_type,
        offer_type,
        jenis_track,
        genre,
        price_normal,
        price_discount,
        discount,
        basic_price,
        gig_link,
        required_files,
        project_type,
        duration,
        reference_link,
        file_and_chat_link,
        detail_project,
        kupon_diskon_id,
        accept_status_id,
      } = req.body;

      // 🔹 Generate nomor otomatis
      const { projectNumber, orderNumber } = generateMarketingNumbers();

      // 🔹 Ambil posisi terakhir dari tabel
      const posResult = await client.query(`
      SELECT COALESCE(MAX(position), 0) AS max_position
      FROM data_marketing
    `);
      const nextPosition = posResult.rows[0].max_position + 1;

      // 🔹 Insert ke DB
      const insertResult = await client.query(
        `
      INSERT INTO data_marketing 
      (input_by, acc_by, buyer_name, code_order, jumlah_track, order_number,
      account, deadline, jumlah_revisi, order_type, offer_type, jenis_track, genre,
      price_normal, price_discount, discount, basic_price, gig_link, required_files,
      project_type, duration, reference_link, file_and_chat_link, detail_project,
      kupon_diskon_id, accept_status_id, create_at, project_number, position)
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,CURRENT_TIMESTAMP,$27,$28)
      RETURNING *`,
        [
          input_by,
          acc_by,
          buyer_name,
          code_order,
          jumlah_track,
          orderNumber,
          account,
          deadline,
          jumlah_revisi,
          order_type,
          offer_type,
          jenis_track,
          genre,
          price_normal,
          price_discount,
          discount,
          basic_price,
          gig_link,
          required_files,
          project_type,
          duration,
          reference_link,
          file_and_chat_link,
          detail_project,
          kupon_diskon_id || null,
          accept_status_id || null,
          projectNumber,
          nextPosition,
        ]
      );

      const newMarketingId = insertResult.rows[0].marketing_id;

      // 🔹 Ambil hasil lengkap dengan join
      const result = await client.query(
        `
      SELECT 
        dm.*, 
        mu.nama_marketing AS input_by_name,
        kd.nama AS acc_by_name,
        am.nama_account AS account_name,
        ot.order_name AS order_type_name,
        oft.offer_name AS offer_type_name,
        tt.track_name AS track_type_name,
        g.genre_name AS genre_name,
        pt.nama_project AS project_type_name,
        k.nama_kupon AS kupon_diskon_name,
        s.status_name AS accept_status_name
      FROM data_marketing dm
      LEFT JOIN marketing_musik_user mu ON mu.id = dm.input_by
      LEFT JOIN kepala_divisi kd ON kd.id = dm.acc_by
      LEFT JOIN account_music am ON am.id = dm.account
      LEFT JOIN music_order_type ot ON ot.id = dm.order_type
      LEFT JOIN offer_type_music oft ON oft.id = dm.offer_type
      LEFT JOIN track_types tt ON tt.id = dm.jenis_track
      LEFT JOIN genre_music g ON g.id = dm.genre
      LEFT JOIN project_type pt ON pt.id = dm.project_type
      LEFT JOIN kupon_diskon k ON k.id = dm.kupon_diskon_id
      LEFT JOIN accept_status s ON s.id = dm.accept_status_id
      WHERE dm.marketing_id = $1
    `,
        [newMarketingId]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("❌ Error creating marketing data:", err.message);
      res.status(500).send("Server error");
    }
  });
