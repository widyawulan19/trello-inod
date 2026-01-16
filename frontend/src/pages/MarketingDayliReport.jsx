import React, { useEffect, useState } from 'react'
import '../style/pages/DataMarketingReport.css'
import { getTodayReportMarketing } from '../services/ApiServices';
import '../style/pages/DataMarketingReport.css'
import BootstrapTooltip from '../components/Tooltip';
import { IoEyeSharp } from 'react-icons/io5';
import { HiOutlineArchiveBox, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';
import LoadingSpinnerDot from '../utils/LoadingSpinnerDot';

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
    
      if (loading) return <LoadingSpinnerDot text='Lagi ngumpulin data marketing hari ini, tunggu bentar ya 😊'/>;
      if (data.length === 0) return <p>Tidak ditemukan data marketing untuk hari ini.</p>;
    

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
            <p className="date">
                DATE:{" "}
                {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                })}
            </p>

            <p className="total-data">
                Total Data Hari Ini :
                <span className="total-highlight">
                {data.length} Project
                </span>
            </p>

            <p className="total-price">
                Total Price from {data.length} project :
                <span className="price-highlight">
                ${totalBasicPrice.toLocaleString()}
                </span>
            </p>
        </div>


        <div className="daily-table">
            <table border="1" cellPadding="8" cellSpacing="0">
                <thead>
                <tr>
                    <th style={{ borderTopLeftRadius: '8px'}}>No</th>
                    <th>Project Number</th>
                    <th>Input By</th>
                    <th>Buyer Name</th>
                    <th>Code Order</th>
                    <th>Jumlah Track</th>
                    <th>Price $</th>
                    <th>Discount % </th>
                    <th>Kupon/(ExtraOf)</th>
                    <th style={{ borderTopRightRadius: '8px', textAlign:'center' }}>Price Total $</th>
                </tr>
                </thead>
                <tbody>
                {data.map((item,index) => (
                    <tr key={item.marketing_id}>
                        <td>{index + 1}</td>
                        <td  className='input-container'>{item.project_number}</td>
                        <td className='buyer-name-container'>{item.input_by_name}</td>
                        <td className="buyer-name-container">{item.buyer_name}</td>
                        <td className="code-order-container">{item.code_order}</td>
                        <td style={{textAlign:'center'}}>{item.jumlah_track}</td>
                        <td className="price-normal-container" style={{textAlign:'center'}}>{item.price_normal}</td>
                        <td className="discount-container" style={{textAlign:'center', color:'#388E3C'}}>{item.discount}</td>
                        <td className="basic-price-container" style={{color:'#388E3C',textAlign:'center'}}>{item.kupon_diskon_name}</td>
                        <td className="discount-container" style={{textAlign:'center', color:'#388E3C'}}>
                            {getBasicPrice(item.price_normal, item.discount)
                            ? ` ${getBasicPrice(item.price_normal, item.discount)}`
                            : "-"}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
        <div className="daily-summary">

        </div>
    </div>
  );
}

export default MarketingDayliReport
