import React, { useState } from 'react'
import '../style/pages/DataMarketingReport.css'
import MarketingDayliReport from './MarketingDayliReport';
import MarketingTenDaysReport from './MarketingTenDaysReport';
import { HiOutlineDocumentReport } from 'react-icons/hi';

const DataMarketingReport=()=> {
    // STATE 
    const [activeReport, setActiveReport] = useState('today');

    // FUNCTION 
    //1. show data
    const renderReport = () =>{
            switch (activeReport) {
                case 'today':
                    return <div className="fade"><MarketingDayliReport/></div>;
                case 'period':
                    return <div className="fade"><MarketingTenDaysReport/></div>;
                default:
                    return <div className="fade"><h4>Data Report Marketing Design</h4></div>
            }
        }

  return (
    <div className='marketing-report-container'>
        <div className="marketing-report-content">
            <div className="report-header">
                <div className="report-title">
                    <div className="report-icon">
                        <HiOutlineDocumentReport className='report-logo'/>
                    </div>
                    <h2>LAPORAN DATA MARKERING MUSIK</h2>
                </div>
                <p>Selamat datang di halaman laporan Marketing Musik. Di sini kamu bisa melihat ringkasan aktivitas dan performa tim desain marketing secara real-time maupun per periode.</p>
            </div>

            <div className="report-button">
                <button
                    className={activeReport === 'today' ? 'active': ''}
                    onClick={()=> setActiveReport('today')}
                >
                    Report Today
                </button>
                <button
                    className={activeReport === 'period' ? 'active' :''}
                    onClick={()=> setActiveReport('period')}
                >
                    Report Period
                </button>
            </div>

            <div className="report-body">
                <div className="report-content">
                    {renderReport()}
                </div>
            </div>
        </div>
    </div>
  )
}

export default DataMarketingReport