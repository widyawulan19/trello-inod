const express = require('express');
const router = express.Router();
const client = require('../connect'); // koneksi PostgreSQL kamu

// ✅ CREATE agenda
router.post('/', async (req, res) => {
  const { user_id, title, description, agenda_date, reminder_time, status_id } = req.body;
  try {
    const result = await client.query(
      `INSERT INTO agenda_personal (user_id, title, description, agenda_date, reminder_time, status_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user_id, title, description, agenda_date, reminder_time, status_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ READ all agendas for a user
router.get('/user/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    const result = await client.query(
      `SELECT a.*, s.name as status_name, s.color 
       FROM agenda_personal a
       LEFT JOIN agenda_status s ON a.status_id = s.id
       WHERE a.user_id = $1
       ORDER BY a.agenda_date ASC`,
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ READ single agenda by id (and user)
router.get('/:id/user/:user_id', async (req, res) => {
  const { id, user_id } = req.params;
  try {
    const result = await client.query(
      `SELECT a.*, s.name as status_name, s.color 
       FROM agenda_personal a
       LEFT JOIN agenda_status s ON a.status_id = s.id
       WHERE a.id = $1 AND a.user_id = $2`,
      [id, user_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Agenda not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ UPDATE agenda
router.put('/:id/user/:user_id', async (req, res) => {
  const { id, user_id } = req.params;
  const { title, description, agenda_date, reminder_time, status_id, is_notified } = req.body;

  try {
    const result = await client.query(
      `UPDATE agenda_personal
       SET title = $1,
           description = $2,
           agenda_date = $3,
           reminder_time = $4,
           status_id = $5,
           is_notified = $6,
           updated_at = NOW()
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [title, description, agenda_date, reminder_time, status_id, is_notified, id, user_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Agenda not found or unauthorized' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE agenda
router.delete('/:id/user/:user_id', async (req, res) => {
  const { id, user_id } = req.params;
  try {
    const result = await client.query(
      `DELETE FROM agenda_personal WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, user_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Agenda not found or unauthorized' });
    res.json({ message: 'Agenda deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


//endpoin status agenda

// ✅ Get all agenda status
router.get('/', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM agenda_status ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get single status by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('SELECT * FROM agenda_status WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Status not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Create new status
router.post('/', async (req, res) => {
  const { name, description, color } = req.body;
  try {
    const result = await client.query(
      `INSERT INTO agenda_status (name, description, color)
       VALUES ($1, $2, $3) RETURNING *`,
      [name, description, color]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update status
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, color } = req.body;
  try {
    const result = await client.query(
      `UPDATE agenda_status SET name = $1, description = $2, color = $3 WHERE id = $4 RETURNING *`,
      [name, description, color, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Status not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete status (with safety: only if not used in agenda_personal)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Cek apakah ada agenda menggunakan status ini
    const check = await client.query('SELECT 1 FROM agenda_personal WHERE status_id = $1 LIMIT 1', [id]);
    if (check.rows.length > 0) {
      return res.status(400).json({ message: 'Cannot delete status: already used in agenda_personal' });
    }

    const result = await client.query('DELETE FROM agenda_status WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Status not found' });

    res.json({ message: 'Status deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get single agenda + status by agenda_id and user_id
router.get('/:id/user/:user_id', async (req, res) => {
  const { id, user_id } = req.params;

  try {
    const result = await client.query(
      `SELECT 
          a.*, 
          s.name AS status_name, 
          s.description AS status_description,
          s.color AS status_color
       FROM agenda_personal a
       LEFT JOIN agenda_status s ON a.status_id = s.id
       WHERE a.id = $1 AND a.user_id = $2`,
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Agenda not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// INSERT INTO agenda_status (name, description, color) VALUES
('trivial', 'Very low importance. Not urgent and can be postponed easily.', '#B0BEC5'),
('optional', 'Optional activity. Does not affect your main goals.', '#90A4AE'),
('normal', 'Regular agenda item. Important but not urgent.', '#42A5F5'),
('important', 'High importance. Should be prioritized.', '#FB8C00'),
('critical', 'Extremely important and time-sensitive. Must not be missed.', '#E53935');

// INSERT INTO agenda_personal (user_id, title, description, agenda_date, reminder_time, status_id)
// VALUES
(3, 'Rapat Tim Marketing', 'Bahas strategi kampanye Q3', '2025-07-20', '2025-07-20 09:00:00', 1),
(3, 'Review Project Alpha', 'Tinjau progress dan deliverable Project Alpha', '2025-07-22', '2025-07-22 10:30:00', 2),
(3, 'Meeting Client ABC', 'Diskusi ulang kontrak dan requirement', '2025-07-24', '2025-07-24 14:00:00', 1),
(3, 'Persiapan Presentasi', 'Siapkan slide untuk presentasi ke direksi', '2025-07-25', '2025-07-25 08:00:00', 3),
(3, 'Jurnal Harian', 'Catatan aktivitas dan refleksi pribadi', '2025-07-26', '2025-07-26 19:00:00', 3);
