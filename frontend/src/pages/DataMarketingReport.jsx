import React, { useState } from 'react'
import '../style/pages/DataMarketingReport.css'
import MarketingDayliReport from './MarketingDayliReport';
import MarketingTenDaysReport from './MarketingTenDaysReport';
import { HiOutlineDocumentReport } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { HiCalendar, HiCalendarDateRange, HiCalendarDays, HiOutlineCircleStack } from 'react-icons/hi2';

const DataMarketingReport=()=> {
    // STATE 
    const [activeReport, setActiveReport] = useState('today');
    const navigate = useNavigate();


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
    
    //2. navigate to data marketing
    const navigateToDataMarketing = () =>{
        navigate('/layout/data-marketing');
    }

  return (
    <div className='marketing-report-container'>
        <div className="marketing-report-content">
            <div className="report-header">
                <div className="report-title">
                    <h2>LAPORAN DATA MARKERING MUSIK</h2>
                </div>
                <p>Selamat datang di halaman laporan Marketing Musik. Di sini kamu bisa melihat ringkasan aktivitas dan performa tim desain marketing secara real-time maupun per periode.</p>
            </div>

            <div className="report-button">
                <button onClick={navigateToDataMarketing}>
                    <HiOutlineCircleStack/>
                    DATA MARKETING
                </button>
                <button
                    className={activeReport === 'today' ? 'active': ''}
                    onClick={()=> setActiveReport('today')}
                >
                    <HiCalendarDays/>
                    DAILY REPORT
                </button>
                <button
                    className={activeReport === 'period' ? 'active' :''}
                    onClick={()=> setActiveReport('period')}
                >
                    <HiCalendarDateRange/>
                    MONTHLY REPORT
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