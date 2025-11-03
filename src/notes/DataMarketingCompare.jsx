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
import { getMarketingCompareSummary } from "../services/ApiServices";
import '../style/notes/Dummy.css'

const DataMarketingCompare = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const result = await getMarketingCompareSummary();

        const formattedData = result.map((item) => ({
          ...item,
          date: new Date(item.date).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "2-digit",
          }),
        }));

        setData(formattedData);
      } catch (error) {
        console.error("Failed to load compare data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  // 🔥 Auto scroll ke kanan ke tanggal terbaru
  useEffect(() => {
    if (!loading && scrollRef.current) {
      const scrollContainer = scrollRef.current;
      scrollContainer.scrollLeft = scrollContainer.scrollWidth;
    }
  }, [loading, data]);

  if (loading) return <p className="text-gray-500">Loading compare chart...</p>;

  return (
    <div className="compare-container">
      <h2 className="text-[15px] font-semibold">Compare: Design vs Music Income</h2>

      {/* Kontainer scroll horizontal */}
      <div
        ref={scrollRef}
        className="overflow-x-auto"
        style={{ width: "100%", height: "230px" }}
      >
        <div style={{ width: `${data.length * 80}px`, height: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 30, right: 30, left: 0, bottom: 10 }}
            >
              <defs>
                {/* 🎨 Gradient lembut untuk Design */}
                <linearGradient id="colorDesign" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                {/* 🎵 Gradient lembut untuk Music */}
                <linearGradient id="colorMusic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
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

              {/* Area untuk Design */}
              <Area
                type="monotone"
                dataKey="design_income"
                stroke="#3b82f6"
                fill="url(#colorDesign)"
                name="Design Income ($)"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                animationDuration={800}
              />

              {/* Area untuk Music */}
              <Area
                type="monotone"
                dataKey="music_income"
                stroke="#a855f7"
                fill="url(#colorMusic)"
                name="Music Income ($)"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DataMarketingCompare;
