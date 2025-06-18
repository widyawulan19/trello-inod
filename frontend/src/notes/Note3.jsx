// GET /api/uploaded-files/:cardId
app.get('/api/uploaded-files/:cardId', async (req, res) => {
  const { cardId } = req.params;

  try {
    const result = await client.query(
      `SELECT * FROM uploaded_files WHERE card_id = $1 ORDER BY uploaded_at DESC`,
      [cardId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Failed to fetch uploaded files' });
  }
});

// DELETE /api/uploaded-files/:id
app.delete('/api/uploaded-files/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Ambil dulu file_url untuk referensi hapus dari Cloudinary kalau perlu
    const findResult = await client.query(
      `SELECT file_url FROM uploaded_files WHERE id = $1`,
      [id]
    );

    if (findResult.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const fileUrl = findResult.rows[0].file_url;

    // (Opsional) Hapus file dari Cloudinary kalau disimpan di sana
    // Pastikan kamu parsing public_id dari URL
    // const publicId = ... // logic parsing
    // await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });

    // Hapus dari database
    await client.query(`DELETE FROM uploaded_files WHERE id = $1`, [id]);

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});
