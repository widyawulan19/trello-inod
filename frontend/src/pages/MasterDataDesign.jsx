import axios from 'axios';
import React, { useEffect, useState } from 'react'
import TabelDataMasterDesign from '../fitur/TabelDataMasterDesign';
import { HiOutlineArrowCircleLeft } from 'react-icons/hi';
import '../style/pages/MasterDataMusik.css'
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from '../context/Snackbar';

const MasterDataDesign=()=> {
    //STATE
    const [activeData, setActiveData] = useState('input');
    const [tableData,setTableData] = useState([]);
    const [selectedData, setSelectedData] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [currentEndpoint, setCurrentEndpoint] = useState("");
    const [currentEndpointAdd, setCurrentEndpointAdd] = useState("");

    const API_URL = process.env.REACT_APP_API_URL;
    const navigate = useNavigate();
    const {showSnackbar} = useSnackbar();

    //FUNCTION
    // 1. fetch all data 
    const fetchAllData = async (type) =>{
        try{
            let endpoin = "";
            if(type === "input") endpoin= "marketing-desain-users";
            if(type === 'kadiv') endpoin= "kepala-divisi-design";
            if(type === 'account') endpoin = "account-design";
            if(type === 'oft') endpoin = "offer-type-design";
            if(type === 'style') endpoin = "style-design";
            if(type === 'ptd') endpoin = "project-type-design";
            if(type === 'otd') endpoin = 'design-order-type';
            if(type === 'status') endpoin = "status-project-design";

            const res = await axios.get(`${API_URL}/${endpoin}`);
            setTableData(res.data);
        }catch(error){
            console.log('Gagal fetch data:', error)
        }
    };

    useEffect(() => {
        fetchAllData(activeData);
    },[activeData]);

    // 2. fungsi add new data 
    // button add 
    const handleAdd = (endpointAdd, cols) =>{
      setCurrentEndpointAdd(endpointAdd);
      setSelectedColumns(cols);
      setSelectedData({});
      setShowEditModal(true);
    }

    //fungsi save add
    const handleSaveAdd = async () =>{
      try{
        const payload = {};
        selectedColumns.forEach(col => {
          payload[col.key] = selectedData[col.key];
        });

        await axios.post(`${API_URL}/${currentEndpointAdd}`, payload);

        showSnackbar("Berhasil tambah data", "success");
        setShowEditModal(false);
        fetchAllData(activeData);
      }catch(error){
        console.log("Error add data:", error)
        showSnackbar("Gagal tambah data", "error");
      }
    }

    // 3. fungsi edit data 
    const handleEdit = async(endpoint, id, cols) =>{
      setCurrentEndpoint(endpoint);

      const detail = await axios.get(`${API_URL}/${endpoint}/${id}`);
      setSelectedData(detail.data);
      setSelectedColumns(cols);
      setShowEditModal(true);
    }

    // save edit 
    const handleSave = async () => {
      try {
        const payload = {};
        selectedColumns.forEach(col => {
          payload[col.key] = selectedData[col.key];
        });

        await axios.put(`${API_URL}/${currentEndpoint}/${selectedData.id}`, payload);

        showSnackbar("Berhasil update data", "success");
        setShowEditModal(false);
        fetchAllData(activeData);

      } catch (err) {
        showSnackbar("Gagal update data", "error");
      }
    };

    // PICK ADD OR EDIT
    const handlePickSave = () => {
      selectedData.id ? handleSave() : handleSaveAdd();
    };

    //3.fungsi delete 
    const handleDelete = async (endpoint, id) =>{
      if(window.confirm("Yakin mau hapus data ini?")){
          await axios.delete(`${API_URL}/${endpoint}/${id}`);
          showSnackbar("Data berhasil dihapus!", "success");
          fetchAllData(activeData)
      }
    }

    // . function render data fetch 
    const renderDataMaster = () =>{
        switch (activeData) {
            case 'input':
                return (
                    <TabelDataMasterDesign
                        title="Marketing User (Design)"
                        endpoint="marketing-desain-users"
                        endpointAdd="marketing-desain-users"
                        data={tableData}
                        btnName="Marketing User"
                        columns={[
                            { key: "nama_marketing", label: "Nama" },
                            { key: "divisi", label: "Divisi" }
                        ]}
                        onAdd={() => handleAdd("marketing-desain-users", [
                          { key: "nama_marketing", label: "Nama" },
                          { key: "divisi", label: "Divisi" }
                        ])}    
                        onEdit={(row) => handleEdit("marketing-desain-users", row.id, [
                          { key: "nama_marketing", label: "Nama" },
                          { key: "divisi", label: "Divisi" }
                        ])}  
                        onDelete={(row)=> handleDelete("marketing-desain-users", row.id)}
                    />
                );
            case 'kadiv':
              return(
                <TabelDataMasterDesign
                    title="Kepala Divisi (Design)"
                    endpoint="kepala-divisi-design"
                    endpointAdd="kepala-divisi-design"
                    data={tableData}
                    btnName="Kepala Divisi"
                    columns={[
                        { key: "nama", label: "Nama" },
                        { key: "divisi", label: "Divisi" }
                    ]}
                    onAdd={() => handleAdd("kepala-divisi-design", [
                      { key: "nama", label: "Nama" },
                      { key: "divisi", label: "Divisi" }
                    ])}    
                    onEdit={(row) => handleEdit("kepala-divisi-design", row.id, [
                      { key: "nama", label: "Nama" },
                      { key: "divisi", label: "Divisi" }
                    ])}  
                    onDelete={(row)=> handleDelete("kepala-divisi-design", row.id)}
                />
              )
            case 'account':
              return(
                <TabelDataMasterDesign
                    title="Account (Design)"
                    endpoint="account-design"
                    endpointAdd="account-design"
                    data={tableData}
                    btnName="Account"
                    columns={[
                        { key: "nama_account", label: "Nama" }
                    ]}
                    onAdd={() => handleAdd("account-design", [
                      { key: "nama_account", label: "Nama" }
                    ])}    
                    onEdit={(row) => handleEdit("account-design", row.id, [
                      { key: "nama_account", label: "Nama" }
                    ])}  
                    onDelete={(row)=> handleDelete("account-design", row.id)}
                />
              )
            case 'oft':
              return(
                <TabelDataMasterDesign
                    title="Offer Type (Design)"
                    endpoint="offer-type-design"
                    endpointAdd="offer-type-design"
                    data={tableData}
                    btnName="Offer Type"
                    columns={[
                        { key: "offer_name", label: "Nama" }
                    ]}
                    onAdd={() => handleAdd("offer-type-design", [
                      { key: "offer_name", label: "Nama" }
                    ])}    
                    onEdit={(row) => handleEdit("offer-type-design", row.id, [
                      { key: "offer_name", label: "Nama" }
                    ])}  
                    onDelete={(row)=> handleDelete("offer-type-design", row.id)}
                />
              )
            case 'style':
              return(
                <TabelDataMasterDesign
                    title="Style (Design)"
                    endpoint="style-design"
                    endpointAdd="style-design"
                    data={tableData}
                    btnName="Style Type"
                    columns={[
                        { key: "style_name", label: "Nama" }
                    ]}
                    onAdd={() => handleAdd("style-design", [
                      { key: "style_name", label: "Nama" }
                    ])}    
                    onEdit={(row) => handleEdit("style-design", row.id, [
                      { key: "style_name", label: "Nama" }
                    ])}  
                    onDelete={(row)=> handleDelete("style-design", row.id)}
                />
              )
            case 'ptd':
              return(
                <TabelDataMasterDesign
                    title="Project Type (Design)"
                    endpoint="project-type-design"
                    endpointAdd="project-type-design"
                    data={tableData}
                    btnName="Project Type"
                    columns={[
                        { key: "project_name", label: "Nama" }
                    ]}
                    onAdd={() => handleAdd("project-type-design", [
                      { key: "project_name", label: "Nama" }
                    ])}    
                    onEdit={(row) => handleEdit("project-type-design", row.id, [
                      { key: "project_name", label: "Nama" }
                    ])}  
                    onDelete={(row)=> handleDelete("project-type-design", row.id)}
                />
              )
             case 'otd':
              return(
                <TabelDataMasterDesign
                    title="Order Type (Design)"
                    endpoint="design-order-type"
                    endpointAdd="design-order-type"
                    data={tableData}
                    btnName="Order Type"
                    columns={[
                        { key: "order_name", label: "Nama" }
                    ]}
                    onAdd={() => handleAdd("design-order-type", [
                      { key: "order_name", label: "Nama" }
                    ])}    
                    onEdit={(row) => handleEdit("design-order-type", row.id, [
                      { key: "order_name", label: "Nama" }
                    ])}  
                    onDelete={(row)=> handleDelete("design-order-type", row.id)}
                />
              )
            case 'status':
              return(
                <TabelDataMasterDesign
                    title="Status Project (Design)"
                    endpoint="status-project-design"
                    endpointAdd="status-project-design"
                    data={tableData}
                    btnName="Status Project"
                    columns={[
                        { key: "status_name", label: "Nama" }
                    ]}
                    onAdd={() => handleAdd("status-project-design", [
                      { key: "status_name", label: "Nama" }
                    ])}    
                    onEdit={(row) => handleEdit("status-project-design", row.id, [
                      { key: "status_name", label: "Nama" }
                    ])}  
                    onDelete={(row)=> handleDelete("status-project-design", row.id)}
                />
              )
        }
      }

    // NAVIGATE TO MAIN DATA 
    const navigateToMainData = () =>{
        navigate('/layout/marketing-design')
    }
    

    
  return (
      <div className='master-page'>
        <div className="mp-sidebar">
          <div className="mp-title">
            <h4>Data Master</h4>
            <div className="mp-search" onClick={navigateToMainData}>
              {/* <HiOutlineCircleStack className='mps-icon' /> */}
              <HiOutlineArrowCircleLeft className='mps-icon'/>
              Data Marekting
            </div>
  
            <div className="main-sidebar">
              <button className={activeData === 'input' ? 'active' : ''} onClick={() => setActiveData('input')}>Marketing User</button>
              <button className={activeData === 'kadiv' ? 'active' : ''} onClick={() => setActiveData('kadiv')}>Kepala Divisi</button>
              <button className={activeData === 'account' ? 'active' : ''} onClick={() => setActiveData('account')}>Account</button>
              <button className={activeData === 'oft' ? 'active' : ''} onClick={() => setActiveData('oft')}>Offer Type</button>
              <button className={activeData === 'style' ? 'active' : ''} onClick={() => setActiveData('style')}>Style</button>
              <button className={activeData === 'ptd' ? 'active' : ''} onClick={() => setActiveData('ptd')}>Project Type</button>
              <button className={activeData === 'otd' ? 'active' : ''} onClick={() => setActiveData('otd')}>Order Type</button>
              <button className={activeData === 'status' ? 'active' : ''} onClick={() => setActiveData('status')}>Status Project</button>
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

export default MasterDataDesign