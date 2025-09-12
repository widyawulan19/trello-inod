import React, { useEffect, useState } from 'react'
import { archiveDataMarektingDesign, deleteDataMarketingDesign, getAllDataMarketingDesign, getAllMarketingDesignJoined, getDataMarketingDesignAccept, getDataMarketingDesignNotAccept, getDataWhereCardIdIsNull, getDataWhereCardIdNotNull } from '../services/ApiServices';
import '../style/pages/MarketingDesign.css'
// import '../style/pages/AcceptDataDesign.css'
import BootstrapTooltip from '../components/Tooltip';
import { CgDollar } from "react-icons/cg";
import { IoEyeSharp } from "react-icons/io5";
import { HiArrowsUpDown, HiChevronUpDown, HiCurrencyDollar, HiHandThumbUp, HiMiniTableCells, HiOutlineArchiveBox, HiOutlineCircleStack, HiOutlinePencil, HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi2';
import { HiOutlineSearch } from 'react-icons/hi';
import ViewDataMarketingDesign from './ViewDataMarketingDesign';
import EditMarketingDesign from './EditMarketingDesign';
import FormMarketingDesign from './FormMarketingDesign';
import { useSnackbar } from '../context/Snackbar';
import MarketingDesignDeleteConfirm from '../modals/MarketingDesignDeleteConfirm';
import Setting from './Setting';
import NewFormMarketingDesign from './NewFormMarketingDesign';
import { useNavigate } from 'react-router-dom';
import OutsideClick from '../hook/OutsideClick';
import { handleArchive } from '../utils/handleArchive';
import ExportMarketingDesign from '../exports/ExportMarketingDesign';
import { FaXmark } from 'react-icons/fa6';
import FormMarketingDesignExample from '../example/FormMarketingDesignExample';

const MarketingDesign=()=> {
    //STATE
    const [dataMarketingDesign, setDataMarketingDesign] = useState([]);
    const [filteredData, setFilteredData] = useState([])
    const [showDetail, setShowDetail] = useState(false)
    const [selectedMarketingDesign, setSelectedMarketingDesign] = useState(null)
    const [showEdit, setShowEdit] = useState(false)
    const [showFormCreate, setShowFormCreate] = useState(false);
    const [showAcceptData, setShowAcceptData] = useState([]);
    const [loading,setLoading] = useState(true);
    //STATE DELETE
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const {showSnackbar} = useSnackbar()
    const navigate = useNavigate();
    //SHOW DATA
    const [data, setData] = useState([]);
    const [showData, setShowData] = useState(false)
    const showDataRef = OutsideClick(() => setShowData(false))
    const [showFilter,setShowFilter] = useState(false)
    const showFilterRef = OutsideClick(()=> setShowFilter(false))
    const [filterType, setFilterType] = useState('DATA MARKETING DESIGN');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [shortType, setShortType] = useState('');

    //STATE FETCH DATA MARKETING
    const [filters, setFilters] = useState({
        buyer_name:'',
        order_number:'',
        account:'',
    })

    const fetchData  = async() =>{
        setLoading(true)
        try {
              let response;
              if (filterType === 'DATA DENGAN CARD') {
                response = await getDataWhereCardIdNotNull();
              } else if (filterType === 'DATA TANPA CARD') {
                response = await getDataWhereCardIdIsNull();
              } else if(filterType === 'DATA MARKETING DESIGN'){
                response = await getAllMarketingDesignJoined();
              }
          
              setData(response.data);
              setFilteredData(response.data);
            } catch (error) {
              console.error('Error fetching marketing design data:', error);
            } finally {
              setLoading(false);
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
            item.account_name?.toLowerCase().includes(filters.account.toLowerCase())
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


    //FUNCTION DELETE DATA MARKETING DESIGN 
    const handleDeleteClick =(marketing_design_id)=>{
        setSelectedMarketingDesign(marketing_design_id)
        setShowDeleteConfirm(true)
    }

    const confirmDelete = async()=>{
        try{
            console.log('Komponen delete data marketing design menerima data marketing ID', selectedMarketingDesign)
            const response = await deleteDataMarketingDesign(selectedMarketingDesign)
            showSnackbar('Data Marketing Design deleted successfully', 'success')
            console.log('Berhasil menghapus data marketing:', response.data)
            fetchMarketingDesign()
        }catch(error){
            console.log('Failed delete data merketing design',error)
            showSnackbar('Error Deleting Data Marketing Design','error')
        }finally{
            setShowDeleteConfirm(false)
            setSelectedMarketingDesign(null)
        }
    }

    const cancleDeleteConfirm = () =>{
        setShowDeleteConfirm(false)
        setSelectedMarketingDesign(null)
    }

    const fetchDataAccept = async() =>{
        try{
            const response = await getDataWhereCardIdNotNull()
            setShowAcceptData(response.data)
        }catch(error){
            console.error('Error fetching data:', error)
        }
    }

    //ARCHIVE DATA
    const handleArchiveDataMarketingDesign =(marketing_design_id) =>{
      handleArchive({
        entity:'marketing_design',
        id:marketing_design_id,
        refetch:fetchMarketingDesign,
        showSnackbar: showSnackbar,
      })
    }
    //FUNCTION
    //1. fetch marketing design 
    const fetchMarketingDesign = async()=>{
        try{
            const response = await getAllMarketingDesignJoined();
            setDataMarketingDesign(response.data)
            setFilteredData(response.data)
        }catch(error){
            console.error('Error fetching marketing design data:', error);
        }
    }

    //2. filtered data
    const handleFilterData = (selectedTerm) =>{
        
        if(selectedTerm === ""){
            setFilteredData(dataMarketingDesign);
        }else{
            const filtered = dataMarketingDesign.filter(
                (item) =>
                    item.buyer_name.toLowerCase().includes(selectedTerm.toLowerCase()) ||
                    item.order_number.toLowerCase().includes(selectedTerm.toLowerCase()) ||
                    item.account_name?.toLowerCase().includes(selectedTerm.toLowerCase())
            );
            setFilteredData(filtered);
        }
    }

    useEffect(()=>{
        fetchMarketingDesign();
        fetchDataAccept();
    },[])

    //Show detail 
    const handleShowDetail = (marketing_design_id)=>{
        setSelectedMarketingDesign(marketing_design_id)
        setShowDetail(!showDetail)
    }
    const handleCloseDetail =()=>{
        setShowDetail(false)
    }

    //show edit 
    const handleShowEdit = (marketing_design_id)=>{
        setSelectedMarketingDesign(marketing_design_id)
        setShowEdit(!showEdit)
    }
    const handleCloseEdit = () =>{
        setShowEdit(false)
    }

    //SHOW CREATE FORM
    const handleShowForm = () =>{
        setShowFormCreate(!showFormCreate)
    }
    const handleCloseForm = () =>{
        setShowFormCreate(false)
    }

    //NAVIGATE TO DATA ACCEPT
    const navigateToDataAccept = () =>{
        navigate(`/data-accept`)
    }

    //show data marketing 
    const handleShowDataMarketing = () =>{
        setShowData(!showData)
    }

    const handleFilterButton = () =>{
        setShowFilter(!showFilter)
    }

    // const hasCardId = (item) => {
    //   return item.card_id !== null && item.card_id !== undefined;
    // };
    const hasCardId = (item) => {
      return item.card_id !== null && item.card_id !== undefined && item.card_id !== "";
    };

  // SHOW DATA CONTENT 
  const handleShowData = () =>{
    setShowData(false)
  }  

  // go to report page 
  const handleGoToReportPage = () =>{
    navigate('/layout/design-report')
  }

  const handleReport = () =>{
    navigate('/layout/design-report2')
  }
    const handleReportPage = () =>{
    navigate('/layout/marketing-design-report')
  }

  return (
    <div className='md-container'>
        <div className="md-header">
            <div className="mdh-left">
              <div className="mdh-title">
                <div className="mdh-icon">
                  <HiOutlineCircleStack className='dm-mini' />
                </div>
                <h3>{filterType}</h3>
              </div>
              <div className="mdh-des">
                <p><strong>Selamat datang di pusat informasi Divisi Marketing Design!</strong></p>
                <p>Di halaman ini, Anda dapat melihat seluruh rangkuman aktivitas dan progres proyek desain yang sedang berlangsung maupun yang telah selesai.</p>
              </div>
            </div>
            <div className="mdh-right">
              <div className="mdhr-btn">
                <button onClick={handleReportPage}>REPORT</button>
                {/* <button onClick={handleReport}>10 DAYS REPORT</button>
                <button onClick={handleGoToReportPage}>REPORT DATA</button> */}
                <button onClick={handleShowForm}>
                      {/* <HiOutlinePlus className='mdh-icon'/> */}
                      NEW DATA
                  </button>
                  <button onClick={handleShowDataMarketing}>
                      {/* <HiMiniTableCells className='mdh-icon'/> */}
                    SHOW DATA
                  </button>
                  <button onClick={handleFilterButton}>
                      {/* <HiChevronUpDown className='mdh-icon'/> */}
                    FILTER DATA
                  </button>
              </div>
              <div className="mdh-search-container">
                <div className="mdh-search">
                    <input 
                        type="search"
                        placeholder='Search here ...' 
                        onChange={(e)=> handleFilterData(e.target.value)}
                    />
                    <HiOutlineSearch className='mdh-search-icon'/>
                </div>
                <div className="export-btn">
                  <ExportMarketingDesign/>
                </div>
              </div>
            </div>
            {/* SHOW COMPONENT  */}
            {showFormCreate && (
                <div className="md-form">
                    <div className="md-content">
                        {/* <Setting onClose={handleCloseForm}/> */}
                        {/* <NewFormMarketingDesign onClose={handleCloseForm} fetchMarketingDesign={fetchMarketingDesign}/> */}
                        <FormMarketingDesignExample onClose={handleCloseForm} fetchMarketingDesign={fetchMarketingDesign}/>
                    </div>
                </div>
            )}


            {/* SHOW DATA  */}
            {showData && (
            <div className='sd-cont' ref={showDataRef}>
              <div className="sd-header">
                <h5><HiMiniTableCells className='h5-icon'/>Show Data By </h5>
                <FaXmark onClick={handleShowData} style={{cursor:'pointer'}}/>
              </div>
                <div className="sd-box">
                  <h5>Show Data By:</h5>
                  <button onClick={() => {setFilterType('DATA MARKETING DESIGN'); {setShowData(!showData)}}} >
                    All Data
                  </button>
                  <button onClick={() => {setFilterType('DATA DENGAN CARD');; {setShowData(!showData)}}}>
                    Data Dengan Card
                  </button>
                  <button onClick={() => {setFilterType('DATA TANPA CARD');; {setShowData(!showData)}}}>
                    Data Tanpa Card
                  </button>
                </div>
              </div>
            )}
        </div>
        
        {/* show  */}

        {/* FILTER BY TYPE DATA  */}
        {showFilter && (
          <div className="ft-cont" ref={showFilterRef}>
            <div className="ftc-header">
              <h5>Filter By:</h5>
            </div>
            <div className="ftc-content">
              <div className="ftc-box">
                <div className='ft-btn' onClick={() => setDropdownOpen(!dropdownOpen)}>
                  <HiChevronUpDown className='ft-icon'/>
                  {shortType ? shortType.replace('_', ' ') : 'Filter Type'}
                </div>
                {dropdownOpen && (
                  <ul className='ul-ftc'>
                    <li
                      className="li-ftc"
                      onClick={() => {
                        setShortType('buyer_name');
                        setDropdownOpen(false);
                      }}
                    >
                      Buyer Name
                    </li>
                    <li
                      className="li-ftc"
                      onClick={() => {
                        setShortType('order_number');
                        setDropdownOpen(false);
                      }}
                    >
                      Order Number
                    </li>
                    <li
                      className="li-ftc"
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
              <div className="ftc-input">
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

        {/* END SHOW COMPONENT  */}
        <div className="new-data">
          {loading ?(
            <p>loading data...</p>
          ):(
            <div className='data-accept-design'>
              <table cellPadding='10' cellSpacing='0'>
                <thead>
                  <tr>
                    <th className='rounded-tl-md'>NO</th>
                    <th>INPUT BY</th>
                    <th>ACC BY</th>
                    <th>STATUS</th>
                    <th>
                      <div className='th'>
                        BUYER NAME <HiArrowsUpDown/>
                      </div>
                    </th>
                    <th>
                      <div className="th">
                        CODE ORDER <HiArrowsUpDown/>
                      </div>
                    </th>
                    <th>JUMLAH DESIGN</th>
                    <th>ORDER NUMBER</th>
                    <th>
                      <div className="th">
                        ACCOUNT <HiArrowsUpDown/>
                      </div>
                    </th>
                    <th>DEADLINE</th>
                    <th>JUMLAH REVISI</th>
                    <th>ORDER TYPE</th>
                    <th>OFFER TYPE</th>
                    <th>STYLE</th>
                    <th>RESOLUTION</th>
                    <th>
                      <div className="th">
                        PRICE NORMAL <CgDollar/>
                      </div>
                    </th>
                    <th>
                      <div className="th">
                        PRICE DISCOUNT <CgDollar/>
                      </div>
                    </th>
                    <th>
                        DISCOUNT PRESENTAGE
                    </th>
                    <th>PROJECT TYPE</th>
                    <th style={{textAlign:'center'}}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, index)=>(
                    <tr key={item.marketing_design_id}>
                      <td>{index + 1}</td>
                      <td className='input-container'  onClick={()=> handleShowDetail(item.marketing_design_id)}>
                        {item.input_by_name || "-"}
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
                            <HiHandThumbUp />
                          </span>
                        )}
                      </td>
                      <td className='acc-container'>{item.acc_by_name}</td>
                      <td className='status-container' style={{textAlign:'left' }}>
                         <span style={{
                           padding: '2px 8px',
                           borderRadius: '12px',
                           backgroundColor: item.status_project_name ? '#C8E6C9' : '#FFCDD2',
                           color: item.status_project_name ? '#2E7D32' : '#C62828',
                           fontWeight: 'bold'
                         }}>
                           {item.status_project_name}
                         </span>
                       </td>
                      <td className='buyer-name-container'>{item.buyer_name}</td>
                      <td className='code-order-container'>{item.code_order}</td>
                      <td className='jumlah-container' style={{textAlign:'center' }}>{item.jumlah_design}</td>
                      <td className='order-number-container'>{item.order_number}</td>
                      <td className='account-container'>{item.account_name}</td>
                      <td className='deadline-container' style={{ textAlign:'center' }}>{new Date(item.deadline).toLocaleDateString()}</td>
                      <td className='jumlah-revisi-container' style={{textAlign:'center' }}>{item.jumlah_revisi}</td>
                      <td className='order-type-container'>{item.order_type_name}</td>
                      <td className='offer-type-container'>{item.offer_type_name}</td>
                      <td className='style-container'>{item.style_name}</td>
                      <td className='resolution-container'>{item.resolution}</td>
                      <td className='price-normal-container' style={{textAlign:'center', color:'#1E1E1E'}}>${item.price_normal}</td>
                      <td className='price-discount-container' style={{textAlign:'center', color:'#E53935'}}>${item.price_discount}</td>
                      <td className='discount_percentage-container' style={{textAlign:'center', color:'#388E3C'}}>{item.discount_percentage}%</td>
                      <td className='project-type-container'>{item.project_type_name}</td>
                      <td className='action-container'>
                        <div className="action-table">
                          <BootstrapTooltip title='View Data' placement='top'>
                            <button onClick={()=> handleShowDetail(item.marketing_design_id)}>
                                <IoEyeSharp style={{color:'white'}}/>
                            </button>
                        </BootstrapTooltip>
                        <BootstrapTooltip title='Edit Data' placement='top'>
                            <button onClick={()=> handleShowEdit(item.marketing_design_id)}>
                                <HiOutlinePencil style={{color:'white'}}/>
                            </button>
                        </BootstrapTooltip>
                        <BootstrapTooltip title='Archive Data' placement='top'>
                            <button onClick={()=>handleArchiveDataMarketingDesign(item.marketing_design_id)}>
                              <HiOutlineArchiveBox style={{color:'white'}}/>
                            </button>
                        </BootstrapTooltip>
                        <BootstrapTooltip title='Delete Data' placement='top'>
                            <button onClick={()=>handleDeleteClick(item.marketing_design_id)}>
                              <HiOutlineTrash style={{color:'white'}}/>
                            </button>
                        </BootstrapTooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* SHOW  */}
                {/* DETAIL VIEW  */}
                {showDetail && selectedMarketingDesign && (
                    <div className="detail-data-design">
                        <div className="detail-cont">
                            <ViewDataMarketingDesign marketingDesignId={selectedMarketingDesign} onClose={handleCloseDetail}/>
                        </div>
                    </div>
                )}

                {/* EDIT VIEW  */}
                {showEdit && selectedMarketingDesign && (
                    <div className="edit-data-design">
                        <div className="edit-cont">
                            <EditMarketingDesign marketingDesignId={selectedMarketingDesign} onClose={handleCloseEdit} fetchMarketingDesign={fetchMarketingDesign} />
                        </div>
                    </div>
                )}
                {/* DELETE DATA*/}
                <MarketingDesignDeleteConfirm
                    isOpen={showDeleteConfirm}
                    marketingDesignId={selectedMarketingDesign}
                    onConfirm={confirmDelete}
                    onCancle={cancleDeleteConfirm}
                />
              </table>
            </div>
          )}
        </div>
    </div>
  )
}

export default MarketingDesign