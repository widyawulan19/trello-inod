const client = require('./connection'); // Sesuaikan path dengan lokasi koneksi DB kamu

async function SystemNotification({ userId, cardId = null,workspaceId, message, type }) {
  try {
    await client.query(
      `INSERT INTO system_notifications (user_id, card_id, workspace_id, message, type, created_at)
       VALUES ($1, $2, $3, $4, $5,now())`,
      [userId, cardId, workspaceId, message, type]
    );
  } catch (error) {
    console.error('Failed to create system notification:', error.message);
    // Optional: throw error kalau mau ditangani di endpoint
  }
}

module.exports = {SystemNotification};
