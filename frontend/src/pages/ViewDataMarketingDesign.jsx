import React, { useEffect, useState } from 'react'
import { checkCardIdNullOrNotForDesign, getDataMarketingDesignById } from '../services/ApiServices'
import {HiPlus } from 'react-icons/hi2'
import { FaXmark } from "react-icons/fa6";
import BootstrapTooltip from '../components/Tooltip'
import '../style/pages/ViewDataMarketingDesign.css'
import OutsideClick from '../hook/OutsideClick';
import FormCreateCardDesign from '../fitur/FormCreateCardDesign'

const ViewDataMarketingDesign=({marketingDesignId, onClose})=> {
    //STATE
    console.log('marketing design id diterima:', marketingDesignId)
    const [dataMarketingDesign, setDataMarketingDesign] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [cardId, setCardId] = useState(null)
    const [loadingCardId, setLoadingCardId] = useState(true)
    const [showCardForm, setShowCardForm] = useState({})
    const showCreateRef = OutsideClick(()=> setShowCardForm(false))


    //FUNCTION 
    //1. fetch data marketing design by id
    const fetchDataDesign = async()=>{
      try{
        const response = await getDataMarketingDesignById(marketingDesignId)
        setDataMarketingDesign(response.data)
      }catch(error){
        console.log('Error fetching data marketing:', error)
      }
    }

    useEffect(()=>{
      fetchDataDesign()
    },[marketingDesignId])

    //2. fungsi untuk mengambil 5 karakter terakhir dari code order
    const getLastFiveCodeOrder = (codeOrder) =>{
      return codeOrder ? codeOrder.slice(-5):'';
    }

    //3. deadline format date
    const formatDate = (isoString) => {
      const date = new Date(isoString);
      const options = { day: 'numeric', month: 'long', year: 'numeric' };
      return date.toLocaleDateString('id-ID', options);
    };

    //4. fetch cardId
    const fetchCardId = async()=>{
      setIsLoading(true)
      try{
        const response = await checkCardIdNullOrNotForDesign(marketingDesignId)
        setCardId(response.data.card_id)
      }catch(error){
        console.error('Error checking card ID:', error)
        setCardId(null)
      }finally{
        setLoadingCardId(false)
      }
    } 
     useEffect(() => {
        fetchDataDesign();
        fetchCardId();
      }, [marketingDesignId]);

  // SHOW CREATE FORM 
  const showCreateForm = (marketingDesignId) =>{
    setShowCardForm((prevState) =>({
      ...prevState,
      [marketingDesignId]: !prevState[marketingDesignId]
    }))
  }
  const handleCloseForm = (marketingDesignId) =>{
    setShowCardForm((prevState) =>({
      ...prevState,
      [marketingDesignId]: false
    }))
  }

  //helper link 
  const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

//text with link 
const renderTextWithLinks = (text) => {
  if (!text || typeof text !== 'string') return null;

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, index) =>
    urlRegex.test(part) ? (
      <a
        key={index}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-blue-600 break-words hover:underline"
      >
        {part}
      </a>
    ) : (
      <span key={index}>{part}</span>
    )
  );
};




  return (
    <div className='view-md-container'>
      <div className="vmd-header">
        <div className="vmd-left">
          <h4>DATA MARKETING</h4>
          {dataMarketingDesign.style} | {dataMarketingDesign.buyer_name} | {dataMarketingDesign.account} | {getLastFiveCodeOrder(dataMarketingDesign.code_order)}
        </div>
        <div className="vmd-right">
            <div className="card-status">
              {loadingCardId ? (
                <p>Memeriksa...</p>
              ): cardId ? (
                <button className='created'>Created</button>
              ):(
                <button className='uncreated'>Not Created</button>
              )}
            </div>

            <button className='create-btn' onClick={()=> showCreateForm(marketingDesignId)}>
              <HiPlus size={15}/>
              CREATE CARD
            </button>
            <BootstrapTooltip title='Close' placement='top'>
              <FaXmark onClick={onClose} className='vmd-icon'/>
            </BootstrapTooltip>
        </div>
      </div>
      {showCardForm[marketingDesignId]&& (
        <div className="vmd-form">
          <FormCreateCardDesign marketingDesignId={marketingDesignId} onClose={()=> handleCloseForm(marketingDesignId)}/>
        </div>
      )}
      {/* FORM CREATE  */}
      <div className="vmd-body">
        <div className="sec-informasi">
          <h4>Informasi Pesanan</h4>
          <div className="vmd-content" >
            <div className="box-content" >
              <p>Input By</p>
              <div className="box-box">
                <p>{dataMarketingDesign.input_by}</p>
              </div>
            </div>
            <div className="box-content">
              <p>Accept By</p>
              <div className="box-box">
                <p>{dataMarketingDesign.acc_by}</p>
              </div>
            </div>
            <div className="box-content">
              <p>Status Accept</p>
              <div className="box-box" style={{padding:'0px'}}>
                <p 
                  style={{
                    padding: '5px 8px',
                    borderRadius: '3px',
                    backgroundColor: dataMarketingDesign.is_accepted ? '#C8E6C9' : '#FFCDD2',
                    color: dataMarketingDesign.is_accepted ? '#2E7D32' : '#C62828',
                    fontWeight: 'bold',
                    textAlign:'center'
                  }}
                >
                  {dataMarketingDesign.is_accepted ?  'Accepted':'Not Accepted'}
                </p>
              </div>
            </div>
            <div className="box-content">
              <p>Buyer Namer</p>
              <div className="box-box">
                <p>{dataMarketingDesign.buyer_name}</p>
              </div>
            </div>
            <div className="box-content">
              <p>Code Order</p>
              <div className="box-box">
                <p>{dataMarketingDesign.code_order}</p>
              </div>
            </div>
            <div className="box-content">
              <p>Order Number</p>
              <div className="box-box">
                <p>{dataMarketingDesign.order_number}</p>
              </div>
            </div>
            <div className="box-content">
              <p>Account</p>
              <div className="box-box">
                <p>{dataMarketingDesign.account}</p>
              </div>
            </div>
            
          </div>
        </div>
        <div className="sec-detail-pesanan">
          <h4>Detail Pesanan</h4>
          <div className="vmd-content">
            <div className="box-content">
              <p>Jumlah Design</p>
              <div className="box-box">
                <p>{dataMarketingDesign.jumlah_design}</p>
              </div>
            </div>
            <div className="box-content">
              <p>Jumlah Revisi</p>
              <div className="box-box">
                <p>{dataMarketingDesign.jumlah_revisi}</p>
              </div>
            </div>
            <div className="box-content">
              <p>Order Type</p>
              <div className="box-box">
                <p>{dataMarketingDesign.order_type}</p>
              </div>
            </div>
            <div className="box-content">
              <p>Project Type</p>
              <div className="box-box">
                <p>{dataMarketingDesign.project_type}</p>
              </div>
            </div>
            <div className="box-content">
              <p>Offer Type</p>
              <div className="box-box">
                <p>{dataMarketingDesign.offer_type}</p>
              </div>
            </div>
            <div className="box-content">
              <p>Deadline</p>
              <div className="box-box">
                <p>{dataMarketingDesign.deadline}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="sec-detail-design">
          <h4>Detail Design</h4>
          <div className="vmd-content">
            <div className="box-content">
              <p>Style</p>
              <div className="box-box">
                <p>{dataMarketingDesign.style}</p>
              </div>
            </div>
            <div className="box-content">
              <p>Resolution</p>
              <div className="box-box">
                <p>{dataMarketingDesign.resolution}</p>
              </div>
            </div>
            <div className="box-content">
              <p>Required Files</p>
              <div className="box-box">
                <p>{dataMarketingDesign.required_files}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="sec-price">
          <h4>Detail Price</h4>
          <div className="vmd-content">
            <div className="box-content">
              <p>Price Normal</p>
              <div className="box-box">
                <p>{dataMarketingDesign.price_normal}</p>
              </div>
            </div>
            <div className="box-content">
              <p>Price Discount</p>
              <div className="box-box">
                <p>{dataMarketingDesign.price_discount}</p>
              </div>
            </div>
            <div className="box-content">
              <p>Discount Precentage</p>
              <div className="box-box">
                <p>{dataMarketingDesign.discount_percentage}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="sec-reference">
          <h4>Reference</h4>
          <div className="vmd-ref-content">
            <div className="box-content">
              <p>Reference</p>
              <div className="box-ref">
                <p>{renderTextWithLinks(dataMarketingDesign.reference)}</p>
              </div>
            </div>

            <div className="box-content">
              <p>File & Chat</p>
              <div className="box-ref">
                {isValidUrl(dataMarketingDesign.file_and_chat) ? (
                  <a
                    href={dataMarketingDesign.file_and_chat}
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
                    {dataMarketingDesign.file_and_chat}
                  </a>
                ) : (
                  <p>{dataMarketingDesign.file_and_chat}</p>
                )}
              </div>
            </div>

          </div>
        </div>
        <div className="sec-detail-project">
          <h4>Detail Project</h4>
          <div className="vmd-detail">
            <div className="box-content" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
              {/* <p>Detail Project</p> */}
              <div className="box-ref" style={{height:'30vh',overflowY:'auto'}}>
                <p>{renderTextWithLinks(dataMarketingDesign.detail_project)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
  
}

export default ViewDataMarketingDesign