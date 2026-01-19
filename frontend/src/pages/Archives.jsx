import React, { useState,useEffect } from 'react'
import { useSnackbar } from '../context/Snackbar'
import { deleteArchiveDataUniversalById, getArchiveBoard, getArchiveCard, getArchiveList, getArchiveMarketing, getArchiveMarketingDesign, getArchiveWorkspace, getArchiveWorkspaceUser, getBoardArchive, getCardArchive, getListArchive, getWorkspaceArchive } from '../services/ApiServices'
import '../style/pages/ArchiveStyle.css'
import { IoIosCloseCircle } from "react-icons/io";
import { FaCircle } from "react-icons/fa6";
import { HiOutlineExternalLink, HiOutlineSearch } from 'react-icons/hi'
import { HiArchiveBoxArrowDown, HiXMark } from "react-icons/hi2";
import BootstrapTooltip from '../components/Tooltip'
import { HiChevronUpDown } from 'react-icons/hi2'
import OutsideClick from '../hook/OutsideClick'
import { IoEyeSharp, IoTrash } from 'react-icons/io5'
import { MdOutlineRestore } from 'react-icons/md'
import { handleRestoreArchive } from '../utils/handleRestoreArchive'
import LoadingSpinnerDot from '../utils/LoadingSpinnerDot'


const Archives=()=> {
    //STATE
    const [selectedType, setSelectedType] = useState('workspace')
    const [selectedArchive, setSelectedArchive] = useState(null)
    const [archiveData, setArchiveData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null);
    const [activeButton, setActiveButton] = useState('workspace')
    const {showSnackbar} = useSnackbar()
    const [showDataArchive, setShowDataArchive] = useState(false);
    const showDataArchiveRef = OutsideClick(()=> setShowDataArchive(false));
    // show detail card 
    const [showDetailCard, setShowDetailCard] = useState(false);
    //FILTER STATE
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    // RESTORE MODAL 
    const [showRestoreModal, setShowRestoreModal] = useState(false)
    const [restoreTarget, setRestoreTarget] = useState(null);

    const handleShowDataArchive = () =>{
        setShowDataArchive(!showDataArchive)
        console.log('Button show data berhasil diklik');
    }

    /* =======================
    SHOW FUNCTION
    ======================= */
    const handleShowDetailCard = (item) => {
        // setSelectedDetailCard(item); // simpan data card
        setShowDetailCard(true);     // buka modal
    };

    const closeDetailArchive = () => {
        setSelectedArchive(null)
        // setShowDetailCard(false);
        // setSelectedDetailCard(null);
    };

    /* =======================
    show and restore confirm
    ======================= */
     const openRestoreModal = (item) =>{
        setRestoreTarget(item);
        setShowRestoreModal(true);
    }

    const closeRestoreModal = () =>{
        setShowRestoreModal(false);
        setRestoreTarget(null)
    }

       const confirmRestore = async () => {
        if (!restoreTarget) return;
    
        await handleRestoreArchive({
            entity: restoreTarget.entity_type,
            id: restoreTarget.entity_id,
            refetch: fetchArchiveData,
            showSnackbar,
        });
    
        closeRestoreModal();
        };
    

    //3. fungsi delete data archive berdasarkan id
    const handleDeleteArchive = async (id) =>{
      try{
          await deleteArchiveDataUniversalById(id);
          showSnackbar('Successfully delete archive data:',"success");
          fetchArchiveData();
      }catch(error){
          console.log('Failed to delete archive data:', error);
          showSnackbar('Failed to delete archive data','error');
      }
    }

    /* =======================
    RENDER DATA DETAIL ARCHIVE
    ======================= */
    const renderArchiveDetail = (archive) => {
    const { entity_type, entity_id, archived_at, data } = archive;
    // const { entity_type, archived_at, data } = archive;


    switch (entity_type) {
        case 'cards':
        return (
            <div className='entity-container'>
                <div className="detail-archive">
                    <h4>ARCHIVE INFORMATION</h4>
                    <p>(Status & History)</p>
                    <DetailRow label="Archive Type" value="Cards" />
                    <DetailRow label="Archived At" value={formatDate(archived_at)} />
                </div>
                <div className="detail-entity">
                    <h4>DETAIL CARD</h4>
                    <p>(Data card saat diarsipkan)</p>
                    <DetailRow label="Card Id" value={entity_id} />
                    <DetailRow label="Create At" value={data?.create_at ? formatDate(data.create_at) : '-'}/>
                    <DetailRow label="Card Name" value={data?.title ?? '-'}/>
                    <DetailRow label="Description" value={entity_type === 'cards'
                                            ? data?.description
                                                ?.replace(/<[^>]+>/g, '')
                                                ?.replace(/\s+/g, ' ')
                                                ?.trim() || '-'
                                            : data?.description?.trim() || '-'}/>
                </div>
            </div>
        );

        case 'lists':
        return (
            <div className='entity-container'>
                <div className="detail-archive">
                    <h4>ARCHIVE INFORMATION</h4>
                    <p>(Status & History)</p>
                    <DetailRow label="Archive Type" value="Lists" />
                    <DetailRow label="Archived At" value={formatDate(archived_at)} />
                </div>
                <div className="detail-entity">
                    <h4>DETAIL LIST</h4>
                    <p>(Data list saat diarsipkan)</p>
                    <DetailRow label="List Id" value={entity_id} />
                    <DetailRow label="Create At" value={data?.create_at ? formatDate(data.create_at) : '-'}/>
                    <DetailRow label="List Name" value={data?.name ?? '-'}/>
                    <DetailRow label="Description" value={'No Description'} />
                </div>
            </div>
        );

        case 'boards':
        return (
            <div className='entity-container'>
                <div className="detail-archive">
                    <h4>ARCHIVE INFORMATION</h4>
                    <p>(Status & History)</p>
                    <DetailRow label="Archive Type" value="Board" />
                    <DetailRow label="Archived At" value={formatDate(archived_at)} />
                </div>

                <div className="detail-entity">
                    <h4>DETAIL BOARDS</h4>
                    <p>(Data board saat diarsipkan)</p>
                    <DetailRow label="Board ID" value={entity_id} />
                    <DetailRow label="Create At" value={data?.create_at ? formatDate(data.create_at) : '-'}/>
                    <DetailRow label="Board Name" value={data?.name ?? '-'}/>
                    <DetailRow label="Description" value={data?.description?.trim() || '-'} />
                </div>
            </div>
        );

    case 'workspace':
    case 'workspaces': {

        return (
            <div className='entity-container'>
                <div className="detail-archive">
                    <h4>ARCHIVE INFORMATION</h4>
                    <p>(Status & History)</p>
                    <DetailRow label="Archive Type" value="Workspace" />
                    <DetailRow label="Archived At" value={formatDate(archived_at)}/>
                </div>
                
                <div className="detail-entity">
                    <h4>DETAIL WORKSPACES</h4>
                    <p>(Data workspace saat diarsipkan)</p>
                    <DetailRow label="Workspace ID" value={entity_id}/>
                    <DetailRow label="Create At" value={data?.create_at ? formatDate(data.create_at) : '-'}/>
                    <DetailRow label="Workspace Name" value={data?.name ?? '-'}/>
                    <DetailRow label="Description" value={data?.description?.trim() || '-'} />
                </div>
            </div>
        );
    }




        case 'data_marketing':
        case 'marketing_design':
        return (
            <div className='entity-container'>
                <DetailRow label="Entity Type" value={entity_type} />
                <DetailRow label="Buyer" value={data?.buyer_name || '-'} />
                <DetailRow label="Account" value={data?.account || '-'} />
                <DetailRow label="Order Number" value={data?.order_number || '-'} />
                <DetailRow label="Status" value={data?.status_project || '-'} />
                <DetailRow label="Archived At" value={formatDate(archived_at)} />
            </div>
        );

        default:
        return <p>Detail tidak tersedia untuk data arvhive ini.</p>;
    }
    };

    const DetailRow = ({ label, value }) => (
        <div className="detail-row">
            {/* <FaCircle/> */}
            <span className="detail-label"> {label}</span>
            :
            <span className="detail-value">{value}</span>
        </div>
    );

    const formatDate = (date) =>
    new Date(date).toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });


    const EntityBadge = ({ type }) => {
        const safeType = type.replace(/_/g, '-');

        return (
            <span
            className="entity-badge"
            style={{
                backgroundColor: `var(--badge-${safeType}-bg)`,
                color: `var(--badge-${safeType}-text)`,
                padding: '4px 10px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: '500',
            }}
            >
            {type.replace(/_/g, ' ')}
            </span>
        );
    };


     const renderHierarchy = (archive) => {
        const { entity_type, parent_entity_type, parent_entity_id, entity_id } = archive;

        return (
            <div className='hierarcy-box'>
            {parent_entity_type && parent_entity_id && (
                <div>↳ {parent_entity_type.toUpperCase()} #{parent_entity_id}</div>
            )}
            <div>
                {entity_type.toUpperCase()} #{entity_id}
            </div>
            </div>
        );
        };






    //FUNCTION
    //1. fungsi untuk mengembil data berdasarkan entity yang dipilih
    const fetchArchiveData = async(type) =>{
        try{
            let response;
            if(type === 'workspace'){
                // response = await getArchiveWorkspace();
                response = await getWorkspaceArchive();
            }else if(type === 'workspace_user'){
                response = await getArchiveWorkspaceUser();
            }else if(type === 'boards'){
                response = await getBoardArchive();
            }else if(type === 'lists'){
                response = await getListArchive();
            }else if(type === 'cards'){
                response = await getCardArchive();
            }else if(type === 'marketing'){
                response = await getArchiveMarketing();
            }else if(type === 'marketing_design'){
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
    
      if (loading) return <LoadingSpinnerDot text='Load data archive, please wait'/>;
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
                                onClick={() => { setSelectedType('boards'); setActiveButton('boards'); }}
                                className={activeButton === 'boards' ? 'active' : ''}
                            >
                                Board
                            </button>

                            <button
                                onClick={() => { setSelectedType('lists'); setActiveButton('lists'); }}
                                className={activeButton === 'lists' ? 'active' : ''}
                            >
                                List
                            </button>

                            <button
                                onClick={() => { setSelectedType('cards'); setActiveButton('cards'); }}
                                className={activeButton === 'cards' ? 'active' : ''}
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
                                onClick={()=>{setSelectedType('marketing_design'); setActiveButton('marketing_design');}}
                                className={activeButton === 'marketing_design' ? 'active':''}
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
                                <th>NO</th>
                                <th>KATEGORI</th>
                                <th>TITLE</th>
                                <th>DESCRIPTION</th>
                                <th>ACTION</th>
                            </tr> 
                        </thead>
                        <tbody>
                            {filteredData.map(item=>(
                                <tr key={item.entity_id}>
                                    <td className='nomor-box'>{archiveData.indexOf(item)+1}</td>
                                    <td className='entity-box'><EntityBadge type={item.entity_type} /></td>
                
                                    <td className='name-box'>
                                     {item.data?.name || item.data?.title || '-'}
                                    </td>
                                    {/* <BootstrapTooltip title={item.data?.description?.trim()} placement='top'> */}
                                        <td className="desc-box">
                                        {item.entity_type === 'cards'
                                            ? item.data?.description
                                                ?.replace(/<[^>]+>/g, '')
                                                ?.replace(/\s+/g, ' ')
                                                ?.trim() || '-'
                                            : item.data?.description?.trim() || '-'}
                                        </td>
                                    {/* </BootstrapTooltip> */}

                                    <td className='action-box'>
                                        <div className="action-action" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
                                    <BootstrapTooltip title='View Data' placement='top'>
                                        {/* <button className='btn-action' onClick={()=> handleShowDetailCard(item)}>
                                            <IoEyeSharp/>
                                        </button> */}
                                        <button className='btn-action' onClick={() => setSelectedArchive(item)}>
                                            <IoEyeSharp/>
                                        </button>
                                    </BootstrapTooltip>
                                    <BootstrapTooltip title='Restore data' placement="top">
                                        <button
                                            className='btn-action'
                                            onClick={() => openRestoreModal(item)}
                                        >
            
                                            <MdOutlineRestore/>
                                        </button>
                                    </BootstrapTooltip>
                                    <BootstrapTooltip title='Delete data' placement='top'>
                                        <button className='btn-action' onClick={()=> handleDeleteArchive(item.entity_id)}>
                                            <IoTrash/>
                                        </button>
                                    </BootstrapTooltip>
                                    </div>
                                </td>
                                </tr>
                                ))}
                        </tbody>
                </table>
                )}
            </div>
        </div>
        
       {selectedArchive &&  (
        <div className="detail-card-modal">
            <div className="detail-card-content">

                <div className="detail-archive-modal-header">
                    <div>
                        <h3>ARCHIVE DETAIL</h3>
                        <EntityBadge type={selectedArchive.entity_type} /> 
                    </div>

                    <button className="close-archive-btn" onClick={closeDetailArchive}>
                        <IoIosCloseCircle/>
                    </button>
                </div>


                <div className="archive-hierarchy">
                    {renderHierarchy(selectedArchive)}
                </div>

                <div className="archive-modal-body">
                    {renderArchiveDetail(selectedArchive)}
                </div>

            </div>
        </div>
        )}



        {showRestoreModal && (
        <div className="modal-overlay">
            <div className="modal-box">
                <h3>⚠️ RESTORE DATA</h3>

                <p>
                    Apakah kamu yakin ingin mengembalikan data
                    <strong> "{restoreTarget?.entity_type}" {restoreTarget?.data?.name || restoreTarget?.data?.title || '-'}</strong>?
                </p>

                <p >
                    Data ini akan dikembalikan ke daftar aktif.
                </p>

                <div className="modal-actions">
                    <button className="btn-cancel" onClick={closeRestoreModal}>
                    Cancel
                    </button>
                    <button className="btn-confirm" onClick={confirmRestore}>
                    Yes, Restore
                    </button>
                </div>
            </div>
        </div>
        )}
    </div>
  )
}

export default Archives