import React, { useEffect, useState, useMemo } from "react";
import {
  getDeletedItems,
  restoreBoard,
  restoreList,
  restoreCard,
  restoreMarketing,
  restoreMarketingDesign,
  restoreWorkspace,
  deleteBoardPermanently,
  deleteListPermanently,
  deleteCardPermanently,
  deleteMarketingPermanently,
  deleteMarketingDesignPermanently,
  getPreviewDataDelete,
} from "../services/ApiServices";
import "../style/pages/DeleteDataExample.css";
import { FaTrashRestore } from "react-icons/fa";
import { IoChevronDownOutline, IoEyeSharp, IoSearchOutline, IoTrash } from "react-icons/io5";
import { HiAdjustmentsHorizontal } from "react-icons/hi2";
import { useSnackbar } from "../context/Snackbar";
import LoadingSpinnerDot from "../utils/LoadingSpinnerDot";
import { MdOutlineRestore } from "react-icons/md";
import { BsCalendar2Week } from "react-icons/bs";
import { IoIosCloseCircle } from "react-icons/io";

export default function DataDelete() {
  const [deletedData, setDeletedData] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  //DETAIL DELETE DATA
  const [selectData, setSelectData] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  
  // 🔥 FILTER STATE
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const [typeOpen, setTypeOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  //DELETE MODAL
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null)

  //RESTORE DATA DELETE
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState(null);

  const { showSnackbar } = useSnackbar();

  /* =======================
     FETCH
  ======================= */
  const fetchDeletedData = async () => {
    setLoading(true);
    try {
      const data = await getDeletedItems();
      setDeletedData(data);
    } catch {
      showSnackbar("Gagal memuat recycle bin 😭", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedData();
  }, []);

  /* =======================
     DATE HELPER
  ======================= */
  const isDateInRange = (date) => {
    if (dateFilter === "all") return true;

    const deletedDate = new Date(date);
    const now = new Date();

    switch (dateFilter) {
      case "today":
        return (
          deletedDate.toDateString() === now.toDateString()
        );
      case "7days":
        return (
          now - deletedDate <= 7 * 24 * 60 * 60 * 1000
        );
      case "30days":
        return (
          now - deletedDate <= 30 * 24 * 60 * 60 * 1000
        );
      default:
        return true;
    }
  };

  /* =======================
     FLATTEN + FILTER DATA
  ======================= */
  const tableData = useMemo(() => {
    const rows = [];

    Object.entries(deletedData).forEach(([type, items]) => {
      if (!Array.isArray(items)) return;

      items.forEach((item) => {
        rows.push({
          id:
            item.id ||
            item.marketing_id ||
            item.marketing_design_id,
          type,
          name:
            item.name ||
            item.title ||
            item.buyer_name ||
            item.code_order ||
            "-",
          deleted_at: item.deleted_at,
        });
      });
});


    return rows.filter((row) => {
      const matchSearch = row.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchType =
        typeFilter === "all" || row.type === typeFilter;

      const matchDate = isDateInRange(row.deleted_at);

      return matchSearch && matchType && matchDate;
    });
  }, [deletedData, searchQuery, typeFilter, dateFilter]);

  /* =======================
     CHECKBOX
  ======================= */
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(tableData.map((row) => row.id));
  };

  const clearSelection = () => setSelectedIds([]);

  /* =======================
     RESTORE
  ======================= */
  const restoreByType = async (type, id) => {
    switch (type) {
      case "workspaces":
        return restoreWorkspace(id);
      case "boards":
        return restoreBoard(id);
      case "lists":
        return restoreList(id);
      case "cards":
        return restoreCard(id);
      case "data_marketing":
        return restoreMarketing(id);
      case "marketing_design":
        return restoreMarketingDesign(id);
      default:
        return null;
    }
  };

    const handleRestore = async (row) => {
      if(!restoreTarget) return;

      try{
        isRestoring(true);
        await restoreByType(row.type, row.id);
        showSnackbar("Item restored ♻️", "success");
        fetchDeletedData();
      }catch(error){
        console.error("Restore error:", error);
        showSnackbar("Failed to restore item ♻️", "error");
      }finally{
        setIsRestoring(false);
        setShowRestoreModal(false);
        setRestoreTarget(null);
      }
    };

    const openRestoreModal = (row) => {
      setRestoreTarget(row);
      setShowRestoreModal(true);
    }

    const closeRestoreModal = () => {
      setShowRestoreModal(false);
      setRestoreTarget(null);
    }

    const confirmRestore = async () => {
      try {
        // 🔹 SINGLE RESTORE (dari modal / action)
        if (restoreTarget) {
          await restoreByType(restoreTarget.type, restoreTarget.id);

          showSnackbar("Item restored ♻️", "success");
          setRestoreTarget(null);
          fetchDeletedData();
          setShowRestoreModal(false);
          return;
        }

        // 🔹 BULK RESTORE
        if (selectedIds.length === 0) return;

        for (const row of tableData.filter((r) =>
          selectedIds.includes(r.id)
        )) {
          await restoreByType(row.type, row.id);
        }

        showSnackbar(
          `${selectedIds.length} items restored ♻️`,
          "success"
        );

        clearSelection();
        fetchDeletedData();
        

      } catch (error) {
        console.error("Restore error:", error);
        showSnackbar("Restore gagal 😭", "error");
      }
    };

  const handleBulkRestore = async () => {
    try {
      for (const row of tableData.filter((r) =>
        selectedIds.includes(r.id)
      )) {
        await restoreByType(row.type, row.id);
      }
      showSnackbar(
        `${selectedIds.length} items restored ♻️`,
        "success"
      );
      clearSelection();
      fetchDeletedData();
    } catch {
      showSnackbar("Bulk restore gagal 😭", "error");
    }
  };

  // DELETE DATA PERMANENT 
  const deleteDataByType = async(type, id)=>{
    switch(type){
      case "boards":
        return deleteBoardPermanently(id);
      case "lists":
        return deleteListPermanently(id);
      case "cards":
        return deleteCardPermanently(id);
      case "data_marketing":
        return deleteMarketingPermanently(id);
      case "marketing_design":
        return deleteMarketingDesignPermanently(id);
      default:
        throw new Error("Unknown entity type");
    }
  }


  const handlePermanentDelete = async()=>{
    if(!deleteTarget) return;

    try{
      setIsDeleting(true);
      await deleteDataByType(deleteTarget.type, deleteTarget.id);
      showSnackbar("Item deleted permanently 🗑️", "success");
      fetchDeletedData();
    }catch(error){
      console.error("Permanent delete error:", error);
      showSnackbar("Failed to delete item permanently 🗑️", "error");
    }finally{
      setIsDeleting(false);
      setIsDeleteOpen(false);
      setDeleteTarget(null);
    }
  }

  /* =======================
  DETAI DATA DELETE
  ======================= */
  const closeDataDetail = () =>{
    setSelectData(null);
  }

  const openDataDetail = async(row) =>{
    try{
      setPreviewLoading(true);
      setSelectData(row);

      const res = await getPreviewDataDelete(row.type, row.id);
      setPreviewData(res.data.preview);
    }catch(err){
      console.error(err);
      showSnackbar("Failed to load preview data 🧐", "error");
    }finally{
      setPreviewLoading(false);
    }
  }

  const formatDate = (date)=>{
    return new Date(date).toLocaleString('id-ID', {
      dateStyle:'medium',
      timeStyle:'short'
    })
  }


const renderDataDelete = () => {
  if (!selectData) return null;
  if (previewLoading) return <p>Loading preview...</p>;
  if (!previewData) return <p>Preview tidak tersedia</p>;

  switch (selectData.type) {
    case "boards":
      return (
        <div className="entity">
          <div className="entity-id">
            BOARD #{previewData.id}
          </div>
          
          <div className="entity-box-container">
            <div className="entity-detail">
              <h4>DELETE INFORMATION</h4>
              <p className="sub-text">(Data Type & History)</p>
              <div className="detail-data-box">
                <strong>Data Type  </strong>
                :
                <p>BOARD</p>
              </div>
              <div className="detail-data-box">
                <strong>Deleted At  </strong>
                :
                <p>{formatDate(previewData.deleted_at)}</p>
              </div> 
            </div>
            
            <div className="entity-detail">
              <h4>DETAIL DATA DELETE</h4>
              <p className="sub-text">(Detail data saat didelete)</p>
              <div className="detail-data-box"> 
                <strong>Board ID</strong>
                : 
                <p>#{previewData.id}</p> 
              </div>
              <div className="detail-data-box">
                <strong>Created at</strong>
                :
                <p>{formatDate(previewData.create_at)}</p>
              </div>
              
              <div className="detail-data-box"> 
                <strong>Name</strong>
                : 
                <p>{previewData.name}</p> 
              </div>
              <div className="detail-data-box">
                <strong>Description</strong>
                :
                <p>{previewData.description || "-"}</p>
              </div>
              
            </div>
          </div>
        </div>
      );
     
    case "lists":
      return (
        <div className="entity">
          <div className="entity-id">
            LIST #{previewData.id}
          </div>
          
          <div className="entity-box-container">
            <div className="entity-detail">
              <h4>DELETE INFORMATION</h4>
              <p className="sub-text">(Data Type & History)</p>
              <div className="detail-data-box">
                <strong>Data Type  </strong>
                :
                <p>LIST</p>
              </div>
              <div className="detail-data-box">
                <strong>Deleted At  </strong>
                :
                <p>{formatDate(previewData.deleted_at)}</p>
              </div> 
            </div>
            
            <div className="entity-detail">
              <h4>DETAIL DATA DELETE</h4>
              <p className="sub-text">(Detail data saat didelete)</p>
              <div className="detail-data-box"> 
                <strong>List ID</strong>
                : 
                <p>#{previewData.id}</p> 
              </div>
              <div className="detail-data-box">
                <strong>Created at</strong>
                :
                <p>{formatDate(previewData.create_at)}</p>
              </div>
              
              <div className="detail-data-box"> 
                <strong>Name</strong>
                : 
                <p>{previewData.name}</p> 
              </div>
              <div className="detail-data-box">
                <strong>Description</strong>
                :
                <p>{previewData.description || "-"}</p>
              </div>
              
            </div>
          </div>
        </div>
      );


    case "cards":
      return (
        <div className="entity">
          <div className="entity-id">
            CARD #{previewData.id}
          </div>
          
          <div className="entity-box-container">
            <div className="entity-detail">
              <h4>DELETE INFORMATION</h4>
              <p className="sub-text">(Data Type & History)</p>
              <div className="detail-data-box">
                <strong>Data Type  </strong>
                :
                <p>CARD</p>
              </div>
              <div className="detail-data-box">
                <strong>Deleted At  </strong>
                :
                <p>{formatDate(previewData.deleted_at)}</p>
              </div> 
            </div>
            
            <div className="entity-detail">
              <h4>DETAIL DATA DELETE</h4>
              <p className="sub-text">(Detail data saat didelete)</p>
              <div className="detail-data-box">
                <strong>Card ID</strong>
                :
                <p>#{previewData.id}</p>
              </div>
              <div className="detail-data-box">
                <strong>Created at</strong>
                :
                <p>{formatDate(previewData.create_at)}</p>
              </div>
              <div className="detail-data-box"> 
                <strong>Name</strong>
                : 
                <p>{previewData.title}</p> 
              </div>
              <div className="detail-data-box">
                <strong>Description</strong>
                :
                {/* <p>{previewData.description || "-"}</p> */}
                <p>{previewData.description?.replace(/<[^>]+>/g, '')
                                                ?.replace(/\s+/g, ' ')
                                                ?.trim() || '-'}
                </p>
              </div>
              
            </div>
          </div>
        </div>
      );

    case "workspaces":
      return (
        <div className="entity">
          <div className="entity-id">
            WORKSPACE #{previewData.id}
          </div>
          
          <div className="entity-box-container">
            <div className="entity-detail">
              <h4>DELETE INFORMATION</h4>
              <p className="sub-text">(Data Type & History)</p>
              <div className="detail-data-box">
                <strong>Data Type  </strong>
                :
                <p>WORKSPACE</p>
              </div>
              <div className="detail-data-box">
                <strong>Deleted At  </strong>
                :
                <p>{formatDate(previewData.deleted_at)}</p>
              </div> 
            </div>
            
            <div className="entity-detail">
              <h4>DETAIL DATA DELETE</h4>
              <p className="sub-text">(Detail data saat didelete)</p>
              <div className="detail-data-box"> 
                <strong>Name</strong>
                : 
                <p>{previewData.name}</p> 
              </div>
              <div className="detail-data-box">
                <strong>Description</strong>
                :
                <p>{previewData.description || "-"}</p>
              </div>
              <div className="detail-data-box">
                <strong>Created at</strong>
                :
                <p>{formatDate(previewData.created_at)}</p>
              </div>
            </div>
          </div>
        </div>
      );

    case "data_marketing":
      return (
        <div className="entity">
          <div className="entity-id">
            MARKETING MUSIK #{previewData.marketing_id}
          </div>
          
          <div className="entity-box-container">
            <div className="entity-detail">
              <h4>DELETE INFORMATION</h4>
              <p className="sub-text">(Data Type & History)</p>
              <div className="detail-data-box">
                <strong>Data Type  </strong>
                :
                <p>MARKETING MUSIK</p>
              </div>
              <div className="detail-data-box">
                <strong>Deleted At  </strong>
                :
                <p>{formatDate(previewData.deleted_at)}</p>
              </div> 
            </div>
            
            <div className="entity-detail">
              <h4>DETAIL DATA DELETE</h4>
              <p className="sub-text">(Detail data saat didelete)</p>
              <div className="detail-data-box"> 
                <strong>Name</strong>
                : 
                <p>{previewData.name}</p> 
              </div>
              <div className="detail-data-box">
                <strong>Description</strong>
                :
               <p>
                {previewData.buyer_name || "-"} | {previewData.order_number || "-"}
              </p>
              </div>
              <div className="detail-data-box">
                <strong>Created at</strong>
                :
                <p>{formatDate(previewData.create_at)}</p>
              </div>
            </div>
          </div>
        </div>
      );

    case "marketing_design":
      return (
        <div className="entity">
          <div className="entity-id">
            MARKETING DESIGN #{previewData.marketing_design_id}
          </div>
          
          <div className="entity-box-container">
            <div className="entity-detail">
              <h4>DELETE INFORMATION</h4>
              <p className="sub-text">(Data Type & History)</p>
              <div className="detail-data-box">
                <strong>Data Type  </strong>
                :
                <p>MARKETING DESIGN</p>
              </div>
              <div className="detail-data-box">
                <strong>Deleted At  </strong>
                :
                <p>{formatDate(previewData.deleted_at)}</p>
              </div> 
            </div>
            
            <div className="entity-detail">
              <h4>DETAIL DATA DELETE</h4>
              <p className="sub-text">(Detail data saat didelete)</p>
              <div className="detail-data-box"> 
                <strong>Marketing ID</strong>
                : 
                <p>#{previewData.marketing_design_id}</p> 
              </div>
              <div className="detail-data-box">
                <strong>Created at</strong>
                :
                <p>{formatDate(previewData.create_at)}</p>
              </div>
              <div className="detail-data-box"> 
                <strong>Name</strong>
                : 
                <p>
                  {previewData.buyer_name || "-"} | {previewData.order_number || "-"}
                </p>
              </div>
              <div className="detail-data-box">
                <strong>Description</strong>
                :
                <p>
                  {previewData.buyer_name || "-"} | {previewData.order_number || "-"}
                </p>
              </div>
              
            </div>
          </div>
        </div>
      );

    default:
      return <p>Preview tidak didukung untuk tipe ini</p>;
  }
};


  // BADGE TYPE
  const EntityBadge = ({ type }) => {
      const safeType = type.replace(/_/g, '-');
      return (
          <span
          className="entity-badge"
          style={{
              backgroundColor: `var(--badge-${safeType}-bg)`,
              color: `var(--badge-${safeType}-text)`,
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: '500',
          }}
          >
          {type.replace(/_/g, ' ')}
          </span>
      );
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
      <div className="recycle-header">
        <div className="recycle-action">

          {/* FILTER TYPE  */}
          <div className="recycle-menu-dropdown">

              <div className="dropdown-type">
                <div className="dropdown-label">
                  <HiAdjustmentsHorizontal size={15}/>
                  TYPE
                </div>

                <button
                  className="dropdown-trigger"
                  onClick={() => {
                    setTypeOpen(!typeOpen);
                    setDateOpen(false);
                  }}
                >
                  {typeFilter === "all" ? "All types" : typeFilter.replace(/_/g, " ")}
                  <span className="caret"><IoChevronDownOutline size={15}/></span>
                </button>
              </div>

              {typeOpen && (
                <ul className="dropdown-menu">
                  {[
                    { label: "All types", value: "all" },
                    { label: "Workspaces", value: "workspaces" },
                    { label: "Boards", value: "boards" },
                    { label: "Lists", value: "lists" },
                    { label: "Cards", value: "cards" },
                    { label: "Marketing", value: "data_marketing" },
                    { label: "Marketing Design", value: "marketing_design" },
                  ].map((item) => (
                    <li
                      key={item.value}
                      className={typeFilter === item.value ? "active" : ""}
                      onClick={() => {
                        setTypeFilter(item.value);
                        setTypeOpen(false);
                      }}
                    >
                      {item.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* DATE FILTER */}
            <div className="recycle-menu-dropdown">
              <div className="dropdown-type">
                <div className="dropdown-label">
                  <BsCalendar2Week size={12}/>
                  DATE
                </div>
                <button
                  className="dropdown-trigger"
                  onClick={() => {
                    setDateOpen(!dateOpen);
                    setTypeOpen(false);
                  }}
                >
                  {dateFilter === "all" ? "All time" : dateFilter}
                   <span className="caret"><IoChevronDownOutline size={15}/></span>
                </button>
              </div>

              {dateOpen && (
                <ul className="dropdown-menu">
                  {[
                    { label: "All time", value: "all" },
                    { label: "Today", value: "today" },
                    { label: "Last 7 days", value: "7days" },
                    { label: "Last 30 days", value: "30days" },
                  ].map((item) => (
                    <li
                      key={item.value}
                      className={dateFilter === item.value ? "active" : ""}
                      onClick={() => {
                        setDateFilter(item.value);
                        setDateOpen(false);
                      }}
                    >
                      {item.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {selectedIds.length > 0 && (
              <button
                className="bulk-restore"
                onClick={handleBulkRestore}
              >
                Restore selected ({selectedIds.length})
              </button>
            )}
        </div>

        {/* header search  */}
        <div className="recycle-search">
          <IoSearchOutline />
          <input
            placeholder="Search deleted items…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="recycle-table">
      <table className="rb-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={
                  selectedIds.length === tableData.length &&
                  tableData.length > 0
                }
                onChange={selectAll}
              />
            </th>
            <th>NAME</th>
            <th>TYPE</th>
            <th>DELETE ON</th>
            <th style={{textAlign:'center'}}>ACTIONS</th>
          </tr>
        </thead>

        <tbody>
          {tableData.length === 0 ? (
            <tr>
              <td colSpan="5" className="empty">
                No deleted items
              </td>
            </tr>
          ) : (
            tableData.map((row) => (
              <tr key={row.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(row.id)}
                    onChange={() => toggleSelect(row.id)}
                  />
                </td>
                <td>{row.name}</td>
                <td className="capitalize">
                  <EntityBadge type={row.type} />
                </td>
                {/* <td className="capitalize">{row.type}</td> */}
                <td>
                  {new Date(row.deleted_at).toLocaleString(
                    "id-ID"
                  )}
                </td>
                <td className="actions"> 
                  <div className="action-group">
                    <button className="link" onClick={() => openRestoreModal(row)}>
                      <MdOutlineRestore/> Restore
                    </button>
                    |
                    <button onClick={()=> openDataDetail(row)}> <IoEyeSharp/> Detail</button>
                    |
                    {/* <button onClick={()=> handlePermanentDelete(row)}>  */}
                    <button 
                      onClick={() => {
                        setDeleteTarget(row);
                        setIsDeleteOpen(true);
                      }}
                    > 
                      <IoTrash/> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>

      {/* MODAL RESTORE  */}
      {showRestoreModal && (
        <div className="modal-overlay">
            <div className="modal-box">
                <h3>⚠️ RESTORE DATA</h3>

                <p>
                    Apakah kamu yakin ingin mengembalikan data
                    <strong> "#{restoreTarget?.id}" {restoreTarget?.name}</strong>?
                </p>

                <p >
                    Data ini akan dikembalikan ke daftar aktif.
                </p>

                <div className="modal-actions">
                    <button className="btn-cancel" onClick={closeRestoreModal} disabled={isRestoring}>
                    Cancel
                    </button>
                    <button className="btn-confirm" onClick={confirmRestore} disabled={isRestoring}>
                    Yes, Restore
                    </button>
                </div>
            </div>
        </div>
        )}

      {/* MODAL CONFIRM DELETE  */}
        {isDeleteOpen && (
            <div className="delete-modal-overlay">
                <div className="modal-delete">
                <h3>Delete archive data?</h3>

                <p>
                    This action will <strong>permanently delete</strong> this data.
                    <br />
                    You won’t be able to restore it.
                </p>

                <div className="modal-actions">
                    <button
                    className="btn-cancel"
                    onClick={() => setIsDeleteOpen(false)}
                    disabled={isDeleting}
                    >
                    Cancel
                    </button>

                    <button
                    className="btn-danger"
                    onClick={handlePermanentDelete}
                    disabled={isDeleting}
                    >
                    {isDeleting ? "Deleting..." : "Delete permanently"}
                    </button>
                </div>
                </div>
            </div>
         )}

        {/* PREVIEW DETAIL DATA DELETE  */}
         {selectData &&  (
          <div className="detail-data-modal">
              <div className="detail-data-content">
  
                  <div className="detail-archive-modal-header">
                      <div>
                          <h3>DATA DELETE DETAIL</h3>
                          <EntityBadge type={selectData.type} /> 
                      </div>
  
                      <button className="close-archive-btn" onClick={closeDataDetail}>
                          <IoIosCloseCircle/>
                      </button>
                  </div>
  
                  <div className="archive-modal-body">
                      {renderDataDelete()}
                  </div>
  
              </div>
          </div>
        )}

    </div>
  );
}
