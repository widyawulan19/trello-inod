import React, { useEffect, useState } from 'react'
import '../style/pages/MasterDataMusik.css'
import { HiOutlineArrowCircleLeft, HiOutlineSearch } from 'react-icons/hi'
import TabelDataMaster from '../fitur/TabelDataMaster';
import axios from 'axios';
import { useSnackbar } from '../context/Snackbar';
import { HiOutlineCircleStack } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';

function MasterDataMusik() {
  const [activeData, setActiveData] = useState('input');
  const [tableData, setTableData] = useState([]);
  const [selectedData, setSelectedData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [currentEndpoint, setCurrentEndpoint] = useState("");
  const [currentEndpointAdd, setCurrentEndpointAdd] = useState("");

  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const API_URL = process.env.REACT_APP_API_URL;

  // FETCH DATA BY MENU
  const fetchAll = async (type) => {
    try {
      let endpoint = "";
      if (type === "input") endpoint = "marketing-users";
      if (type === "kadiv") endpoint = "kepala-divisi";
      if (type === "status") endpoint = "accept-status";
      if (type === "account") endpoint = "accounts-music";
      if (type === "ot") endpoint = "music-order-types";
      if (type === "of") endpoint = "offer-types-music";
      if (type === "jt") endpoint = "track-types";
      if (type === "genre") endpoint = "genre-music";
      if (type === "pt") endpoint = "project-types-music";
      if (type === "kupon") endpoint = "kupon-diskon";

      const res = await axios.get(`${API_URL}/${endpoint}`);
      setTableData(res.data);
    } catch (err) {
      console.error("Gagal fetch data:", err);
    }
  };

  useEffect(() => {
    fetchAll(activeData);
  }, [activeData]);

  // ADD BUTTON CLICK
  const handleAdd = (endpointAdd, cols) => {
    setCurrentEndpointAdd(endpointAdd); // endpoint for POST add
    setSelectedColumns(cols);
    setSelectedData({});
    setShowEditModal(true);
  };

  // SAVE FOR ADD
  const handleSaveAdd = async () => {
    try {
      const payload = {};
      selectedColumns.forEach(col => {
        payload[col.key] = selectedData[col.key];
      });

      await axios.post(`${API_URL}/${currentEndpointAdd}`, payload);

      showSnackbar("Berhasil tambah data", "success");
      setShowEditModal(false);
      fetchAll(activeData);

    } catch (err) {
      showSnackbar("Gagal tambah data", "error");
      console.error(err);
    }
  };

  // DELETE
  const handleDelete = async (endpoint, id) => {
    if (window.confirm("Yakin mau hapus data ini?")) {
      await axios.delete(`${API_URL}/${endpoint}/${id}`);
      showSnackbar("Data berhasil dihapus!", "success");
      fetchAll(activeData);
    }
  };

  // EDIT BUTTON CLICK
  const handleEdit = async (endpointEdit, id, cols) => {
    setCurrentEndpoint(endpointEdit);

    const detail = await axios.get(`${API_URL}/${endpointEdit}/${id}`);
    setSelectedData(detail.data);
    setSelectedColumns(cols);
    setShowEditModal(true);
  };

  // SAVE EDIT
  const handleSave = async () => {
    try {
      const payload = {};
      selectedColumns.forEach(col => {
        payload[col.key] = selectedData[col.key];
      });

      await axios.put(`${API_URL}/${currentEndpoint}/${selectedData.id}`, payload);

      showSnackbar("Berhasil update data", "success");
      setShowEditModal(false);
      fetchAll(activeData);

    } catch (err) {
      showSnackbar("Gagal update data", "error");
    }
  };

  // PICK ADD OR EDIT
  const handlePickSave = () => {
    selectedData.id ? handleSave() : handleSaveAdd();
  };

  const renderDataMaster = () => {
    switch (activeData) {
      case 'input':
        return (
          <TabelDataMaster
            title="Marketing User (Musik)"
            endpoint="marketing-users"       // GET, UPDATE, DELETE
            endpointAdd="marketing-users"    // POST ADD
            data={tableData}
            btnName="Marketing User"
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
            title="Kepala Divisi Musik"
            endpoint="kepala-divisi"
            endpointAdd="kepala-divisi"
            data={tableData}
            btnName="Kepala Divisi"
            columns={[
              { key: "nama", label: "Nama" },
              { key: "divisi", label: "Divisi" }
            ]}
            onAdd={() => handleAdd("kepala-divisi", [
              { key: "nama", label: "Nama" },
              { key: "divisi", label: "Divisi" }
            ])}
            onEdit={(row)=> handleEdit("kepala-divisi", row.id,[
              {key: "nama", label:"Nama"},
              {key: "divisi", label:"Divisi"}
            ])}
            onDelete={(row) => handleDelete("kepala-divisi", row.id)}
          />
        );

        case 'status':
          return(
            <TabelDataMaster
              title="Status Project"
              endpoint="accept-status"
              endpointAdd="accept-status"
              data={tableData}
              btnName="Status Project"
              columns={[
                {key:"status_name", label:"Nama"}
              ]}
              onAdd={() => handleAdd("accept-status",[
                {key:"status_name", label:"Nama"}
              ])}
              onEdit={(row)=> handleEdit("accept-status", row.id,[
                {key:"status_name", label:"Nama"}
              ])}
              onDelete={(row)=> handleDelete("accept-status", row.id)}
            />
          );

          case 'account':
            return (
              <TabelDataMaster
                title="Music Account"
                endpoint="accounts-music"
                endpointAdd="accounts-music"
                data={tableData}
                btnName="Music Account"
                columns={[
                  {key:"nama_account", label:"Nama"}
                ]}
                onAdd={() => handleAdd("accounts-music",[
                  {key:"nama_account", label:"Nama"}
                ])}
                onEdit={(row)=> handleEdit("accounts-music", row.id,[
                  {key:"nama_account", label:"Nama"}
                ])}
                onDelete={(row)=> handleDelete("accounts-music", row.id)}
              />
            );

          case 'ot':
            return (
              <TabelDataMaster
                title="Order Type Music"
                endpoint="music-order-types"
                endpointAdd="music-order-types"
                data={tableData}
                btnName="Order Type"
                columns={[
                  {key:"order_name", label:"Nama"}
                ]}
                onAdd={() => handleAdd("music-order-types",[
                  {key:"order_name", label:"Nama"}
                ])}
                onEdit={(row)=> handleEdit("music-order-types", row.id,[
                  {key:"order_name", label:"Nama"}
                ])}
                onDelete={(row)=> handleDelete("music-order-types", row.id)}
              />
            );

            case 'of':
              return (
                <TabelDataMaster
                  title="Offer Type Music"
                  endpoint="offer-types-music"
                  endpointAdd="offer-types-music"
                  data={tableData}
                  btnName="Offer Type"
                  columns={[
                    {key:"offer_name", label:"Nama"}
                  ]}
                  onAdd={() => handleAdd("offer-types-music",[
                    {key:"offer_name", label:"Nama"}
                  ])}
                  onEdit={(row)=> handleEdit("offer-types-music", row.id,[
                    {key:"offer_name", label:"Nama"}
                  ])}
                  onDelete={(row)=> handleDelete("offer-types-music", row.id)}
                />
              );

              case 'jt':
                return (
                  <TabelDataMaster
                    title="Music Track Type"
                    endpoint="track-types"
                    endpointAdd="track-types"
                    data={tableData}
                    btnName="Track Type"
                    columns={[
                      {key:"track_name", label:"Nama"}
                    ]}
                    onAdd={() => handleAdd("track-types",[
                      {key:"track_name", label:"Nama"}
                    ])}
                    onEdit={(row)=> handleEdit("track-types", row.id,[
                      {key:"track_name", label:"Nama"}
                    ])}
                    onDelete={(row)=> handleDelete("track-types", row.id)}
                  />
                );

              case 'genre':
                return (
                  <TabelDataMaster
                    title="Genre Music"
                    endpoint="genre-music"
                    endpointAdd="genre-music"
                    data={tableData}
                    btnName="Genre Music"
                    columns={[
                      {key:"genre_name", label:"Nama"}
                    ]}
                    onAdd={() => handleAdd("genre-music",[
                      {key:"genre_name", label:"Nama"}
                    ])}
                    onEdit={(row)=> handleEdit("genre-music", row.id,[
                      {key:"genre_name", label:"Nama"}
                    ])}
                    onDelete={(row)=> handleDelete("genre-music", row.id)}
                  />
                );
              
              case 'pt':
                return (
                  <TabelDataMaster
                    title="Music Project Type"
                    endpoint="project-types-music"
                    endpointAdd="project-types-music"
                    data={tableData}
                    btnName="Project Type"
                    columns={[
                        {key:"nama_project", label:"Nama"}
                      ]}
                      onAdd={() => handleAdd("project-types-music",[
                        {key:"nama_project", label:"Nama"}
                      ])}
                      onEdit={(row)=> handleEdit("project-types-music", row.id,[
                        {key:"nama_project", label:"Nama"}
                      ])}
                      onDelete={(row)=> handleDelete("project-types-music", row.id)}
                  />
                );
              case 'kupon':
                return(
                  <TabelDataMaster
                    title="Kupon Diskon"
                    endpoint="kupon-diskon"
                    endpointAdd="kupon-diskon"
                    data={tableData}
                    btnName="Kupon Diskon"
                    columns={[
                      {key:"nama_kupon", label:"Nama"}
                    ]}
                    onAdd={() => handleAdd("kupon-diskon",[
                      {key:"nama_kupon", label:"Nama"}
                    ])}
                    onEdit={(row)=> handleEdit("kupon-diskon", row.id,[
                      {key:"nama_kupon", label:"Nama"}
                    ])}
                    onDelete={(row)=> handleDelete("kupon-diskon", row.id)}
                  />
                )
      default:
        return <div className="fade">Coming Soon</div>;
    }
  };

  // navigate 
  const navigateToDataMarketing = () =>{
    navigate('/layout/data-marketing');
  }

  return (
    <div className='master-page'>
      <div className="mp-sidebar">
        <div className="mp-title">
          <h4>Data Master</h4>
          <div className="mp-search" onClick={navigateToDataMarketing}>
            {/* <HiOutlineCircleStack className='mps-icon' /> */}
            <HiOutlineArrowCircleLeft className='mps-icon'/>
            Data Marekting
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
      </div>

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{selectedData.id ? "Edit Data" : "Add New Data"}</h3>

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
  );
}

export default MasterDataMusik;
