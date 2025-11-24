import React, { useState } from 'react'
import '../style/pages/MasterDataMusik.css'
import { HiOutlineSearch } from 'react-icons/hi'
import TabelDataMaster from '../fitur/TabelDataMaster';
import axios from 'axios';

function MasterDataMusik() {
  const [activeData, setActiveData] = useState('input');
  const [selectedData, setSelectedData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [currentEndpoint, setCurrentEndpoint] = useState("");

  const API_URL = process.env.REACT_APP_API_URL;

  // GENERIC DELETE
  const handleDelete = async (endpoint, id) => {
    if (window.confirm("Yakin mau hapus data ini?")) {
      await axios.delete(`${API_URL}/${endpoint}/${id}`);
      alert("Berhasil hapus data");
      window.location.reload();
    }
  };

  // GENERIC EDIT
  const handleEdit = async (endpointEdit, id, cols) => {
    setCurrentEndpoint(endpointEdit);

    const detail = await axios.get(`${API_URL}/${endpointEdit}/${id}`);
    setSelectedData(detail.data);
    setSelectedColumns(cols);
    setShowEditModal(true);
  };

  // GENERIC SAVE / UPDATE
  const handleSave = async () => {
    try {
      // buat object baru hanya berisi kolom yang boleh diupdate
      const payload = {};
      selectedColumns.forEach(col => {
        payload[col.key] = selectedData[col.key];
      });

      console.log("DEBUG PAYLOAD:", payload);
    console.log("DEBUG ID:", selectedData);

      await axios.put(`${API_URL}/${currentEndpoint}/${selectedData.id}`, payload);
      alert("Berhasil update data");
      setShowEditModal(false);
      window.location.reload();
    } catch (err) {
      console.error("❌ Gagal update:", err);
      alert("Gagal update data");
    }
};


  const renderDataMaster = () => {
    switch (activeData) {
      case 'input':
        return (
          <TabelDataMaster
            title="Marketing User"
            endpoint={`${API_URL}/marketing-users`}
            columns={[
              { key: "nama_marketing", label: "Nama" },
              { key: "divisi", label: "Divisi" }
            ]}
            onEdit={(row) => handleEdit("marketing-users", row.id, [
              { key: "nama_marketing", label: "Nama" },
              { key: "divisi", label: "Divisi" }
            ])}
            onDelete={(row) => handleDelete("marketing-users", row.id)}
          />
        );

      case 'kadiv':
        return (
          <TabelDataMaster
            title="Kepala Divisi"
            endpoint={`${API_URL}/kepala-divisi`}
            columns={[
              { key: "nama", label: "Nama" },
              { key: "divisi", label: "Divisi" }
            ]}
          />
        );

      case 'status':
        return <div className="fade">Status Project</div>;
      case 'account':
        return <div className="fade">Account Name</div>;
      case 'ot':
        return <div className="fade">Order Type</div>;
      case 'of':
        return <div className="fade">Offer Type</div>;
      case 'jt':
        return <div className="fade">Jenis Track</div>;
      case 'genre':
        return <div className="fade">Genre Music</div>;
      case 'pt':
        return <div className="fade">Project Type</div>;
      case 'kupon':
        return <div className="fade">Jenis Kupon</div>;
    }
  };

  return (
    <div className='master-page'>
      <div className="mp-sidebar">
        <div className="mp-title">
          <h4>Data Master</h4>
          <div className="mp-search">
            <HiOutlineSearch className='mps-icon' />
            <input type="search" placeholder='Search ' />
          </div>

          <div className="main-sidebar">
            <button className={activeData === 'input' ? 'active' : ''} onClick={() => setActiveData('input')}>Marketing User</button>
            <button className={activeData === 'kadiv' ? 'active' : ''} onClick={() => setActiveData('kadiv')}>Kepala Divisi</button>
            <button className={activeData === 'status' ? 'active' : ''} onClick={() => setActiveData('status')}>Status Project</button>
            <button className={activeData === 'account' ? 'active' : ''} onClick={() => setActiveData('account')}>Account Name</button>
            <button className={activeData === 'ot' ? 'active' : ''} onClick={() => setActiveData('ot')}>Order Type</button>
            <button className={activeData === 'of' ? 'active' : ''} onClick={() => setActiveData('of')}>Offer Type</button>
            <button className={activeData === 'jt' ? 'active' : ''} onClick={() => setActiveData('jt')}>Jenis Track</button>
            <button className={activeData === 'genre' ? 'active' : ''} onClick={() => setActiveData('genre')}>Genre Music</button>
            <button className={activeData === 'pt' ? 'active' : ''} onClick={() => setActiveData('pt')}>Project Type</button>
            <button className={activeData === 'kupon' ? 'active' : ''} onClick={() => setActiveData('kupon')}>Jenis Kupon</button>
          </div>
        </div>
      </div>

      <div className="mp-body">
        <div className="master-name">{renderDataMaster()}</div>
        <div className="master-data"></div>
      </div>

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Data</h3>

            {selectedColumns.map(col => (
              <div className="form-group" key={col.key}>
                <label>{col.label}</label>
                <input
                  type="text"
                  value={selectedData[col.key] || ""}
                  onChange={(e) =>
                    setSelectedData({ ...selectedData, [col.key]: e.target.value })
                  }
                />
              </div>
            ))}

            <button onClick={() => setShowEditModal(false)}>Close</button>
            <button className="btn-save" onClick={handleSave}>Save</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MasterDataMusik;
