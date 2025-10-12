import React, { useEffect, useState } from "react";
import {
  getDeletedItems,
  restoreBoard,
  restoreList,
  restoreCard,
  restoreMarketing,
  restoreMarketingDesign,
} from "../services/ApiServices.js";
import '../style/pages/DataDelete.css';
import { FaTrashRestore } from "react-icons/fa";
import { IoSearchOutline } from "react-icons/io5";


export default function DataDelete() {
  const [deletedData, setDeletedData] = useState({});
  const [loading, setLoading] = useState(true);
  const [filteredData, setFilteredData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const fetchDeletedData = async () => {
    setLoading(true);
    try {
      const data = await getDeletedItems();
      setDeletedData(data);
      setFilteredData(data);
    } catch (err) {
      console.error("Failed to fetch deleted items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedData();
  }, []);

  // 🔍 Filter data berdasarkan input pencarian
    useEffect(() => {
      if (!searchQuery.trim()) {
        setFilteredData(deletedData);
        return;
      }
  
      const lowerQuery = searchQuery.toLowerCase();
      const newFiltered = {};
  
      Object.entries(deletedData).forEach(([key, items]) => {
        newFiltered[key] = items.filter((item) => {
          const name =
            item.name ||
            item.title ||
            item.buyer_name ||
            item.code_order ||
            item.order_number ||
            "";
          return name.toLowerCase().includes(lowerQuery);
        });
      });
  
      setFilteredData(newFiltered);
    }, [searchQuery, deletedData]);
  

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

  if (loading) return <p>Loading recycle bin...</p>;

  return (
    <div className="rb-container">
      <div className="rb-header">
        <div className="header-title">
          <div className="title-left">
            <div className="header-icon">
              <FaTrashRestore/>
            </div>
            <h2>Recycle Bin</h2>
          </div>
          <div className="title-right">
            {/* 🔍 Input Pencarian */}
            <div className="rb-search">
              <IoSearchOutline/>
              <input
                type="text"
                placeholder="Cari berdasakan nama data"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
        </div>
        <div className="sub-title">
          <p>
            Semua data yang dihapus sementara tersimpan di sini. <br />
            Gunakan tombol Restore untuk mengembalikan data ke posisi semula,
            atau pilih Delete Permanently untuk membersihkan secara permanen.
          </p>
        </div>
      </div>

      <div className="rb-grid">
        {/* {Object.entries(deletedData).map(([key, items]) => ( */}
        {Object.entries(filteredData).map(([key, items]) => (
          <div key={key} className="rb-section">
            <h3 className="rb-section-title">
              {key.replace(/([A-Z])/g, " $1")}
            </h3>

            {items.length === 0 ? (
              <p className="text-sm italic text-gray-400">No deleted {key} found.</p>
            ) : (
              <div className="rb-card-grid">
                {items.map((item) => (
                  <div className="rb-card" key={item.id || item.marketing_id || item.marketing_design_id}>
                    <div className="rb-card-info">
                      <h4 className="rb-card-title">{getDisplayName(key, item)}</h4>
                      <p className="rb-card-id">
                        ID: {item.id || item.marketing_id || item.marketing_design_id}
                      </p>
                      {/* 🕒 Tambahkan waktu delete di sini */}
                      {item.deleted_at && (
                        <span className="text-xs italic text-gray-400">
                          Deleted at: {new Date(item.deleted_at).toLocaleString("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      )}
                    </div>
                    <button
                      className="rb-restore-btn"
                      onClick={() =>
                        handleRestore(
                          key === "marketingDesign"
                            ? "marketingDesign"
                            : key === "marketing"
                            ? "marketing"
                            : key.slice(0, -1),
                          item.id || item.marketing_id || item.marketing_design_id
                        )
                      }
                    >
                      ♻️ Restore
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>


      {/* {Object.entries(deletedData).map(([key, items]) => (
        <div
          key={key}
          className="p-4 transition-all bg-white border shadow-sm rounded-xl hover:shadow-md"
        >
          <h2 className="mb-3 text-lg font-semibold text-gray-800 capitalize">
            {key.replace(/([A-Z])/g, " $1")}
          </h2>

          {items.length === 0 ? (
            <p className="text-sm italic text-gray-500">
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
                  className="flex items-center justify-between pb-2 border-b"
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
                    className="px-3 py-1 text-sm text-white transition bg-green-500 rounded hover:bg-green-600"
                  >
                    Restore
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))} */}
    </div>
  );
}
