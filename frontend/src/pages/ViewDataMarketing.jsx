import React, { useEffect, useState } from 'react'
import { getAllLists, getDataMarketingById, createCardFromMarketing, checkCardIdNullOrNot } from '../services/ApiServices';
import { data, useParams } from 'react-router-dom';
import '../style/pages/ViewDataMarketing.css'
import { HiCube, HiCubeTransparent, HiOutlinePlus, HiOutlineXMark } from 'react-icons/hi2';
import BootstrapTooltip from '../components/Tooltip';
import OutsideClick from '../hook/OutsideClick';
import FormCreateCardMarketing from '../fitur/FormCreateCardMarketing';
import { useRouterContext } from '../context/RouteContext';
import { FaXmark } from 'react-icons/fa6';


const ViewDataMarketing=({marketingId, onClose})=> {
    //STATE
    const {workspaceId, boardId} = useRouterContext()
    console.log('Data workspace id berhasil diteruskan:', workspaceId)
    console.log('Data marketing berhasil diteruskan:', marketingId)
    const [dataMarketings, setDataMarketings] = useState([]);
    const [lists, setLists] = useState([]);
    const [selectedListId, setSelectedListId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showList, setShowList] = useState({})
    const showListRef = OutsideClick(()=> setShowList(false))
    const [cardId, setCardId] = useState(null)
    const [loadingCardId, setLoadingCardId] = useState(true)


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
            const response = await getDataMarketingById(marketingId)
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


  return (
    <div className='view-dm-container'>
      <div className="vdm-header">
        <div className="vdm-left">
          <h4>DATA MARKETING</h4>
          {dataMarketings.genre} | {dataMarketings.buyer_name} | {dataMarketings.account} | {getLastFiveCodeOrder(dataMarketings.code_order)}
        </div>
        <div className="vdm-right">
          {/* CHECK CARD ID  */}
          <div className="card-status">
            {loadingCardId ? (
              <p>Memeriksa...</p>
            ): cardId ? (
              <button className='created'>Created</button>
            ):(
              <button className='uncreated'>Not Created</button>
            )}
          </div>

          <button className='cc-btn' onClick={()=> handleShowLists(marketingId)}>
            <HiOutlinePlus style={{fontSize:'15px'}}/>
            CREATE CARD
          </button>
          <BootstrapTooltip title='Close Detail' placement='top'>
            <FaXmark onClick={onClose} className='vdm-icon'/>
          </BootstrapTooltip>
        </div>
      </div>
      {showList[marketingId]&& (
        // <div ref={showListRef}>Marketing lists</div>
        <div className='vdm-form'>
          <FormCreateCardMarketing marketingId={marketingId} onClose={() => handleShowClose(marketingId)}/>
        </div>
      )}

      <div className="vdm-body">
        {/* INFORMASI PESANAN CONTAINER  */}
        <div className="sec">
          <h4>Informasi Pesanan</h4>
          <div className="sec-content">
            <div className="box">
              <p>Input By</p>
              <div className='box1'>
                <p>{dataMarketings.input_by}</p>
              </div>
            </div>
            <div className="box">
              <p>Accepted By</p>
              <div className='box1'>
                <p>{dataMarketings.acc_by}</p>
              </div>
            </div>
            <div className="box">
              <p>Status Accept</p>
              <div className="box1" style={{padding:'0px'}}>
                <p 
                  style={{
                    padding: '5px 8px',
                    borderRadius: '3px',
                    backgroundColor: dataMarketings.is_accepted ? '#C8E6C9' : '#FFCDD2',
                    color: dataMarketings.is_accepted ? '#2E7D32' : '#C62828',
                    fontWeight: 'bold',
                    textAlign:'center',
                    margin:"0px"
                  }}
                >
                  {dataMarketings.is_accepted ?  'Accepted':'Not Accepted'}
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
                <p>{dataMarketings.account}</p>
              </div>
            </div>
          </div>
        </div>
        {/* END INFORMASI PESANAN CONTAINER  */}

        {/* DETAIL PESANAN  */}
        <div className="sec">
          <h4>Detail Pesanan</h4>
          <div className="sec-content">
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
                <p>{dataMarketings.order_type}</p>
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
                <p>{dataMarketings.jenis_track}</p>
              </div>
            </div>
            <div className="box">
              <p>Genre</p>
              <div className='box1'>
                <p>{dataMarketings.genre}</p>
              </div>
            </div>
            <div className="box">
              <p>Project Type</p>
              <div className='box1'>
                <p>{dataMarketings.project_type}</p>
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
          <h4>Informasi Harga dan Diskon</h4>
          <div className="sec-content">
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
          <h4>Referensi dan File Pendukung</h4>
          <div className="sec-content-link">
            <div className="box">
              <p>Gig Link</p>
              <div className='box1'>
                <a href={dataMarketings.gig_link} target="_blank" rel="noopener noreferrer">{dataMarketings.gig_link}</a>
              </div>
            </div>
            <div className="box">
              <p>Reference Link</p>
              <div className='box1'>
                <a href={dataMarketings.reference_link} target="_blank" rel="noopener noreferrer">{dataMarketings.reference_link}</a>
              </div>
            </div>
            <div className="box">
              <p>Require Link</p>
              <div className='box1'>
                <a href={dataMarketings.required_files} target="_blank" rel="noopener noreferrer">{dataMarketings.required_files}</a>
              </div>
            </div>
            <div className="box">
              <p>File & Chat</p>
              <div className='box1'>
                <a href={dataMarketings.file_and_chat_link} target="_blank" rel="noopener noreferrer">{dataMarketings.file_and_chat_link}</a>
              </div>
            </div>
            </div>
        </div>
        {/* END REFERENSI DAN FILE PENDUKUNG  */}

        {/* PROJECT DESCRIPTION  */}
        <div className="sec">
          <h4>Project Description</h4>
          <div className="sec-desc-content">
            <div className="box" style={{width:'100%', padding:'0px 5px'}}>
              {/* <p>Description</p> */}
              <div className='box1' style={{height:'10vh', width:'100%'}}>
                <p>{dataMarketings.detail_project}</p>
              </div>
            </div>
          </div>
        </div>
        {/* END DESCRIPTION PROJECT  */}
      </div>

      
    </div>
  )
}

export default ViewDataMarketing

{/* <h3>Data Marketing Design for <br />New Project | {marketingDesign.style} | {marketingDesign.buyer_name} | {marketingDesign.account} | {lastFiveChars}</h3> */}
// <h2>Marketing Detail</h2>
//       <p><strong>ID:</strong> {dataMarketings.id}</p>
//       <p><strong>Buyer Name:</strong> {dataMarketings.buyer_name}</p>
//       <p><strong>Order Number:</strong> {dataMarketings.order_number}</p>
//       <p><strong>Account:</strong> {dataMarketings.account}</p>
//       <p><strong>Deadline:</strong> {new Date(dataMarketings.deadline).toLocaleDateString()}</p>
//       {/* Tambahkan detail lainnya sesuai kebutuhan */}