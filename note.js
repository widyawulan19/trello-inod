// NEW SCHEDULE EMPLOYEE
//1. view data schedule employee 
app.get('/api/employee-schedule/view', async (req, res) => {
  try {
    const result = await client.query(`
      SELECT 
        e.name,
        e.divisi,
        MAX(CASE WHEN d.name = 'Senin' THEN s.name END) AS senin,
        MAX(CASE WHEN d.name = 'Selasa' THEN s.name END) AS selasa,
        MAX(CASE WHEN d.name = 'Rabu' THEN s.name END) AS rabu,
        MAX(CASE WHEN d.name = 'Kamis' THEN s.name END) AS kamis,
        MAX(CASE WHEN d.name = 'Jumat' THEN s.name END) AS jumat,
        MAX(CASE WHEN d.name = 'Sabtu' THEN s.name END) AS sabtu,
        MAX(CASE WHEN d.name = 'Minggu' THEN s.name END) AS minggu
      FROM employee_schedules es
      JOIN employees e ON es.employee_id = e.id
      JOIN day d ON es.day_id = d.id
      JOIN shift_employee s ON es.shift_id = s.id
      GROUP BY e.id, e.name, e.divisi
      ORDER BY e.name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//1.2 view data shcedule employee by employee id
app.get('/api/employee-schedule/view/:employeeId', async (req, res) => {
  const {employeeId} = req.params;

  try {
    const result = await client.query(`
      SELECT 
        e.id,
        e.name,
        e.divisi,
        MAX(CASE WHEN d.name = 'Senin' THEN s.name END) AS senin,
        MAX(CASE WHEN d.name = 'Selasa' THEN s.name END) AS selasa,
        MAX(CASE WHEN d.name = 'Rabu' THEN s.name END) AS rabu,
        MAX(CASE WHEN d.name = 'Kamis' THEN s.name END) AS kamis,
        MAX(CASE WHEN d.name = 'Jumat' THEN s.name END) AS jumat,
        MAX(CASE WHEN d.name = 'Sabtu' THEN s.name END) AS sabtu,
        MAX(CASE WHEN d.name = 'Minggu' THEN s.name END) AS minggu
      FROM employee_schedules es
      JOIN employees e ON es.employee_id = e.id
      JOIN day d ON es.day_id = d.id
      JOIN shift_employee s ON es.shift_id = s.id
      WHERE e.id = $1
      GROUP BY e.id, e.name, e.divisi
    `, [employeeId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Employee schedule not found.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching employee schedule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


//2. post endpoin 
app.post("/api/employee-schedule", async (req, res) => {
  const { name, divisi, schedules } = req.body;

  try {
    // 1. Cek apakah employee sudah ada
    const employeeCheck = await client.query(
      "SELECT id FROM employees WHERE name = $1 AND divisi = $2",
      [name, divisi]
    );

    let employeeId;

    if (employeeCheck.rows.length > 0) {
      // Sudah ada
      employeeId = employeeCheck.rows[0].id;
    } else {
      // Belum ada, tambahkan employee
      const insertEmployee = await client.query(
        "INSERT INTO employees (name, divisi) VALUES ($1, $2) RETURNING id",
        [name, divisi]
      );
      employeeId = insertEmployee.rows[0].id;
    }

    // 2. Simpan shift untuk setiap hari ke tabel employee_schedules
    for (const s of schedules) {
      await client.query(
        `INSERT INTO employee_schedules (employee_id, day_id, shift_id)
         VALUES ($1, $2, $3)`,
        [employeeId, s.day_id, s.shift_id]
      );
    }

    res.status(201).json({ message: "Jadwal shift berhasil disimpan!" });
  } catch (err) {
    console.error("Error saving employee schedule:", err);
    res.status(500).json({ error: "Terjadi kesalahan saat menyimpan shift." });
  }
});

//3. Update seluruh data karyawan dan jadwal shift
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

//4. Update hanya jadwal shift tanpa mengubah nama dan divisi
app.put("/api/employee-schedule/:employeeId/schedules", async (req, res) => {
  const { employeeId } = req.params;
  const { schedules } = req.body;

  try {
    // Hapus semua jadwal lama
    await client.query("DELETE FROM employee_schedules WHERE employee_id = $1", [employeeId]);

    // Masukkan jadwal baru
    for (const s of schedules) {
      await client.query(
        "INSERT INTO employee_schedules (employee_id, day_id, shift_id) VALUES ($1, $2, $3)",
        [employeeId, s.day_id, s.shift_id]
      );
    }

    res.status(200).json({ message: "Jadwal shift berhasil diupdate." });
  } catch (err) {
    console.error("Error updating schedules:", err);
    res.status(500).json({ error: "Terjadi kesalahan saat mengupdate jadwal." });
  }
});

//5. delete schedule employee by employee id
app.delete("/api/employee-schedule/:employeeId", async (req, res) => {
  const { employeeId } = req.params;

  try {
    const result = await client.query(
      "DELETE FROM employee_schedules WHERE employee_id = $1",
      [employeeId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Jadwal tidak ditemukan untuk employee ini." });
    }

    res.status(200).json({ message: "Jadwal shift berhasil dihapus." });
  } catch (err) {
    console.error("Error deleting schedules:", err);
    res.status(500).json({ error: "Terjadi kesalahan saat menghapus jadwal." });
  }
});



