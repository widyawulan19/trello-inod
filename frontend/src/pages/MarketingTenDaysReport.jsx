import React, { useEffect, useState } from 'react'
import { getTenDaysMarketing } from '../services/ApiServices';
import '../style/pages/DataMarketingReport.css';
import BootstrapTooltip from '../components/Tooltip';
import { IoEyeSharp } from 'react-icons/io5';
import { HiOutlineArchiveBox, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';
import { HiOutlineSearch } from 'react-icons/hi';
import LoadingSpinnerDot from '../utils/LoadingSpinnerDot';

const MarketingTenDaysReport=()=> {
    // STATE 
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState(null);
    // month 
    const [openMonth, setOpenMonth] = useState(false);
    const [monthSearch, setMonthSearch] = useState("");
    // period 
    const [openPeriod, setOpenPeriod] = useState(false);

    // FUNCTION 
    useEffect(() => {
      const fetchData = async () => {
        setLoading(true);
        const result = await getTenDaysMarketing();
        setData(result);
        setLoading(false);
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


/* =======================
SEARCH MONTH 
======================= */
const filteredMonthData = data.filter((item) => {
  if (!item.month) return false;

  const label = new Date(item.month).toLocaleString("id-ID", {
    month: "long",
    year: "numeric",
  });

  return label.toLowerCase().includes(monthSearch.toLowerCase());
});



  // FUNCTION TO SHOW STATUS 
  const STATUS_COLORS ={
    "ACCEPTED ":'#2E7D32',
    "NOT ACCEPTED":'#C62828',
    "ON PROGRESS":'#C38D24',
    "UNKNOWN":'#F5F5F5',
  }
  const STATUS_BG = {
    "ACCEPTED ":'#C8E6C9',
    "NOT ACCEPTED":'#FFCDD2',
    "ON PROGRESS":'#FFDCB3',
    "UNKNOWN":"#9E9E9E",
  }

  if (loading) return <LoadingSpinnerDot text='Sedang memuat data laporan. Mohon tunggu.'/>

  return (
    <div className='design-period-container'>
        <div className="dp-title">
            <h2>Laporan Data Marketing Musik per 10 Hari</h2>
        </div>
      

      {/* Pilih Bulan */}
      <div className="dp-select">
          <div className="select-bulan">
            <label>PILIH BULAN :</label>

            {/* Trigger */}
            <div
              className="month-trigger"
              onClick={() => setOpenMonth(!openMonth)}
            >
              {selectedMonth
                ? new Date(selectedMonth).toLocaleString("id-ID", {
                    month: "long",
                    year: "numeric",
                  })
                : "Pilih Bulan"}

              <span className={ openMonth ? "chevron rotate-180" : "chevron"}> ▼ </span>
            </div>

            {/* Dropdown */}
            {openMonth && (
              <div className="month-dropdown">
                {/* SEARCH INPUT */}
                <div className="search-box">
                  <HiOutlineSearch size={15}/>
                  <input
                    type="text"
                    placeholder="Cari bulan..."
                    value={monthSearch}
                    onChange={(e) => setMonthSearch(e.target.value)}
                    className="month-search"
                  />
                </div>
                

                <div className='month-dropdown-item'>
                  <ul>
                    {filteredMonthData.length > 0 ? (
                      filteredMonthData.map((item, idx) => (
                        <li
                          key={idx}
                          className={`month-item ${
                            selectedMonth === item.month
                              ? "active"
                              : ""
                          }`}
                          onClick={() => {
                            handleMonthChange({
                              target: { value: item.month },
                            });
                            setOpenMonth(false);
                            setMonthSearch("");
                          }}
                        >
                          {new Date(item.month).toLocaleString(
                            "id-ID",
                            {
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </li>
                      ))
                    ) : (
                      <li className="month-empty">
                        Bulan tidak ditemukan
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>



        {/* Pilih Periode */}
        {uniquePeriods.length > 0 && (
          <div className="select-periode">
            <label>
              PILIH PERIOD :
            </label>

            {/* Trigger */}
            {/* <div className="period-wrapper"></div> */}
            <div className="period-trigger" onClick={() => setOpenPeriod(!openPeriod)}>
              {selectedPeriod
                ? `Periode ${getPeriodLabel(selectedPeriod)}`
                : "-- Semua Periode --"}
              <span className={ openPeriod ? "chevron rotate-180"  : "chevron"}>
                ▼
              </span>
            </div>

            {/* Dropdown */}
            {openPeriod && (
              <div className="period-dropdown-item">
                <ul>
                  {/* All option */}
                  <li
                    className={`period-item ${
                      selectedPeriod === "" ? "active" : ""
                    }`}
                    onClick={() => {
                      setSelectedPeriod("");
                      setOpenPeriod(false);
                    }}
                  >
                    -- Semua Periode --
                  </li>

                  {uniquePeriods.map((period, idx) => (
                    <li
                      key={idx}
                      className={`period-item ${
                        selectedPeriod === period
                          ? "active"
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedPeriod(period);
                        setOpenPeriod(false);
                      }}
                    >
                      Periode {getPeriodLabel(period)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
                  <h2>
                    Periode {getPeriodLabel(item.period)} 
                  </h2>
                  <h2> Total: {item.total} Data</h2>
                  <h2>Total Price from {item.total} order : <span className='text-green-600'> $ {totalBasicPrice.toLocaleString()} </span></h2>
                </div>
              
              <div className="month-table">
                <table className="min-w-full">
                  <thead>
                      <tr>
                        <th>No</th>
                        <th className="input-container">Project Number</th>
                        <th className="input-container">Input By</th>
                        <th className="buyer-name-container">Buyer Name</th>
                        <th className="code-order-container">Code Order</th>
                        <th className="jumlah-container">Jumlah Track</th>
                        <th className="price-normal-container">Price Normal $</th>
                        <th className="price-discount-container">Price Discount $</th>
                        <th className="discount-container">Discount</th>
                        <th className="price-discount-container">Kupon Discount</th>
                        <th className="basic-price-container">Total Price %</th>
                      </tr>
                  </thead>
                  <tbody>
                      {item.details.map((detail, dIdx) => (
                      <tr key={dIdx}>
                        <td>{dIdx + 1}</td>
                          <td>{detail["project_number"] || "-"}</td>
                          <td>{detail["input_by_name"] || "-"}</td>
                          <td>{detail["buyer_name"] || "-"}</td>
                          <td>{detail["code_order"] || "-"}</td>
                          <td>{detail["jumlah_track"] || "-"}</td>
                          {/* PRICE  */}
                          <td>
                            {detail["price_normal"] ? ` ${detail["price_normal"]}` : "-"}
                          </td>
                          <td className="text-green-500">
                            {getPriceDiscount(detail.price_normal, detail.discount)
                              ? ` ${getPriceDiscount(detail.price_normal, detail.discount)}`
                              : "-"}
                          </td>
                          <td>{detail["discount"] || "-"}</td>
                          <td>{detail["kupon_diskon_name"] || "-"}</td>
                          <td className="text-green-600">
                            {getBasicPrice(detail.price_normal, detail.discount)
                              ? ` ${getBasicPrice(detail.price_normal, detail.discount)}`
                              : "-"}
                          </td>
                          {/* END PRICE  */}
                      </tr>
                      ))}
                  </tbody>
              </table>
            </div>

            </div>
            )
          })}
      </div>
    </div>
  );
}

export default MarketingTenDaysReport
