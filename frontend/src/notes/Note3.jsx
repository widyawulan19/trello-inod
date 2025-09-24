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
