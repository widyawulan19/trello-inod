import React, { useEffect, useState } from "react";
import { getTenDaysMarketingDesign, getTodayMarketingDesign } from "../services/ApiServices";

const ReportPage = () => {
  const [todayData, setTodayData] = useState([]);
  const [tenDaysData, setTenDaysData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedRange, setSelectedRange] = useState("all");

  // ambil data hari ini & 10 harian
  useEffect(() => {
    getTodayMarketingDesign().then(setTodayData).catch(console.error);
    getTenDaysMarketingDesign().then(setTenDaysData).catch(console.error);
  }, []);

  // Untuk daftar bulan (YYYY-MM) dari row.month
    const parseMonth = (row) => {
      return row && row.month ? new Date(row.month) : null;
    };

    // Untuk tanggal detail marketing design
    const parseDate = (row) => {
      return row && row.create_at ? new Date(row.create_at) : null;
    };

  // daftar bulan unik dari data create_at
  const uniqueMonths = [
    ...new Set(
      tenDaysData.map((row) => {
        const d = parseMonth(row);
        return d ? d.toISOString().slice(0, 7) : null; // YYYY-MM
      })
    ),
  ].filter(Boolean);

  // atur default bulan ke bulan terbaru
  useEffect(() => {
    if (uniqueMonths.length > 0 && !selectedMonth) {
      setSelectedMonth(uniqueMonths[0]);
    }
  }, [uniqueMonths, selectedMonth]);

  const filteredTenDays = tenDaysData
  .filter((row) => {
    const monthKey = new Date(row.month).toISOString().slice(0, 7);
    if (monthKey !== selectedMonth) return false;

    if (selectedRange === "1-10") return row.period === 1;
    if (selectedRange === "11-20") return row.period === 2;
    if (selectedRange === "21-31") return row.period === 3;
    return true;
  })
  .flatMap((row) => row.details); // ambil semua details dari periode



  return (
    <div>
      <h2>Laporan Marketing Design</h2>

      {/* === Data Hari Ini === */}
      <h3>📌 Data Hari Ini</h3>
      {todayData.length === 0 ? (
        <p>Tidak ada data hari ini.</p>
      ) : (
        <table border="1" style={{ marginBottom: "2rem" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Input By</th>
              <th>Create At</th>
            </tr>
          </thead>
          <tbody>
            {todayData.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.input_by}</td>
                <td>
                  {new Date(row.create_at).toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* === Data Per 10 Hari === */}
      <h3>📌 Data Per 10 Hari</h3>

      {/* Dropdown bulan */}
      <label>Pilih Bulan: </label>
      <select
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
      >
        {uniqueMonths.map((m) => (
          <option key={m} value={m}>
            {new Date(m + "-01").toLocaleString("id-ID", {
              month: "long",
              year: "numeric",
            })}
          </option>
        ))}
      </select>

      {/* Dropdown periode */}
      <label style={{ marginLeft: "1rem" }}>Pilih Periode: </label>
      <select
        value={selectedRange}
        onChange={(e) => setSelectedRange(e.target.value)}
      >
        <option value="all">Semua</option>
        <option value="1-10">1 - 10</option>
        <option value="11-20">11 - 20</option>
        <option value="21-31">21 - 31</option>
      </select>

      <table border="1" style={{ marginTop: "1rem", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Bulan</th>
            <th>Periode</th>
            <th>ID</th>
            <th>Input By</th>
            <th>Create At</th>
          </tr>
        </thead>
        <tbody>
          {filteredTenDays.map((row) => {
            const d = parseDate(row);
            return (
              <tr key={row.marketing_design_id}>
                <td>{d.toLocaleString("id-ID", { month: "long", year: "numeric" })}</td>
                <td>
                  {row.period === 1 ? "1-10" : row.period === 2 ? "11-20" : "21-31"}
                </td>
                <td>{row.marketing_design_id}</td>
                <td>{row.input_by}</td>
                <td>{d.toLocaleString("id-ID")}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ReportPage;
