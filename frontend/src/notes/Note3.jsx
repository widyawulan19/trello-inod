// 3. Cek apakah marketing design sudah di-export
export const getExportMarketingDesign = (marketingDesignId) =>
  axios.get(`${API_URL}/marketing-design-export/${marketingDesignId}`);

// Ambil semua data export
export const getAllMarketingExports = async () => {
  try {
    const res = await axios.get(`${API_URL}/marketing-exports`);
    return res.data;
  } catch (err) {
    console.error("❌ Gagal ambil marketing_exports:", err);
    throw err;
  }
};


// 2. Ambil semua data export
app.get("/api/marketing-exports", async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM marketing_exports ORDER BY exported_at DESC");
        res.json(result.rows);
    } catch (error) {
        console.error("❌ Error get marketing_exports:", error);
        res.status(500).json({ success: false, message: "Gagal ambil data" });
    }
});

app.get('/api/marketing-design-export', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM marketing_design_exports ORDER BY exported_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error get all data marketing design export', error);
        res.status(500).json({ success: false, message: "Gagal ambil data" });
    }
})