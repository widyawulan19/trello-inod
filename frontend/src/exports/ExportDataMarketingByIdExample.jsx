
import { useEffect, useState } from "react";
import { getAllDataMarketingJoined, exportDataMarketingToSheets } from "../services/ApiServices";

const ExportDataMarketingByIdExample = () => {
  const [marketingList, setMarketingList] = useState([]);
  const [loading, setLoading] = useState(false);
  const marketingId = 46;

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
  const handleExportToSheet = async (marketingId, buyerName) => {
    try {
        setLoading(true);
        await exportDataMarketingToSheets(marketingId);
        alert(`✅ Data "${buyerName}" berhasil dikirim ke Google Sheets`);
    } catch (err) {
        console.error("❌ Gagal kirim ke Sheets:", err);
        alert(`❌ Gagal kirim data "${buyerName}"`);
    } finally {
        setLoading(false);
    }
    };

  useEffect(() => {
    fetchMarketingData();
  }, []);

  return (
    <div className="container p-4 mx-auto" style={{border:'1px solid red', overflowX:'auto'}}>
      <h1 className="mb-4 text-2xl font-bold">Marketing Dashboard</h1>

      {loading && <p>Loading...</p>}

      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="px-4 py-2 border">Input By</th>
            <th className="px-4 py-2 border">Acc By</th>
            <th className="px-4 py-2 border">Buyer Name</th>
            <th className="px-4 py-2 border">Code Order</th>
            <th className="px-4 py-2 border">Order Number</th>
            <th className="px-4 py-2 border">Account</th>
            <th className="px-4 py-2 border">Deadline</th>
            <th className="px-4 py-2 border">Revisi</th>
            <th className="px-4 py-2 border">Order Type</th>
            <th className="px-4 py-2 border">Offer Type</th>
            <th className="px-4 py-2 border">Jenis Track</th>
            <th className="px-4 py-2 border">Genre</th>
            <th className="px-4 py-2 border">Price Normal</th>
            <th className="px-4 py-2 border">Price Discount</th>
            <th className="px-4 py-2 border">Discount</th>
            <th className="px-4 py-2 border">Basic Price</th>
            <th className="px-4 py-2 border">Kupon Diskon</th>
            <th className="px-4 py-2 border">Gig Link</th>
            <th className="px-4 py-2 border">Required Files</th>
            <th className="px-4 py-2 border">Project Type</th>
            <th className="px-4 py-2 border">Duration</th>
            <th className="px-4 py-2 border">Reference Link</th>
            <th className="px-4 py-2 border">File & Chat Link</th>
            <th className="px-4 py-2 border">Detail Project</th>
            <th className="px-4 py-2 border">Status</th>
            <th className="px-4 py-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {marketingList.map((item) => (
            <tr key={item.marketing_design_id}>
                <td className="px-4 py-2 border">{item.input_by_name}</td>
                <td className="px-4 py-2 border">{item.acc_by_name}</td>
                <td className="px-4 py-2 border">{item.buyer_name}</td>
                <td className="px-4 py-2 border">{item.code_order}</td>
                <td className="px-4 py-2 border">{item.order_number}</td>
                <td className="px-4 py-2 border">{item.account_name}</td>
                <td className="px-4 py-2 border">{item.Deadline}</td>
                <td className="px-4 py-2 border">{item.jumlah_revisi}</td>
                <td className="px-4 py-2 border">{item.order_type_name}</td>
                <td className="px-4 py-2 border">{item.offer_type_name}</td>
                <td className="px-4 py-2 border">{item.jenis_track}</td>
                <td className="px-4 py-2 border">{item.genre_name}</td>
                <td className="px-4 py-2 border">{item.price_normal}</td>
                <td className="px-4 py-2 border">{item.price_discount}</td>
                <td className="px-4 py-2 border">{item.discount}</td>
                <td className="px-4 py-2 border">{item.basic_price}</td>
                <td className="px-4 py-2 border">{item.kupon_diskon_name}</td>
                <td className="px-4 py-2 border">{item.gig_link}</td>
                <td className="px-4 py-2 border">{item.required_files}</td>
                <td className="px-4 py-2 border">{item.project_type_name}</td>
                <td className="px-4 py-2 border">{item.duration}</td>
                <td className="px-4 py-2 border">{item.reference_link}</td>
                <td className="px-4 py-2 border">{item.file_and_chat_link}</td>
                <td className="px-4 py-2 border">{item.detail_project}</td>
                <td className="px-4 py-2 border">{item.accept_status_name}</td>
              <td className="px-4 py-2 border">
                <button
                  className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
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

export default ExportDataMarketingByIdExample;