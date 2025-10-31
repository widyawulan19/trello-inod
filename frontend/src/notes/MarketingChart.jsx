import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const MarketingChart = ({ data }) => {
  // format tanggal biar rapi
  const formattedData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
    }),
    total_orders: item.total_orders,
    total_income: item.total_income,
  }));

  return (
    <div className="p-4 bg-white shadow-md rounded-2xl">
      <h2 style={{padding:'0px', margin:'0px', fontSize:'15px'}}>
        📈 Total Penjualan per Hari
      </h2>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="total_orders"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
            name="Jumlah Order"
          />
          <Line
            type="monotone"
            dataKey="total_income"
            stroke="#82ca9d"
            name="Total Pendapatan (USD)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MarketingChart;
