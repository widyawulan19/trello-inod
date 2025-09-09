import React, { useEffect, useState, useRef } from "react";
import { getAllDataMarketing,getAllDataMarketingJoined, deleteDataMarketing, getDataMarketingAccepted, getDataMarketingWithCardId, getDataMarketingWithCardIdNull, getDataMarketingRejected, archiveDataMarketing } from "../services/ApiServices";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import "../style/pages/DataMarketing.css";
import { HiArrowsUpDown, HiChevronUpDown, HiMiniTableCells, HiOutlineArchiveBox, HiOutlineCircleStack, HiOutlinePencil, HiOutlinePlus, HiOutlineTrash, HiOutlineXCircle } from "react-icons/hi2";
import { HiOutlineFilter, HiOutlineSearch } from "react-icons/hi";
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

const DataMarketing = () => {
  const location = useLocation();
  // const {workspaceId, boardId, listId,cardId} = location.state || {}

  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");
  const boardId = searchParams.get("boardId");
  const listId = searchParams.get("listId");
  const cardId = searchParams.get("cardId");

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
  console.log('workspace id diterima:', workspaceId)
  //SATE DELETE CONFIRM
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
      }else if(filterType === 'DATA MAREKTING ACCEPTED'){
        response = await getDataMarketingAccepted();
      }else if(filterType === 'DATA MARKETING NOT ACCEPTED'){
        response = await getDataMarketingRejected();
      }else if(filterType === 'SEMUA DATA MARKETING'){
        // response = await getAllDataMarketing();
        response = await getAllDataMarketingJoined();
      }

      setData(response.data);
      setFilteredData(response.data);
    }catch(error){
      console.error('Error fetching data marekting:', error)
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
     if (filters.account) {
       temp = temp.filter((item) =>
         item.account.toLowerCase().includes(filters.account.toLowerCase())
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
const hasCardId = (item) =>{
  return item.card_id !== null && item.card_id !== undefined
}

//fetch marketing design
const fetchDataMarketing = async()=>{
  try{
    // const response = await getAllDataMarketing()
    const response = await getAllDataMarketingJoined();
    setDataMarketing(response.data)
    setFilteredData(response.data)
  }catch(error){
    console.error('Error fetching data marekting:', error)
  }
}

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
          item.account.toLowerCase().includes(selectedTerm.toLowerCase()) 
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
            <strong>Selamat datang di pusat informasi Data Marketing !</strong>
            <p>
              Halaman ini dirancang untuk meningkatkan transparansi dan efisiensi dalam proses pemasaran—dari awal order hingga proyek selesai.
            </p>
          </div>
         
        </div>
        <div className="dmc-right">
          <div className="dmcr-btn">
            <button onClick={handleToReportPage}>REPORT</button>
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
              SHORT DATA
            </button>
          </div>
          <div className="mdc-search-container">
            <div className="dm-search-box">
                <input
                type="search"
                placeholder="Search here ..."
                onChange={(e) => handleFilterData(e.target.value)}
                />
                <HiOutlineSearch className="dms-icon"/>
            </div>
            <div className="dm-search-export">
              <ExportDataMarketing/>
            </div>   
          </div>
        </div>

      {/* SHOW FORM  */}
        {showFormCreate && (
            <div className="dmf-cont">
                <div className="dmf-content">
                    <FormDataMarketing onClose={handleCloseForm} fetchData={fetchData}/>
                </div>
            </div>
        )}
      </div>

      {/* SHOW DATA  */}
      {showData && (
        <div className="show-data-container">
          <div className="sdc-header">
            <h5> <HiMiniTableCells className="h5-icons"/>Show Data By:</h5>
            <FaXmark onClick={handleCloseShowData} style={{cursor:'pointer'}}/>
          </div>
          <div className="sdc-container">
             <button onClick={()=> {setFilterType('SEMUA DATA MARKETING'); {setShowData(!showData)}}}>
              All Data
            </button>
            <button onClick={()=> {setFilterType('DATA MARKETING DENGAN CARD'); {setShowData(!showData)}}}>
              Data Marketing Dengan Card
            </button>
            <button onClick={()=> {setFilterType('DATA MARKETING TANPA CARD'); {setShowData(!showData)}}}>
              Data Marketing Tanpa Card
            </button>
            <button onClick={()=> {setFilterType('DATA MAREKTING ACCEPTED'); {setShowData(!showData)}}}>
              Data Marketing Accepted
            </button>
            <button onClick={()=> {setFilterType('DATA MARKETING NOT ACCEPTED'); {setShowData(!showData)}}}>
              Data Marketing Not Accepted
            </button>
          </div>
        </div>
      )}

      {/* SHOW DATA FILTER  */}
      {showFilter && (
        <div className="filter-container">
          <div className="filter-header">
            <h5><HiChevronUpDown className="h5-icons"/>Filter Data By:</h5>
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
                        setShortType('order_number');
                        setDropdownOpen(false);
                      }}
                    >
                      Order Number
                    </li>
                    <li
                      className="li-filter"
                      onClick={() => {
                        setShortType('account');
                        setDropdownOpen(false);
                      }}
                    >
                      Account
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

      <div className="data-marketing-form">
        {loading ? (
          <p>Loading data...</p>
        ):(
          <div className="dm-container">
            <table cellPadding="10" cellSpacing="0">
              <thead>
                <tr>
                  <th style={{ borderTopLeftRadius: '8px'}}>No</th>
                  <th>Input By</th>
                  <th>Accepted By</th>
                  <th>STATUS</th>
                  <th>
                    <div className="dm-th">
                      Buyer Name 
                      <HiArrowsUpDown/>
                    </div>
                  </th>
                  <th>
                    <div className="dm-th">
                      Order Number
                      <HiArrowsUpDown/>
                    </div>
                  </th>
                  <th>
                    <div className="dm-th">
                      Account
                      <HiArrowsUpDown/>
                    </div>
                  </th>
                  <th>Deadline</th>
                  <th>Code Order</th>
                  <th>Jumlah Track</th>
                  <th>Order Type</th>
                  <th>Offer Type</th>
                  <th>Jenis Track</th>
                  <th>Genre</th>
                  <th>Price Normal</th>
                  <th>Price Discount</th>
                  <th>Discount</th>
                  <th>Kupon Diskon</th>
                  <th>Basic Price</th>
                  <th>Project Type</th>
                  <th>Duration</th>
                  <th style={{ borderTopRightRadius: '8px', textAlign:'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={item.marketing_id}>
                    <td>{index + 1}</td>
                    <td className="input-container">{item.input_by_name}
                      {hasCardId(item) && (
                        <span style={{
                          backgroundColor: '#e0f7fa',
                          color: '#00796b',
                          padding: '4px 6px',
                          fontSize: '10px',
                          fontWeight:'bold',
                          borderRadius: '4px',
                          marginLeft: '5px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {'CARD'}
                          {/* <HiHandThumbUp /> */}
                        </span>
                      )}
                    </td>
                    <td className="acc-container">{item.acc_by_name}</td>
                    <td className="status-container">
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '12px',
                          backgroundColor: item.is_accepted ? '#C8E6C9' : '#FFCDD2',
                          color: item.is_accepted ? '#2E7D32' : '#C62828',
                          fontWeight: 'bold'
                        }}>
                          {item.is_accepted ? 'Accepted' : 'Not Accepted'}
                        </span>
                      </td>
                    <td className="buyer-name-container">{item.buyer_name}</td>
                    <td className="order-number-container" >{item.order_number}</td>
                    <td className="account-container">{item.account_name}</td>
                    <td className="deadline-container" style={{textAlign:'center' }}>{new Date(item.deadline).toLocaleDateString()}</td>
                    <td className="code-order-container">{item.code_order}</td>
                    <td style={{textAlign:'center'}}>{item.jumlah_track}</td>
                    <td className="order-type-container">{item.order_type_name}</td>
                    <td className="offer-type-container">{item.offer_type_name}</td>
                    <td className="jenis-track-container" >{item.track_type_name}</td>
                    <td className="genre-container">{item.genre_name}</td>
                    <td className="price-normal-container" style={{textAlign:'center', color:'#1E1E1E'}}>${item.price_normal}</td>
                    <td className="price-discount-container" style={{textAlign:'center', color:'#E53935'}}>{item.price_discount ? `$${item.price_discount}` : "N/A"}</td>
                    <td className="discount-container" style={{textAlign:'center', color:'#388E3C'}}>{item.discount}</td>
                    <td className="discount-container" style={{textAlign:'center', color:'#388E3C'}}>{item.kupon_diskon_name}</td>
                    <td className="basic-price-container" style={{color:'#388E3C',textAlign:'center'}}>{item.basic_price}</td>
                    <td className="project-type-container" >{item.project_type_name}</td>
                    <td className="duration-container">{item.duration}</td>
                    <td className="action-container">
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
                ))}
              </tbody>
              {/* Detail View */}
                {showDetail && selectedMarketingId && (
                    <div className="detail-data-marketing">
                        <div className="detail-data-box">
                            <ViewDataMarketing marketingId={selectedMarketingId} onClose={handleCloseDetail} />
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
                />
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataMarketing;
