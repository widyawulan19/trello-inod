import React, { useEffect, useState } from 'react'
import '../style/pages/DataMarketingReport.css'
import { getTodayReportMarketing } from '../services/ApiServices';
import BootstrapTooltip from '../components/Tooltip';
import { IoEyeSharp } from 'react-icons/io5';
import { HiOutlineArchiveBox, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';

const MarketingDayliReport = () => {
    // STATE 
      const [data, setData] = useState([]);
      const [loading, setLoading] = useState(true);
    

      //FUNCTION
      useEffect(() => {
        const fetchData = async () => {
          setLoading(true);
          const result = await getTodayReportMarketing();
          setData(result);
          setLoading(false);
        };
    
        fetchData();
      }, []);
    
     // fungsi untuk mengambil 5 karakter terakhir dari code order
    const getLastFiveCodeOrder = (codeOrder) =>{
      return codeOrder ? codeOrder.slice(-5) : '';
    }
    
      if (loading) return <p>Loading data marketing hari ini...</p>;
      if (data.length === 0) return <p>Tidak ada data marketing untuk hari ini.</p>;
    

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

// Hitung total basic price semua data hari ini
const totalBasicPrice = data.reduce((sum, item) => {
  return sum + (getBasicPrice(item.price_normal, item.discount) || 0);
}, 0);


  return (
    <div className="daily-container">
        <div className="dayli-title">
            <h2>Data Marketing Musik Hari Ini</h2>
        </div>

        <div className="daily-total">
            <p style={{ marginTop: "4px", fontWeight: "bold", color: "#5D12EB" }}>
                Date: {new Date().toLocaleDateString("id-ID", { 
                    weekday: "long", year: "numeric", month: "long", day: "numeric" 
                })}
            </p>

            <p style={{ marginTop: "4px",padding:'0px'}}>
                Total Data Hari Ini: {data.length} Project
            </p>
            <p>Total Price from {data.length}: <span className='text-green-600'> ${totalBasicPrice.toLocaleString()}</span></p>
        </div>

        <div className="dayli-table">
            <table border="1" cellPadding="8" cellSpacing="0">
                <thead>
                <tr>
                    <th style={{ borderTopLeftRadius: '8px'}}>No</th>
                    <th>Title</th>
                    <th>Input By</th>
                    <th>Acc by</th>
                    <th>Status</th>
                    <th>Buyer Name</th>
                    <th>Order Number</th>
                    <th>Account</th>
                    <th>Deadline</th>
                    <th>Code Order</th>
                    <th>Jumlah Track</th>
                    <th>Order Type</th>
                    <th>Offer Type</th>
                    <th>Jenis Track</th>
                    <th>Genre</th>
                    <th>Price Normal</th>
                    <th>Price Discount</th>
                    <th>Discount </th>
                    <th>Kupon Discount</th>
                    <th>Price Total</th>
                    <th>Project Type</th>
                    <th>Duration</th>
                    <th style={{ borderTopRightRadius: '8px', textAlign:'center' }}>Action</th>
                </tr>
                </thead>
                <tbody>
                {data.map((item,index) => (
                    <tr key={item.marketing_id}>
                    {/* <td>{item.marketing_design_id}</td> */}
                        <td>{index + 1}</td>
                        <td className='resolution-container' style={{color:'#5D12EB', textDecoration:'underline', cursor:'pointer'}}>{item.buyer_name} | {item.account} | {getLastFiveCodeOrder(item.code_order)}</td>
                        <td className='input-container'>{item.input_by_name}</td>
                        <td className='acc-container'>{item.acc_by_name}</td>
                        <td className='status-container' style={{textAlign:'left' }}>
                        <span style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: item.accept_status_name? '#C8E6C9' : '#FFCDD2',
                            color: item.accept_status_name ? '#2E7D32' : '#C62828',
                            fontWeight: 'bold'
                        }}>
                            {item.accept_status_name ? 'Accepted' : 'Not Accepted'}
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
                        <td className="price-discount-container" style={{textAlign:'center', color:'#E53935'}}>
                            {getPriceDiscount(item.price_normal, item.discount)
                            ? `$ ${getPriceDiscount(item.price_normal, item.discount)}`
                            : "-"}
                        </td>
                        <td className="discount-container" style={{textAlign:'center', color:'#388E3C'}}>{item.discount}</td>
                        <td className="basic-price-container" style={{color:'#388E3C',textAlign:'center'}}>{item.kupon_diskon_name}</td>
                        <td className="discount-container" style={{textAlign:'center', color:'#388E3C'}}>
                            {getBasicPrice(item.price_normal, item.discount)
                            ? `$ ${getBasicPrice(item.price_normal, item.discount)}`
                            : "-"}
                        </td>
                        <td className="project-type-container" >{item.project_type_name}</td>
                        <td className="duration-container">{item.duration}</td>
                        <td className='action-container'>
                            <div className="action-table">
                            <BootstrapTooltip title='View Data' placement='top'>
                                <button>
                                    <IoEyeSharp style={{color:'white'}}/>
                                </button>
                            </BootstrapTooltip>
                            <BootstrapTooltip title='Edit Data' placement='top'>
                                <button >
                                    <HiOutlinePencil style={{color:'white'}}/>
                                </button>
                            </BootstrapTooltip>
                            <BootstrapTooltip title='Archive Data' placement='top'>
                                <button>
                                    <HiOutlineArchiveBox style={{color:'white'}}/>
                                </button>
                            </BootstrapTooltip>
                            <BootstrapTooltip title='Delete Data' placement='top'>
                                <button>
                                    <HiOutlineTrash style={{color:'white'}}/>
                                </button>
                            </BootstrapTooltip>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    </div>
  );
}

export default MarketingDayliReport