// cronJob.js
const cron = require('node-cron');
const client = require('./backend/connection'); // file koneksi ke PostgreSQL kamu
const dayjs = require('dayjs');

cron.schedule('0 0 * * *', async () => {
  const now = dayjs();
  const threeDaysLater = now.add(3, 'day').toISOString();

  try {
    const { rows: cards } = await client.query(`
      SELECT c.id as card_id, c.title, c.due_date, cu.user_id
      FROM cards c
      JOIN card_users cu ON c.id = cu.card_id
      WHERE c.due_date BETWEEN NOW() AND $1
    `, [threeDaysLater]);

    for (const card of cards) {
      const message = `Reminder: Card "${card.title}" is due on ${dayjs(card.due_date).format('DD MMM YYYY')}`;

      await client.query(`
        INSERT INTO notifications (user_id, message, type)
        VALUES ($1, $2, 'due_soon')
      `, [card.user_id, message]);

      console.log(`Notified user ${card.user_id} for card ${card.card_id}`);
    }

  } catch (err) {
    console.error('Error running cron job:', err);
  }
});
