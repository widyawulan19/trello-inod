// import React, { useState } from "react";
// import { GiCardExchange } from "react-icons/gi";
// import { updateListPositions } from "../services/ApiServices";

// const PositionList = ({ boardId, lists, setLists }) => {
//   const [activeDropdown, setActiveDropdown] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleChangeListPosition = async (listId, newIndex) => {
//     setLoading(true);

//     try {
//       // Temukan posisi lama
//       const currentIndex = lists.findIndex((l) => l.id === listId);
//       const updatedLists = [...lists];
//       const [movedList] = updatedLists.splice(currentIndex, 1);
//       updatedLists.splice(newIndex, 0, movedList);

//       // Update nilai position baru
//       const reorderedLists = updatedLists.map((l, idx) => ({
//         ...l,
//         position: idx + 1,
//       }));

//       // Update UI langsung
//       setLists(reorderedLists);
//       setActiveDropdown(null);

//       // Simpan ke backend
//       await updateListPositions(
//         boardId,
//         reorderedLists.map((l) => ({ id: l.id, position: l.position }))
//       );

//       console.log("✅ List positions updated successfully!");
//     } catch (error) {
//       console.error("❌ Gagal ubah posisi list:", error);
//       alert("Gagal memperbarui posisi list.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-3">
//       {lists.map((list) => (
//         <div
//           key={list.id}
//           className="flex items-center justify-between p-3 border bg-gray-50 rounded-xl"
//         >
//           {/* Nama List + posisi */}
//           <span className="font-medium text-gray-700">
//             {list.name}{" "}
//             <span className="ml-2 text-sm text-blue-500">
//               (Posisi: {list.position})
//             </span>
//           </span>

//           {/* Tombol dropdown */}
//           <div className="relative">
//             <button
//               onClick={() =>
//                 setActiveDropdown(activeDropdown === list.id ? null : list.id)
//               }
//               disabled={loading}
//               className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 transition"
//             >
//               <GiCardExchange className="text-gray-700" />
//               {loading && activeDropdown === list.id
//                 ? "Memproses..."
//                 : "Ubah Posisi"}
//             </button>

//             {/* Dropdown */}
//             {activeDropdown === list.id && (
//               <div
//                 className="absolute right-0 z-50 mt-2 bg-white border shadow-lg w-44 rounded-xl"
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 <div className="px-3 py-2 text-sm font-semibold bg-gray-100 border-b rounded-t-xl">
//                   Pilih Posisi Baru
//                 </div>
//                 <ul className="overflow-y-auto max-h-48">
//                   {lists.map((_, i) => (
//                     <li
//                       key={i}
//                       className={`px-3 py-2 text-sm cursor-pointer transition ${
//                         list.position === i + 1
//                           ? "bg-blue-100 text-blue-700 font-medium"
//                           : "hover:bg-gray-100"
//                       }`}
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleChangeListPosition(list.id, i);
//                       }}
//                     >
//                       Posisi {i + 1}{" "}
//                       {list.position === i + 1 && "✓"}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default PositionList;


// import React, { useState, useEffect } from "react";
// import { reorderListPosition, getListPositions } from "../services/ApiServices";
// import axios from "axios";

// const Board = ({ boardId, showSnackbar }) => {
//   const [lists, setLists] = useState([]);
//   const [listPositionDropdown, setListPositionDropdown] = useState(null); // dropdown aktif
//   const [positions, setPositions] = useState({}); // posisi sementara tiap list

//   useEffect(() => {
//     fetchLists();
//   }, [boardId]);

//   const fetchLists = async () => {
//     try {
//       const res = await axios.get(`http://localhost:5000/api/lists?board_id=${boardId}`);
//       setLists(res.data);

//       // Simpan posisi awal
//       const pos = {};
//       res.data.forEach((l) => (pos[l.id] = l.position));
//       setPositions(pos);
//     } catch (err) {
//       console.error("Failed to fetch lists:", err);
//     }
//   };

//   // 🔁 FUNCTION: Change List Position
//   const handleChangeListPosition = async (listId, newPosition) => {
//     try {
//       await reorderListPosition(listId, newPosition, boardId);

//       setListPositionDropdown(null); // Tutup dropdown setelah update
//       await fetchLists(); // Refresh list setelah posisi diubah
//       showSnackbar("✅ Success change list position!", "success");
//     } catch (error) {
//       console.error("Error changing list position:", error);
//       showSnackbar("❌ Failed to change list position, try again!", "error");
//     }
//   };

//   return (
//     <div className="board-container" style={{ padding: "20px" }}>
//       <h2 className="mb-3 text-lg font-semibold">🧱 Manage List Positions</h2>

//       {lists.map((list) => (
//         <div
//           key={list.id}
//           className="list-item"
//           style={{
//             border: "1px solid #ddd",
//             borderRadius: "8px",
//             padding: "10px",
//             marginBottom: "10px",
//             position: "relative",
//             background: "#fafafa",
//           }}
//         >
//           <strong>{list.title}</strong>
//           <button
//             style={{ marginLeft: "10px" }}
//             onClick={() =>
//               setListPositionDropdown(
//                 listPositionDropdown === list.id ? null : list.id
//               )
//             }
//           >
//             Posisi: {list.position}
//           </button>

//           {listPositionDropdown === list.id && (
//             <ul
//               style={{
//                 listStyle: "none",
//                 padding: "5px",
//                 margin: "5px 0 0 0",
//                 border: "1px solid #ccc",
//                 borderRadius: "4px",
//                 position: "absolute",
//                 background: "#fff",
//                 zIndex: 10,
//                 minWidth: "100px",
//               }}
//             >
//               {lists.map((_, i) => (
//                 <li
//                   key={i}
//                   style={{
//                     padding: "5px 10px",
//                     cursor: "pointer",
//                     background: i === list.position ? "#eee" : "#fff",
//                   }}
//                   onClick={() => handleChangeListPosition(list.id, i)}
//                 >
//                   {i}
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default Board;


//6. update board name
app.put('/api/boards/:id/name', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user.id;

    try {
        const result = await client.query(
            "UPDATE boards SET name = $1, update_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
            [name, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Boards is not found' });
        }

        //CHECK USER ID
        console.log('endpoin update board name ini menerima userId:', userId);

        //LOG ACTIVITY 
        await logActivity(
            'board',
            result.rows[0].id,
            'update',
            userId,
            `Board name updated to '${name}' in board`,
            'board',
            id
        )

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating board name:', error);
        res.status(500).json({ error: error.message });
    }
})
//7. update description boards
app.put('/api/boards/:id/description', async (req, res) => {
    const { id } = req.params;
    const { description } = req.body;
    const userId = req.user.id;

    try {
        const result = await client.query(
            "UPDATE boards SET description = $1, update_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
            [description, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Boards is not found' });
        }

        //check user id
        console.log('Endpoin update desctiption ini menerima userId:', userId);

        //log activity
        await logActivity(
            'board',
            result.rows[0].id,
            'update',
            userId,
            `Board description updated to '${description}' in board`,
            'board',
            id
        )

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating board name:', error);
        res.status(500).json({ error: error.message });
    }

})


// ✅ GET: semua boards (urut berdasarkan position)
app.get('/api/boards', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM public.boards ORDER BY position ASC');
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No boards found' });
    }
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error fetching boards' });
  }
});


// ✅ GET: semua board berdasarkan workspace_id (urut by position)
app.get('/api/workspaces/:workspaceId/boards', async (req, res) => {
  const { workspaceId } = req.params;
  try {
    const result = await client.query(
      'SELECT * FROM boards WHERE workspace_id = $1 ORDER BY position ASC',
      [workspaceId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ✅ CREATE: board baru disimpan di posisi terakhir workspace-nya
app.post('/api/boards', async (req, res) => {
  const { user_id, name, description, workspace_id } = req.body;

  try {
    // Hitung jumlah board di workspace untuk menentukan posisi baru
    const { rows: existingBoards } = await client.query(
      'SELECT COUNT(*) AS count FROM boards WHERE workspace_id = $1',
      [workspace_id]
    );
    const newPosition = parseInt(existingBoards[0].count) + 1;

    const result = await client.query(
      `INSERT INTO boards (user_id, name, description, workspace_id, position, create_at) 
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) 
       RETURNING *`,
      [user_id, name, description, workspace_id, newPosition]
    );

    const boardId = result.rows[0].id;

    await logActivity(
      'board',
      boardId,
      'create',
      user_id,
      `Board '${name}' created`,
      'workspace',
      workspace_id
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error creating board:', error);
    res.status(500).json({ error: error.message });
  }
});


// ✅ UPDATE board (name, description, dll tetap sama)
app.put('/api/boards/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, background_image_id, assign } = req.body;

  try {
    const result = await client.query(
      `UPDATE boards 
       SET name = $1, description = $2, background_image_id = $3, assign = $4, update_at = CURRENT_TIMESTAMP 
       WHERE id = $5 RETURNING *`,
      [name, description, background_image_id, assign, id]
    );

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'Board not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ✅ UPDATE board name (tidak ubah position)
app.put('/api/boards/:id/name', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const userId = req.user.id;

  try {
    const result = await client.query(
      `UPDATE boards 
       SET name = $1, update_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [name, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Board not found' });
    }

    await logActivity(
      'board',
      result.rows[0].id,
      'update',
      userId,
      `Board name updated to '${name}'`,
      'board',
      id
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating board name:', error);
    res.status(500).json({ error: error.message });
  }
});


// ✅ DELETE board (setelah hapus, posisinya diresekuens)
app.delete('/api/boards/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    await client.query('BEGIN');

    // ambil workspace_id dulu biar tau konteks posisi
    const { rows } = await client.query('SELECT workspace_id FROM boards WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Board not found' });
    }
    const workspaceId = rows[0].workspace_id;

    await client.query('DELETE FROM boards WHERE id = $1', [id]);

    // resekuens posisi board di workspace ini
    await client.query(
      `WITH reordered AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY position) AS new_pos
        FROM boards WHERE workspace_id = $1
      )
      UPDATE boards b
      SET position = r.new_pos
      FROM reordered r
      WHERE b.id = r.id`,
      [workspaceId]
    );

    await logActivity(
      'board',
      id,
      'delete',
      userId,
      `Board dengan Id ${id} deleted`,
      'workspace',
      workspaceId
    );

    await client.query('COMMIT');
    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
