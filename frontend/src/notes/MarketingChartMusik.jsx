import React, { useEffect, useState, useRef } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { getMarketingMusicSummary } from "../services/ApiServices";

const MarketingMusicChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const result = await getMarketingMusicSummary();
        console.log("Raw API result:", result);

        // Format tanggal jadi 20/10 dst
        const formattedData = result.map((item) => ({
          ...item,
          date: new Date(item.date).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "2-digit",
          }),
        }));

        setData(formattedData);
      } catch (error) {
        console.error("Failed to load marketing music data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  // 🔥 Auto scroll ke kanan (tanggal terbaru)
  useEffect(() => {
    if (!loading && scrollRef.current) {
      const scrollContainer = scrollRef.current;
      scrollContainer.scrollLeft = scrollContainer.scrollWidth;
    }
  }, [loading, data]);

  if (loading) return <p className="text-gray-500">Loading chart data...</p>;

  return (
    <div className="w-full p-4 bg-white shadow rounded-2xl">
      <h2 className="text-[15px] mb-2 font-semibold">Daily Music Marketing Income</h2>

      <div ref={scrollRef} className="overflow-x-auto" style={{ width: "100%", height: "230px" }}>
        <div style={{ width: `${data.length * 80}px`, height: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              key={data.length} // memaksa rerender saat data berubah
              data={data.length > 0 ? data : [{ date: "N/A", total_income: 0, total_orders: 0 }]}
              margin={{ top: 30, right: 30, left: 0, bottom: 10 }}
            >
              <defs>
                <linearGradient id="colorIncomeMusic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOrdersMusic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                iconSize={10}
                wrapperStyle={{ paddingTop: "10px" }}
              />

              <Area
                type="monotone"
                dataKey="total_income"
                stroke="#a855f7"
                fill="url(#colorIncomeMusic)"
                name="Total Income ($)"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Area
                type="monotone"
                dataKey="total_orders"
                stroke="#f59e0b"
                fill="url(#colorOrdersMusic)"
                name="Total Orders"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>

        </div>
      </div>
    </div>
  );
};

export default MarketingMusicChart;
