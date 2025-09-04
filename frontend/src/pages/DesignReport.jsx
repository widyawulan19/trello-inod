import React, { useEffect, useState } from "react";
import {
  getTodayMarketingDesign,
  getTenDaysMarketingDesign,
} from "../services/ApiServices";

// ✅ Helper untuk aman parse tanggal
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr.replace(" ", "T")); // ganti " " jadi "T" supaya valid ISO
};

const DesignReport = () => {
  const [todayData, setTodayData] = useState([]);
  const [tenDaysData, setTenDaysData] = useState([]);
  const [loading, setLoading] = useState(true);

  // filter option
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedRange, setSelectedRange] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = await getTodayMarketingDesign();
        const tenDays = await getTenDaysMarketingDesign();

        setTodayData(today);
        setTenDaysData(tenDays);

        // ambil bulan unik dari data 10 hari
        const uniqueMonths = Array.from(
          new Set(
            tenDays
              .map((item) => {
                const d = parseDate(item.month || item.create_at);
                return d ? d.toISOString().slice(0, 7) : null; // YYYY-MM
              })
              .filter(Boolean)
          )
        );

        if (uniqueMonths.length > 0) {
          setSelectedMonth(uniqueMonths[0]); // default pilih bulan pertama
        }
      } catch (err) {
        console.error("❌ Gagal fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading data...</p>;

  // filter data berdasarkan bulan & rentang tanggal
  const filteredTenDays = tenDaysData.filter((row) => {
    const date = parseDate(row.month || row.create_at);
    if (!date) return false;

    const day = date.getDate();
    const monthKey = date.toISOString().slice(0, 7); // YYYY-MM

    if (monthKey !== selectedMonth) return false;

    if (selectedRange === "1-10") return day >= 1 && day <= 10;
    if (selectedRange === "11-20") return day >= 11 && day <= 20;
    if (selectedRange === "21-31") return day >= 21;
    return true;
  });

  // ambil semua bulan unik buat dropdown
  const uniqueMonths = Array.from(
    new Set(
      tenDaysData
        .map((item) => {
          const d = parseDate(item.month || item.create_at);
          return d ? d.toISOString().slice(0, 7) : null;
        })
        .filter(Boolean)
    )
  );

  return (
    <div style={{ padding: "20px" }}>
      <h2>📅 Laporan Marketing Design</h2>

      {/* Hari ini */}
      <section style={{ marginBottom: "30px" }}>
        <h3>Data Hari Ini</h3>
        {todayData.length > 0 ? (
          <ul>
            {todayData.map((item) => {
              const d = parseDate(item.create_at);
              return (
                <li key={item.marketing_design_id}>
                  <strong>ID:</strong> {item.marketing_design_id} |{" "}
                  <strong>Dibuat:</strong>{" "}
                  {d ? d.toLocaleString("id-ID") : "Tanggal tidak valid"}
                </li>
              );
            })}
          </ul>
        ) : (
          <p>Tidak ada data untuk hari ini</p>
        )}
      </section>

      {/* Filter */}
      <section style={{ marginBottom: "20px" }}>
        <h3>Filter Laporan Per 10 Hari</h3>
        <label>
          Pilih Bulan:{" "}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {uniqueMonths.map((month) => (
              <option key={month} value={month}>
                {new Date(month + "-01").toLocaleDateString("id-ID", {
                  month: "long",
                  year: "numeric",
                })}
              </option>
            ))}
          </select>
        </label>
        {"  "}
        <label>
          Pilih Rentang:{" "}
          <select
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
          >
            <option value="all">Semua</option>
            <option value="1-10">Tanggal 1 - 10</option>
            <option value="11-20">Tanggal 11 - 20</option>
            <option value="21-31">Tanggal 21 - 31</option>
          </select>
        </label>
      </section>

      {/* Per 10 hari */}
      <section>
        <h3>Data Per 10 Hari</h3>
        {filteredTenDays.length > 0 ? (
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
              {filteredTenDays.map((row, index) => {
                const d = parseDate(row.month || row.create_at);
                return (
                  <tr key={index}>
                    <td>Periode {row.period ?? "-"}</td>
                    <td>
                      {d
                        ? d.toLocaleDateString("id-ID", {
                            month: "long",
                            year: "numeric",
                          })
                        : "-"}
                    </td>
                    <td>{row.total ?? "-"}</td>
                    <td>{row.ids ? row.ids.join(", ") : "-"}</td>
                  </tr>
                );
              })}
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
