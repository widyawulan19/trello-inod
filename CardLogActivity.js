// const client = require('./connection'); // PostgreSQL client dari file `connection.js`

// /**
//  * Fungsi untuk mencatat log aktivitas pada entitas card dan turunannya.
//  * @param {Object} options
//  * @param {string} options.action - Tindakan yang dilakukan (add, update, delete, assign, etc.)
//  * @param {number} options.card_id - ID dari card utama
//  * @param {number} options.user_id - ID user yang melakukan aksi
//  * @param {string} [options.entity] - Nama entitas tambahan (misal: 'cover', 'label', 'assign')
//  * @param {number} [options.entity_id] - ID entitas tambahan (optional)
//  * @param {string|Object|null} [options.details] - Detail aktivitas (plain text atau object akan di-convert ke JSON)
//  */
// async function logCardActivity({ action, card_id, user_id, entity = null, entity_id = null, details = null }) {
//   console.log("📝 logCardActivity called with:", {
//     action,
//     card_id,
//     user_id,
//     entity,
//     entity_id,
//     details,
//   })

//   if (!card_id || !user_id || !action) {
//     console.error("❌ logCardActivity error: card_id, user_id, or action missing!");
//     throw new Error('card_id, user_id, and action are required');
//   }

//   const finalDetails = typeof details === 'object' ? JSON.stringify(details) : details;

//   await client.query(`
//     INSERT INTO card_activities (card_id, user_id, action_type, entity, entity_id, action_detail, created_at)
//     VALUES ($1, $2, $3, $4, $5, $6, NOW())
//   `, [card_id, user_id, action, entity, entity_id, finalDetails]);
// }

// module.exports = { logCardActivity };



const client = require('./connection');

async function logCardActivityMultiple({ action, card_id, user_ids, entity = null, entity_id = null, details = null }) {
  if (!card_id || !user_ids || !action || !Array.isArray(user_ids) || user_ids.length === 0) {
    throw new Error('card_id, user_ids (array), and action are required');
  }

  const finalDetails = typeof details === 'object' ? JSON.stringify(details) : details;

  const queries = user_ids.map(user_id => {
    return client.query(
      `INSERT INTO card_activities (card_id, user_id, action_type, entity, entity_id, action_detail, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [card_id, user_id, action, entity, entity_id, finalDetails]
    );
  });

  await Promise.all(queries);
  console.log(`📝 Logged activity "${action}" for users: ${user_ids.join(', ')}`);
}

module.exports = { logCardActivityMultiple };
