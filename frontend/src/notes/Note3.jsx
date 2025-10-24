// Tambahkan state untuk form
const [form, setForm] = useState({
  detail_project: ''
});

// Setelah dataMarketingDesign di-fetch, sinkronkan form.detail_project
useEffect(() => {
  if (dataMarketingDesign?.detail_project) {
    setForm((prev) => ({
      ...prev,
      detail_project: dataMarketingDesign.detail_project,
    }));
  }
}, [dataMarketingDesign]);

// Fungsi untuk handle perubahan dari ReactQuill
const handleChangeQuill = (value) => {
  setForm((prevForm) => ({
    ...prevForm,
    detail_project: value || '', // fallback empty string untuk keamanan
  }));
};


// MEDIA CHATS 
app.post('/api/chats/:chatId/media', upload.single('file'), async (req, res) => {
    const { chatId } = req.params;

    if (!req.file || !chatId) {
        return res.status(400).json({ error: 'Missing file or chatId' });
    }

    try {
        // Upload buffer ke Cloudinary
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    resource_type: 'auto', // auto = bisa image, video, pdf, dll
                    folder: 'trello_chat_media',
                    public_id: `${Date.now()}-${req.file.originalname}`,
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(req.file.buffer);
        });

        const fileUrl = result.secure_url;
        const fileName = req.file.originalname;

        // Tentukan tipe media berdasarkan mimetype
        const mimeType = req.file.mimetype;
        let mediaType = 'file';
        if (mimeType.startsWith('image/')) mediaType = 'image';
        else if (mimeType.startsWith('video/')) mediaType = 'video';
        else if (mimeType.startsWith('audio/')) mediaType = 'audio';

        // Simpan ke tabel card_chats_media
        const dbResult = await client.query(
            `INSERT INTO card_chats_media (chat_id, media_url, media_type)
             VALUES ($1, $2, $3) RETURNING *`,
            [chatId, fileUrl, mediaType]
        );

        res.status(201).json(dbResult.rows[0]);
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed', message: error.message });
    }
});

// END MEDIA CHATS 
