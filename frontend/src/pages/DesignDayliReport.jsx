// src/components/TodayMarketing.js
import React, { useEffect, useState } from "react";
import { getMarketingDesignReportToday, getTodayMarketingDesign } from "../services/ApiServices"; // pastikan path sesuai
import { IoEyeSharp } from "react-icons/io5";
import { HiOutlineArchiveBox, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi2";
import BootstrapTooltip from "../components/Tooltip";
// import '../style/pages/MarketingDesignReport.css'
import '../style/pages/DataMarketingReport.css'
import LoadingSpinnerDot from "../utils/LoadingSpinnerDot";


const DesignDayliReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);

        const response = await getMarketingDesignReportToday();

        // tanggal hari ini WIB (Asia/Jakarta)
        const todayWIB = new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Jakarta",
        }); 
        // hasil: yyyy-mm-dd

        const todayData = response.find(item => {
        const itemDateWIB = new Date(item.date).toLocaleDateString("en-CA", {
            timeZone: "Asia/Jakarta",
        });
        return itemDateWIB === todayWIB;
        });

        setData(todayData ? todayData.details : []);
        setLoading(false);
    };

    fetchData();
    }, []);




 // fungsi untuk mengambil 5 karakter terakhir dari code order
const getLastFiveCodeOrder = (codeOrder) =>{
  return codeOrder ? codeOrder.slice(-5) : '';
}

  if (loading) return <LoadingSpinnerDot text='Lagi ngumpulin data marketing hari ini, tunggu bentar ya 😊'/>;
//   if (loading) return <p>Loading data marketing hari ini...</p>;
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
            <h2>Data Marketing Design Hari Ini</h2>
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
            {/* <table className="min-w-full"> */}
                <thead>
                <tr>
                    <th>No</th>
                    <th>Project Number</th>
                    <th>Input By</th>
                    <th>Order Number</th>
                    <th>Code Order</th>
                    <th>Buyer Name</th>
                    <th>Account</th>
                    <th>Jumlah Design</th>
                    <th>Deadline</th>
                    <th>Price Normal $</th>
                    <th>Discount %</th>
                    <th>
                        Price Total $
                    </th>
                </tr>
                </thead>
                <tbody>
                {data.map((item,index) => (
                    <tr key={item.marketing_design_id}>
                        <td>{index + 1}</td>
                        <td className='input-container'>{item.project_number}</td>

                        <td className='buyer-name-container'>{item.input_by_name}</td>
                        <td className='order-number-container'>{item.order_number}</td>
                        <td className='code-order-container'>{item.code_order}</td>
                       
                        <td className='buyer-name-container' >{item.buyer_name}</td>
                        <td className='account-container'>{item.account_name}</td>
                        <td className="jumlah-container" style={{textAlign:'center' }}>{item.jumlah_design}</td>
                        
                        <td className='deadline-container' style={{ textAlign:'center' }}>{new Date(item.deadline).toLocaleDateString()}</td>
                        <td className='price-normal-container' style={{textAlign:'center'}}>${item.price_normal}</td>
                        <td className="price-discount-container" style={{textAlign:'center', color:'#E53935'}}>
                            {getPriceDiscount(item.price_normal, item.discount)
                            ? `$ ${getPriceDiscount(item.price_normal, item.discount)}`
                            : "-"}
                        </td>
                        {/* <td className='discount_percentage-container' style={{textAlign:'center', color:'#388E3C'}}>{item.discount_percentage}%</td> */}
                        <td className="discount-container" style={{textAlign:'center', color:'#388E3C'}}>
                            {getBasicPrice(item.price_normal, item.discount)
                            ? `$ ${getBasicPrice(item.price_normal, item.discount)}`
                            : "-"}
                        </td>
                       
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default DesignDayliReport;
