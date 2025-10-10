import React, { useEffect, useState } from "react";
import {
  getDeletedItems,
  restoreBoard,
  restoreList,
  restoreCard,
  restoreMarketing,
  restoreMarketingDesign,
} from "../services/ApiServices.js";

export default function DataDelete() {
  const [deletedData, setDeletedData] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchDeletedData = async () => {
    setLoading(true);
    try {
      const data = await getDeletedItems();
      setDeletedData(data);
    } catch (err) {
      console.error("Failed to fetch deleted items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedData();
  }, []);

  const handleRestore = async (type, id) => {
    try {
      switch (type) {
        case "board":
          await restoreBoard(id);
          break;
        case "list":
          await restoreList(id);
          break;
        case "card":
          await restoreCard(id);
          break;
        case "marketing":
          await restoreMarketing(id);
          break;
        case "marketingDesign":
          await restoreMarketingDesign(id);
          break;
        default:
          return;
      }

      alert(`${type} restored successfully!`);
      fetchDeletedData(); // refresh data setelah restore
    } catch (err) {
      console.error(`Failed to restore ${type}:`, err);
    }
  };

  if (loading) return <p>Loading recycle bin...</p>;

  // Fungsi bantu untuk menentukan nama yang ditampilkan
  const getDisplayName = (key, item) => {
    switch (key) {
      case "boards":
        return item.name || item.title || `Board ID: ${item.id}`;
      case "lists":
        return item.title || item.name || `List ID: ${item.id}`;
      case "cards":
        return item.title || item.name || `Card ID: ${item.id}`;
      case "marketing":
        return (
          item.buyer_name ||
          `${item.code_order || ""} (${item.order_number || "No Order"})`
        );
      case "marketingDesign":
        return (
          item.buyer_name ||
          `${item.code_order || ""} (${item.order_number || "No Order"})`
        );
      default:
        return item.name || `Item ID: ${item.id}`;
    }
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold mb-6">🗑️ Recycle Bin</h1>

      {Object.entries(deletedData).map(([key, items]) => (
        <div
          key={key}
          className="bg-white border p-4 rounded-xl shadow-sm hover:shadow-md transition-all"
        >
          <h2 className="font-semibold text-lg capitalize mb-3 text-gray-800">
            {key.replace(/([A-Z])/g, " $1")}
          </h2>

          {items.length === 0 ? (
            <p className="text-gray-500 text-sm italic">
              No deleted {key} found.
            </p>
          ) : (
            <ul className="space-y-2">
              {items.map((item) => (
                <li
                  key={
                    item.id ||
                    item.marketing_id ||
                    item.marketing_design_id
                  }
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-700">
                      {getDisplayName(key, item)}
                    </span>
                    <span className="text-xs text-gray-500">
                      ID:{" "}
                      {item.id ||
                        item.marketing_id ||
                        item.marketing_design_id}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      handleRestore(
                        key === "marketingDesign"
                          ? "marketingDesign"
                          : key === "marketing"
                          ? "marketing"
                          : key.slice(0, -1), // plural → singular
                        item.id ||
                          item.marketing_id ||
                          item.marketing_design_id
                      )
                    }
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition"
                  >
                    Restore
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
