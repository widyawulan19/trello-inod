import React, { useState,useEffect } from 'react'
import { useSnackbar } from '../context/Snackbar'
import { getArchiveBoard, getArchiveCard, getArchiveList, getArchiveMarketing, getArchiveMarketingDesign, getArchiveWorkspace, getArchiveWorkspaceUser } from '../services/ApiServices'
import '../style/pages/ArchiveStyle.css'
import { CiSearch } from 'react-icons/ci'
import { HiOutlineExternalLink, HiOutlineSearch } from 'react-icons/hi'
import { HiArchiveBoxArrowDown } from "react-icons/hi2";
import BootstrapTooltip from '../components/Tooltip'
import { HiChevronUpDown } from 'react-icons/hi2'
import OutsideClick from '../hook/OutsideClick'

const Archives=()=> {
    //STATE
    const [selectedType, setSelectedType] = useState('workspace')
    const [archiveData, setArchiveData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null);
    const [activeButton, setActiveButton] = useState('workspace')
    const {showSnackbar} = useSnackbar()
    const [showDataArchive, setShowDataArchive] = useState(false);
    const showDataArchiveRef = OutsideClick(()=> setShowDataArchive(false));
    //FILTER STATE
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredData, setFilteredData] = useState([]);

    const handleShowDataArchive = () =>{
        setShowDataArchive(!showDataArchive)
        console.log('Button show data berhasil diklik');
    }

    //debug
    


    //FUNCTION
    //1. fungsi untuk mengembil data berdasarkan entity yang dipilih
    const fetchArchiveData = async(type) =>{
        try{
            let response;
            if(type === 'workspace'){
                response = await getArchiveWorkspace();
            }else if(type === 'workspace_user'){
                response = await getArchiveWorkspaceUser();
            }else if(type === 'board'){
                response = await getArchiveBoard();
            }else if(type === 'list'){
                response = await getArchiveList();
            }else if(type === 'card'){
                response = await getArchiveCard();
            }else if(type === 'marketing'){
                response = await getArchiveMarketing();
            }else if(type === 'marketing design'){
                response = await getArchiveMarketingDesign();
            }
            setArchiveData(response.data);
            setFilteredData(response.data);
        }catch(error){
            setError('Error fetching archive data');
            console.error(error)
        }finally{
            setLoading(false)
        }
    }

    //fungsi search
    const handleSearch = (query) =>{
        setSearchQuery(query);
        const lowerQuery = query.toLowerCase();

        const filtered = archiveData.filter(item =>
            item.name?.toLowerCase().includes(lowerQuery) ||
            item.entity_type?.toLowerCase().includes(lowerQuery)
        )
        setFilteredData(filtered);
    }

     useEffect(()=>{
        setLoading(true);
        fetchArchiveData(selectedType);
      }, [selectedType]);
    
      if (loading) return <p>Loading archived workspaces...</p>;
      if (error) return <p>{error}</p>;
    

  return (
    <div className='archive-box-container'>
        <div className="archive-box-header">
            <div className="archive-header-left">
                 <h4>ARCHIVE DATA {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}s</h4>
                <p> <span>Semua Aktivitas Terdokumentasi, Tersimpan dengan Aman</span>
                    Selamat datang di halaman Arsip Data. Di sini, Anda dapat menelusuri seluruh riwayat aktivitas proyek, mulai dari Workspace, Board, List, Card, hingga detail lengkap dari Data Marketing yang pernah dibuat.
                </p>
            </div>

            <div className="archive-header-btn">
                <div className='data-search'>
                    <HiOutlineSearch size={13}/>
                    <input 
                        type="text" 
                        className='search-input'
                        placeholder='search data archive...'
                        value={searchQuery}
                        onChange={(e)=> handleSearch(e.target.value)}
                    />
                </div>
                
                <div className="btn-container">
                    <button>
                        <HiOutlineExternalLink size={15}/>
                        EXPORT
                    </button>

                    {/* WRAPPER PENTING */}
                    <div className="archive-dropdown-wrapper">
                        <button
                            className="btn-show-archive"
                            onClick={handleShowDataArchive}
                        >
                            <HiChevronUpDown size={15}/>
                            SHOW DATA
                        </button>

                        {showDataArchive && (
                        <div className="archive-button" ref={showDataArchiveRef}>
                            <h5>Select Data:</h5>

                            <button
                                onClick={() => { setSelectedType('workspace'); setActiveButton('workspace'); }}
                                className={activeButton === 'workspace' ? 'active' : ''}
                            >
                             Workspace
                            </button>

                            <button
                                onClick={() => { setSelectedType('board'); setActiveButton('board'); }}
                                className={activeButton === 'board' ? 'active' : ''}
                            >
                                Board
                            </button>

                            <button
                                onClick={() => { setSelectedType('list'); setActiveButton('list'); }}
                                className={activeButton === 'list' ? 'active' : ''}
                            >
                                List
                            </button>

                            <button
                                onClick={() => { setSelectedType('card'); setActiveButton('card'); }}
                                className={activeButton === 'card' ? 'active' : ''}
                            >
                                Card
                            </button>

                            <button
                                onClick={()=>{setSelectedType('marketing'); setActiveButton('marketing');}}
                                className={activeButton === 'marketing' ? 'active':''}
                            >
                                Marketing
                            </button>

                            <button
                                onClick={()=>{setSelectedType('marketing design'); setActiveButton('marketing design');}}
                                className={activeButton === 'marketing design' ? 'active':''}
                            >
                                Marketing Design
                            </button>                            
                        </div>
                        )}
                    </div>
                </div>
            </div>
            
        </div>
        <div className="archive-data-table">
            <div className="archive-show-data">
                {filteredData.length === 0 ?(
                    <p>No archived {selectedType}s found.</p>
                ):(
                    <table>
                    <thead>
                    <tr>
                        <th style={{borderTopLeftRadius:'8px', borderBottomLeftRadius:'8px'}}>No.</th>
                        {/* <th >ID No.</th> */}
                        <th>Kategori</th>
                        <th>Name</th>
                        <th style={{borderTopRightRadius:'8px', borderBottomRightRadius:'8px'}}>Description</th>
                    </tr> 
                    </thead>
                    <tbody>
                    {filteredData.map(item=>(
                        <tr key={item.entity_id}>
                        <td style={{borderTopLeftRadius:'8px', borderBottomLeftRadius:'8px'}}>{archiveData.indexOf(item)+1}</td>
                        {/* <td style={{paddingLeft:'15px', width:'20px'}}>{item.entity_id}</td> */}
                        <td style={{fontWeight:'bold'}}>{item.entity_type}</td>
                        <td>{item.name}</td>
                        <td style={{borderTopRightRadius:'8px', borderBottomRightRadius:'8px'}}>{item.description}</td>
                        </tr>
                        ))}
                    </tbody>
                </table>
                )}
            </div>
        </div>
    </div>
  )
}

export default Archives