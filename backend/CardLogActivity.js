const client = require('./connection'); // PostgreSQL client dari file `connection.js`

/**
 * Fungsi untuk mencatat log aktivitas pada entitas card dan turunannya.
 * @param {Object} options
 * @param {string} options.action - Tindakan yang dilakukan (add, update, delete, assign, etc.)
 * @param {number} options.card_id - ID dari card utama
 * @param {number} options.user_id - ID user yang melakukan aksi
 * @param {string} [options.entity] - Nama entitas tambahan (misal: 'cover', 'label', 'assign')
 * @param {number} [options.entity_id] - ID entitas tambahan (optional)
 * @param {string|Object|null} [options.details] - Detail aktivitas (plain text atau object akan di-convert ke JSON)
 */
async function logCardActivity({ action, card_id, user_id, entity = null, entity_id = null, details = null }) {
  console.log("📝 logCardActivity called with:", {
    action,
    card_id,
    user_id,
    entity,
    entity_id,
    details,
  });

  if (!card_id || !user_id || !action) {
    console.error("❌ logCardActivity error: card_id, user_id, or action missing!");
    throw new Error('card_id, user_id, and action are required');
  }

  const finalDetails = typeof details === 'object' ? JSON.stringify(details) : details;

  await client.query(`
    INSERT INTO card_activities (card_id, user_id, action_type, entity, entity_id, action_detail, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW())
  `, [card_id, user_id, action, entity, entity_id, finalDetails]);
}

module.exports = { logCardActivity };


//cara pemakaian di endpoin relasi
// const { logCardActivity } = require('../helpers/cardActivityLogger');

// app.put('/api/cards/:cardId/cover', async (req, res) => {
//   const { cardId } = req.params;
//   const { cover_id } = req.body;
//   const userId = req.user.id;

//   try {
//     const existing = await client.query("SELECT * FROM card_cover WHERE card_id = $1", [cardId]);

//     let action;
//     let details;

//     if (existing.rows.length > 0) {
//       await client.query("UPDATE card_cover SET cover_id = $1 WHERE card_id = $2", [cover_id, cardId]);
//       action = "update";
//       details = { old_cover_id: existing.rows[0].cover_id, new_cover_id: cover_id };
//     } else {
//       await client.query("INSERT INTO card_cover (card_id, cover_id) VALUES ($1, $2)", [cardId, cover_id]);
//       action = "add";
//       details = { cover_id };
//     }

//     // Log activity
//     await logCardActivity({
//       action,
//       card_id: cardId,
//       user_id: userId,
//       entity: 'cover',
//       entity_id: cover_id,
//       details,
//     });

//     res.status(200).json({ message: `Cover ${action}ed`, cover_id });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to update cover" });
//   }
// });
