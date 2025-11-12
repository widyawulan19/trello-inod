import React, { useEffect, useState, useRef } from "react";
import { getAllDataMarketing,getAllDataMarketingJoined, deleteDataMarketing, getDataMarketingAccepted, getDataMarketingWithCardId, getDataMarketingWithCardIdNull, getDataMarketingRejected, archiveDataMarketing, getAllMarketingExports, exportDataMarketingToSheets, addExportMarketing, updateMarketingPosition } from "../services/ApiServices";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import "../style/pages/DataMarketing.css";
import { HiArrowsUpDown, HiChevronUpDown, HiMiniTableCells, HiOutlineArchiveBox, HiOutlineCircleStack, HiOutlinePencil, HiOutlinePlus, HiOutlineTrash, HiOutlineXCircle } from "react-icons/hi2";
import { HiChevronDown, HiChevronUp, HiOutlineFilter, HiOutlineSearch } from "react-icons/hi";
import BootstrapTooltip from "../components/Tooltip";
import ViewDataMarketing from "./ViewDataMarketing";
import EditMarketingForm from "./EditMarketingForm";
import NewEditDataMarketing from "./NewEditDataMarketing";
import FormDataMarketing from "./FormDataMarketing";
import { useSnackbar } from "../context/Snackbar";
import DataMarketingDeleteConfirm from "../modals/DataMarketingDeleteConfirm";
import OutsideClick from "../hook/OutsideClick";
import { IoEyeSharp } from "react-icons/io5";
import { handleArchive } from "../utils/handleArchive";
import ExportDataMarketing from "../exports/ExportDataMarketing";
import { FaXmark } from "react-icons/fa6";
import { AiFillCheckCircle } from "react-icons/ai";
import FormMarketingExample from "../example/FormMarketingExample";
import { MdLockReset } from "react-icons/md";
import ResetCounter from "../fitur/ResetCounter";

const DataMarketing = () => {
  const location = useLocation();
  // const {workspaceId, boardId, listId,cardId} = location.state || {}

  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");
  const boardId = searchParams.get("boardId");
  const listId = searchParams.get("listId");
  const cardId = searchParams.get("cardId");

  const [marketingTransfile, setMarketingTransfile] = useState([]);
  const [isExported, setIsExported] = useState(false);

  const [data, setData] = useState([]);
  const [dataMarketing, setDataMarketing] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedMarketingId, setSelectedMarketingId] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showFormCreate, setShowFormCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  // const {workspaceId, boardId} = useParams();
  console.log('lihat select marketingId pada file ini', selectedMarketingId);  //SATE DELETE CONFIRM
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const {showSnackbar} = useSnackbar();
  //FILTER DATA
  const [filterType, setFilterType] = useState('DATA MARKETING')
  const [filters, setFilters] = useState({
    buyer_name:'',
    order_number:'',
    account:'',
  })
  //ACCEPT DATA
  const [showAcceptData, setShowAcceptData] = useState([]);

  //SHOW STATE
  const [showData, setShowData] = useState(false)
  const showDataRef = OutsideClick(()=> setShowData(false));
  const [showFilter,setShowFilter] = useState(false)
  const showFilterRef = OutsideClick(()=> setShowFilter(false))
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [shortType, setShortType] = useState('');
  const [showCounterReset, setShowCounterReset] = useState(false);

  // FUNGSI SHOW FORM RESET COUNTER 
  const handleShowCounterReset = () =>{
    setShowCounterReset(!showCounterReset)
  }
  const handleCloseCounterReset = () =>{
    setShowCounterReset(false)
  }

//   FUNGSI SHOW DETAIL 
  const handleShowDetail = (marketingId)=>{
    // e.stopPropagation();
    setSelectedMarketingId(marketingId)
    setShowDetail(!showDetail);
  }
  const handleCloseDetail = ()=>{
    setShowDetail(false)
  }

//FUNGSI SHOW EDIT FORM
const handleShowEditForm = (marketingId) =>{
    setShowEditForm(!showEditForm)
    setSelectedMarketingId(marketingId)
}
const handleCloseEditForm = ()=>{
    setShowEditForm(false)
}

//FUNGSI SHOW CREATE FORM
const handleShowForm = () =>{
    setShowFormCreate(!showFormCreate)
}
const handleCloseForm = () =>{
    setShowFormCreate(false)
}


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async() =>{
    setLoading(true)
    try{
      let response;
      if(filterType === 'DATA MARKETING DENGAN CARD'){
        response = await getDataMarketingWithCardId();
      }else if(filterType === 'DATA MARKETING TANPA CARD'){
        response = await getDataMarketingWithCardIdNull();
      }else if(filterType === 'DATA MARKETING ACCEPTED'){
        response = await getDataMarketingAccepted();
      }else if(filterType === 'DATA MARKETING NOT ACCEPTED'){
        response = await getDataMarketingRejected();
      }else if(filterType === 'SEMUA DATA MARKETING'){
        // response = await getAllDataMarketing();
        response = await getAllDataMarketingJoined();
      }

      console.log("📦 Response dari API:", response);

      setData(response.data || response);
      setFilteredData(response.data || response);

    }catch(error){
      console.error('Error fetching data marekting woi:', error)
    }finally{
      setLoading(false)
    }
  }
  useEffect(()=>{
    fetchData();
  },[filterType])

  useEffect(() => {
     let temp = [...data];
     if (filters.buyer_name) {
       temp = temp.filter((item) =>
         item.buyer_name.toLowerCase().includes(filters.buyer_name.toLowerCase())
       );
     }
     if (filters.order_number) {
       temp = temp.filter((item) =>
         item.order_number.toLowerCase().includes(filters.order_number.toLowerCase())
       );
     }
     if (filters.account_name) {
       temp = temp.filter((item) =>
         item.account_name.toLowerCase().includes(filters.account_name.toLowerCase())
       );
     }
     if (filters.input_by_name) {
       temp = temp.filter((item) =>
         item.input_by_name.toLowerCase().includes(filters.input_by_name.toLowerCase())
       );
     }
     setFilteredData(temp);
   }, [filters, data]);

   const handleFilterChange = (e) => {
     const { name, value } = e.target;
     setFilters((prev) => ({
       ...prev,
       [name]: value,
     }));
   };

  const handleEdit = (id) => {
    navigate(`/layout/edit-marketing/${id}`); // Redirect ke halaman edit
  };

  const handleToMarketingDetail = (marketinId) => {
    navigate(`/layout/data-marketing/${marketinId}`)
  }

  const handleToDataMaster = () =>{
    navigate(`/layout/data-master-musik`)
  }

  

//FUNGSI DELETE CONFIRM
const handleDeleteClick = (marketingId) =>{
  setSelectedMarketingId(marketingId)
  setShowDeleteConfirm(true)
}

const confirmDelete = async()=>{
  try{
    console.log('komponen delete marketing dapat menerima data marketing ID:', selectedMarketingId)
    const response = await deleteDataMarketing(selectedMarketingId)
    showSnackbar('Data Marketing deleted successfully', 'success')
    console.log('Berhasil menghapus data marketing', response.data)
    fetchData() 
    fetchDataMarketing()
  }catch(error){
    showSnackbar('Failed to delete Data Marketing','error')
    console.log('Error deleting data marketing', error)
  }finally{
    setShowDeleteConfirm(false)
    setSelectedMarketingId(null)
  }
}

const cancleDeleteDataMarketing = () =>{
  setShowDeleteConfirm(false)
  setSelectedMarketingId(null)
}

//fungsi untuk mengetahui data memiliki card Id
const hasCardId = (item) => {
  return item.card_id !== null && item.card_id !== undefined && item.card_id !== "";
};


//fetch marketing
const fetchDataMarketing = async()=>{
  try{
    // const response = await getAllDataMarketing()
    const response = await getAllDataMarketingJoined();
    setDataMarketing(response.data)
    setFilteredData(response.data)
    console.log("✅ Data marketing fetched:", fetchDataMarketing);
  }catch(error){
    console.error('Error fetching data marekting:', error)
  }
}

// Fungsi ubah posisi (up/down)
  const handleMove = async (id, direction) => {
    try {
      const res = await updateMarketingPosition(id, direction);
      console.log(res.message);
      fetchDataMarketing(); // refresh urutan data setelah update
    } catch (err) {
      console.error("Gagal ubah posisi:", err);
    }
  };

//archive data
const handleArchiveDataMarketing =(marketing_id)=>{
  handleArchive({
    entity:'data_marketing',
    id: marketing_id,
    refetch: fetchDataMarketing,
    showSnackbar: showSnackbar,
  })
}


//fungsi filtered data
const handleFilterData = (selectedTerm) => {
    setIsDropdownOpen(false);
    if (selectedTerm === "") {
      setFilteredData(data);
    } else {
      const filtered = data.filter(
        (item) =>
          item.buyer_name.toLowerCase().includes(selectedTerm.toLowerCase()) ||
          item.order_number.toLowerCase().includes(selectedTerm.toLowerCase()) ||
          item.account_name.toLowerCase().includes(selectedTerm.toLowerCase()) ||
          item.input_by_name.toLowerCase().includes(selectedTerm.toLowerCase())
      );
      setFilteredData(filtered);
    }
  };

useEffect(()=>{
    fetchDataMarketing();
    // fetchDataAccept();
},[])

//show data
const handleShowDataMarketing = () =>{
  setShowData(true)
}

const handleCloseShowData = () =>{
  setShowData(false)
}

//show filtered data
const handleFilterButton = () =>{
  setShowFilter(!showFilter);
}

const handleCloseFilterButton = () =>{
  setShowFilter(false)
}

const handleToReportPage = () =>{
  navigate('/layout/marketing-report')
}

// PERHITUNGAN PRICE 
const getPriceDiscount = (price_normal, discount) => {
  if (!price_normal || !discount) return 0; // kalau ga ada diskon, potongan = 0

  if (typeof discount === "string" && discount.includes("%")) {
    let persen = parseFloat(discount.replace("%", ""));
    return price_normal * (persen / 100);
  } else {
    return parseFloat(discount) || 0; // langsung nominal
  }
};

const getBasicPrice = (price_normal, discount) => {
  if (!price_normal) return null;

  const potongan = getPriceDiscount(price_normal, discount);
  return price_normal - potongan;
};


// fungsi data marketing export 
const fetchDataTransfile = async () => {
  try {
    setLoading(true);
    const response = await getAllMarketingExports();
    setMarketingTransfile(response);
  } catch (err) {
    console.error("❌ Error fetch transfile:", err);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchDataTransfile();
}, []);


const handleExportToSheets = async (marketingId) => {
  try {
    // ambil detail marketing dari list di parent
    const marketingData = dataMarketing.find(m => m.marketing_id === marketingId);
    console.log('data marketing bisa dilihat disini:',dataMarketing)

    if (!marketingData) {
      throw new Error("Data marketing tidak ditemukan");
    }

    await exportDataMarketingToSheets(marketingData);

    setIsExported(true);
    setMarketingTransfile((prev) => [...prev, { marketing_id: marketingId }]);

    // 3. Insert ke DB
    const res = await addExportMarketing(marketingId);
    console.log("berhasil kirim data ke sheets:", res);

    showSnackbar(`Berhasil kirim data ke sheets file`, "success");
    fetchDataMarketing();
  } catch (error) {
    console.error("Gagal kirim data ke sheets:", error);
    showSnackbar(` Gagal kirim data ke sheets file`, "error");
  }
};

  // FUNCTION TO SHOW STATUS 
  const STATUS_COLORS ={
    "ACCEPTED ":'#2E7D32',
    "NOT ACCEPTED":'#C62828',
    "ON PROGRESS":'#C38D24',
    "UNKNOWN":'#F5F5F5',
  }
  const STATUS_BG = {
    "ACCEPTED ":'#C8E6C9',
    "NOT ACCEPTED":'#FFCDD2',
    "ON PROGRESS":'#FFDCB3',
    "UNKNOWN":"#9E9E9E",
  }


  return (
    <div className="dmc-container">
      <div className="dm-panel">
        <div className="dm-left">
          <div className="dml-title">
            <div className="dm-icon">
              <HiOutlineCircleStack className="dm-mini" />
            </div>
             
             <h3>{filterType}</h3>
            {/* <h4>DASHBOARD DATA MARKETING</h4> */}
          </div>
          <div className="dml-desc">
            {/* <strong>Selamat datang di pusat informasi Data Marketing !</strong> */}
            <p>
             Selamat datang di pusat informasi Data Marketing ! <br /> Halaman ini dirancang untuk meningkatkan transparansi dan efisiensi dalam proses pemasaran—dari awal order hingga proyek selesai.
            </p>
          </div>
        </div>

        {/* SHOW FORM  */}
          {showFormCreate && (
              <div className="dmf-cont">
                  <div className="dmf-content">
                      {/* <FormDataMarketing onClose={handleCloseForm} fetchData={fetchData}/> */}
                      <FormMarketingExample onClose={handleCloseForm} fetchData={fetchDataMarketing}/>
                  </div>
              </div>
          )}

        <div className="dmc-right">
          <div className="dmcr-btn">
            <button onClick={handleToReportPage}>REPORT DATA</button>
            <button onClick={handleShowForm}>
                {/* <HiOutlinePlus className="dm-icon"/> */}
                NEW DATA
            </button>
            <button onClick={handleShowDataMarketing}>
              {/* <HiMiniTableCells className="dm-icon"/> */}
              SHOW DATA
            </button>
            <button onClick={handleFilterButton}>
              {/* <HiChevronUpDown className="dm-icon"/> */}
              FILTER DATA
            </button>
          </div>
          <div className="mdc-search-container">
            <div className="dm-search-box">
              <HiOutlineSearch className="dms-icon"/>
                <input
                type="search"
                placeholder="Search here ..."
                onChange={(e) => handleFilterData(e.target.value)}
                />
            </div>
            <button className="reset-btn" onClick={handleShowCounterReset}>
              <MdLockReset className="reset-icon"/> Reset Counter
            </button>
            <button className="reset-btn" onClick={handleToDataMaster}>
              Data Master
            </button>
            
          </div>

          {/* SHOW FORM RESET COUNTER  */}
          {showCounterReset && (
              <div className="dmf-cont">
                <ResetCounter onClose={handleCloseCounterReset} />
              </div>
          )}

          {/* SHOW DATA */}
          {showData && (
            <div className="show-data-container">
              <div className="sdc-header">
                <h5><HiMiniTableCells className="h5-icons"/> Show Data By</h5>
                <FaXmark onClick={handleCloseShowData} style={{cursor:'pointer'}}/>
              </div>
              <div className="sdc-container">
                <button onClick={() => { setFilterType("SEMUA DATA MARKETING"); setShowData(false); }}>
                  All Data
                </button>
                <button onClick={() => { setFilterType("DATA MARKETING DENGAN CARD"); setShowData(false); }}>
                  Data Marketing Dengan Card
                </button>
                <button onClick={() => { setFilterType("DATA MARKETING TANPA CARD"); setShowData(false); }}>
                  Data Marketing Tanpa Card
                </button>
                <button onClick={() => { setFilterType("DATA MARKETING ACCEPTED"); setShowData(false); }}>
                  Data Marketing Accepted
                </button>
                <button onClick={() => { setFilterType("DATA MARKETING NOT ACCEPTED"); setShowData(false); }}>
                  Data Marketing Not Accepted
                </button>
              </div>
            </div>
          )}

          {/* SHOW FORM  */}
          {/* {showFormCreate && (
              <div className="dmf-cont">
                  <div className="dmf-content">
                      <FormMarketingExample onClose={handleCloseForm} fetchData={fetchDataMarketing}/>
                  </div>
              </div>
          )} */}

          {/* SHOW DATA FILTER  */}
          {showFilter && (
            <div className="filter-container">
              <div className="filter-header">
                <h5><HiChevronUpDown className="h5-icons"/>Filter Data By</h5>
                <FaXmark onClick={handleCloseFilterButton} style={{cursor:'pointer'}}/>
              </div>
              <div className="filter-content">
                <div className="filter-box">
                  <button onClick={()=> setDropdownOpen(!dropdownOpen)} className="filter-btn">
                    <HiChevronUpDown/>
                    {shortType ? shortType.replace('_', ' ') : 'Filter Type'}
                  </button>
                  {dropdownOpen && (
                      <ul className='ul-filter'>
                        <li
                          className="li-filter"
                          onClick={() => {
                            setShortType('buyer_name');
                            setDropdownOpen(false);
                          }}
                        >
                          Buyer Name
                        </li>
                        <li
                          className="li-filter"
                          onClick={() => {
                            setShortType('account_name');
                            setDropdownOpen(false);
                          }}
                        >
                          Account
                        </li>
                        <li
                          className="li-filter"
                          onClick={() => {
                            setShortType('input_by_name');
                            setDropdownOpen(false);
                          }}
                        >
                          Marketing Name
                        </li>
                      </ul>
                    )}
                </div>
                {/* Input Field */}
                  <div className="filter-input">
                    {shortType && (
                      <input
                        type="text"
                        name={shortType}
                        value={filters[shortType]}
                        onChange={handleFilterChange}
                        placeholder={`Filter by ${shortType.replace('_', ' ')}`}
                        className="w-full p-2 border rounded"
                      />
                    )}
                  </div>
              </div>
            </div>
          )}
        </div>
      </div>
      

      <div className="data-marketing-form">
        {loading ? (
          <p>Loading data...</p>
        ):(
          <div className="dm-container">
            <table cellPadding="10" cellSpacing="0">
              <thead>
                <tr>
                  <th style={{ borderTopLeftRadius: '8px'}}>NO</th>
                  <th>PROJECT NUMBER</th>
                  <th>INPUT BY</th>
                  <th>ACCEPTED BY</th>
                  <th>STATUS</th>
                  <th  style={{ textAlign:'left'}}>
                    <div className="dm-th">
                      BUYER NAME 
                      <HiArrowsUpDown/>
                    </div>
                  </th>
                  <th>
                    <div className="dm-th">
                      ORDER NUMBER
                      <HiArrowsUpDown/>
                    </div>
                  </th>
                  <th style={{ textAlign:'left'}}>
                    <div className="dm-th">
                      ACCOUNT
                      <HiArrowsUpDown/>
                    </div>
                  </th>
                  <th>DEADLINE</th>
                  <th>CODE ORDER</th>
                  <th>JUMLAH TRACK</th>
                  <th>ORDER TYPE</th>
                  <th>OFFER TYPE</th>
                  <th style={{ textAlign:'left'}}>JENIS TRACK</th>
                  <th>GENRE</th>
                  <th>PRICE NORMAL</th>
                  <th>PRICE DISCOUNT</th>
                  <th>DISCOUNT</th>
                  <th>KUPON DISKON</th>
                  <th>TOTAL PRICE </th>
                  <th>PROJECT TYPE</th>
                  <th>DURATION</th>
                  <th style={{ borderTopRightRadius: '8px', textAlign:'center' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => {
                  // cek apakah marketing_id sudah di-export
                 const isExported = marketingTransfile.some(
                    (exp) => exp.marketing_id === item.marketing_id
                  );

                  return (
                  <tr key={item.marketing_id}>
                    <td className="nomor-box">
                      <div className="number-box">
                        {index + 1}
                        <div className="icon-position">
                          <BootstrapTooltip title='Move Up' placement='top'>
                            <button
                              onClick={() => handleMove(item.marketing_id, "up")}
                              className="position-btn"
                              style={{ padding:'0px', fontSize:'11px'}}
                            >

                                <HiChevronUp/>
                            </button>
                          </BootstrapTooltip>
                          <BootstrapTooltip title='Move Down' placement='top'>
                          <button
                            onClick={() => handleMove(item.marketing_id, "down")}
                            className="position-btn"
                            style={{ padding:'0px', fontSize:'11px'}}
                          >
                              <HiChevronDown/>
                          </button>
                          </BootstrapTooltip>
                        </div>
                      <div className="number-box">
                      </div>
                      </div>
                    </td>
                    <td className="project-number-box" 
                      onClick={()=> handleShowDetail(item.marketing_id)}
                      >
                      {item.project_number}
                      </td>
                    <td className="input-box-container" >
                      {item.input_by_name || "-"}
                      {hasCardId(item) && (
                        <span
                          style={{
                            backgroundColor: '#e0f7fa',
                            color: '#00796b',
                            padding: '4px 6px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            borderRadius: '4px',
                            marginLeft: '5px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          CARD
                        </span>
                      )}
                      <button
                        disabled={isExported}
                        style={{
                          backgroundColor: "transparent",
                          color: isExported ? "green" : "white",
                          cursor: isExported ? "not-allowed" : "pointer",
                          padding: "4px 8px",
                          border: "none",
                          borderRadius: "4px",
                          fontSize:'15px',
                        }}
                      >
                        <AiFillCheckCircle />
                      </button>
                    </td>

                    <td className="acc-box-container">{item.acc_by_name}</td>
                    <td className="status-box-container" style={{textAlign:'center' }}>
                        <span style={{
                          padding: "2px 8px",
                          borderRadius: "12px",
                          color:STATUS_COLORS[item.accept_status_name],
                          backgroundColor:STATUS_BG[item.accept_status_name],
                          fontWeight: "bold",
                        }}>
                          {item.accept_status_name}
                        </span>
                      </td>
                    <td className="buyer-box">{item.buyer_name}</td>
                    <td className="order-number-box" style={{textAlign:'center' }} >{item.order_number}</td>
                    <td className="account-box" style={{textAlign:'center' }}>{item.account_name}</td>
                    <td className="deadline-box" style={{textAlign:'center' }}>{new Date(item.deadline).toLocaleDateString()}</td>
                    <td className="code-order-box">{item.code_order}</td>
                    <td className="jumlah-track-box" style={{textAlign:'center'}}>{item.jumlah_track}</td>
                    <td className="order-type-box">{item.order_type_name}</td>
                    <td className="offer-type-box">{item.offer_type_name}</td>
                    <td className="jenis-track-box" >{item.track_type_name}</td>
                    <td className="genre-box">{item.genre_name}</td>
                    <td className="price-normal-box" style={{textAlign:'center', color:'#1E1E1E'}}>{item.price_normal}</td>
                    <td className="price-discount-box" style={{textAlign:'center', color:'#E53935'}}>
                      {getPriceDiscount(item.price_normal, item.discount)
                            ? ` ${getPriceDiscount(item.price_normal, item.discount)}`
                            : "-"}
                    </td>
                    <td className="discount-box" style={{textAlign:'center', color:'#388E3C'}}>{item.discount}</td>
                    <td className="coupon-box" style={{textAlign:'center', color:'#388E3C'}}>{item.kupon_diskon_name}</td>
                    <td className="basic-price-box" style={{color:'#388E3C',textAlign:'center'}}> 
                      {getBasicPrice(item.price_normal, item.discount)
                            ? ` ${getBasicPrice(item.price_normal, item.discount)}`
                            : "-"}
                    </td>
                    <td className="project-type-box" >{item.project_type_name}</td>
                    <td className="duration-box">{item.duration}</td>
                    <td className="action-box">
                      <div className="action-data-marketing">
                        <BootstrapTooltip title='View Data' placement='top'>
                            <button onClick={()=> handleShowDetail(item.marketing_id)}>
                                <IoEyeSharp/>
                            </button>
                        </BootstrapTooltip>
                        <BootstrapTooltip title='Edit Data' placement='top'>
                            <button onClick={() => handleShowEditForm(item.marketing_id)}><HiOutlinePencil/></button>
                        </BootstrapTooltip>
                        <BootstrapTooltip title='Archive Data' placement='top'>
                             <button onClick={()=>handleArchiveDataMarketing(item.marketing_id)}>
                               <HiOutlineArchiveBox style={{color:'white'}}/>
                             </button>
                         </BootstrapTooltip>
                        <BootstrapTooltip title='Delete Data' placement='top'>
                            <button onClick={() => handleDeleteClick(item.marketing_id)}><HiOutlineTrash/></button>
                        </BootstrapTooltip>
                      </div>
                        
                    </td>
                  </tr>
                  )
                })}
              </tbody>
              {/* Detail View */}
                {showDetail && selectedMarketingId && (
                    <div className="detail-data-marketing">
                        <div className="detail-data-box">
                            <ViewDataMarketing 
                              marketingId={selectedMarketingId}
                              onClose={handleCloseDetail} 
                              isExported={isExported}
                              setIsExported={setIsExported} 
                              marketingTransfile={marketingTransfile}
                              fetchDataTransfile={fetchDataTransfile}
                              onExport={handleExportToSheets}
                            />
                            {/* <button onClick={() => setShowDetail(false)}>Close</button> */}
                        </div>
                    </div>
                )}
                {/* EDIT FORM  */}
                {showEditForm && selectedMarketingId && (
                    <div className="edit-data-marketing">
                        <div className="edit-data-box">
                          <NewEditDataMarketing marketingId={selectedMarketingId} onClose={handleCloseEditForm} fetchDataMarketing={fetchDataMarketing}/>
                            {/* <EditMarketingForm marketingId={selectedMarketingId} onClose={handleCloseEditForm} fetchDataMarketing={fetchDataMarketing}/> */}
                        </div>
                    </div>
                )}
                {/* DELETE CONFIRM */}
                <DataMarketingDeleteConfirm
                  isOpen={showDeleteConfirm}
                  marketingId={selectedMarketingId}
                  onConfirm={confirmDelete}
                  onCancle={cancleDeleteDataMarketing}
                  fetchDataMarketing={fetchDataMarketing}
                />
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataMarketing;
