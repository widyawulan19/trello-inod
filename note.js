//PERSONAL AGENDA
//1. create new agenda
app.post('/api/agenda', async (req, res) => {
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

//2. read all agendas for users
app.get('/api/agenda-user/user/:user_id', async (req, res) => {
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

//3. read satu agenda by id (and user)
app.get('/api/agenda-user/:id/user/:user_id', async (req, res) => {
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

//4. update agenda
app.put('/api/agenda/:id/user/:user_id', async (req, res) => {
  const { id, user_id } = req.params;
  const { title, description, agenda_date, reminder_time, status_id, is_notified, is_done } = req.body;

  try {
    const result = await client.query(
      `UPDATE agenda_personal
       SET title = $1,
           description = $2,
           agenda_date = $3,
           reminder_time = $4,
           status_id = $5,
           is_notified = $6,
           is_done = $7,
           updated_at = NOW()
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
      [title, description, agenda_date, reminder_time, status_id, is_notified,is_done, id, user_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Agenda not found or unauthorized' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//5. delete agenda
app.delete('/api/agenda-user/:id/user/:user_id', async (req, res) => {
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

// 6. mark check agenda (get unfinished agendas)
app.get('/api/unfinished-agendas/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await client.query(`
      SELECT * FROM agenda_personal 
      WHERE user_id = $1 
        AND is_done = false
      ORDER BY agenda_date ASC
    `, [userId]);

    res.json({
      count: result.rowCount,
      data: result.rows,
      message: result.rowCount > 0 
        ? 'Unfinished agendas fetched successfully'
        : 'No unfinished agendas found'
    });
  } catch (err) {
    console.error('Error fetching unfinished agendas:', err);
    res.status(500).json({ error: 'Failed to fetch unfinished agendas' });
  }
});


//6.1 mark check agenda (get finish agendas)
app.get('/api/finish-agendas/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await client.query(`
      SELECT * FROM agenda_personal 
      WHERE user_id = $1 
        AND is_done = true
      ORDER BY agenda_date ASC
    `, [userId]);

    res.json({
      count: result.rowCount,
      data: result.rows,
      message: result.rowCount > 0 ? 'Finished agendas fetched successfully' : 'No finished agendas found'
    });
  } catch (err) {
    console.error('Error fetching finished agendas:', err);
    res.status(500).send('Failed to fetch finished agendas');
  }
});


//7. endpoin checkmark agenda 
app.put('/api/finish-agenda/:agendaId', async (req, res) => {
  const { agendaId } = req.params;

  try {
    const result = await client.query(`
      UPDATE agenda_personal 
      SET is_done = true 
      WHERE id = $1
      RETURNING *
    `, [agendaId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Agenda not found' });
    }

    res.json({
      message: 'Agenda marked as finished',
      updatedAgenda: result.rows[0]
    });
  } catch (err) {
    console.error('Error updating agenda:', err);
    res.status(500).send('Failed to update agenda');
  }
});

// 7. Update is_done value (true or false)
app.put('/api/update-agenda-status/:agendaId', async (req, res) => {
  const { agendaId } = req.params;
  const { is_done } = req.body; // frontend kirim nilai true atau false

  try {
    const result = await client.query(`
      UPDATE agenda_personal 
      SET is_done = $1 
      WHERE id = $2
      RETURNING *
    `, [is_done, agendaId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Agenda not found' });
    }

    res.json({
      message: `Agenda status updated to ${is_done}`,
      updatedAgenda: result.rows[0]
    });
  } catch (err) {
    console.error('Error updating agenda status:', err);
    res.status(500).send('Failed to update agenda status');
  }
});


// 7. Update is_done value (true or false) universal
app.put('/api/update-agenda-status/:agendaId', async (req, res) => {
  const { agendaId } = req.params;
  const { is_done } = req.body; // frontend kirim nilai true atau false

  try {
    const result = await client.query(`
      UPDATE agenda_personal 
      SET is_done = $1 
      WHERE id = $2
      RETURNING *
    `, [is_done, agendaId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Agenda not found' });
    }

    res.json({
      message: `Agenda status updated to ${is_done}`,
      updatedAgenda: result.rows[0]
    });
  } catch (err) {
    console.error('Error updating agenda status:', err);
    res.status(500).send('Failed to update agenda status');
  }
});

// 8. Update is_done with user check
app.put('/api/update-agenda-status/:agendaId/user/:userId', async (req, res) => {
  const { agendaId, userId } = req.params;
  const { is_done} = req.body;

  try {
    // Pastikan agenda ini milik user yang benar
    const check = await client.query(
      'SELECT * FROM agenda_personal WHERE id = $1 AND user_id = $2',
      [agendaId, userId]
    );

    if (check.rowCount === 0) {
      return res.status(403).json({ message: 'Agenda not found or access denied' });
    }

    const result = await client.query(
      'UPDATE agenda_personal SET is_done = $1 WHERE id = $2 RETURNING *',
      [is_done, agendaId]
    );

    res.json({
      message: `Agenda status updated to ${is_done}`,
      updatedAgenda: result.rows[0]
    });
  } catch (err) {
    console.error('Error updating agenda status:', err);
    res.status(500).send('Failed to update agenda status');
  }
});
