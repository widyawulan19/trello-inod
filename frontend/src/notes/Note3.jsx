import React, { useEffect, useState } from 'react'
import '../style/pages/MasterDataMusik.css'
import { HiOutlineSearch } from 'react-icons/hi'
import TabelDataMaster from '../fitur/TabelDataMaster';
import axios from 'axios';
import { useSnackbar } from '../context/Snackbar';

function MasterDataMusik() {
  const [activeData, setActiveData] = useState('input');
  const [tableData, setTableData] = useState([]);
  const [selectedData, setSelectedData] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [currentEndpoint, setCurrentEndpoint] = useState("");
  const [currentEdnpoinAdd, setCurrentEndpointAdd] = useState("");
  const {showSnackbar} = useSnackbar();

  const API_URL = process.env.REACT_APP_API_URL;

  // FETCH ALL DATA BASED ON ACTIVE MENU
  const fetchAll = async (type) => {
    try {
      let endpoint = "";

      if (type === "input") endpoint = "marketing-users";
      if (type === "kadiv") endpoint = "kepala-divisi";

      const res = await axios.get(`${API_URL}/${endpoint}`);
      setTableData(res.data);

    } catch (err) {
      console.error("Gagal fetch data:", err);
    }
  };

  // INITIAL LOAD + SAAT MENU DIGANTI
  useEffect(() => {
    fetchAll(activeData);
  }, [activeData]);

  const handleAdd = (endpoint, cols) => {
    setCurrentEndpointAdd(endpoint);
    setSelectedColumns(cols);
    setSelectedData({});  // data kosong untuk input
    setShowEditModal(true);
  };

  const handleSaveAdd = async () => {
    try {
      const payload = {};
      selectedColumns.forEach(col => {
        payload[col.key] = selectedData[col.key];
      });

      await axios.post(`${API_URL}/${currentEdnpoinAdd}`, payload);
      showSnackbar('Berhasil tambah data', 'success');

      setShowEditModal(false);
      fetchAll(activeData);

    } catch (err) {
      showSnackbar('Gagal tambah data', 'error');
    }
  };

  // GENERIC DELETE
  const handleDelete = async (endpoint, id) => {
    if (window.confirm("Yakin mau hapus data ini?")) {
      await axios.delete(`${API_URL}/${endpoint}/${id}`);
      alert("Berhasil hapus data");
      showSnackbar("Data Berhasil dihapus!",'success')
      fetchAll(activeData);
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

      await axios.put(`${API_URL}/${currentEndpoint}/${selectedData.id}`, payload);
      showSnackbar('Berhasil update data','success');

      setShowEditModal(false);
      fetchAll(activeData)

    } catch (err) {
      console.error("❌ Gagal update:", err);
      showSnackbar('Gagal update data!', 'error')
    }
};

// pilih action save
  const handlePickSave = () => {
    selectedData.id ? handleSave() : handleSaveAdd();
  };

  const renderDataMaster = () => {
    switch (activeData) {
      case 'input':
        return (
          <TabelDataMaster
            title="Marketing User"
            endpoint={`${API_URL}/marketing-users`}
            data={tableData}
            btnName="Marketing User"
            // fetchData={fetchData}
            columns={[
              { key: "nama_marketing", label: "Nama" },
              { key: "divisi", label: "Divisi" }
            ]}
            onAdd={() => handleAdd("marketing-users", [
              { key: "nama_marketing", label: "Nama" },
              { key: "divisi", label: "Divisi" }
            ])}
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
            <h3>{selectedData.id ? "Edit Data": 'Add New Data'}</h3>

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

            <div className="btn-modal">
              <button onClick={() => setShowEditModal(false)}>Close</button>
              <button className="btn-modal-save" onClick={handlePickSave}>Save</button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  )
}

export default MasterDataMusik;
