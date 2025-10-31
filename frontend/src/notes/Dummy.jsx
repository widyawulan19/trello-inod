import React from "react";
import MarketingChart from "./MarketingChart";


const Dummy = () => {
  const marketingData = [
    { date: "2025-10-25", total_orders: 4, total_income: 140 },
    { date: "2025-10-26", total_orders: 2, total_income: 70 },
    { date: "2025-10-27", total_orders: 6, total_income: 210 },
    { date: "2025-10-28", total_orders: 3, total_income: 105 },
    { date: "2025-10-29", total_orders: 5, total_income: 175 },
  ];

  return (
    <div style={{
        // border:'1px solid blue',
        width:'100%'
    }}>
      <MarketingChart data={marketingData} />
    </div>
  );
};

export default Dummy;
