//2. add data note color
app.post('/api/note-colors', async(res, res)=>{
  const {color, color_name} = req.body;
  try{
    const result = await client.query(
      `INSERT INTO notes_color (color, color_name)
      VALUES ($1, $2) RETURNING *`,
      [color, color_name]
    );
    res.status(201).json(result.rows[0]);
  }catch(error){
    res.status(500).json({error: err.message});
  }
})

// put personal note color 
app.put('/api/personal-note/:id/color', async (req, res) => {
  const { id } = req.params;
  const { background_color } = req.body;

  try {
    await client.query(
      'UPDATE personal_notes SET background_color = $1 WHERE id = $2',
      [background_color, id]
    );
    res.json({ message: 'Color updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update color' });
  }
});
