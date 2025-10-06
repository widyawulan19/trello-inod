import React, { useEffect, useState } from 'react'
import { checkCardIdNullOrNotForDesign, getExportMarketingDesign, getMarketingDesignById } from '../services/ApiServices'
import {HiPlus } from 'react-icons/hi2'
import { FaXmark } from "react-icons/fa6";
import BootstrapTooltip from '../components/Tooltip'
import '../style/pages/ViewDataMarketingDesign.css'
import OutsideClick from '../hook/OutsideClick';
import FormCreateCardDesign from '../fitur/FormCreateCardDesign'
import ExportMarketingDesignById from '../exports/ExportMarketingDesignById';
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";


const ViewDataMarketingDesign=({marketingDesignId, onClose, fetchMarketingDesign, handleExportToSheet, isExported,setIsExported, designTransfile, setDesignTransfile})=> {
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
        const response = await getMarketingDesignById(marketingDesignId)
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

  // link reference 
  function linkify(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
  }


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

  const DetailProjectInput = ({ value, onChange }) => {
  return (
    <ReactQuill
      value={value}
      onChange={onChange}
      modules={{
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ indent: "-1" }, { indent: "+1" }],
          ["link"],
          ["clean"],
        ],
      }}
      formats={[
        "header",
        "bold", "italic", "underline", "strike",
        "list", "bullet", "indent",
        "link"
      ]}
      style={{ minHeight: "200px", marginBottom: "20px" }}
    />
  );
};


  return (
    <div className='view-md-container'>
      <div className="vmd-header">
        <div className="vmd-left">
          <h4>DETAIL DATA MARKETING DESIGN</h4>
          {dataMarketingDesign.buyer_name} | {dataMarketingDesign.account_name} | {dataMarketingDesign.order_type_name} | {getLastFiveCodeOrder(dataMarketingDesign.code_order)}
        </div>
        <div className="vmd-center">
          <div className="export" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={() => handleExportToSheet(marketingDesignId)}
              disabled={designTransfile.some(exp => exp.marketing_design_id === marketingDesignId)} 
              style={{
                backgroundColor: designTransfile.some(exp => exp.marketing_design_id === marketingDesignId) ? "#ccc" : "#1C7821",
                color: designTransfile.some(exp => exp.marketing_design_id === marketingDesignId) ? "#666" : "#fff",
                padding: "6px 7px",
                border: "none",
                borderRadius: "6px",
                fontWeight:'bold',
                cursor: designTransfile.some(exp => exp.marketing_design_id === marketingDesignId) ? "not-allowed" : "pointer"
              }}
            >

              {designTransfile.some(exp => exp.marketing_design_id === marketingDesignId)
                ? "Sudah Transfile"
                : "Transfile to SpreedSheets"}
            </button>
          </div>

          <button className='create-btn' onClick={()=> showCreateForm(marketingDesignId)}>
            {/* <HiPlus size={15}/> */}
            CREATE CARD
          </button>
          {showCardForm[marketingDesignId]&& (
            <div className="vmd-form">
              <FormCreateCardDesign marketingDesignId={marketingDesignId} onClose={()=> handleCloseForm(marketingDesignId)}/>
            </div>
          )}

          <div className="card-status">
              {loadingCardId ? (
                <p>Memeriksa...</p>
              ): cardId ? (
                <button className='created-status'>Created</button>
              ):(
                <button className='uncreated-status'>Not Created</button>
              )}
          </div>

        </div>
        
          
        <div className="vmd-right">
          <BootstrapTooltip title='Close' placement='top'>
            <FaXmark onClick={onClose} className='vmd-icon'/>
          </BootstrapTooltip>
        </div>

      </div>
      
      {/* FORM CREATE  */}
      <div className="vmd-body">
        <div className="sec-informasi">
          <h4>Informasi Pesanan</h4>
          <div className="vmd-content" >
            <div className="box-content" >
              <p>Project Number</p>
              <div className="box-box">
                <p>{dataMarketingDesign.project_number}</p>
              </div>
            </div>
            <div className="box-content" >
              <p>Input By</p>
              <div className="box-box">
                <p>{dataMarketingDesign.input_by_name}</p>
              </div>
            </div>
            <div className="box-content">
              <p>Accept By</p>
              <div className="box-box">
                <p>{dataMarketingDesign?.acc_by_name || "-"}</p>
              </div>
            </div>
            <div className="box-content">
              <p>Status Accept</p>
              <div className="box-box" style={{padding:'0px'}}>
                <p 
                  style={{
                    padding: '5px 8px',
                    borderRadius: '3px',
                    backgroundColor: STATUS_BG[dataMarketingDesign?.status_project_name],
                    color:STATUS_COLORS[dataMarketingDesign?.status_project_name],
                    fontWeight: 'bold',
                    textAlign:'center'
                  }}
                >
                  {dataMarketingDesign?.status_project_name || "-"}
                </p>
              </div>
            </div>
            <div className="box-content">
              <p>Buyer Namer</p>
              <div className="box-box">
                <p>{dataMarketingDesign?.buyer_name || "-"}</p>
              </div>
            </div>
            <div className="box-content">
              <p>Code Order</p>
              <div className="box-box">
                <p>{dataMarketingDesign?.code_order || "-"}</p>
              </div>
            </div>
            <div className="box-content">
              <p>Order Number</p>
              <div className="box-box">
                <p>{dataMarketingDesign?.order_number || "-"}</p>
              </div>
            </div>
            <div className="box-content">
              <p>Account</p>
              <div className="box-box">
                <p>{dataMarketingDesign?.account_name || "-"}</p>
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
                <p>{dataMarketingDesign?.jumlah_design || "-"}</p>
              </div>
            </div>
            <div className="box-content">
              <p>Jumlah Revisi</p>
              <div className="box-box">
                <p>{dataMarketingDesign?.jumlah_revisi || "-"}</p>
              </div>
            </div>
            <div className="box-content">
              <p>Order Type</p>
              <div className="box-box">
                <p>{dataMarketingDesign?.order_type_name || "-"}</p>
              </div>
            </div>
            <div className="box-content">
              <p>Project Type</p>
              <div className="box-box">
                <p>{dataMarketingDesign?.project_type_name || "-"}</p>
              </div>
            </div>
            <div className="box-content">
              <p>Offer Type</p>
              <div className="box-box">
                <p>{dataMarketingDesign?.offer_type_name || "-"}</p>
              </div>
            </div>
            <div className="box-content">
              <p>Deadline</p>
              <div className="box-box">
                <p>{dataMarketingDesign?.deadline || "-"}</p>
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
                <p>{dataMarketingDesign?.style_name || "-"}</p>
              </div>
            </div>
            <div className="box-content">
              <p>Resolution</p>
              <div className="box-box">
                <p>{dataMarketingDesign?.resolution || "-"}</p>
              </div>
            </div>
            <div className="box-content">
              <p>Required Files</p>
              <div className="box-box">
                <p>{dataMarketingDesign?.required_files || "-"}</p>
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
                <p>{dataMarketingDesign?.price_normal || "-"}</p>
              </div>
            </div>
            <div className="box-content">
              <p>Price Discount</p>
              <div className="box-box">
                <p>{dataMarketingDesign?.price_discount || "-"}</p>
              </div>
            </div>
            <div className="box-content">
              <p>Discount Precentage</p>
              <div className="box-box">
                <p>{dataMarketingDesign?.discount_percentage || "-"}</p>
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
                <p>{renderTextWithLinks(dataMarketingDesign?.reference || "-")}</p>
              </div>
            </div>

            <div className="box-content">
              <p>File & Chat</p>
              <div className="box-ref">
                {isValidUrl(dataMarketingDesign?.file_and_chat || "-") ? (
                  <a
                    href={dataMarketingDesign?.file_and_chat || "-"}
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
                    {dataMarketingDesign?.file_and_chat || "-"}
                  </a>
                ) : (
                  <p>{dataMarketingDesign?.file_and_chat || "-"}</p>
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
              <div className="box-ref" >
                <div
                  dangerouslySetInnerHTML={{
                    __html: linkify(dataMarketingDesign.detail_project || ""),
                  }}
                />
                {/* <p>{renderTextWithLinks(dataMarketingDesign?.detail_project || "-")}</p> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
  
}

export default ViewDataMarketingDesign