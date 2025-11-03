import React, { useState } from "react";
import DataMarketingCompare from "./DataMarketingCompare";
import MarketingChart from "./MarketingChart";
import MarketingMusicChart from "./MarketingMusicChart";
import { ChevronDown } from "lucide-react";

const HomeNotes = () => {
  const [selectedChart, setSelectedChart] = useState("both");
  const [openDropdown, setOpenDropdown] = useState(false);

  const handleSelect = (value) => {
    setSelectedChart(value);
    setOpenDropdown(false);
  };

  return (
    <div className="relative p-4 bg-white shadow home-notes rounded-2xl">
      {/* ===== Header ===== */}
      <div className="flex items-center justify-between mb-3 notes-header">
        <div className="relative flex items-center gap-3 nh-right">
          {/* === Custom Dropdown === */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(!openDropdown)}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none"
            >
              {selectedChart === "both"
                ? "Both"
                : selectedChart === "design"
                ? "Design Only"
                : "Music Only"}
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  openDropdown ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>

            {openDropdown && (
              <ul className="absolute right-0 z-20 w-40 mt-2 bg-white border border-gray-200 rounded-md shadow-lg">
                <li
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-purple-50 ${
                    selectedChart === "both" ? "bg-purple-100" : ""
                  }`}
                  onClick={() => handleSelect("both")}
                >
                  Both
                </li>
                <li
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-purple-50 ${
                    selectedChart === "design" ? "bg-purple-100" : ""
                  }`}
                  onClick={() => handleSelect("design")}
                >
                  Design Only
                </li>
                <li
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-purple-50 ${
                    selectedChart === "music" ? "bg-purple-100" : ""
                  }`}
                  onClick={() => handleSelect("music")}
                >
                  Music Only
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* ===== Body ===== */}
      <div className="mt-2 notes-body">
        {selectedChart === "both" && <DataMarketingCompare />}
        {selectedChart === "design" && <MarketingChart />}
        {selectedChart === "music" && <MarketingMusicChart />}
      </div>
    </div>
  );
};

export default HomeNotes;
