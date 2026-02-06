import React, { useEffect, useState, useMemo } from "react";
import {
  getDeletedItems,
  restoreBoard,
  restoreList,
  restoreCard,
  restoreMarketing,
  restoreMarketingDesign,
  restoreWorkspace,
} from "../services/ApiServices.js";
import "../style/pages/DataDelete.css";
import { FaTrashRestore } from "react-icons/fa";
import { IoSearchOutline } from "react-icons/io5";
import { useSnackbar } from "../context/Snackbar";
import LoadingSpinnerDot from "../utils/LoadingSpinnerDot.jsx";

export default function DataDelete() {
  const [deletedData, setDeletedData] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { showSnackbar } = useSnackbar();

  /* =======================
     FETCH DELETED DATA
  ======================= */
  const fetchDeletedData = async () => {
    setLoading(true);
    try {
      const data = await getDeletedItems();
      setDeletedData(data);
    } catch (err) {
      console.error("Failed to fetch deleted items:", err);
      showSnackbar("Gagal memuat recycle bin 😭", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedData();
  }, []);

  /* =======================
     FILTER (DERIVED STATE)
  ======================= */
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return deletedData;

    const lowerQuery = searchQuery.toLowerCase();
    const result = {};

    Object.entries(deletedData).forEach(([key, items]) => {
      result[key] = items.filter((item) => {
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

    return result;
  }, [deletedData, searchQuery]);

  /* =======================
     RESTORE HANDLER
  ======================= */
  const handleRestore = async (type, id) => {
    try {
      switch (type) {
        case "workspaces":
          await restoreWorkspace(id);
          break;
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

      showSnackbar("Data berhasil direstore ♻️", "success");
      fetchDeletedData();
    } catch (err) {
      console.error(`Failed to restore ${type}:`, err);
      showSnackbar("Restore gagal 😭", "error");
    }
  };

  /* =======================
     DISPLAY NAME HELPER
  ======================= */
  const getDisplayName = (key, item) => {
    switch (key) {
      case "workspaces":
        return item.name || `Workspace ID: ${item.id}`;
      case "boards":
        return item.name || item.title || `Board ID: ${item.id}`;
      case "lists":
        return item.title || item.name || `List ID: ${item.id}`;
      case "cards":
        return item.title || item.name || `Card ID: ${item.id}`;
      case "marketing":
      case "marketingDesign":
        return (
          item.buyer_name ||
          `${item.code_order || ""} (${item.order_number || "No Order"})`
        );
      default:
        return item.name || `Item ID: ${item.id}`;
    }
  };

  if (loading)
    return (
      <LoadingSpinnerDot text="Sebentar ya, datanya lagi dimuat 😊" />
    );

  /* =======================
     RENDER
  ======================= */
  return (
    <div className="rb-container">
      <div className="rb-header">
        <div className="header-title">
          <div className="title-left">
            <div className="header-icon">
              <FaTrashRestore />
            </div>
            <h2>Recycle Bin</h2>
          </div>

          <div className="title-right">
            <div className="rb-search">
              <IoSearchOutline />
              <input
                type="text"
                placeholder="Cari berdasarkan nama data"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="sub-title">
          <p>
            Semua data yang dihapus sementara tersimpan di sini. <br />
            Gunakan Restore untuk mengembalikan data ke posisi semula.
          </p>
        </div>
      </div>

      <div className="rb-grid">
        {Object.entries(filteredData).map(([key, items]) => (
          <div key={key} className="rb-section">
            <h3 className="rb-section-title">
              {key.replace(/([A-Z])/g, " $1")}
            </h3>

            {items.length === 0 ? (
              <p className="no-data-delete">No deleted {key} found.</p>
            ) : (
              <div className="rb-card-grid">
                {items.map((item) => {
                  const itemId =
                    item.id ||
                    item.marketing_id ||
                    item.marketing_design_id;

                  return (
                    <div className="rb-card" key={itemId}>
                      <div className="rb-card-info">
                        <h4 className="rb-card-title">
                          {getDisplayName(key, item)}
                        </h4>

                        <p className="rb-card-id">ID: {itemId}</p>

                        {item.deleted_at && (
                          <span className="text-xs italic text-gray-400">
                            Deleted at:{" "}
                            {new Date(item.deleted_at).toLocaleString(
                              "id-ID",
                              {
                                dateStyle: "medium",
                                timeStyle: "short",
                              }
                            )}
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
                              : key === "workspaces"
                              ? "workspaces"
                              : key.slice(0, -1),
                            itemId
                          )
                        }
                      >
                        ♻️ Restore
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
