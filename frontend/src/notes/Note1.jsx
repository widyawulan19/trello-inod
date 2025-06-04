// const express = require('express');
// const router = express.Router();
// const client = require('./connect'); // path ke file koneksi PostgreSQL kamu

// router.get('/api/card-location', async (req, res) => {
//   const { workspaceId, cardId } = req.query;

//   if (!workspaceId || !cardId) {
//     return res.status(400).json({ error: 'workspaceId dan cardId wajib diisi' });
//   }

//   try {
//     const result = await client.query(`
//       SELECT 
//         w.id AS workspace_id,
//         b.id AS board_id,
//         l.id AS list_id,
//         c.id AS card_id
//       FROM workspaces w
//       JOIN boards b ON b.workspace_id = w.id
//       JOIN lists l ON l.board_id = b.id
//       JOIN cards c ON c.list_id = l.id
//       WHERE w.id = $1 AND c.id = $2
//       LIMIT 1
//     `, [workspaceId, cardId]);

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'Data tidak ditemukan' });
//     }

//     res.json(result.rows[0]);
//   } catch (error) {
//     console.error('Gagal mengambil lokasi card:', error.message);
//     res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data' });
//   }
// });

// module.exports = router;


// // 5. function navigate to
// const handleNavigate = async (notif) => {
//   const { type, card_id } = notif;

//   if (type === 'workspace_assigned') {
//     const workspaceId = notif.workspace_id || notif.message.match(/\d+/)?.[0]; // fallback kalau workspace_id belum dikirim
//     if (workspaceId) {
//       navigate(`/workspaces/${workspaceId}/boards`);
//     }
//   } else if (type === 'card_assigned') {
//     try {
//       const response = await fetch(`http://localhost:5000/api/card-location?workspaceId=${notif.workspace_id}&cardId=${card_id}`);
//       const data = await response.json();

//       const { workspace_id, board_id, list_id, card_id } = data;
//       if (workspace_id && board_id && list_id && card_id) {
//         navigate(`/workspaces/${workspace_id}/boards/${board_id}/lists/${list_id}/cards/${card_id}`);
//       } else {
//         console.warn("Card location data incomplete", data);
//       }
//     } catch (err) {
//       console.error("Failed to fetch card location:", err);
//     }
//   } else {
//     console.log("Unknown type, no navigation performed.");
//   }
// };


// import { getPathToSystemNotif } from '../services/ApiServices';

// const handleNavigate = async (notif) => {
//   const { type, workspace_id, card_id } = notif;

//   if (type === 'workspace_assigned') {
//     navigate(`/workspaces/${workspace_id}/boards`);
//   }

//   if (type === 'card_assigned') {
//     try {
//       const res = await getPathToSystemNotif(workspace_id, card_id);
//       const data = res.data;

//       const { workspace_id, board_id, list_id, card_id } = data;
//       navigate(`/workspaces/${workspace_id}/boards/${board_id}/lists/${list_id}/cards/${card_id}`);
//     } catch (error) {
//       console.error('Failed to get card path:', error);
//     }
//   }
// };


// app.get('/api/card/:cardId/card-location', async (req, res) => {
//   const { cardId } = req.params;

//   if (!cardId) {
//     return res.status(400).json({ error: 'cardId wajib diisi' });
//   }

//   try {
//     const result = await client.query(`
//       SELECT 
//         w.id AS workspace_id,
//         b.id AS board_id,
//         l.id AS list_id,
//         c.id AS card_id
//       FROM cards c
//       JOIN lists l ON c.list_id = l.id
//       JOIN boards b ON l.board_id = b.id
//       JOIN workspaces w ON b.workspace_id = w.id
//       WHERE c.id = $1
//       LIMIT 1
//     `, [cardId]);

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'Data tidak ditemukan' });
//     }

//     res.json(result.rows[0]);
//   } catch (error) {
//     console.error('Gagal mengambil lokasi card:', error.message);
//     res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data' });
//   }
// });


// // backend/routes/notifications.js

// const express = require('express');
// const router = express.Router();
// const pool = require('../connect'); // koneksi ke PostgreSQL

// router.get('/unread-count/:userId', async (req, res) => {
//   const { userId } = req.params;

//   try {
//     const query = `
//       SELECT
//         (SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false) AS unread_chat_notifications,
//         (SELECT COUNT(*) FROM system_notifications WHERE user_id = $1 AND is_read = false) AS unread_system_notifications
//     `;

//     const result = await pool.query(query, [userId]);

//     const { unread_chat_notifications, unread_system_notifications } = result.rows[0];

//     res.status(200).json({
//       unreadChatNotifications: unread_chat_notifications,
//       unreadSystemNotifications: unread_system_notifications,
//       totalUnread: unread_chat_notifications + unread_system_notifications
//     });
//   } catch (error) {
//     console.error('Error fetching unread notifications count:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// module.exports = router;


// const {user} = useUser();
//     const userId = user.id;

// maxWidth: '60%',
//     alignSelf: isOwnMessage ? 'flex-end' : 'flex-start',
//     borderBottomRightRadius: isOwnMessage ? '4px' : '16px',
//     borderBottomLeftRadius: isOwnMessage ? '16px' : '4px',
//     boxShadow: isOwnMessage
//       ? '0px 4px 8px #5e12eb46'
//       : '0px 4px 8px rgba(0, 0, 0, 0.1)',