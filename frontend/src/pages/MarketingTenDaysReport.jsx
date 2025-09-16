import React, { useEffect, useState } from 'react'
import { getTenDaysMarketing } from '../services/ApiServices';
import BootstrapTooltip from '../components/Tooltip';
import { IoEyeSharp } from 'react-icons/io5';
import { HiOutlineArchiveBox, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';

const MarketingTenDaysReport=()=> {
    // STATE 
    const [data, setData] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState(null);


    // FUNCTION 
    useEffect(() => {
      const fetchData = async () => {
        const result = await getTenDaysMarketing();
        setData(result);
        if (result.length > 0) setSelectedMonth(result[0].month);
      };
      fetchData();
    }, []);

    const handleMonthChange = (e) => {
      setSelectedMonth(e.target.value);
      setSelectedPeriod(null); // reset period ketika bulan berubah
    };

    const selectedMonthData = data.filter(d => d.month === selectedMonth);

    // Ambil daftar periode unik untuk bulan yang dipilih
    const uniquePeriods = [...new Set(selectedMonthData.map(d => d.period))];

    const getPeriodLabel = (period) => {
      const p = Number(period); // pastikan period jadi number
      switch (p) {
        case 1: return "1-10";
        case 2: return "11-20";
        case 3: return "21-end";
        default: return "-";
      }
    };


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


  return (
    <div className='design-period-container'>
        <div className="dp-title">
            <h2>Laporan Data Marketing Musik per 10 Hari</h2>
        </div>
      
      <div className="dp-select">
        {/* Pilih Bulan */}
        <div className="select-bulan">
            <label className="mr-2 font-semibold">Pilih Bulan:</label>
            <select value={selectedMonth || ""} onChange={handleMonthChange}>
            {data.map((item, idx) => (
                <option key={idx} value={item.month}>
                {item.month ? new Date(item.month).toLocaleString("id-ID", { month: "long", year: "numeric" }) : "Unknown"}
                </option>
            ))}
            </select>
        </div>

        {/* Pilih Periode */}
        {uniquePeriods.length > 0 && (
            <div className="select-periode">
            <label className="mr-2 font-semibold">Pilih Periode:</label>
            <select
                value={selectedPeriod || ""}
                onChange={(e) => setSelectedPeriod(e.target.value)} // jika period string
            >
                <option value="">-- Semua Periode --</option>
                {uniquePeriods.map((period, idx) => (
                <option key={idx} value={period}>
                    Periode {getPeriodLabel(period)}
                </option>
                ))}
            </select>
            </div>
        )}
      </div>
      

      {/* Tampilkan Data dalam Tabel */}
      <div className="data-report">
        {selectedMonthData
          .filter(item => !selectedPeriod || item.period === selectedPeriod)
          .map((item, idx) => {
            // Hitung total basic price di periode ini
            const totalBasicPrice = item.details.reduce((sum, detail) => {
              return sum + (getBasicPrice(detail.price_normal, detail.discount) || 0);
            }, 0);

            return(
              <div key={idx} className='table-report-content'>
                <div className="report-summary">
                  <h2 className="mb-2 font-bold">
                    Periode {getPeriodLabel(item.period)} 
                  </h2>
                  <h2> Total: {item.total} Data</h2>
                  <h2>Total Price from {item.total}: <span className='text-green-600'> $ {totalBasicPrice.toLocaleString()} </span></h2>
                </div>
              
              <table className="min-w-full border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                    <th className="input-container">Input By</th>
                    <th className="acc-container">Acc By</th>
                    <th className="status-container">Status</th>
                    <th className="buyer-name-container">Buyer Name</th>
                    <th className="order-number-container">Order Number</th>
                    <th className="account-container">Account</th>
                    <th className="deadline-container">Deadline</th>
                    <th className="code-order-container">Code Order</th>
                    <th className="jumlah-container">Jumlah Track</th>
                    <th className="order-type-container">Order Type</th>
                    <th className="offer-type-container">Offer Type</th>
                    <th className="jenis-track-container">Jenis Track</th>
                    <th className="genre-container">Genre</th>
                    <th className="price-normal-container">Price Normal $</th>
                    <th className="price-discount-container">Price Discount $</th>
                    <th className="discount-container">Discount</th>
                    <th className="price-discount-container">Kupon Discount</th>
                    <th className="basic-price-container">Total Price %</th>
                    <th className="project-type-container">Project Type</th>
                    <th className="duration-container">Duration</th>
                    <th className="action-container">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {item.details.map((detail, dIdx) => (
                    <tr key={dIdx} className="text-center hover:bg-gray-50">
                        <td className="px-2 py-1 border">{detail["input_by_name"] || "-"}</td>
                        <td className="px-2 py-1 border">{detail["acc_by_name"] || "-"}</td>
                        <td className="px-2 py-1 border">
                          <span
                            className={`px-2 py-1 rounded-full font-bold ${
                              detail.accept_status_id === 1
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {detail.accept_status_id === 1 ? "Accepted" : "Not Accepted"}
                          </span>
                        </td>
                        <td className="px-2 py-1 border">{detail["buyer_name"] || "-"}</td>
                        <td className="px-2 py-1 border">{detail["order_number"] || "-"}</td>
                        <td className="px-2 py-1 border">{detail["account_name"] || "-"}</td>
                        <td className="px-2 py-1 border">
                        {detail["deadline"]
                            ? new Date(detail["deadline"]).toLocaleDateString("id-ID")
                            : "-"}
                        </td>
                        <td className="px-2 py-1 border">{detail["code_order"] || "-"}</td>
                        <td className="px-2 py-1 border">{detail["jumlah_track"] || "-"}</td>
                        <td className="px-2 py-1 border">{detail["order_type_name"] || "-"}</td>
                        <td className="px-2 py-1 border">{detail["offer_type_name"] || "-"}</td>
                        <td className="px-2 py-1 border">{detail["track_type_name"] || "-"}</td>
                        <td className="px-2 py-1 border">{detail["genre_name"] || "-"}</td>
                        {/* PRICE  */}
                        <td className="px-2 py-1 border">
                          {detail["price_normal"] ? ` ${detail["price_normal"]}` : "-"}
                        </td>
                        <td className="px-2 py-1 text-green-500 border">
                          {getPriceDiscount(detail.price_normal, detail.discount)
                            ? ` ${getPriceDiscount(detail.price_normal, detail.discount)}`
                            : "-"}
                        </td>
                        <td className="px-2 py-1 border">{detail["discount"] || "-"}</td>
                        <td className="px-2 py-1 border">{detail["kupon_diskon_name"] || "-"}</td>
                        <td className="px-2 py-1 text-green-600 border">
                          {getBasicPrice(detail.price_normal, detail.discount)
                            ? ` ${getBasicPrice(detail.price_normal, detail.discount)}`
                            : "-"}
                        </td>
                        {/* END PRICE  */}
                        <td className="px-2 py-1 border">{detail["project_type_name"] || "-"}</td>
                        <td className="px-2 py-1 border">{detail["duration"] || "-"}</td>
                        <td className="px-2 py-1 border">
                        <div className="flex justify-center gap-2">
                            <BootstrapTooltip title="View Data" placement="top">
                            <button>
                                <IoEyeSharp />
                            </button>
                            </BootstrapTooltip>
                            <BootstrapTooltip title="Edit Data" placement="top">
                            <button>
                                <HiOutlinePencil />
                            </button>
                            </BootstrapTooltip>
                            <BootstrapTooltip title="Archive Data" placement="top">
                            <button>
                                <HiOutlineArchiveBox />
                            </button>
                            </BootstrapTooltip>
                            <BootstrapTooltip title="Delete Data" placement="top">
                            <button>
                                <HiOutlineTrash />
                            </button>
                            </BootstrapTooltip>
                        </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>

            </div>
            )
          })}
      </div>
    </div>
  );
}

export default MarketingTenDaysReport
