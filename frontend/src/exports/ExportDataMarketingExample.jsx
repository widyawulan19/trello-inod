
import { useEffect, useState } from "react";
import { getAllDataMarketingJoined, exportDataMarketingToSheets } from "../services/ApiServices";

const ExportDataMarketingExample = () => {
  const [marketingList, setMarketingList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch semua data marketing
  const fetchMarketingData = async () => {
    try {
      setLoading(true);
      const res = await getAllDataMarketingJoined();
      setMarketingList(res.data);
    } catch (err) {
      console.error("❌ Gagal fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Kirim satu data ke Google Sheets
  const handleExportToSheet = async (marketingData) => {
    try {
      setLoading(true);
      await exportDataMarketingToSheets({ marketingData }); // pastikan service kirim body { marketingData }
      alert(`✅ Data "${marketingData.buyer_name}" berhasil dikirim ke Google Sheets`);
    } catch (err) {
      console.error("❌ Gagal kirim ke Sheets:", err);
      alert(`❌ Gagal kirim data "${marketingData.buyer_name}"`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketingData();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Marketing Dashboard</h1>

      {loading && <p>Loading...</p>}

      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Buyer</th>
            <th className="border px-4 py-2">Code Order</th>
            <th className="border px-4 py-2">Order Number</th>
            <th className="border px-4 py-2">Deadline</th>
            <th className="border px-4 py-2">Project Type</th>
            <th className="border px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {marketingList.map((item) => (
            <tr key={item.marketing_design_id}>
              <td className="border px-4 py-2">{item.buyer_name}</td>
              <td className="border px-4 py-2">{item.code_order}</td>
              <td className="border px-4 py-2">{item.order_number}</td>
              <td className="border px-4 py-2">{item.deadline}</td>
              <td className="border px-4 py-2">{item.project_type_name}</td>
              <td className="border px-4 py-2">
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  onClick={() => handleExportToSheet(item)}
                >
                  Export to Sheets
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExportDataMarketingExample;