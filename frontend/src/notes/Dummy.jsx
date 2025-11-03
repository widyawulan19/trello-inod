import React, { useState } from "react";
import MarketingMusicChart from "./MarketingChartMusik";
import MarketingChart from "./MarketingChart";
import DataMarketingCompare from "./DataMarketingCompare";
import '../style/notes/Dummy.css'
const Dummy = ({ selectedChart}) => {


  return (
    <div className="dummy-container">
      {/* ===== Body ===== */}
      <div className="mt-2 notes-body">
        {selectedChart === "both" && <DataMarketingCompare />}
        {selectedChart === "design" && <MarketingChart />}
        {selectedChart === "music" && <MarketingMusicChart />}
      </div>
    </div>
  );
};

export default Dummy;
