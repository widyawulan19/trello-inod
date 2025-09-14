// src/components/TodayMarketing.js
import React, { useEffect, useState } from "react";
import { getMarketingDesignReportToday, getTodayMarketingDesign } from "../services/ApiServices"; // pastikan path sesuai
import { IoEyeSharp } from "react-icons/io5";
import { HiOutlineArchiveBox, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi2";
import BootstrapTooltip from "../components/Tooltip";
import '../style/pages/MarketingDesignReport.css'


const DesignDayliReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await getTodayMarketingDesign();
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

  return (
    <div className="daily-container">
        <div className="dayli-title">
            <h2>Data Marketing Design Hari Ini</h2>
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
        </div>
        <div className="dayli-table">
            <table border="1" cellPadding="8" cellSpacing="0">
                <thead>
                <tr>
                    <th>NO</th>
                    <th>Title</th>
                    <th>Input By</th>
                    <th>Acc by</th>
                    <th>Status</th>
                    <th>Buyer Name</th>
                    <th>Code Order</th>
                    <th>Jumlah Design</th>
                    <th>Order Number</th>
                    <th>Account</th>
                    <th>Deadline</th>
                    <th>Jumlah Revisi</th>
                    <th>Order Type</th>
                    <th>Offer Type</th>
                    <th>Style</th>
                    <th>Resolution</th>
                    <th>Price Normal</th>
                    <th>Price Discount</th>
                    <th>Discount Presentage</th>
                    <th>Project Type</th>
                    <th>Action</th>
                </tr>
                </thead>
                <tbody>
                {data.map((item,index) => (
                    <tr key={item.marketing_design_id}>
                    {/* <td>{item.marketing_design_id}</td> */}
                        <td>{index + 1}</td>
                        <td className='resolution-container' style={{color:'#5D12EB', textDecoration:'underline', cursor:'pointer'}}>{item.buyer_name} | {item.account} | {getLastFiveCodeOrder(item.code_order)}</td>
                        <td className='input-container'>{item.input_by}</td>
                        <td className='acc-container'>{item.acc_by}</td>
                        <td className='status-container' style={{textAlign:'left' }}>
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
                        <td className='buyer-name-container'>{item.buyer_name}</td>
                        <td className='code-order-container'>{item.code_order}</td>
                        <td className='jumlah-container' style={{textAlign:'center' }}>{item.jumlah_design}</td>
                        <td className='order-number-container'>{item.order_number}</td>
                        <td className='account-container'>{item.account}</td>
                        <td className='deadline-container' style={{ textAlign:'center' }}>{new Date(item.deadline).toLocaleDateString()}</td>
                        <td className='jumlah-revisi-container' style={{textAlign:'center' }}>{item.jumlah_revisi}</td>
                        <td className='order-type-container'>{item.order_type}</td>
                        <td className='offer-type-container'>{item.offer_type}</td>
                        <td className='style-container'>{item.style}</td>
                        <td className='resolution-container'>{item.resolution}</td>
                        <td className='price-normal-container' style={{textAlign:'center', color:'#1E1E1E'}}>${item.price_normal}</td>
                        <td className='price-discount-container' style={{textAlign:'center', color:'#E53935'}}>${item.price_discount}</td>
                        <td className='discount_percentage-container' style={{textAlign:'center', color:'#388E3C'}}>${item.discount_percentage}</td>
                        <td className='project-type-container' >{item.project_type}</td>
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
};

export default DesignDayliReport;
