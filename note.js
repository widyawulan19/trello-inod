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

// Update seluruh data karyawan dan jadwal shift
app.put("/api/employee-schedule/:employeeId", async (req, res) => {
  const { employeeId } = req.params;
  const { name, divisi, schedules } = req.body;

  try {
    // Update nama dan divisi employee
    await client.query(
      "UPDATE employees SET name = $1, divisi = $2 WHERE id = $3",
      [name, divisi, employeeId]
    );

    // Hapus semua jadwal lama
    await client.query("DELETE FROM employee_schedules WHERE employee_id = $1", [employeeId]);

    // Masukkan jadwal baru
    for (const s of schedules) {
      await client.query(
        "INSERT INTO employee_schedules (employee_id, day_id, shift_id) VALUES ($1, $2, $3)",
        [employeeId, s.day_id, s.shift_id]
      );
    }

    res.status(200).json({ message: "Data karyawan dan jadwal berhasil diupdate." });
  } catch (err) {
    console.error("Error updating employee schedule:", err);
    res.status(500).json({ error: "Terjadi kesalahan saat mengupdate data." });
  }
});

