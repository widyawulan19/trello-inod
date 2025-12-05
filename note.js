async function generateMarketingNumbers() {
  const now = dayjs();
  const currentMonth = now.month();

  // Ambil data counter dari DB
  const result = await client.query(`
        SELECT current_order_number, current_project_number, last_updated
        FROM counters
        WHERE counter_name = 'marketing'
        FOR UPDATE
    `);

  let { current_order_number, current_project_number, last_updated } = result.rows[0];

  // Reset jika bulan baru
  const lastMonth = dayjs(last_updated).month();
  if (currentMonth !== lastMonth) {
    current_order_number = 0;
    current_project_number = 0;
    console.log(`🔁 Bulan baru! Reset nomor ke P01 (${now.format('MMM YYYY')})`);
  }

  // Increment
  current_order_number += 1;
  current_project_number += 1;

  // Simpan kembali ke DB
  await client.query(
    `
        UPDATE counters
        SET 
            current_order_number = $1,
            current_project_number = $2,
            last_updated = CURRENT_TIMESTAMP
        WHERE counter_name = 'marketing'
        `,
    [current_order_number, current_project_number]
  );

  // Format hasil
  const projectNumber = `P${String(current_project_number).padStart(2, "0")} ${now.format("DD/MMM/YYYY")}`;
  const orderNumber = `${current_order_number}`;

  return { projectNumber, orderNumber };
}



app.post('/api/archive/:entity/:id/:userId', async (req, res) => {
  const { entity, id, userId } = req.params;

  const entityMap = {
    workspaces_user: { table: 'workspaces_users', idField: 'workspace_id' },
    workspaces: { table: 'workspaces', idField: 'id' },
    boards: { table: 'boards', idField: 'id' },
    lists: { table: 'lists', idField: 'id' },
    cards: { table: 'cards', idField: 'id' },
    data_marketing: { table: 'data_marketing', idField: 'marketing_id' },
    marketing_design: { table: 'marketing_design', idField: 'marketing_design_id' }
  };

  const config = entityMap[entity];
  if (!config) return res.status(400).json({ error: 'Entity tidak dikenali' });

  try {
    const { table, idField } = config;

    // ======================================================
    // 1. Ambil data utama dari tabel utama
    // ======================================================
    const result = await client.query(
      `SELECT * FROM ${table} WHERE ${idField} = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: `Data ${entity} dengan ID ${id} tidak ditemukan`
      });
    }

    let data = result.rows[0];

    // ======================================================
    // 2. Jika entity = cards → ambil seluruh relasi lengkap
    // ======================================================
    if (entity === "cards") {
      const relations = {};

      const tables = {
        checklists: "card_checklists",
        cover: "card_cover",
        descriptions: "card_descriptions",
        due_dates: "card_due_dates",
        labels: "card_labels",
        members: "card_members",
        priorities: "card_priorities",
        status: "card_status",
        users: "card_users",
        chats: "card_chats"
      };

      for (const [key, tableName] of Object.entries(tables)) {
        const q = await client.query(
          `SELECT * FROM ${tableName} WHERE card_id = $1`,
          [id]
        );
        relations[key] = q.rows;
      }

      // Gabungkan data utama + relasi
      data = {
        ...data,
        ...relations
      };
    }

    // ======================================================
    // 3. Simpan ke archive_universal
    // ======================================================
    await client.query(`
            INSERT INTO archive_universal (entity_type, entity_id, data, user_id)
            VALUES ($1, $2, $3, $4)
        `, [entity, id, data, userId]);


    // ======================================================
    // 4. Hapus dari tabel utama
    // ======================================================
    await client.query(
      `DELETE FROM ${table} WHERE ${idField} = $1`,
      [id]
    );

    res.status(200).json({
      message: `Data ${entity} ID ${id} berhasil diarsipkan`
    });

  } catch (err) {
    console.error('Archive error:', err);
    res.status(500).json({ error: err.message });
  }
});



app.get('/api/cards/:cardId/media-count', async (req, res) => {
  const { cardId } = req.params;

  try {
    const result = await client.query(
      `SELECT COUNT(cm.id) AS total_media
       FROM card_chats_media cm
       JOIN card_chats c ON c.id = cm.chat_id
       WHERE c.card_id = $1`,
      [cardId]
    );

    res.json({ media_count: Number(result.rows[0].total_media) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to count media' });
  }
});
