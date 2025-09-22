import { useEffect, useState } from "react";
import {
  getAllMarketingDesignJoined,
  exportDesignToSheets,
} from "../services/ApiServices";

const ExportMarketingDesignById = () => {
  const [designList, setDesignList] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch semua data marketing design
  const fetchDesignData = async () => {
    try {
      setLoading(true);
      const res = await getAllMarketingDesignJoined();
      setDesignList(res.data);
    } catch (err) {
      console.error("❌ Gagal fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Kirim satu data ke Google Sheets
  const handleExportDesignToSheet = async (designData) => {
    try {
      setLoading(true);
      await exportDesignToSheets(designData);
      alert(`✅ Data design "${designData.buyer_name}" berhasil dikirim ke Google Sheets`);
    } catch (err) {
      console.error("❌ Gagal kirim ke Sheets:", err);
      alert(`❌ Gagal kirim data design "${designData.buyer_name}"`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesignData();
  }, []);

  return (
    <div className="container p-4 mx-auto" style={{ border: "1px solid green", overflowX: "auto" }}>
      <h1 className="mb-4 text-2xl font-bold">Marketing Design Dashboard</h1>

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
            <th className="px-4 py-2 border">Jumlah Design</th>
            <th className="px-4 py-2 border">Revisi</th>
            <th className="px-4 py-2 border">Order Type</th>
            <th className="px-4 py-2 border">Offer Type</th>
            <th className="px-4 py-2 border">Project Type</th>
            <th className="px-4 py-2 border">Style</th>
            <th className="px-4 py-2 border">Status</th>
            <th className="px-4 py-2 border">Resolution</th>
            <th className="px-4 py-2 border">Reference</th>
            <th className="px-4 py-2 border">Price Normal</th>
            <th className="px-4 py-2 border">Price Discount</th>
            <th className="px-4 py-2 border">Discount %</th>
            <th className="px-4 py-2 border">Required Files</th>
            <th className="px-4 py-2 border">File & Chat</th>
            <th className="px-4 py-2 border">Detail Project</th>
            <th className="px-4 py-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {designList.map((item) => (
            <tr key={item.marketing_design_id}>
              <td className="px-4 py-2 border">{item.input_by_name}</td>
              <td className="px-4 py-2 border">{item.acc_by_name}</td>
              <td className="px-4 py-2 border">{item.buyer_name}</td>
              <td className="px-4 py-2 border">{item.code_order}</td>
              <td className="px-4 py-2 border">{item.order_number}</td>
              <td className="px-4 py-2 border">{item.account_name}</td>
              <td className="px-4 py-2 border">{item.deadline}</td>
              <td className="px-4 py-2 border">{item.jumlah_design}</td>
              <td className="px-4 py-2 border">{item.jumlah_revisi}</td>
              <td className="px-4 py-2 border">{item.order_type_name}</td>
              <td className="px-4 py-2 border">{item.offer_type_name}</td>
              <td className="px-4 py-2 border">{item.project_type_name}</td>
              <td className="px-4 py-2 border">{item.style_name}</td>
              <td className="px-4 py-2 border">{item.status_project_name}</td>
              <td className="px-4 py-2 border">{item.resolution}</td>
              <td className="px-4 py-2 border">{item.reference}</td>
              <td className="px-4 py-2 border">{item.price_normal}</td>
              <td className="px-4 py-2 border">{item.price_discount}</td>
              <td className="px-4 py-2 border">{item.discount_percentage}</td>
              <td className="px-4 py-2 border">{item.required_files}</td>
              <td className="px-4 py-2 border">{item.file_and_chat}</td>
              <td className="px-4 py-2 border">{item.detail_project}</td>
              <td className="px-4 py-2 border">
                <button
                  className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
                  onClick={() => handleExportDesignToSheet(item)}
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

export default ExportMarketingDesignById;
