import React, { isValidElement, useEffect, useState } from 'react'
import { getAllLists, getDataMarketingById,getAllDataMarketingJoinedById, createCardFromMarketing, checkCardIdNullOrNot, exportDataMarketingToSheets, getMarketingWithExportStatus,checkMarketingExport ,addMarketingExport,addExportMarketing, getAllMarketingExports} from '../services/ApiServices';
import { data, useNavigate, useParams } from 'react-router-dom';
import '../style/pages/ViewDataMarketing.css'
import { HiCube, HiCubeTransparent, HiOutlinePlus, HiOutlineXMark, HiPlus, HiXMark } from 'react-icons/hi2';
import BootstrapTooltip from '../components/Tooltip';
import OutsideClick from '../hook/OutsideClick';
import FormCreateCardMarketing from '../fitur/FormCreateCardMarketing';
import { useRouterContext } from '../context/RouteContext';
import { useSnackbar } from '../context/Snackbar';
import ReactQuill from 'react-quill-new';
import "react-quill-new/dist/quill.snow.css";
import { MdMarkEmailRead, MdMarkEmailUnread } from 'react-icons/md';
import { TbArrowBigUpLines } from "react-icons/tb";
import { IoCheckbox, IoCheckboxOutline, IoCheckmarkDone, IoCloseSharp } from "react-icons/io5";
import { IoMdCloseCircle } from 'react-icons/io';


const ViewDataMarketing=({marketingId, onClose, isExported, setIsExported,marketingTransfile, fetchDataTransfile,onExport})=> {
    //STATE
    const {workspaceId, boardId} = useRouterContext()
    console.log('Data workspace id berhasil diteruskan:', workspaceId)
    console.log('ONEXPORT marketing berhasil diteruskan:', onExport)
    console.log('berhasil meneruskan isExported:', isExported)
    const [dataMarketings, setDataMarketings] = useState([]);
    const [lists, setLists] = useState([]);
    const [selectedListId, setSelectedListId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showList, setShowList] = useState({})
    const showListRef = OutsideClick(()=> setShowList(false))
    const [cardId, setCardId] = useState(null)
    const [loadingCardId, setLoadingCardId] = useState(true)
    const {showSnackbar} = useSnackbar();
    const navigate = useNavigate();
    // const [marketingTransfile, setMarketingTransfile] = useState([]);
    // const [isExported, setIsExported] = useState(false);



    const handleShowLists = (marketingId) => {
      setShowList((prevState) => ({
        ...prevState,
        [marketingId]: !prevState[marketingId], // Toggle list untuk marketingId tertentu
      }));
    };
    
    const handleShowClose = (marketingId) => {
      setShowList((prevState) => ({
        ...prevState,
        [marketingId]: false, // Tutup list saat tombol close diklik
      }));
    };
    
    
    

    //FUNCTION
    //1. fetch data marketing by id
    const fetchData = async()=>{
        try{
            // const response = await getDataMarketingById(marketingId)
            const response = await getAllDataMarketingJoinedById(marketingId)
            setDataMarketings(response.data)
        }catch(error){
            console.log('Error fetching data marketing:', error)
        }
    }

    useEffect(()=>{
        fetchData();
    },[marketingId])

     //2. fungsi untuk mengambil 5 karakter terakhir dari code order
    const getLastFiveCodeOrder = (codeOrder) =>{
      return codeOrder ? codeOrder.slice(-5) : '';
    }

    //3. deadline format date
    const formatDate = (isoString) => {
      const date = new Date(isoString);
      const options = { day: 'numeric', month: 'long', year: 'numeric' };
      return date.toLocaleDateString('id-ID', options);
  };


  //5. fungsi to create marketing data to card
  const handleCreateDataCardFromMarketing = async () => {
    if (!selectedListId) {
      alert('Silakan pilih list terlebih dahulu!');
      return;
    }

    try {
      setIsLoading(true); // Menandakan proses sedang berlangsung
      const response = await createCardFromMarketing(selectedListId, marketingId);

      if (response.status === 201) {
        console.log('Card berhasil dibuat:', response.data);
        alert('Card berhasil dibuat dari data marketing!');
      } else {
        console.log('Gagal membuat card:', response.data);
        alert('Gagal membuat card!');
      }
    } catch (error) {
      console.error('Terjadi kesalahan saat membuat card:', error);
      alert('Terjadi kesalahan saat membuat card!');
    } finally {
      setIsLoading(false); // Menandakan proses selesai
    }
  };

  //6. fetch cardid
  const fetchCardId = async()=>{
    setIsLoading(true)
    try{
      const response = await checkCardIdNullOrNot(marketingId)
      setCardId(response.data.card_id);
    }catch(error){
      console.error('Error checking card ID:', error)
      setCardId(null)
    }finally{
      setLoadingCardId(false)
    }
  }
  useEffect(() => {
    fetchData();
    fetchCardId();
  }, [marketingId]);

  //NAVIGATE 
  const navigateToEditPage = () =>{
    navigate('/layout/edit-marketing-musik')
  }


      // link reference 
    function linkify(text) {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      return text.replace(urlRegex, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
      });
    }


// konfigurasi toolbar ReactQuill
const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"], 
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "blockquote", "code-block"],
      [{ align: [] }],
      ["clean"], // hapus format
    ],
  };

  // FUNCTION TO SHOW STATUS 
  const STATUS_COLORS ={
    "ACCEPTED ":'#2E7D32',
    "NOT ACCEPTED":'#C62828',
    "ON PROGRESS":'#C38D24',
    "UNKNOWN":'#F5F5F5',
    "CONFIRMED": "#1565C0"
  }
  const STATUS_BG = {
    "ACCEPTED ":'#C8E6C9',
    "NOT ACCEPTED":'#FFCDD2',
    "ON PROGRESS":'#FFDCB3',
    "UNKNOWN":"#9E9E9E",
    "CONFIRMED": "#BBDEFB" 
  }

  /* =======================
  LINK HELPER
  ======================= */
  const idValidUrl = (string) =>{
    try{
      new URL(string);
      return true;
    }catch (_) {
      return false;
    }
  }


  return (
    <div className='view-dm-container'>

      <div className="vmd-header">
        <div className="vdm-left">
          <h4>DETAIL DATA MARKETING</h4>
          <p>
            {dataMarketings.buyer_name} | {dataMarketings.account_name} | {dataMarketings.order_type_name} | {getLastFiveCodeOrder(dataMarketings.code_order)}
          </p>
        </div>
        
       
        <div className="vdm-right">
           <div className="vdm-action">
                  <button 
                    onClick={()=> handleShowLists(marketingId)}>
                    {loadingCardId ? (
                      <p>Memeriksa...</p>
                    ): cardId ? (
                      <p className='create-icon'><IoCheckmarkDone size={15}/> CREATED</p>
                    ):(
                      <p className='not-created-icon'> <IoCloseSharp size={15}/> NOT CREATED</p>
                    )}
                  </button>

                  <button
                      onClick={() => onExport(marketingId)}
                      disabled={marketingTransfile.some(exp => exp.marketing_id === marketingId)} // disable jika sudah di-transfile
                      style={{
                        fontSize:'11px',
                        cursor: marketingTransfile.some(exp => exp.marketing_id === marketingId) ? "not-allowed" : "pointer",
                      }}
                  >
                    {marketingTransfile.some(exp => exp.marketing_id === marketingId)
                      ? <IoCheckmarkDone size={15}/>
                      : <TbArrowBigUpLines size={15}/>
                    }
                    {marketingTransfile.some(exp => exp.marketing_id === marketingId)
                      ? "TRANSFERED "
                      : "TRANSFER TO SPREADSHEET"}
                  </button>

                  {showList[marketingId]&& (
                    // <div ref={showListRef}>Marketing lists</div>
                    <div className='vdm-form'>
                      <FormCreateCardMarketing marketingId={marketingId} onClose={() => handleShowClose(marketingId)}/>
                    </div>
                  )}
            </div>
          <div className="close-header-icon">
             <BootstrapTooltip title='Close' placement='top'>
              <IoMdCloseCircle onClick={onClose} className='vdm-icon'/>
            </BootstrapTooltip>
          </div>
        </div>
      </div>

      
      

      <div className="vdm-body">
        {/* INFORMASI PESANAN CONTAINER  */}
        <div className="sec">
          <h4>INFORMASI PESANAN</h4>
          <div className="sec-container">
            <div className="box">
              <p>Project Number</p>
              <div className='box1'>
                <p>{dataMarketings.project_number}</p>
              </div>
            </div>
            <div className="box">
              <p>Input By</p>
              <div className='box1'>
                <p>{dataMarketings.input_by_name}</p>
              </div>
            </div>
            <div className="box">
              <p>Accepted By</p>
              <div className='box1'>
                <p>{dataMarketings.acc_by_name}</p>
              </div>
            </div>
            <div className="box">
              <p>Status Accept</p>
              <div className="box1" style={{padding:'0px'}}>
                <p 
                  style={{
                    padding: '5px 8px',
                    borderRadius: '3px',
                    backgroundColor: STATUS_BG[dataMarketings?.accept_status_name],
                    color:STATUS_COLORS[dataMarketings?.accept_status_name],
                    fontWeight: 'bold',
                    textAlign:'center'
                  }}
                >
                  {dataMarketings.accept_status_name}
                </p>
              </div>
            </div>
            <div className="box">
              <p>Buyer Name</p>
              <div className='box1'>
                <p>{dataMarketings.buyer_name}</p>
              </div>
            </div>
            <div className="box">
              <p>Account</p>
              <div className='box1'>
                <p>{dataMarketings.account_name}</p>
              </div>
            </div>
          </div>
        </div>
        {/* END INFORMASI PESANAN CONTAINER  */}

        {/* DETAIL PESANAN  */}
        <div className="sec">
          <h4>DETAIL PESANAN</h4>
          <div className="sec-container">
            <div className="box">
              <p>Code Order</p>
              <div className='box1'>
                <p>{dataMarketings.code_order}</p>
              </div>
            </div>
            <div className="box">
              <p>Order Number</p>
              <div className='box1'>
                <p>{dataMarketings.order_number}</p>
              </div>
            </div>
            <div className="box">
              <p>Order Type</p>
              <div className='box1'>
                <p>{dataMarketings.order_type_name}</p>
              </div>
            </div>
            <div className="box">
              <p>Jumlah Track</p>
              <div className='box1'>
                <p>{dataMarketings.jumlah_track}</p>
              </div>
            </div>
            <div className="box">
              <p>Jenis Track</p>
              <div className='box1'>
                <p>{dataMarketings.track_type_name}</p>
              </div>
            </div>
            <div className="box">
              <p>Genre</p>
              <div className='box1'>
                <p>{dataMarketings.genre_name}</p>
              </div>
            </div>
            <div className="box">
              <p>Project Type</p>
              <div className='box1'>
                <p>{dataMarketings.project_type_name}</p>
              </div>
            </div>
            <div className="box">
              <p>Duration</p>
              <div className='box1'>
                <p>{dataMarketings.duration}</p>
              </div>
            </div>
            <div className="box">
              <p>Jumlah Revisi</p>
              <div className='box1'>
                <p>{dataMarketings.jumlah_revisi}</p>
              </div>
            </div>
            <div className="box">
              <p>Deadline</p>
              <div className='box1'>
                <p>{formatDate(dataMarketings.deadline)}</p>
              </div>
            </div>
          </div>
        </div>
        {/* END DETAIL PESANAN  */}

        {/* INFORMASI HARGA  */}
        <div className="sec">
          <h4>INFORMASI HARGA DAN DISKON</h4>
          <div className="sec-container">
            <div className="box">
              <p>Price Normal</p>
              <div className='box1'>
                <p>{dataMarketings.price_normal}</p>
              </div>
            </div>
            <div className="box">
              <p>Price Discount</p>
              <div className='box1'>
                <p>{dataMarketings.price_discount}</p>
              </div>
            </div>
            <div className="box">
              <p>Discount</p>
              <div className='box1'>
                <p>{dataMarketings.discount}</p>
              </div>
            </div>
            <div className="box">
              <p>Kupon Discount</p>
              <div className='box1'>
                <p>{dataMarketings.kupon_diskon_name}</p>
              </div>
            </div>
            <div className="box">
              <p>Basic Price</p>
              <div className='box1'>
                <p>{dataMarketings.basic_price}</p>
              </div>
            </div>
          </div>
        </div>
        {/* END INFORMASI HARGA  */}

        {/* REFERENSI DAN FILE PENDUKUNG  */}
        <div className="sec">
          <h4>REFERENSI DAN FILE PENDUKUNG</h4>
          {/* <h4>Referensi dan File Pendukung</h4> */}
          <div className="sec-container-link">
            <div className="box">
              <p>Gig Link</p>
              <div className='box1-ref'>
                <a href={dataMarketings.gig_link} target="_blank" rel="noopener noreferrer">{dataMarketings.gig_link}</a>
              </div>
            </div>
            
            <div className="box">
              <p>Require Link</p>
              <div className='box1-ref'>
                <a href={dataMarketings.required_files} target="_blank" rel="noopener noreferrer">{dataMarketings.required_files}</a>
              </div>
            </div>
            <div className="box">
              <p>File & Chat</p>
              <div className='box1-ref'>
                <a href={dataMarketings.file_and_chat_link} target="_blank" rel="noopener noreferrer">{dataMarketings.file_and_chat_link}</a>
              </div>
                {/* <div className="box-ref">
                  {isValidElement(dataMarketings?.file_and_chat || "-") ? (
                    <a
                      href={dataMarketings?.file_and_chat || "-"}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#1d4ed8',        // biru-500 (Tailwind vibe)
                        textDecoration: 'none',
                        fontWeight: '500',
                        fontSize:'12px',
                        // border:'1px solid red',
                        wordWrap:'break-word',
                        whiteSpace:'normal',
                        overflowWrap:'break-word'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                      {dataMarketings?.file_and_chat || "-"}
                    </a>
                  ) : (
                    <p>{dataMarketings?.file_and_chat || "-"}</p>
                  )}
                </div>*/}
              </div> 
            
            <div className="box" style={{width:'100%', padding:'0px 5px'}}>
              <p>Reference Link</p>
              <div className='box1-ref' style={{minHeight:'10vh',maxHeight:'20vh', width:'100%', overflowY:'auto'}}>
                <div
                  dangerouslySetInnerHTML={{
                    __html: linkify(dataMarketings.reference_link || ""),
                  }}
                />
              </div>
            </div>
          
            </div>
        </div>
        {/* END REFERENSI DAN FILE PENDUKUNG  */}

        {/* PROJECT DESCRIPTION  */}
        <div className="sec">
          <h4>PROJECT DESCRIPTION</h4>
          <div className="sec-desc-content">
            <div className="box" style={{width:'100%', padding:'0px 5px', display:'flex', alignItems:'center', justifyContent:'center'}}>
   
              <ReactQuill
                className='my-detail-editor'
                value={dataMarketings.detail_project || ""}
                theme="snow"
                modules={{toolbar: false }}
              />
            </div>
          </div>
          
        </div>
        {/* END DESCRIPTION PROJECT  */}
      </div>

      
    </div>
  )
}

export default ViewDataMarketing
