import React, { useEffect, useState } from "react";

const ReportPage = () => {
  const [tenDaysData, setTenDaysData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedRange, setSelectedRange] = useState("all");

  // ambil data dari backend
  useEffect(() => {
    fetch("/api/marketing-design/reports")
      .then((res) => res.json())
      .then((data) => setTenDaysData(data))
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  // helper parse tanggal
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr);
  };

  // daftar bulan unik dari data
  const uniqueMonths = [
    ...new Set(
      tenDaysData.map((row) => {
        const d = parseDate(row.month);
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

  // filter data berdasarkan bulan & periode
  const filteredTenDays = tenDaysData.filter((row) => {
    const d = parseDate(row.month);
    if (!d) return false;

    const monthKey = d.toISOString().slice(0, 7); // YYYY-MM
    if (monthKey !== selectedMonth) return false;

    if (selectedRange === "1-10") return row.period === 1;
    if (selectedRange === "11-20") return row.period === 2;
    if (selectedRange === "21-31") return row.period === 3;
    return true; // "all"
  });

  return (
    <div>
      <h2>Laporan Marketing Design</h2>

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

      {/* Tabel laporan */}
      <table border="1" style={{ marginTop: "1rem", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Bulan</th>
            <th>Periode</th>
            <th>Total</th>
            <th>ID Data</th>
          </tr>
        </thead>
        <tbody>
          {filteredTenDays.map((row, idx) => {
            const d = parseDate(row.month);
            return (
              <tr key={idx}>
                <td>
                  {d.toLocaleString("id-ID", { month: "long", year: "numeric" })}
                </td>
                <td>
                  {row.period === 1
                    ? "1-10"
                    : row.period === 2
                    ? "11-20"
                    : "21-31"}
                </td>
                <td>{row.total}</td>
                <td>{row.ids.join(", ")}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ReportPage;
