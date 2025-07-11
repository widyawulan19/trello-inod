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

// get semua data archive universal 
app.get('/api/archive-data', async (req, res) => {
  try {
    const result = await client.query(`SELECT * FROM archive_universal ORDER BY archived_at DESC`);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching archive:', error);
    res.status(500).json({ error: error.message });
  }
});


//delete data archive universall by id
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

//restore data archive
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

import React, { useEffect, useState } from "react";
import { getAllDataArchive, deleteArchiveDataUniversalById } from "../services/ApiServices";

const ArchiveUniversal = () => {
  const [archiveData, setArchiveData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ message: "", type: "" });

  const fetchArchiveData = async () => {
    setLoading(true);
    try {
      const response = await getAllDataArchive();
      setArchiveData(response.data);
    } catch (error) {
      console.error("Error fetching archive data", error);
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, type) => {
    setSnackbar({ message, type });
    setTimeout(() => setSnackbar({ message: "", type: "" }), 3000);
  };

  const handleDeleteArchive = async (id) => {
    try {
      await deleteArchiveDataUniversalById(id);
      showSnackbar("Successfully deleted archive data", "success");
      fetchArchiveData(); // Refresh
    } catch (error) {
      console.error("Failed to delete archive data:", error);
      showSnackbar("Failed to delete archive data", "error");
    }
  };

  useEffect(() => {
    fetchArchiveData();
  }, []);

  return (
    <div className="p-4">
      {snackbar.message && (
        <div className={`p-2 mb-4 text-white ${snackbar.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
          {snackbar.message}
        </div>
      )}
      <h2 className="mb-4 text-xl font-bold">Archive Data</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full text-sm border">
          <thead>
            <tr className="text-left bg-gray-100">
              <th className="p-2 border">Entity Type</th>
              <th className="p-2 border">Entity ID</th>
              <th className="p-2 border">User ID</th>
              <th className="p-2 border">Archived At</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {archiveData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="p-2 border">{item.entity_type}</td>
                <td className="p-2 border">{item.entity_id}</td>
                <td className="p-2 border">{item.user_id ?? "-"}</td>
                <td className="p-2 border">{new Date(item.archived_at).toLocaleString()}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => handleDeleteArchive(item.id)}
                    className="px-2 py-1 text-white bg-red-500 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {archiveData.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">No archived data found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ArchiveUniversal;
