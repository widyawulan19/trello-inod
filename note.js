//4. restore data archive 
app.post('/api/restore/:entity/:id', async (req, res) => {
  const { entity, id } = req.params;

  const entityMap = {
    workspaces_users: { table: 'workspaces_users' },
    workspaces: { table: 'workspaces' },
    boards: { table: 'boards' },
    lists: { table: 'lists' },
    cards: { table: 'cards' },
    data_marketing: { table: 'data_marketing' },
    marketing_design: { table: 'marketing_design' }
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

app.post('/api/restore-testing/cards/:cardId', async (req, res) => {
  const { cardId } = req.params;

  try {
    await client.query('BEGIN');

    // 1. Ambil data dari archive_universal
    const archiveResult = await client.query(
      `SELECT data FROM archive_universal 
             WHERE entity_type = 'cards' AND entity_id = $1`,
      [cardId]
    );

    if (archiveResult.rows.length === 0) {
      return res.status(404).json({ error: 'Archived card not found' });
    }

    const raw = archiveResult.rows[0].data;
    const card = raw.card;

    if (!card) {
      return res.status(400).json({ error: 'Invalid archive structure: missing card data' });
    }

    // ============================================
    // STEP 1 — RESTORE ROW INTI CARD
    // ============================================

    const cardKeys = Object.keys(card);
    const cardVals = Object.values(card);
    const placeholders = cardVals.map((_, i) => `$${i + 1}`).join(', ');

    await client.query(
      `INSERT INTO public.cards (${cardKeys.join(', ')}) 
             VALUES (${placeholders})`,
      cardVals
    );

    // ============================================
    // STEP 2 — RESTORE SEMUA RELASI (LIKE DUPLICATE)
    // ============================================

    const restoreRelation = async (tableName, arr) => {
      if (!arr || arr.length === 0) return;

      for (const row of arr) {
        const keys = Object.keys(row);
        const vals = Object.values(row);
        const ph = vals.map((_, i) => `$${i + 1}`).join(', ');

        await client.query(
          `INSERT INTO public.${tableName} (${keys.join(', ')})
                     VALUES (${ph})`,
          vals
        );
      }
    };

    await restoreRelation("card_checklists", raw.checklists);
    await restoreRelation("card_cover", raw.cover);
    await restoreRelation("card_descriptions", raw.descriptions);
    await restoreRelation("card_due_dates", raw.due_dates);
    await restoreRelation("card_labels", raw.labels);
    await restoreRelation("card_members", raw.members);
    await restoreRelation("card_priorities", raw.priorities);
    await restoreRelation("card_status", raw.status);
    await restoreRelation("card_users", raw.users);
    await restoreRelation("card_chats", raw.chats);

    // ============================================
    // STEP 3 — HAPUS DARI ARCHIVE UNIVERSAL
    // ============================================
    await client.query(
      `DELETE FROM archive_universal 
             WHERE entity_type = 'cards' AND entity_id = $1`,
      [cardId]
    );

    await client.query('COMMIT');

    res.status(200).json({
      message: "Card restored successfully",
      restoredCard: card
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("❌ Restore Error:", err);
    res.status(500).json({ error: err.message });
  }
});



// Endpoint untuk duplikasi card ke list tertentu
app.post('/api/duplicate-card-to-list/:cardId/:listId', async (req, res) => {
  const { cardId, listId } = req.params;
  const { position } = req.body; // 🎯 ambil posisi dari body
  const userId = req.user.id;


  try {
    await client.query('BEGIN');

    // Kalau user pilih posisi, geser posisi lain dulu
    if (position) {
      await client.query(
        `UPDATE public.cards 
            SET position = position + 1 
            WHERE list_id = $1 AND position >= $2`,
        [listId, position]
      );
    }

    const result = await client.query(
      `INSERT INTO public.cards (title, description, list_id, position) 
        SELECT title, description, $1, 
                COALESCE($2, (SELECT COALESCE(MAX(position), 0) + 1 FROM public.cards WHERE list_id = $1))
        FROM public.cards 
        WHERE id = $3 
        RETURNING id, title, list_id`,
      [listId, position, cardId]
    );


    const newCardId = result.rows[0].id;
    const newCardTitle = result.rows[0].title;

    // 2. Salin relasi-relasi card
    await client.query(
      `INSERT INTO public.card_checklists (card_id, checklist_id, created_at, updated_at)
             SELECT $1, checklist_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
             FROM public.card_checklists WHERE card_id = $2`,
      [newCardId, cardId]
    );

    await client.query(
      `INSERT INTO public.card_cover (card_id, cover_id)
             SELECT $1, cover_id FROM public.card_cover WHERE card_id = $2`,
      [newCardId, cardId]
    );

    await client.query(
      `INSERT INTO public.card_descriptions (card_id, description, created_at, updated_at)
             SELECT $1, description, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
             FROM public.card_descriptions WHERE card_id = $2`,
      [newCardId, cardId]
    );

    await client.query(
      `INSERT INTO public.card_due_dates (card_id, due_date, created_at, updated_at)
             SELECT $1, due_date, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
             FROM public.card_due_dates WHERE card_id = $2`,
      [newCardId, cardId]
    );

    await client.query(
      `INSERT INTO public.card_labels (card_id, label_id)
             SELECT $1, label_id FROM public.card_labels WHERE card_id = $2`,
      [newCardId, cardId]
    );

    await client.query(
      `INSERT INTO public.card_members (card_id, user_id)
             SELECT $1, user_id FROM public.card_members WHERE card_id = $2`,
      [newCardId, cardId]
    );

    await client.query(
      `INSERT INTO public.card_priorities (card_id, priority_id)
             SELECT $1, priority_id FROM public.card_priorities WHERE card_id = $2`,
      [newCardId, cardId]
    );

    await client.query(
      `INSERT INTO public.card_status (card_id, status_id, assigned_at)
             SELECT $1, status_id, CURRENT_TIMESTAMP
             FROM public.card_status WHERE card_id = $2`,
      [newCardId, cardId]
    );

    await client.query(
      `INSERT INTO public.card_users (card_id, user_id)
             SELECT $1, user_id FROM public.card_users WHERE card_id = $2`,
      [newCardId, cardId]
    );

    // 3. Ambil nama user untuk dicatat di activity
    const userRes = await client.query(
      "SELECT username FROM users WHERE id = $1",
      [userId]
    );
    const userName = userRes.rows[0]?.username || 'Unknown';

    // === Ambil info list + board asal (dari card lama) ===
    const oldListRes = await client.query(
      `SELECT l.id AS list_id, l.name AS list_name, b.id AS board_id, b.name AS board_name
             FROM cards c
             JOIN lists l ON c.list_id = l.id
             JOIN boards b ON l.board_id = b.id
             WHERE c.id = $1`,
      [cardId]
    );
    const fromListId = oldListRes.rows[0]?.list_id;
    const fromListName = oldListRes.rows[0]?.list_name || "Unknown List";
    const fromBoardId = oldListRes.rows[0]?.board_id;
    const fromBoardName = oldListRes.rows[0]?.board_name || "Unknown Board";

    // === Ambil info list + board tujuan ===
    const newListRes = await client.query(
      `SELECT l.id AS list_id, l.name AS list_name, b.id AS board_id, b.name AS board_name
             FROM lists l
             JOIN boards b ON l.board_id = b.id
             WHERE l.id = $1`,
      [listId]
    );
    const toListName = newListRes.rows[0]?.list_name || "Unknown List";
    const toBoardId = newListRes.rows[0]?.board_id;
    const toBoardName = newListRes.rows[0]?.board_name || "Unknown Board";

    // Ambil semua card di list tujuan untuk generate pilihan posisi
    const cardsInTargetList = await client.query(
      `SELECT id, title, position FROM public.cards WHERE list_id = $1 ORDER BY position ASC`,
      [listId]
    );

    const positions = cardsInTargetList.rows.map((c, index) => ({
      value: index + 1,
      label: `${index + 1}. ${c.title}`
    }));


    await client.query('COMMIT');

    // 4. Log ke user_activity (global activity)
    await logActivity(
      'card',
      newCardId,
      'duplicate',
      userId,
      `Card dengan ID ${cardId} diduplikasi dari list ${fromListId} ke list ${listId}`,
      'list',
      listId
    );

    // 5. Log ke card_activities (activity di card baru)
    await logCardActivity({
      action: 'duplicate',
      card_id: newCardId,
      user_ids: [userId], // <<< perbaikan di sini
      entity: 'list',
      entity_id: listId,
      details: {
        cardTitle: newCardTitle,
        fromListId,
        fromListName,
        fromBoardId,
        fromBoardName,
        toListId: listId,
        toListName,
        toBoardId,
        toBoardName,
        duplicatedBy: { id: userId, username: userName }
      }
    });


    // Response sukses
    res.status(200).json({
      message: 'Card berhasil diduplikasi',
      cardId: newCardId,
      listId,
      listName: toListName,
      fromBoard: { id: fromBoardId, name: fromBoardName },
      toBoard: { id: toBoardId, name: toBoardName },
      newCard: {
        id: newCardId,
        title: newCardTitle,
        listId,
        listName: toListName,
        duplicatedBy: {
          id: userId,
          username: userName
        }
      },
      positions
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan saat menyalin card ke list yang baru' });
  }
});



app.post('/api/restore/:entity/:id', async (req, res) => {
  const { entity, id } = req.params;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Cek apakah entity valid
    const allowedEntities = ["workspaces", "boards", "lists", "cards"];
    if (!allowedEntities.includes(entity)) {
      return res.status(400).json({ error: "Invalid entity." });
    }

    // 2. Ambil data archive berdasarkan entity
    const archiveQuery = `
            SELECT * FROM archives
            WHERE entity = $1 AND entity_id = $2
        `;
    const archiveResult = await client.query(archiveQuery, [entity, id]);

    if (archiveResult.rows.length === 0) {
      return res.status(404).json({ error: "Archived data not found." });
    }

    const archivedData = archiveResult.rows[0].data;

    // 3. Restore main entity
    let mainTable = entity;
    let primaryKey = "id";

    let restoredData = { ...archivedData };

    await client.query(
      `UPDATE ${mainTable} SET is_archived = false WHERE ${primaryKey} = $1`,
      [id]
    );

    // -------------------------------------------------------
    // 4. Jika entity adalah CARD → restore semua relasinya
    // -------------------------------------------------------
    if (entity === "cards") {

      // Restore card_descriptions
      if (archivedData.card_descriptions?.length > 0) {
        for (const desc of archivedData.card_descriptions) {
          await client.query(`
                        UPDATE card_descriptions 
                        SET is_archived = false
                        WHERE id = $1
                    `, [desc.id]);
        }
      }

      // Restore card_labels
      if (archivedData.card_labels?.length > 0) {
        for (const lbl of archivedData.card_labels) {
          await client.query(`
                        UPDATE card_labels
                        SET is_archived = false
                        WHERE id = $1
                    `, [lbl.id]);
        }
      }

      // Restore card_chats
      if (archivedData.card_chats?.length > 0) {
        for (const chat of archivedData.card_chats) {
          await client.query(`
                        UPDATE card_chats
                        SET is_archived = false
                        WHERE id = $1
                    `, [chat.id]);
        }
      }

      // Restore card_files
      if (archivedData.card_files?.length > 0) {
        for (const file of archivedData.card_files) {
          await client.query(`
                        UPDATE card_files
                        SET is_archived = false
                        WHERE id = $1
                    `, [file.id]);
        }
      }

      // Restore card_activities
      if (archivedData.card_activities?.length > 0) {
        for (const act of archivedData.card_activities) {
          await client.query(`
                        UPDATE card_activities
                        SET is_archived = false
                        WHERE id = $1
                    `, [act.id]);
        }
      }

    }

    // 5. Hapus archive record setelah restore
    await client.query(
      `DELETE FROM archives WHERE entity = $1 AND entity_id = $2`,
      [entity, id]
    );

    await client.query("COMMIT");

    res.json({
      message: "Restore successful.",
      restored: restoredData
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Restore error:", err);
    res.status(500).json({ error: "Failed to restore entity." });

  } finally {
    client.release();
  }
});



// Duplicate card endpoint (lengkap: relasi + chat replies + chat media)
app.post('/api/duplicate-card-to-list/:cardId/:listId/:userId/testing', async (req, res) => {
  const { cardId, listId, userId } = req.params;
  const { position } = req.body;
  const actingUserId = parseInt(userId, 10);

  if (!actingUserId) return res.status(401).json({ error: 'Unauthorized: userId missing' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 0. Get original card
    const cardRes = await client.query(`SELECT * FROM public.cards WHERE id = $1`, [cardId]);
    if (cardRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Card not found' });
    }
    const oldCard = cardRes.rows[0];

    // 1. Handle position if provided (shift)
    if (position) {
      await client.query(
        `UPDATE public.cards 
         SET position = position + 1 
         WHERE list_id = $1 AND position >= $2`,
        [listId, position]
      );
    }

    // 2. Insert new card (duplicate main fields)
    const newCardInsert = await client.query(
      `INSERT INTO public.cards 
         (title, description, list_id, position, is_active, show_toggle, create_at, update_at)
       VALUES
         ($1, $2, $3, COALESCE($4, (SELECT COALESCE(MAX(position), 0) + 1 FROM public.cards WHERE list_id = $3)), $5, $6, NOW(), NOW())
       RETURNING id, title, list_id, is_active, show_toggle`,
      [
        oldCard.title + ' (Copy)',
        oldCard.description,
        listId,
        position,
        oldCard.is_active,
        oldCard.show_toggle
      ]
    );

    const newCardId = newCardInsert.rows[0].id;
    const newCardTitle = newCardInsert.rows[0].title;

    // 3. Duplicate simple relation tables via INSERT ... SELECT
    // card_checklists
    await client.query(
      `INSERT INTO public.card_checklists (card_id, checklist_id, created_at, updated_at)
       SELECT $1, checklist_id, NOW(), NOW()
       FROM public.card_checklists WHERE card_id = $2`,
      [newCardId, cardId]
    );

    // card_cover
    await client.query(
      `INSERT INTO public.card_cover (card_id, cover_id, create_at, update_at)
       SELECT $1, cover_id, NOW(), NOW()
       FROM public.card_cover WHERE card_id = $2`,
      [newCardId, cardId]
    );

    // card_descriptions
    await client.query(
      `INSERT INTO public.card_descriptions (card_id, description, created_at, updated_at, nomer_active_order, input_by, buyer_name, code_order, jumlah_track, order_number, account, deadline, jumlah_revisi, order_type, offer_type, jenis_track, genre, price, required_file, project_type, duration, reference, file_and_chat, detail_project, cdesc_id)
       SELECT $1, description, NOW(), NOW(), nomer_active_order, input_by, buyer_name, code_order, jumlah_track, order_number, account, deadline, jumlah_revisi, order_type, offer_type, jenis_track, genre, price, required_file, project_type, duration, reference, file_and_chat, detail_project, cdesc_id
       FROM public.card_descriptions WHERE card_id = $2`,
      [newCardId, cardId]
    );

    // card_due_dates
    await client.query(
      `INSERT INTO public.card_due_dates (card_id, due_date, created_at, updated_at)
       SELECT $1, due_date, NOW(), NOW()
       FROM public.card_due_dates WHERE card_id = $2`,
      [newCardId, cardId]
    );

    // card_labels
    await client.query(
      `INSERT INTO public.card_labels (card_id, label_id, create_at, update_at)
       SELECT $1, label_id, NOW(), NOW()
       FROM public.card_labels WHERE card_id = $2`,
      [newCardId, cardId]
    );

    // card_members
    await client.query(
      `INSERT INTO public.card_members (card_id, user_id, created_at, updated_at)
       SELECT $1, user_id, NOW(), NOW()
       FROM public.card_members WHERE card_id = $2`,
      [newCardId, cardId]
    );

    // card_priorities
    await client.query(
      `INSERT INTO public.card_priorities (card_id, priority_id, created_at, updated_at)
       SELECT $1, priority_id, NOW(), NOW()
       FROM public.card_priorities WHERE card_id = $2`,
      [newCardId, cardId]
    );

    // card_status
    await client.query(
      `INSERT INTO public.card_status (card_id, status_id, assigned_at, update_at)
       SELECT $1, status_id, NOW(), NOW()
       FROM public.card_status WHERE card_id = $2`,
      [newCardId, cardId]
    );

    // card_users
    await client.query(
      `INSERT INTO public.card_users (card_id, user_id, created_at, updated_at)
       SELECT $1, user_id, NOW(), NOW()
       FROM public.card_users WHERE card_id = $2`,
      [newCardId, cardId]
    );

    // ========== 4. DUPLICATE CARD CHATS (WITH PARENT MAPPING) ==========
    // 4a. Ambil semua chat lama (urut berdasarkan id agar mapping deterministic)
    const oldChatsRes = await client.query(
      `SELECT * FROM public.card_chats WHERE card_id = $1 ORDER BY id ASC`,
      [cardId]
    );
    const oldChats = oldChatsRes.rows;

    // chatIdMap: oldChatId -> newChatId
    const chatIdMap = {};

    // 4b. Insert chats satu per satu, set parent_message_id = NULL dulu (atau tetap NULL kalau tidak ada)
    for (const chat of oldChats) {
      const insertChat = await client.query(
        `INSERT INTO public.card_chats 
          (card_id, user_id, message, parent_message_id, mentions, send_time, created_at, updated_at, deleted_at)
         VALUES ($1, $2, $3, $4, $5, COALESCE($6, NOW()), NOW(), NOW(), $7)
         RETURNING id`,
        [
          newCardId,
          chat.user_id,
          chat.message,
          null,           // parent_message_id sementara null; akan diupdate nanti jika perlu
          chat.mentions,
          chat.send_time,
          chat.deleted_at
        ]
      );

      const newChatId = insertChat.rows[0].id;
      chatIdMap[chat.id] = newChatId;
    }

    // 4c. Update parent_message_id pada chat baru sesuai mapping (jika parent exists)
    for (const chat of oldChats) {
      if (chat.parent_message_id) {
        const oldParent = chat.parent_message_id;
        const newParent = chatIdMap[oldParent] || null;
        const newChat = chatIdMap[chat.id];

        // Jika parent tidak ditemukan dalam map (edge case), biarkan null
        await client.query(
          `UPDATE public.card_chats SET parent_message_id = $1 WHERE id = $2`,
          [newParent, newChat]
        );
      }
    }

    // ========== 5. DUPLICATE CARD_CHATS_MEDIA berdasarkan mapping ==========
    // Ambil semua media untuk semua old chat id
    const oldChatIds = oldChats.map(c => c.id);
    if (oldChatIds.length > 0) {
      const oldMediaRes = await client.query(
        `SELECT * FROM public.card_chats_media WHERE chat_id = ANY($1::int[]) ORDER BY id ASC`,
        [oldChatIds]
      );

      for (const media of oldMediaRes.rows) {
        const newChatIdForMedia = chatIdMap[media.chat_id];
        if (!newChatIdForMedia) continue; // safety
        await client.query(
          `INSERT INTO public.card_chats_media (chat_id, media_url, media_type, created_at)
           VALUES ($1, $2, $3, NOW())`,
          [newChatIdForMedia, media.media_url, media.media_type]
        );
      }
    }

    // ========== 6. (OPTIONAL) Duplicate any other relations referencing chats (notifications, etc.) if needed ==========
    // Example: jika ada notifications yang punya chat_id FK dan perlu digandakan, tambahkan logic mapping di sini.
    // NOTE: jangan duplikasi FK yang seharusnya menunjuk ke original (tergantung business rule).

    // ========== 7. Commit transaction ==========
    await client.query('COMMIT');

    // Ambil info user & lists untuk response (optional, sama seperti versi lama)
    const userRes = await client.query("SELECT username FROM users WHERE id = $1", [actingUserId]);
    const userName = userRes.rows[0]?.username || 'Unknown';

    const oldListRes = await client.query(
      `SELECT l.id AS list_id, l.name AS list_name, b.id AS board_id, b.name AS board_name
       FROM cards c
       JOIN lists l ON c.list_id = l.id
       JOIN boards b ON l.board_id = b.id
       WHERE c.id = $1`,
      [cardId]
    );
    const fromListId = oldListRes.rows[0]?.list_id;
    const fromListName = oldListRes.rows[0]?.list_name || "Unknown List";
    const fromBoardId = oldListRes.rows[0]?.board_id;
    const fromBoardName = oldListRes.rows[0]?.board_name || "Unknown Board";

    const newListRes = await client.query(
      `SELECT l.id AS list_id, l.name AS list_name, b.id AS board_id, b.name AS board_name
       FROM lists l
       JOIN boards b ON l.board_id = b.id
       WHERE l.id = $1`,
      [listId]
    );
    const toListName = newListRes.rows[0]?.list_name || "Unknown List";
    const toBoardId = newListRes.rows[0]?.board_id;
    const toBoardName = newListRes.rows[0]?.board_name || "Unknown Board";

    // Simpan activity (sama seperti implementasimu sebelumnya)
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

    // Response success
    res.status(200).json({
      message: 'Card berhasil diduplikasi beserta relasi, chat (reply) dan chat media',
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

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Duplicate card error:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  } finally {
    client.release();
  }
});


// batas besar di express (WAJIB)
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ extended: true, limit: '200mb' }));

// batas besar di multer (WAJIB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 } // 200 MB
});

// MEDIA CHATS 
app.post('/api/chats/:chatId/media', upload.single('file'), async (req, res) => {
  const { chatId } = req.params;

  if (!req.file || !chatId) {
    return res.status(400).json({ error: 'Missing file or chatId' });
  }

  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'trello_chat_media',
          public_id: `${Date.now()}-${req.file.originalname}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    const fileUrl = result.secure_url;
    const mimeType = req.file.mimetype;

    let mediaType = 'file';
    if (mimeType.startsWith('image/')) mediaType = 'image';
    else if (mimeType.startsWith('video/')) mediaType = 'video';
    else if (mimeType.startsWith('audio/')) mediaType = 'audio';

    const dbResult = await client.query(
      `INSERT INTO card_chats_media (chat_id, media_url, media_type)
             VALUES ($1, $2, $3) RETURNING *`,
      [chatId, fileUrl, mediaType]
    );

    res.status(201).json(dbResult.rows[0]);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed', message: error.message });
  }
});
