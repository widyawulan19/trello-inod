import React, { useState } from 'react'
import '../style/pages/MarketingDesignReport.css'
import DesignTenDaysReport from './DesignTenDaysReport';
import DesignDayliReport from './DesignDayliReport';
import { HiOutlineDocumentReport } from "react-icons/hi";
import { useNavigate } from 'react-router-dom';

const MarketingDesignReport =()=> {
    //STATE
    const [activeReport, setActiveReport] = useState('today');
    const navigate = useNavigate();

    //FUNCTION

    //1. show data 
    const renderReport = () =>{
        switch (activeReport) {
            case 'today':
                return <div className="fade"><DesignDayliReport/></div>;
            case 'period':
                return <div className="fade"><DesignTenDaysReport/></div>;
            default:
                return <div className="fade"><h4>Data Report Marketing Design</h4></div>
        }
    }

    //2. navigate to data marketing design
    const navigateToMarketingDesign = () =>{
        navigate('/layout/marketing-design')
    }

  return (
    <div className='design-report-container'>
        <div className="design-report-content">
            <div className="report-header">
                <div className="report-title">
                    <div className="report-icon">
                        <HiOutlineDocumentReport className='report-logo'/>
                    </div>
                    <h2>LAPORAN MARKETING DESIGN</h2>
                </div>
                
                <p>Selamat datang di halaman laporan Marketing Design. Di sini kamu bisa melihat ringkasan aktivitas dan performa tim desain marketing secara real-time maupun per periode.</p>
            </div>
            <div className="report-button">
                <button
                    onClick={navigateToMarketingDesign}
                >
                    Marketing Design
                </button>
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

export default MarketingDesignReport