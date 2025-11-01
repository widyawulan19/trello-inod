import React, { useEffect, useState } from "react";
import { getDailyMarketingSummary } from "../services/ApiServices";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

const MarketingChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const result = await getDailyMarketingSummary();

        // Format tanggal biar tampil 11/10
        const formattedData = result.map((item) => ({
          ...item,
          date: new Date(item.date).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "2-digit",
          }),
        }));

        setData(formattedData);
      } catch (error) {
        console.error("Failed to load marketing data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <p className="text-gray-500">Loading chart data...</p>;

  return (
    <div className="w-full p-4 overflow-x-auto bg-white shadow rounded-2xl">
      <h2 className="text-[15px] mb-2">Daily Marketing Income</h2>
      <div style={{ width: `${data.length * 80}px`, height: "320px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend verticalAlign="top" height={36} />
            <Line
              type="monotone"
              dataKey="total_income"
              stroke="#3b82f6"
              name="Total Income ($)"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="total_orders"
              stroke="#10b981"
              name="Total Orders"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MarketingChart;
