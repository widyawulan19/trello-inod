import React, { useState, useEffect } from "react";
import { getTodayMarketingDesign, getTenDaysMarketingDesign } from "../services/ApiServices";

const MarketingReport = () => {
  const [option, setOption] = useState("today"); // "today" atau "period"
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Helper untuk format bulan dengan aman
  const formatMonth = (month) => {
    if (!month) return "-"; // null, undefined, atau string kosong
    const d = new Date(month);
    if (isNaN(d.getTime())) return "-"; // tanggal invalid
    return d.toLocaleString("id-ID", { month: "long", year: "numeric" });
  };


  const fetchData = async () => {
    setLoading(true);
    if (option === "today") {
      const todayData = await getTodayMarketingDesign();
      setData(todayData);
    } else {
      const periodData = await getTenDaysMarketingDesign();
      setData(periodData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [option]);

  const renderDetails = (details) => {
    return details.map((item) => (
      <div key={item.marketing_design_id} style={{border:'1px solid red', height:'80vh', overflowY:'auto'}}>
      <div style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px", overflowY:'auto', height:'50vh' }}>
        <p><strong>Input By:</strong> {item["input by"]}</p>
        <p><strong>Buyer Name:</strong> {item["buyer name"]}</p>
        <p><strong>Code Order:</strong> {item["code order"]}</p>
        <p><strong>Jumlah Design:</strong> {item["jumlah design"]}</p>
        <p><strong>Deadline:</strong> {item.deadline}</p>
        <p><strong>Detail Project:</strong> {item["detail project"]}</p>
      </div>
      </div>
    ));
  };

  return (
    <div>
      <h2>Marketing Report</h2>

      <div style={{ marginBottom: "20px" }}>
        <label>
          <input
            type="radio"
            name="reportOption"
            value="today"
            checked={option === "today"}
            onChange={() => setOption("today")}
          />{" "}
          Hari Ini
        </label>

        <label style={{ marginLeft: "20px" }}>
          <input
            type="radio"
            name="reportOption"
            value="period"
            checked={option === "period"}
            onChange={() => setOption("period")}
          />{" "}
          Per Periode (10 Hari)
        </label>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : option === "today" ? (
        <div>
          {data.length === 0 ? <p>Tidak ada data hari ini.</p> : renderDetails(data)}
        </div>
      ) : (
        <div>
          {data.length === 0 ? (
            <p>Tidak ada data per periode.</p>
          ) : (
            data.map((periodItem, index) => (
              <div key={index} style={{ marginBottom: "20px" }}>
                <h3>
                  Bulan: {formatMonth(periodItem.month)} | Periode: {periodItem.period || "-"} | Total: {periodItem.total}
                </h3>
                {renderDetails(periodItem.details)}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MarketingReport;
