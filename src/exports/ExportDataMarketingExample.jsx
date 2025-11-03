
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
      await exportDataMarketingToSheets( marketingData ); // pastikan service kirim body { marketingData }
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
    <div className="container mx-auto p-4" style={{border:'1px solid red', overflowX:'auto'}}>
      <h1 className="text-2xl font-bold mb-4">Marketing Dashboard</h1>

      {loading && <p>Loading...</p>}

      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Input By</th>
            <th className="border px-4 py-2">Acc By</th>
            <th className="border px-4 py-2">Buyer Name</th>
            <th className="border px-4 py-2">Code Order</th>
            <th className="border px-4 py-2">Order Number</th>
            <th className="border px-4 py-2">Account</th>
            <th className="border px-4 py-2">Deadline</th>
            <th className="border px-4 py-2">Revisi</th>
            <th className="border px-4 py-2">Order Type</th>
            <th className="border px-4 py-2">Offer Type</th>
            <th className="border px-4 py-2">Jenis Track</th>
            <th className="border px-4 py-2">Genre</th>
            <th className="border px-4 py-2">Price Normal</th>
            <th className="border px-4 py-2">Price Discount</th>
            <th className="border px-4 py-2">Discount</th>
            <th className="border px-4 py-2">Basic Price</th>
            <th className="border px-4 py-2">Kupon Diskon</th>
            <th className="border px-4 py-2">Gig Link</th>
            <th className="border px-4 py-2">Required Files</th>
            <th className="border px-4 py-2">Project Type</th>
            <th className="border px-4 py-2">Duration</th>
            <th className="border px-4 py-2">Reference Link</th>
            <th className="border px-4 py-2">File & Chat Link</th>
            <th className="border px-4 py-2">Detail Project</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {marketingList.map((item) => (
            <tr key={item.marketing_design_id}>
                <td className="border px-4 py-2">{item.input_by_name}</td>
                <td className="border px-4 py-2">{item.acc_by_name}</td>
                <td className="border px-4 py-2">{item.buyer_name}</td>
                <td className="border px-4 py-2">{item.code_order}</td>
                <td className="border px-4 py-2">{item.order_number}</td>
                <td className="border px-4 py-2">{item.account_name}</td>
                <td className="border px-4 py-2">{item.Deadline}</td>
                <td className="border px-4 py-2">{item.jumlah_revisi}</td>
                <td className="border px-4 py-2">{item.order_type_name}</td>
                <td className="border px-4 py-2">{item.offer_type_name}</td>
                <td className="border px-4 py-2">{item.jenis_track}</td>
                <td className="border px-4 py-2">{item.genre_name}</td>
                <td className="border px-4 py-2">{item.price_normal}</td>
                <td className="border px-4 py-2">{item.price_discount}</td>
                <td className="border px-4 py-2">{item.discount}</td>
                <td className="border px-4 py-2">{item.basic_price}</td>
                <td className="border px-4 py-2">{item.kupon_diskon_name}</td>
                <td className="border px-4 py-2">{item.gig_link}</td>
                <td className="border px-4 py-2">{item.required_files}</td>
                <td className="border px-4 py-2">{item.project_type_name}</td>
                <td className="border px-4 py-2">{item.duration}</td>
                <td className="border px-4 py-2">{item.reference_link}</td>
                <td className="border px-4 py-2">{item.file_and_chat_link}</td>
                <td className="border px-4 py-2">{item.detail_project}</td>
                <td className="border px-4 py-2">{item.accept_status_name}</td>
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