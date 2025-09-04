import { useState, useEffect } from "react";
import { getMarketingDesignReportAuto, getMarketingDesignReportManual } from "../services/ApiServices";


export default function DesignReport() {
  const [mode, setMode] = useState("auto");
  const [bulan, setBulan] = useState("2025-05");
  const [periode, setPeriode] = useState(1);
  const [data, setData] = useState([]);

  const fetchData = async () => {
  try {
    let result;
    if (mode === "auto") {
      result = await getMarketingDesignReportAuto();
    } else {
      result = await getMarketingDesignReportManual(bulan, periode);
    }
    setData(result.data); // penting: pakai .data
  } catch (err) {
    console.error("Gagal fetch data:", err);
  }
};


  useEffect(() => {
    fetchData();
  }, [mode, bulan, periode]);

  return (
    <div className="p-4">
      <h2 className="mb-4 text-xl font-bold">📊 Laporan Marketing Design</h2>

      <div className="flex gap-4 mb-4">
        <label>
          <input
            type="radio"
            value="auto"
            checked={mode === "auto"}
            onChange={() => setMode("auto")}
          />{" "}
          Auto (sesuai kalender)
        </label>
        <label>
          <input
            type="radio"
            value="manual"
            checked={mode === "manual"}
            onChange={() => setMode("manual")}
          />{" "}
          Manual (pilih bulan & periode)
        </label>
      </div>

      {mode === "manual" && (
        <div className="flex gap-2 mb-4">
          <input
            type="month"
            value={bulan}
            onChange={(e) => setBulan(e.target.value)}
            className="p-2 border"
          />
          <select
            value={periode}
            onChange={(e) => setPeriode(Number(e.target.value))}
            className="p-2 border"
          >
            <option value={1}>1 - 10</option>
            <option value={2}>11 - 20</option>
            <option value={3}>21 - akhir</option>
          </select>
        </div>
      )}

      <button
        onClick={fetchData}
        className="px-4 py-2 text-white bg-blue-500 rounded"
      >
        Refresh
      </button>

      <table className="w-full mt-4 border">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-2 py-1 border">ID</th>
            <th className="px-2 py-1 border">Buyer</th>
            <th className="px-2 py-1 border">Order</th>
            <th className="px-2 py-1 border">Input By</th>
            <th className="px-2 py-1 border">Tanggal</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.marketing_design_id}>
              <td className="px-2 py-1 border">{d.marketing_design_id}</td>
              <td className="px-2 py-1 border">{d.buyer_name}</td>
              <td className="px-2 py-1 border">{d.order_number}</td>
              <td className="px-2 py-1 border">{d.input_by}</td>
              <td className="px-2 py-1 border">
                {new Date(d.create_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
