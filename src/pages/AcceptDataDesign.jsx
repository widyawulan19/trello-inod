import React, { useEffect, useState } from 'react'
import { getDataWhereCardIdNotNull } from '../services/ApiServices';
import '../style/pages/AcceptDataDesign.css'
import { HiArrowsUpDown, HiOutlineCircleStack, HiOutlinePencil } from 'react-icons/hi2';
import { HiOutlineSearch } from 'react-icons/hi';
import { CgDollar, CgFileDocument } from 'react-icons/cg';
import { IoEyeSharp } from 'react-icons/io5';
import BootstrapTooltip from '../components/Tooltip';
import ViewDataMarketingDesign from './ViewDataMarketingDesign';
import EditMarketingDesign from './EditMarketingDesign';
import MarketingDesignDeleteConfirm from '../modals/MarketingDesignDeleteConfirm';

const AcceptDataDesign=()=> {
    //STATE
    const [dataAccept, setDataAccept] = useState([]);
    const [filteredData, setFilteredData] = useState([])
    const [acceptDataMarketing, setAcceptDataMarketing] = useState([])
    const [showDetailProject, setShowDetailProject] = useState(false);


    //FUNCTION
    //1. fetch all data accept
    const fetchDataAccept = async() =>{
        try{
            const response = await getDataWhereCardIdNotNull()
            setDataAccept(response.data);
            setFilteredData(response.data)
        }catch(error){
            console.error('Error fetch data accept:', error)
        }
    }

    //2. function filtered data
    const handleFilterData = (selectedTerm) =>{
        if(selectedTerm === ""){
            setFilteredData(acceptDataMarketing)
        }else{
            const filtered = acceptDataMarketing.filter(
                (item)=>
                    item.buyer_name.toLowerCase().includes(selectedTerm.toLowerCase()) ||
                    item.order_number.toLowerCase().includes(selectedTerm.toLowerCase()) ||
                    item.account.toLowerCase().includes(selectedTerm.toLowerCase()) 
            );
            setFilteredData(filtered);
        }
    }

    //3. function to show detail
    // const handleShowDetailProject = (marketing_design_id) =>{
    //     setS
    // }


    useEffect(()=>{
        fetchDataAccept()
    },[])
  return (
    <div className='data-accept-container'>
        <div className="dac-header">
            <div className="dach-left">
                <HiOutlineCircleStack/>
                <h4>DATA MARKETING DESIGN</h4>/
                <h4>DATA ACCEPT</h4>
            </div>
            <div className="dach-right">
                <div className="dach-search">
                    <input 
                        type="search"
                        placeholder='Search here...'
                        onChange={(e)=> handleFilterData(e.target.value)} 
                    />
                    <HiOutlineSearch className='dach-search-icon'/>
                </div>
            </div>
        </div>
        <div className="md-body">
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
                        <th style={{borderTopRightRadius:'4px'}}>PROJECT DETAIL</th>
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
                            <td style={{ width: '100%', minWidth: '10vw', maxWidth: '10vw', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <button className='project-detail'>Detail<CgFileDocument className='pd-icon'/></button>
                            </td>
                            {/* <td className="action-table">
                                <BootstrapTooltip title='View Data' placement='top'>
                                    <button onClick={()=> handleShowDetail(item.marketing_design_id)}>
                                        <IoEyeSharp/>
                                    </button>
                                </BootstrapTooltip>
                                <BootstrapTooltip title='Edit Data' placement='top'>
                                    <button onClick={()=> handleShowEdit(item.marketing_design_id)}>
                                        <HiOutlinePencil/>
                                    </button>
                                </BootstrapTooltip>
                                <BootstrapTooltip title='Delete Data' placement='top'>
                                    <button onClick={()=>handleDeleteClick(item.marketing_design_id)}><HiOutlineTrash/></button>
                                </BootstrapTooltip>
                            </td> */}
                        </tr>
                    ))}
                </tbody>
                {/* SHOW  */}
                {/* {showDetail && selectedMarketingDesign && (
                    <div className="detail-design">
                        <div className="detail-cont">
                            <ViewDataMarketingDesign marketingDesignId={selectedMarketingDesign} onClose={handleCloseDetail}/>
                        </div>
                    </div>
                )}
                {showEdit && selectedMarketingDesign && (
                    <div className="edit-design">
                        <div className="edit-cont">
                            <EditMarketingDesign marketingDesignId={selectedMarketingDesign} onClose={handleCloseEdit} fetchMarketingDesign={fetchMarketingDesign} />
                        </div>
                    </div>
                )}
                <MarketingDesignDeleteConfirm
                    isOpen={showDeleteConfirm}
                    marketingDesignId={selectedMarketingDesign}
                    onConfirm={confirmDelete}
                    onCancle={cancleDeleteConfirm}
                /> */}
            </table>
        </div>
    </div>
  )
}

export default AcceptDataDesign

{/* <div>
{dataAccept.map((accept)=>(
    <div key={accept.id}>
        <p>{accept.input_by}</p>
    </div>
))}
</div> */}