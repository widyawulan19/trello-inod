import React, { useEffect, useState } from 'react';
import {
  getAllDataMarketingDesign,
  getDataWhereCardIdIsNull,
  getDataWhereCardIdNotNull,
} from '../services/ApiServices';
import '../style/pages/AcceptDataDesign.css'
// import '../style/pages/ExampleDataMarketing.css'
import { HiArrowsUpDown, HiChevronUpDown, HiMiniTableCells } from 'react-icons/hi2';
import { CgDollar } from 'react-icons/cg';
import { HiFilter, HiOutlineFilter } from 'react-icons/hi';

const MarketingDesignList = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [showWithCardIdOnly, setShowWithCardIdOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [showFilter, setShowFilter] = useState(false);
  const [showBuyerName, setShowBuyerName] = useState(false);
  const [showOrderNumber, setShowOrderNumber] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showData, setShowData] = useState(false);
  const [shortType, setShortType] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);


  const [filters, setFilters] = useState({
    buyer_name: '',
    order_number: '',
    account: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      let response;
      if (filterType === 'not-null') {
        response = await getDataWhereCardIdNotNull();
      } else if (filterType === 'null') {
        response = await getDataWhereCardIdIsNull();
      } else if (filterType === 'accept') {
        response = await getDataWhereCardIdNotNull();
      } else{
        response = await getAllDataMarketingDesign();
      }

      setData(response.data);
      setFilteredData(response.data);
    } catch (error) {
      console.error('Error fetching marketing design data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterType]);

  useEffect(() => {
    let temp = [...data];
    if (filters.buyer_name) {
      temp = temp.filter((item) =>
        item.buyer_name.toLowerCase().includes(filters.buyer_name.toLowerCase())
      );
    }
    if (filters.order_number) {
      temp = temp.filter((item) =>
        item.order_number.toLowerCase().includes(filters.order_number.toLowerCase())
      );
    }
    if (filters.account) {
      temp = temp.filter((item) =>
        item.account.toLowerCase().includes(filters.account.toLowerCase())
      );
    }
    setFilteredData(temp);
  }, [filters, data]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilterButton = () =>{
    setShowFilter(!showFilter)
  }
  const handleShowBuyerName = () =>{
    setShowBuyerName(!showBuyerName)
  }
  const handleShowOrderNumber = () =>{
    setShowOrderNumber(!showOrderNumber)
  }
  const handleShowAccount = () =>{
    setShowAccount(!showAccount)
  }

  const handleShowDataMarketing = () =>{
    setShowData(!showData)
  }

  return (
    <div className="dac-container">
      <div className="dac-header">
        <h2 className="text-xl font-semibold mb-4">Marketing Design Data</h2>

        <div className="dac-right">
          <div className="dm-filter-data">
            <button onClick={handleShowDataMarketing}>
              <HiMiniTableCells className='dacr-icon'/>
              SHOW DATA BY
            </button>
          </div>
          <div className="dm-filter-type">
            <button onClick={handleFilterButton}>
            <HiChevronUpDown className='dacr-icon'/>
            SHORT TYPE
            </button>
          </div>
        </div>
        
        {/* SHOW KATEGORI DATA  */}
        {showData && (
          <div className='sd-container'>
            <h5>Show Data By:</h5>
            <button onClick={() => setFilterType('all')} >
              All Data
            </button>
            <button onClick={() => setFilterType('not-null')}>
              Data Dengan Card
            </button>
            <button onClick={() => setFilterType('null')}>
              Data Tanpa Card
            </button>
            <button onClick={() => setFilterType('accept')}>
              Accept Data Marketing
            </button>
          </div>
        )}


        {/* FILTER BY TYPE DATA  */}
        {showFilter && (
            <div className="ft-container">
              <div className="ftc-header">
                <h5>Short By:</h5>
              </div>
              <div className="ftc-content">
                <div className="ftc-box">
                  <button onClick={() => setDropdownOpen(!dropdownOpen)} className='btn-ft'>
                    <HiChevronUpDown className='dacr-icon'/>
                    {shortType ? shortType.replace('_', ' ') : 'Short Type'}
                  </button>
                  {dropdownOpen && (
                    <ul className='ul-ftc'>
                      <li
                        className="li-ftc"
                        onClick={() => {
                          setShortType('buyer_name');
                          setDropdownOpen(false);
                        }}
                      >
                        Buyer Name
                      </li>
                      <li
                        className="li-ftc"
                        onClick={() => {
                          setShortType('order_number');
                          setDropdownOpen(false);
                        }}
                      >
                        Order Number
                      </li>
                      <li
                        className="li-ftc"
                        onClick={() => {
                          setShortType('account');
                          setDropdownOpen(false);
                        }}
                      >
                        Account
                      </li>
                    </ul>
                  )}
                </div>
                {/* Input Field */}
                <div className="ftc-input">
                  {shortType && (
                    <input
                      type="text"
                      name={shortType}
                      value={filters[shortType]}
                      onChange={handleFilterChange}
                      placeholder={`Filter by ${shortType.replace('_', ' ')}`}
                      className="border p-2 rounded w-full"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

      </div>
    
      

      {loading ? (
        <p>Loading data...</p>
      ) : (
        <div className="data-accept-container">
          {/* <h4>DATA MARKETING </h4> */}
            <table cellPadding="10" cellSpacing="0" style={{ tableLayout: 'auto', width: '100%' }}>
                <thead>
                    <tr>
                        <th style={{borderTopLeftRadius:'4px'}}>NO</th>
                        <th>INPUT BY </th>
                        <th>ACC BY</th>
                        <th>BUYER NAME <HiArrowsUpDown/></th>
                        <th>CODE ORDER <HiArrowsUpDown/></th>
                        <th>JUMLAH DESIGN</th>
                        <th>ORDER NUMBER </th>
                        <th>ACCOUNT <HiArrowsUpDown/></th>
                        <th>DEADLINE</th>
                        <th>JUMLAH REVISI</th>
                        <th>ORDER TYPE</th>
                        <th>OFFER TYPE</th>
                        <th>STYLE</th>
                        <th>RESOLUTION</th>
                        <th>PRICE NORMAL <CgDollar/></th>
                        <th>PRICE DISCOUNT <CgDollar/></th>
                        <th>DISCOUNT PRESENTAGE <CgDollar/></th>
                        {/* <th>Required Files</th> */}
                        <th>PROJECT TYPE</th>
                        <th style={{borderTopRightRadius:'4px'}}>ACTION</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map((item, index)=>(
                        <tr key={item.marketing_design_id}>
                            <td>{index + 1}</td>
                            <td style={{ width: '100%', minWidth: '10vw', maxWidth: '10vw' }}>{item.input_by}</td>
                            <td style={{ width: '100%', minWidth: '10vw', maxWidth: '10vw' }}>{item.acc_by}</td>
                            <td style={{ width: '100%', minWidth: '10vw', maxWidth: '10vw' }}>{item.buyer_name}</td>
                            <td style={{ width: '100%', minWidth: '10vw', maxWidth: '10vw' }}>{item.code_order}</td>
                            <td style={{ width: '100%', minWidth: '10vw', maxWidth: '10vw', textAlign:'center' }}>{item.jumlah_design}</td>
                            <td style={{ width: '100%', minWidth: '10vw', maxWidth: '10vw' }}>{item.order_number}</td>
                            <td style={{ width: '100%', minWidth: '10vw', maxWidth: '10vw' }}>{item.account}</td>
                            <td style={{ width: '100%', minWidth: '10vw', maxWidth: '10vw', textAlign:'center' }}>{new Date(item.deadline).toLocaleDateString()}</td>
                            <td style={{ width: '100%', minWidth: '10vw', maxWidth: '10vw', textAlign:'center' }}>{item.jumlah_revisi}</td>
                            <td style={{ width: '100%', minWidth: '10vw', maxWidth: '10vw'}}>{item.order_type}</td>
                            <td style={{ width: '100%', minWidth: '10vw', maxWidth: '10vw'}}>{item.offer_type}</td>
                            <td style={{ width: '100%', minWidth: '12vw', maxWidth: '12vw'}}>{item.style}</td>
                            <td style={{ width: '100%', minWidth: '12vw', maxWidth: '12vw'}}>{item.resolution}</td>
                            <td style={{ width: '100%', minWidth: '10vw', maxWidth: '10vw' , textAlign:'center', color:'#1E1E1E'}}>${item.price_normal}</td>
                            <td style={{ width: '100%', minWidth: '10vw', maxWidth: '10vw' , textAlign:'center', color:'#E53935'}}>${item.price_discount}</td>
                            <td style={{ width: '100%', minWidth: '10vw', maxWidth: '10vw' , textAlign:'center', color:'#388E3C'}}>${item.discount_percentage}</td>
                            {/* <td>{item.required_files}</td> */}
                            <td style={{ width: '100%', minWidth: '10vw', maxWidth: '10vw' }}>{item.project_type}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      )}
    </div>
  );
};

export default MarketingDesignList;
