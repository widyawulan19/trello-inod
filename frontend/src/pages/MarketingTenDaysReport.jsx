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
          .map((item, idx) => (
            <div key={idx} className='table-report-content'>
              <h2 className="font-bold mb-2">
                Periode {getPeriodLabel(item.period)} - Total: {item.total} Data
              </h2>
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
                    <th className="price-normal-container">Price Normal</th>
                    <th className="price-discount-container">Price Discount</th>
                    <th className="discount-container">Discount</th>
                    <th className="basic-price-container">Basic Price</th>
                    <th className="project-type-container">Project Type</th>
                    <th className="duration-container">Duration</th>
                    <th className="action-container">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {item.details.map((detail, dIdx) => (
                    <tr key={dIdx} className="text-center hover:bg-gray-50">
                        <td className="border px-2 py-1">{detail["input_by"] || "-"}</td>
                        <td className="border px-2 py-1">{detail["acc_by"] || "-"}</td>
                        <td className="border px-2 py-1">
                        <span
                            className={`px-2 py-1 rounded-full font-bold ${
                            detail.is_accepted
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                        >
                            {detail.is_accepted ? "Accepted" : "Not Accepted"}
                        </span>
                        </td>
                        <td className="border px-2 py-1">{detail["buyer_name"] || "-"}</td>
                        <td className="border px-2 py-1">{detail["order_number"] || "-"}</td>
                        <td className="border px-2 py-1">{detail["account"] || "-"}</td>
                        <td className="border px-2 py-1">
                        {detail["deadline"]
                            ? new Date(detail["deadline"]).toLocaleDateString("id-ID")
                            : "-"}
                        </td>
                        <td className="border px-2 py-1">{detail["code_order"] || "-"}</td>
                        <td className="border px-2 py-1">{detail["jumlah_track"] || "-"}</td>
                        <td className="border px-2 py-1">{detail["order_type"] || "-"}</td>
                        <td className="border px-2 py-1">{detail["offer_type"] || "-"}</td>
                        <td className="border px-2 py-1">{detail["jenis_track"] || "-"}</td>
                        <td className="border px-2 py-1">{detail["genre"] || "-"}</td>
                        <td className="border px-2 py-1">
                        {detail["price_normal"] ? `Rp ${detail["price_normal"]}` : "-"}
                        </td>
                        <td className="border px-2 py-1">
                        {detail["price_discount"] ? `Rp ${detail["price_discount"]}` : "-"}
                        </td>
                        <td className="border px-2 py-1">{detail["discount"] || "-"}</td>
                        <td className="border px-2 py-1">
                        {detail["basic_price"] ? `Rp ${detail["basic_price"]}` : "-"}
                        </td>
                        <td className="border px-2 py-1">{detail["project_type"] || "-"}</td>
                        <td className="border px-2 py-1">{detail["duration"] || "-"}</td>
                        <td className="border px-2 py-1">
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
          ))}
      </div>
    </div>
  );
}

export default MarketingTenDaysReport
