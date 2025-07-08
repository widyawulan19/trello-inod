app.post('/api/archive/:entity/:id', async (req, res) => {
    const { entity, id } = req.params;

    const entityMap = {
        data_marketing: { table: 'data_marketing', idField: 'marketing_id' },
        workspace: { table: 'workspaces', idField: 'id' },
        cards: { table: 'cards', idField: 'id' },
        // tambahkan entitas lainnya jika perlu
    };

    const config = entityMap[entity];
    if (!config) return res.status(400).json({ error: 'Entity tidak dikenali' });

    try {
        const { table, idField } = config;

        // 1. Ambil data dari tabel asli
        const result = await client.query(
            `SELECT * FROM ${table} WHERE ${idField} = $1`, [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: `Data ${entity} dengan ID ${id} tidak ditemukan` });
        }

        const data = result.rows[0];

        // 2. Masukkan ke archive_universal
        await client.query(`
            INSERT INTO archive_universal (entity_type, entity_id, data)
            VALUES ($1, $2, $3)
        `, [entity, id, data]);

        // 3. Hapus dari tabel aslinya
        await client.query(
            `DELETE FROM ${table} WHERE ${idField} = $1`, [id]
        );

        res.status(200).json({ message: `Data ${entity} ID ${id} berhasil diarsipkan` });
    } catch (err) {
        console.error('Archive error:', err);
        res.status(500).json({ error: err.message });
    }
});

// import { handleArchive } from '../utils/handleArchive';

const handleArchiveBoard = (boardId) => {
  handleArchive({
    entity: 'board',
    id: boardId,
    refetch: fetchBoards,         // fungsi yang refresh daftar board
    showSnackbar: showSnackbar,   // fungsi snackbar dari props/context
  });
};
