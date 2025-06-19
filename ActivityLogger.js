// src/helpers/activityLogger.js
const client = require('./connection'); // Mengimpor client yang sudah kamu buat

async function logActivity(entity_type, entity_id, action, user_id, details = null, parent_entity = null, parent_entity_id = null) {
  console.log("📍 logActivity called with:", {
    entity_type,
    entity_id,
    action,
    user_id,
    details,
    parent_entity,
    parent_entity_id,
  });

  if (!entity_id) {
    console.error("❌ logActivity error: entity_id is NULL!");
    throw new Error('entity_id is required for logging activity');
  }

  await client.query(`
    INSERT INTO activity_logs (entity_type, entity_id, action, user_id, details, parent_entity, parent_entity_id, timestamp)
    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
  `, [entity_type, entity_id, action, user_id, details, parent_entity, parent_entity_id]);
}


module.exports = { logActivity };
