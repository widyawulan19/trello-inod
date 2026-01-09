import React, { useEffect, useState, useCallback, useMemo, memo } from 'react'
import {
  archiveDataMarektingDesign,
  deleteDataMarketingDesign,
  getAllDataMarketingDesign,
  getAllMarketingDesignJoined,
  getDataMarketingDesignAccept,
  getDataMarketingDesignNotAccept,
  getDataWhereCardIdIsNull,
  getDataWhereCardIdNotNull,
  exportDesignToSheets,
  addExportMarketingDesign,
  getExportMarketingDesign,
  getAllMarketingDesignExports,
  updateMarketingDesignPosition,
  getMarketingDesignPaginated
} from '../services/ApiServices';
import '../style/pages/MarketingDesign.css'
import BootstrapTooltip from '../components/Tooltip';
import { CgDatabase, CgDollar } from "react-icons/cg";
import { IoEyeSharp } from "react-icons/io5";
import {
  HiAdjustmentsHorizontal,
  HiArrowsUpDown, HiChevronDown, HiChevronUp, HiChevronUpDown,
  HiCurrencyDollar, HiHandThumbUp, HiMiniTableCells, HiOutlineArchiveBox,
  HiOutlineChartBar,
  HiOutlineCircleStack, HiOutlineFunnel, HiOutlinePencil, HiOutlinePlus, HiOutlineTrash,
  HiXMark
} from 'react-icons/hi2';
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
import NewEditMarketingDesign from './NewEditMarketingDesign';
import { AiFillCheckCircle } from 'react-icons/ai';
import { MdLockReset } from 'react-icons/md';
import ResetCounterDesign from '../fitur/ResetCounterDesgin';
import LoadingSpinnerDot from '../utils/LoadingSpinnerDot';
import SearchSugesstion from '../fitur/SearchSugesstion';

/* ---------------------------
  Memoized Row Component
   - defined outside main component
   - expects stable props (useCallback in parent helps)
----------------------------*/
const MarketingDesignRow = memo(({
  item,
  index,
  isExported,
  handleMove,
  handleShowDetail,
  handleShowEdit,
  handleArchiveDataMarketingDesign,
  handleDeleteClick,
  hasCardId,
  STATUS_CLASS,
  STATUS_BG,
  STATUS_COLORS
}) => {
  return (
    <tr>
      <td className='number-container'>
        <div className="number-box">
          {index + 1}
          <span className="icon-position">
            <BootstrapTooltip title='Move Up' placement='top'>
              <button
                onClick={() => handleMove(item.marketing_design_id, "down")}
                style={{ padding:'2px', fontSize:'9px'}}
              >
                <HiChevronUp/>
              </button>
            </BootstrapTooltip>
            <BootstrapTooltip title='Move Down' placement='top'>
              <button
                onClick={() => handleMove(item.marketing_design_id, "up")}
                style={{ padding:'2px', fontSize:'9px'}}
              >
                <HiChevronDown/>
              </button>
            </BootstrapTooltip>
          </span>
        </div>
      </td>

      <td className='project-number-container' onClick={()=> handleShowDetail(item.marketing_design_id)}>
        {item.project_number}
      </td>

      <td className='input-container-box'>
        {item.input_by_name || "-"}
        {hasCardId(item) && (
          <span className="label-card">
            CARD
          </span>
        )}

        {/* <button
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
        </button> */}
        <button
          disabled={isExported}
          className={`check-btn ${
            isExported ? "success" : "active"
          } ${isExported ? "disabled" : ""}`}
        >
          <AiFillCheckCircle />
        </button>

        
      </td>

      <td className='acc-container' style={{textAlign:'center' }}>{item.acc_by_name}</td>

      <td className='status-container' style={{textAlign:'center' }}>
        <span className={`status-badge status-${STATUS_CLASS[item.status_project_name?.trim()]}`}>
          {item.status_project_name}
        </span>
        {/* <span style={{
          padding: '2px 8px',
          borderRadius: '12px',
          backgroundColor: STATUS_BG[item.status_project_name],
          color: STATUS_COLORS[item.status_project_name],
          fontWeight: 'bold'
        }}>
          {item.status_project_name}
        </span> */}
      </td>

      <td className='buyer-name-container'>{item.buyer_name}</td>
      <td className='code-order-container'>{item.code_order}</td>
      <td className='jumlah-container' style={{textAlign:'center' }}>{item.jumlah_design}</td>
      <td className='order-number-container' style={{textAlign:'center' }}>{item.order_number}</td>
      <td className='account-container'>{item.account_name}</td>
      <td className='deadline-container' style={{ textAlign:'center' }}>{item.deadline ? new Date(item.deadline).toLocaleDateString() : '-'}</td>
      <td className='jumlah-revisi-container' style={{textAlign:'center' }}>{item.jumlah_revisi}</td>
      <td className='order-type-container'>{item.order_type_name}</td>
      <td className='offer-type-container'>{item.offer_type_name}</td>
      <td className='style-container' style={{textAlign:'center' }}>{item.style_name}</td>
      <td className='resolution-container' style={{textAlign:'center' }}>{item.resolution}</td>
      <td className='price-normal-container' style={{textAlign:'center'}}>{item.price_normal}</td>
      <td className='price-discount-container' style={{textAlign:'center', color:'#E53935'}}>{item.price_discount}</td>
      <td className='discount_percentage-container' style={{textAlign:'center', color:'#388E3C'}}>{item.discount_percentage}%</td>
      <td className='project-box-container' style={{textAlign:'center' }}>{item.project_type_name}</td>

      <td className='action-container' style={{textAlign:'center' }}>
        <div className="action-table">
          <BootstrapTooltip title='View Data' placement='top'>
            <button className='btn-action-icon' onClick={()=> handleShowDetail(item.marketing_design_id)}>
                <IoEyeSharp/>
            </button>
          </BootstrapTooltip>

          <BootstrapTooltip title='Edit Data' placement='top'>
            <button className='btn-action-icon' onClick={()=> handleShowEdit(item.marketing_design_id)}>
                <HiOutlinePencil/>
            </button>
          </BootstrapTooltip>

          <BootstrapTooltip title='Archive Data' placement='top'>
            <button className='btn-action-icon' onClick={()=>handleArchiveDataMarketingDesign(item.marketing_design_id)}>
              <HiOutlineArchiveBox/>
            </button>
          </BootstrapTooltip>

          <BootstrapTooltip title='Delete Data' placement='top'>
            <button className='btn-action-icon' onClick={()=>handleDeleteClick(item.marketing_design_id)}>
              <HiOutlineTrash/>
            </button>
          </BootstrapTooltip>
        </div>
      </td>
    </tr>
  );
});

/* ---------------------------
  Main Component
----------------------------*/
const MarketingDesign = () => {
  // STATE
  const [dataMarketingDesign, setDataMarketingDesign] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedMarketingDesign, setSelectedMarketingDesign] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showFormCreate, setShowFormCreate] = useState(false);
  const [showAcceptData, setShowAcceptData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // SHOW DATA UI
  const [data, setData] = useState([]); // kept for other flows if needed
  const [showData, setShowData] = useState(false);
  const showDataRef = OutsideClick(() => setShowData(false));
  const [showFilter, setShowFilter] = useState(false);
  const showFilterRef = OutsideClick(()=> setShowFilter(false));
  const [filterType, setFilterType] = useState('DATA MARKETING DESIGN');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [shortType, setShortType] = useState('');
  const [isExported, setIsExported] = useState(false);
  const [designTransfile, setDesignTransfile] = useState([]);
  const [showFormCounter, setShowFormCounter] = useState(false);

  // FILTER STATE
  const [filters, setFilters] = useState({
    buyer_name:'',
    order_number:'',
    account:'',
    input_by_name: ''
  });

  // Helper to assign data once
  const assignMarketingData = useCallback((list) => {
    setDataMarketingDesign(list);
    setFilteredData(list);
    setLoading(false);
  }, []);

  // helper hasCardId
  const hasCardId = useCallback((item) => {
    return item.card_id !== null && item.card_id !== undefined && item.card_id !== "";
  }, []);

  // FETCH generic depending on filterType (single entrypoint)
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let response;

      if (filterType === "DATA DENGAN CARD") {
        response = await getDataWhereCardIdNotNull();
        assignMarketingData(response.data || response);

      } else if (filterType === "DATA TANPA CARD") {
        response = await getDataWhereCardIdIsNull();
        assignMarketingData(response.data || response);

      } else {
        // PAGINATION FIX
        const resp = await getMarketingDesignPaginated(page, limit);
        const list = resp?.data?.data || resp?.data || [];
        setTotalPages(resp?.data?.totalPages || 1);

        const withExportStatus = await Promise.all(
          list.map(async (d) => {
            try {
              const check = await getExportMarketingDesign(
                d.marketing_design_id
              );
              return {
                ...d,
                is_transfiled: !!check?.data?.exported,
              };
            } catch {
              return { ...d, is_transfiled: false };
            }
          })
        );

        assignMarketingData(withExportStatus);
      }
    } catch (err) {
      console.error("Error fetching marketing design data:", err);
    } finally {
      setLoading(false);
    }
  }, [filterType, page, assignMarketingData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);



  // fetch accept & transfile lists once
  const fetchAuxiliary = useCallback(async () => {
    try {
      const resp = await getDataWhereCardIdNotNull();
      setShowAcceptData(resp.data || resp);
    } catch (err) {
      console.error('Error fetching accept data:', err);
    }

    try {
      const resp2 = await getAllMarketingDesignExports();
      // normalize to array
      setDesignTransfile(resp2.data || resp2 || []);
    } catch (err) {
      console.error('Error fetching transfile list:', err);
    }
  }, []);

  // Only one effect: when component mounts OR filterType changes, use fetchData
  useEffect(() => {
    fetchAuxiliary();
    fetchData();
  }, [fetchAuxiliary, fetchData]);

  // Filtering effect (local filtering UI)
  useEffect(() => {
    let temp = [...dataMarketingDesign];
    if (filters.buyer_name) {
      temp = temp.filter((item) =>
        (item.buyer_name || '').toLowerCase().includes(filters.buyer_name.toLowerCase())
      );
    }
    if (filters.order_number) {
      temp = temp.filter((item) =>
        (item.order_number || '').toLowerCase().includes(filters.order_number.toLowerCase())
      );
    }
    if (filters.account) {
      temp = temp.filter((item) =>
        (item.account_name || '').toLowerCase().includes(filters.account.toLowerCase())
      );
    }
    if (filters.input_by_name) {
      temp = temp.filter((item) =>
        (item.input_by_name || '').toLowerCase().includes(filters.input_by_name.toLowerCase())
      );
    }
    setFilteredData(temp);
  }, [filters, dataMarketingDesign]);

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  }, []);

  // simple search for all columns (global search)
  const handleFilterData = useCallback((value) => {
    const keyword = value.toLowerCase();

    if (!keyword) {
      setFilteredData(dataMarketingDesign);
      return;
    }

    const filtered = dataMarketingDesign.filter((item) =>
      Object.values(item).some((val) =>
        (val ? String(val).toLowerCase() : "").includes(keyword)
      )
    );

    setFilteredData(filtered);
  }, [dataMarketingDesign]);


  const confirmDelete = useCallback(async () => {
    try {
      await deleteDataMarketingDesign(selectedMarketingDesign);
      showSnackbar('Data Marketing Design deleted successfully', 'success');
      // refetch minimal
      fetchData();
    } catch (error) {
      console.error('Failed delete data marketing design', error);
      showSnackbar('Error Deleting Data Marketing Design','error');
    } finally {
      setShowDeleteConfirm(false);
      setSelectedMarketingDesign(null);
    }
  }, [selectedMarketingDesign, showSnackbar, fetchData]);

  const cancleDeleteConfirm = useCallback(() => {
    setShowDeleteConfirm(false);
    setSelectedMarketingDesign(null);
  }, []);

  const handleArchiveDataMarketingDesign = useCallback((marketing_design_id) => {
    handleArchive({
      entity:'marketing_design',
      id:marketing_design_id,
      refetch: fetchData,
      showSnackbar
    });
  }, [fetchData, showSnackbar]);

  // Stable handlers passed to rows
  const handleMove = useCallback(async (id, direction) => {
    try {
      await updateMarketingDesignPosition(id, direction);
      // refresh minimal
      fetchData();
    } catch (err) {
      console.error('Gagal ubah posisi data:', err);
    }
  }, [fetchData]);

  const handleShowDetail = useCallback((marketing_design_id) => {
    setSelectedMarketingDesign(marketing_design_id);
    setShowDetail(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setShowDetail(false);
    setSelectedMarketingDesign(null);
  }, []);

  const handleShowEdit = useCallback((marketing_design_id) => {
    setSelectedMarketingDesign(marketing_design_id);
    setShowEdit(true);
  }, []);

  const handleCloseEdit = useCallback(() => {
    setShowEdit(false);
    setSelectedMarketingDesign(null);
  }, []);

  const handleShowForm = useCallback(() => {
    setShowFormCreate(prev => !prev);
  }, []);

  const handleShowDataMarketing = useCallback(() => {
    setShowData(prev => !prev);
  }, []);

  const handleFilterButton = useCallback(() => {
    setShowFilter(prev => !prev);
  }, []);

  const handleShowCounter = useCallback(() => {
    setShowFormCounter(prev => !prev);
  }, []);

  const handleCloseCounter = useCallback(() => {
    setShowFormCounter(false);
  }, []);

  // designTransfile Set for O(1) lookup
  const transfileSet = useMemo(() => {
    const s = new Set();
    (designTransfile || []).forEach(d => {
      // accept both object with marketing_design_id or raw ids
      if (d?.marketing_design_id) s.add(d.marketing_design_id);
      else if (typeof d === 'number' || typeof d === 'string') s.add(d);
    });
    return s;
  }, [designTransfile]);

  // export flow
  const handleExportToSheet = useCallback(async (marketingDesignId) => {
    try {
      const marketingDesign = dataMarketingDesign.find(m => m.marketing_design_id === marketingDesignId);
      if (!marketingDesign) throw new Error("Data marketing tidak ditemukan");

      await exportDesignToSheets(marketingDesign);

      setIsExported(true);
      setDesignTransfile((prev) => [
        ...prev,
        { marketing_design_id: marketingDesignId }
      ]);

      await addExportMarketingDesign(marketingDesignId);

      showSnackbar(`Data berhasil dikirim ke Google Sheets`, "success");
      // update minimal (re-fetch)
      fetchData();
    } catch (error) {
      console.error("Gagal kirim data ke sheets:", error);
      showSnackbar(`Gagal kirim data ke sheets`, "error");
    }
  }, [dataMarketingDesign, showSnackbar, fetchData]);

  // STATUS constants
  const STATUS_CLASS = {
    "ACCEPTED": "accepted",
    "NOT ACCEPTED": "rejected",
    "ON PROGRESS": "progress",
    "UNKNOWN": "unknown",
    "CONFIRMED": "confirmed",
  };


  // const STATUS_COLORS = useMemo(() => ({
  //   "ACCEPTED ":'#2E7D32',
  //   "NOT ACCEPTED":'#C62828',
  //   "ON PROGRESS":'#C38D24',
  //   "UNKNOWN":'#F5F5F5',
  //   "CONFIRMED": "#1565C0"
  // }), []);

  // const STATUS_BG = useMemo(() => ({
  //   "ACCEPTED ": "rgba(200, 230, 201, 0.4)",    // #C8E6C9
  //   "NOT ACCEPTED": "rgba(255, 205, 210, 0.4)", // #FFCDD2
  //   "ON PROGRESS": "rgba(255, 220, 179, 0.4)",  // #FFDCB3
  //   "UNKNOWN": "rgba(158, 158, 158, 0.4)",      // #9E9E9E
  //   "CONFIRMED": "rgba(187, 222, 251, 0.4)",    // #BBDEFB
  //   }), []);


  // const STATUS_BG = useMemo(() => ({
  //   "ACCEPTED ":'#C8E6C9',
  //   "NOT ACCEPTED":'#FFCDD2',
  //   "ON PROGRESS":'#FFDCB3',
  //   "UNKNOWN":"#9E9E9E",
  //   "CONFIRMED": "#BBDEFB"
  // }), []);

  // UI render
  return (
    <div className='md-container'>
      <div className="md-header">
        <div className="mdh-left">
          <div className="mdh-title">
            {/* <div className="mdh-icon">
              <HiOutlineCircleStack className='dm-mini' />
            </div> */}
            <h3>{filterType}</h3>
          </div>
          <div className="mdh-des">
            <p><strong>Selamat datang di pusat informasi Divisi Marketing Design!</strong></p>
            <p>Di halaman ini, Anda dapat melihat seluruh rangkuman aktivitas dan progres proyek desain yang sedang berlangsung maupun yang telah selesai.</p>
          </div>
        </div>

        {/* SHOW COMPONENT */}
        {showFormCreate && (
          <div className="md-form">
            <div className="md-content">
              <FormMarketingDesignExample onClose={handleShowForm} fetchMarketingDesign={fetchData} />
            </div>
          </div>
        )}

        <div className="mdh-right">
          <div className="mdhr-btn">
            <button onClick={handleShowDataMarketing}> <HiAdjustmentsHorizontal /> SHOW DATA</button>
            <button onClick={handleFilterButton}> <HiOutlineFunnel/> FILTER DATA</button>
            <button onClick={() => navigate('/layout/marketing-design-report')}><HiOutlineChartBar/> REPORT</button>
            {/* <button className='new-data-btn'  onClick={handleShowForm}> <HiOutlinePlus/> NEW DATA</button> */}
          </div>

          <div className="mdh-search-container">
            <SearchSugesstion
              data={dataMarketingDesign}
              onSearch={handleFilterData}
              onSelect={(field, value) => {
                setFilters((prev) => ({
                  ...prev,
                  buyer_name: "",
                  order_number: "",
                  account: "",
                  [field]: value,
                }));
              }}
            />

            <div className='new-data-btn'  onClick={handleShowForm}> <HiOutlinePlus/> NEW DATA</div>
            <div className="reset-btn-btn" onClick={handleShowCounter}>
              <MdLockReset/> <span>RESET COUNTER</span>
            </div>
            <div className="data-master-btn" onClick={() => navigate('/layout/data-master-design')}>
              <CgDatabase/>
              <span>DATA MASTER</span>
            </div>
          </div>

          {showFormCounter && (
            <div className="reset-form">
              <ResetCounterDesign onClose={handleCloseCounter}/>
            </div>
          )}

          {showData && (
            <div className='sd-cont' ref={showDataRef}>
              <div className="sd-header">
                <h5><HiMiniTableCells className='h5-icon'/>SHOW DATA BY </h5>
                {/* <HiXMark onClick={handleShowDataMarketing} style={{cursor:'pointer'}}/> */}
              </div>
              <div className="sd-box">
                {/* <h5>Show Data By:</h5> */}
                <button onClick={() => { setFilterType('DATA MARKETING DESIGN'); setShowData(false); }}>All Data</button>
                <button onClick={() => { setFilterType('DATA DENGAN CARD'); setShowData(false); }}>Data Dengan Card</button>
                <button onClick={() => { setFilterType('DATA TANPA CARD'); setShowData(false); }}>Data Tanpa Card</button>
              </div>
            </div>
          )}

          {showFilter && (
            <div className="ft-cont" ref={showFilterRef}>
              <div className="ftc-header"><h5>Filter By:</h5></div>
              <div className="ftc-content">
                <div className="ftc-box">
                  <div className='ft-btn' onClick={() => setDropdownOpen(!dropdownOpen)}>
                    <HiChevronUpDown className='ft-icon'/>
                    {shortType ? shortType.replace('_', ' ') : 'Filter Type'}
                  </div>
                  {dropdownOpen && (
                    <ul className='ul-ftc-box'>
                      <li className="li-ftc" onClick={() => { setShortType('buyer_name'); setDropdownOpen(false); }}>Buyer Name</li>
                      <li className="li-ftc" onClick={() => { setShortType('order_number'); setDropdownOpen(false); }}>Order Number</li>
                      <li className="li-ftc" onClick={() => { setShortType('account'); setDropdownOpen(false); }}>Account</li>
                      <li className="li-ftc" onClick={() => { setShortType('input_by_name'); setDropdownOpen(false); }}>Marketing Name</li>
                    </ul>
                  )}
                </div>
                <div className="ftc-input-box">
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

      <div className="new-data">
        {loading ? (
          // <p>loading data...</p>
          <LoadingSpinnerDot text='Preparing your data marketing'/>
        ) : (
          <div className='data-accept-design'>
            <table cellPadding='10' cellSpacing='0'>
              <thead>
                <tr>
                  <th className='rounded-tl-md' style={{textAlign:'center'}}>NO</th>
                  <th>PROJECT NUMBER</th>
                  <th style={{textAlign:'center'}}>INPUT BY</th>
                  <th style={{textAlign:'center'}}>ACC BY</th>
                  <th style={{textAlign:'center'}}>STATUS</th>
                  <th><div className='th'>BUYER NAME <HiArrowsUpDown/></div></th>
                  <th><div className="th">CODE ORDER <HiArrowsUpDown/></div></th>
                  <th style={{textAlign:'center'}}>JUMLAH DESIGN</th>
                  <th style={{textAlign:'center'}}>ORDER NUMBER</th>
                  <th><div className="th">ACCOUNT <HiArrowsUpDown/></div></th>
                  <th style={{textAlign:'center'}}>DEADLINE</th>
                  <th style={{textAlign:'center'}}>JUMLAH REVISI</th>
                  <th>ORDER TYPE</th>
                  <th>OFFER TYPE</th>
                  <th style={{textAlign:'center'}}>STYLE</th>
                  <th style={{textAlign:'center'}}>RESOLUTION</th>
                  <th><div className="th">PRICE NORMAL</div></th>
                  <th><div className="th">PRICE DISCOUNT</div></th>
                  <th style={{textAlign:'center'}}>DISCOUNT</th>
                  <th style={{textAlign:'center'}}>PROJECT TYPE</th>
                  <th style={{textAlign:'center'}}>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {filteredData.map((item, index) => {
                  const isExported = transfileSet.has(item.marketing_design_id) || !!item.is_transfiled;
                  return (
                    <MarketingDesignRow
                      key={item.marketing_design_id}
                      item={item}
                      index={index}
                      isExported={isExported}
                      handleMove={handleMove}
                      handleShowDetail={handleShowDetail}
                      handleShowEdit={handleShowEdit}
                      handleArchiveDataMarketingDesign={handleArchiveDataMarketingDesign}
                      handleDeleteClick={(id) => { setSelectedMarketingDesign(id); setShowDeleteConfirm(true); }}
                      hasCardId={hasCardId}
                      STATUS_CLASS={STATUS_CLASS}
                      // STATUS_BG={STATUS_BG}
                      // STATUS_COLORS={STATUS_CLASS}
                    />
                  );
                })}
              </tbody>
            </table>
            <div className="pagination">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>

              <span>
                Page <strong>{page}</strong> of <strong>{totalPages}</strong>
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>


            {/* DETAIL / EDIT MODALS */}
            {showDetail && selectedMarketingDesign && (
              <div className="detail-data-design">
                <div className="detail-cont">
                  <ViewDataMarketingDesign
                    marketingDesignId={selectedMarketingDesign}
                    onClose={handleCloseDetail}
                    handleExportToSheet={handleExportToSheet}
                    fetchMarketingDesign={fetchData}
                    setIsExported={setIsExported}
                    isExported={isExported}
                    designTransfile={designTransfile}
                    setDesignTransfile={setDesignTransfile}
                  />
                </div>
              </div>
            )}

            {showEdit && selectedMarketingDesign && (
              <div className="edit-data-design">
                <div className="edit-cont">
                  <NewEditMarketingDesign marketingDesignId={selectedMarketingDesign} onClose={handleCloseEdit} fetchMarketingDesign={fetchData} />
                </div>
              </div>
            )}

            <MarketingDesignDeleteConfirm
              isOpen={showDeleteConfirm}
              marketingDesignId={selectedMarketingDesign}
              onConfirm={confirmDelete}
              onCancle={cancleDeleteConfirm}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketingDesign;
