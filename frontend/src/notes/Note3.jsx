<<<<<<< HEAD
=======
// src/services/ApiServices.js
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api"; // ganti sesuai base URL backend kamu

// Delete uploaded file
export const deleteUploadedFile = async (cardId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/delete-file/${cardId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting uploaded file:", error);
    throw error;
  }
};


import React, { useState } from "react";
import { deleteUploadedFile } from "../services/ApiServices";

const UploadedFileItem = ({ file, onDeleteSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Yakin mau hapus file ini?")) return;

    try {
      setLoading(true);
      await deleteUploadedFile(file.cardid); // pastikan nama field sama (cardId / cardid)
      alert("File berhasil dihapus");
      if (onDeleteSuccess) {
        onDeleteSuccess(file.cardid); // update state parent biar file hilang dari UI
      }
    } catch (err) {
      alert("Gagal menghapus file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="uploaded-file-item">
      <span>{file.filename}</span>
      <button onClick={handleDelete} disabled={loading}>
        {loading ? "Menghapus..." : "Hapus"}
      </button>
    </div>
  );
};

export default UploadedFileItem;

const UploadFile = ({ cardId, fetchCardById }) => {
  const [allUploadFile, setAllUploadFile] = useState([]);
  const [showSetting, setShowSetting] = useState(null);
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  // tutup ketika klik luar
  const settingRef = OutsideClick(() => setShowSetting(null));

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm("Yakin mau hapus file ini?")) return;
    try {
      setLoading(true);
      await deleteFile(fileId);
      showSnackbar("Delete file succesfully", "success");
      fetchCardById();
      setShowSetting(null);
    } catch (error) {
      console.log(error);
      showSnackbar("Failed delete file!", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUploadFile = async () => {
    try {
      const result = await getAllUploadFiles(cardId);
      setAllUploadFile(result.data);
    } catch (error) {
      console.error("Error fetching all file:", error);
    }
  };

  useEffect(() => {
    fetchAllUploadFile();
  }, [cardId]);

  const handleShowSetting = (fileId) => {
    setShowSetting(showSetting === fileId ? null : fileId);
  };

  return (
    <div className="upload-file-container">
      {Array.isArray(allUploadFile) &&
        allUploadFile.map((file, index) => (
          <div key={index} className="upload-cont">
            <div className="upload-cont-prev">
              <div className="upload-cont-header">
                <button onClick={() => handleShowSetting(file.cardid)}>
                  <HiAdjustments />
                </button>
              </div>
              <div
                className="upload-icon"
                style={{ color: iconColor[file.type] }}
              >
                {iconType[file.type] || <AiOutlineFileUnknown />}
              </div>

              {/* hanya tampil kalau cocok */}
              {showSetting === file.cardid && (
                <div className="file-set" ref={settingRef}>
                  <div
                    className="del-btn"
                    onClick={() => handleDeleteFile(file.cardid)}
                  >
                    Delete file
                  </div>
                </div>
              )}
            </div>

            <div className="upload-cont-body">
              <div className="upload-desc">
                <h5>{file.file_name}</h5>
                <p>{formatDate(file.uploaded_at)}</p>
                <BootstrapTooltip title="View File" placement="top">
                  <a
                    href={file.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View
                  </a>
                </BootstrapTooltip>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};
>>>>>>> c1cde09 (perubahan di fitur attach)
