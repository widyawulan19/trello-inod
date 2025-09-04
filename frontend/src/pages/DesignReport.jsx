import React, { useEffect, useState } from "react";
import { getTodayMarketingDesign, getTenDaysMarketingDesign } from "../services/ApiServices";

const DesignReport = () => {
  const [todayData, setTodayData] = useState([]);
  const [tenDaysData, setTenDaysData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = await getTodayMarketingDesign();
        const tenDays = await getTenDaysMarketingDesign();

        setTodayData(today);
        setTenDaysData(tenDays);
      } catch (err) {
        console.error("❌ Gagal fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading data...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>📅 Laporan Marketing Design</h2>

      {/* Hari ini */}
      <section style={{ marginBottom: "30px" }}>
        <h3>Data Hari Ini</h3>
        {todayData.length > 0 ? (
          <ul>
            {todayData.map((item) => (
              <li key={item.marketing_design_id}>
                <strong>ID:</strong> {item.marketing_design_id} |{" "}
                <strong>Dibuat:</strong> {new Date(item.create_at).toLocaleString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>Tidak ada data untuk hari ini</p>
        )}
      </section>

      {/* Per 10 hari */}
      <section>
        <h3>Data Per 10 Hari</h3>
        {tenDaysData.length > 0 ? (
          <table border="1" cellPadding="10">
            <thead>
              <tr>
                <th>Periode</th>
                <th>Bulan</th>
                <th>Total Data</th>
                <th>IDs</th>
              </tr>
            </thead>
            <tbody>
              {tenDaysData.map((row, index) => (
                <tr key={index}>
                  <td>Periode {row.period}</td>
                  <td>{new Date(row.month).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}</td>
                  <td>{row.total}</td>
                  <td>{row.ids.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Tidak ada data untuk periode ini</p>
        )}
      </section>
    </div>
  );
};

export default DesignReport;
