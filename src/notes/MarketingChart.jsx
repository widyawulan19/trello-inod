import React, { useEffect, useState, useRef } from "react";
import { getDailyMarketingSummary } from "../services/ApiServices";
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

const MarketingChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const result = await getDailyMarketingSummary();

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
        console.error("Failed to load marketing data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  // 🔥 Auto scroll ke kanan (tanggal terbaru) setelah data dimuat
  useEffect(() => {
    if (!loading && scrollRef.current) {
      const scrollContainer = scrollRef.current;
      scrollContainer.scrollLeft = scrollContainer.scrollWidth;
    }
  }, [loading, data]);

  if (loading) return <p className="text-gray-500">Loading chart data...</p>;

  return (
    <div className="w-full p-4 bg-white shadow rounded-2xl">
      <h2 className="text-[15px] mb-2 font-semibold">Daily Marketing Income</h2>

      {/* Kontainer scroll horizontal */}
      <div
        ref={scrollRef}
        className="overflow-x-auto"
        style={{ width: "100%", height: "230px" }}
      >
        {/* Lebar fleksibel tergantung jumlah data */}
        <div style={{ width: `${data.length * 80}px`, height: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 30, right: 30, left: 0, bottom: 10 }}
            >
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                stroke="#3b82f6"
                fill="url(#colorIncome)"
                name="Total Income ($)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="total_orders"
                stroke="#10b981"
                fill="url(#colorOrders)"
                name="Total Orders"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MarketingChart;
