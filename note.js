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