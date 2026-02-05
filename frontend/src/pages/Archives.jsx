import React, { useState,useEffect } from 'react'
import { useSnackbar } from '../context/Snackbar'
import { deleteArchiveDataUniversalById, deleteBoardPermanently, deleteCardPermanently, deleteDataArchivePermanent, deleteListPermanently, deleteMarketingDesignPermanently, deleteMarketingPermanently, getAllAccountsMusic, getAllOrderTypesMusic, getArchiveBoard, getArchiveCard, getArchiveList, getArchiveMarketing, getArchiveMarketingDesign, getArchiveWorkspace, getArchiveWorkspaceUser, getBoardArchive, getCardArchive, getListArchive, getMarketingArchive, getMarketingDesignArchive, getWorkspaceArchive } from '../services/ApiServices'
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
import { useLocation } from 'react-router-dom';


const Archives=()=> {
    //STATE
    const [selectedType, setSelectedType] = useState('workspace')
    const [selectedArchive, setSelectedArchive] = useState(null)
    const [archiveData, setArchiveData] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingModal, setLoadingModal] = useState(false);
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
    // data marekting needed 
    const [accountMusic, setAccountMusic] = useState([])
    const [orderTypes, setOrderTypes] = useState([])
    const location = useLocation();

    //DELETE CONFIRM MODAL
    const [deleteTargetId, setDeleteTargetId] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
  fetchAccountMusic()
  fetchOrderTypes()
}, [])

const fetchAccountMusic = async () => {
  const res = await getAllAccountsMusic()
  setAccountMusic(res.data)
}

const fetchOrderTypes = async () => {
  const res = await getAllOrderTypesMusic()
  setOrderTypes(res.data)
}



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
                    <DetailRow label="Card Id" value={`#${entity_id}`} />
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
                    <DetailRow label="List Id" value={`#${entity_id}`}/>
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
                    <DetailRow label="Board ID" value={`#${entity_id}`} />
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
                    <DetailRow label="Workspace ID" value={`#${entity_id}`}/>
                    <DetailRow label="Create At" value={data?.create_at ? formatDate(data.create_at) : '-'}/>
                    <DetailRow label="Workspace Name" value={data?.name ?? '-'}/>
                    <DetailRow label="Description" value={data?.description?.trim() || '-'} />
                </div>
            </div>
        );
    }

    case 'data_marketing':
        return (
            <div className='entity-container'>
                <div className="detail-archive">
                    <h4>ARCHIVE INFORMATION</h4>
                    <p>(Status & History)</p>
                    <DetailRow label="Archive Type" value="Marketing Musik" />
                    <DetailRow label="Archived At" value={formatDate(archived_at)}/>
                </div>
                
                <div className="detail-entity">
                    <h4>DETAIL MARKETING MUSIK</h4>
                    <p>(Data marketing saat diarsipkan)</p>
                    <DetailRow label="Marketing ID" value={`#${entity_id}`}/>
                    <DetailRow label="Create At" value={data?.create_at ? formatDate(data.create_at) : '-'}/>
                    <DetailRow
                        label="Marketing Name"
                        value={[
                            selectedArchive?.data?.buyer_name,
                            selectedArchive?.data?.code_order,
                        ].filter(Boolean).join(' - ')}
                    />


                    <DetailRow label="Description" value={entity_type === 'data_marketing'
                                            ? data?.detail_project
                                                ?.replace(/<[^>]+>/g, '')
                                                ?.replace(/\s+/g, ' ')
                                                ?.trim() || '-'
                                            : data?.description?.trim() || '-'}/>
                </div>
            </div>
        );

        case 'marketing_design':
        return (
            <div className='entity-container'>
                <div className="detail-archive">
                    <h4>ARCHIVE INFORMATION</h4>
                    <p>(Status & History)</p>
                    <DetailRow label="Archive Type" value="Marketing Design" />
                    <DetailRow label="Archived At" value={formatDate(archived_at)}/>
                </div>
                
                <div className="detail-entity">
                    <h4>DETAIL MARKETING DESIGN</h4>
                    <p>(Data marketing saat diarsipkan)</p>
                    <DetailRow label="Marketing ID" value={`#${entity_id}`}/>
                    <DetailRow label="Create At" value={data?.create_at ? formatDate(data.create_at) : '-'}/>
                    <DetailRow
                        label="Marketing Name"
                        value={[
                            selectedArchive?.data?.buyer_name,
                            selectedArchive?.data?.code_order,
                        ].filter(Boolean).join(' - ')}
                    />


                    <DetailRow label="Description" value={entity_type === 'marketing_design'
                                            ? data?.detail_project
                                                ?.replace(/<[^>]+>/g, '')
                                                ?.replace(/\s+/g, ' ')
                                                ?.trim() || '-'
                                            : data?.description?.trim() || '-'}/>
                </div>
            </div>
        );


        default:
        return <p>Detail tidak tersedia untuk data arvhive ini.</p>;
    }
    };

    const sortedData = [...filteredData].sort(
        (a, b) => new Date(b.archived_at) - new Date(a.archived_at)
        );

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


    // FUNGSSI DELETE DATA BERDASARKAN ENTIY YANG DIPILIH
    const deletePermanentByType = async (type, id) => {
        switch (type) {
            case 'boards':
            return deleteBoardPermanently(id);

            case 'lists':
            return deleteListPermanently(id);

            case 'cards':
            return deleteCardPermanently(id);

            case 'data_marketing':
            return deleteMarketingPermanently(id);

            case 'marketing_design':
            return deleteMarketingDesignPermanently(id);

            default:
            throw new Error(`Unsupported archive type: ${type}`);
    }
    };



    //3. fungsi delete data archive berdasarkan id
    const handleDeleteArchive = async () => {
    if (!deleteTargetId) return;

        try {
            setIsDeleting(true);

            await deleteDataArchivePermanent(deleteTargetId);

            showSnackbar(
            'Archive & original data deleted permanently 🗑️',
            'success'
            );

            fetchArchiveData(selectedType);
        } catch (error) {
            console.error('Failed to delete archive data:', error);
            showSnackbar('Failed to delete archive data', 'error');
        } finally {
            setIsDeleting(false);
            setIsDeleteOpen(false);
            setDeleteTargetId(null);
            setDeleteTarget(null);
        }
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
            }else if(type === 'data_marketing'){
                response = await getMarketingArchive();
            }else if(type === 'marketing_design'){
                response = await getMarketingDesignArchive();
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

    // memperlambat load 
    useEffect(() => {
    if (location.state?.openArchive && location.state.entity_type) {
        setSelectedType(location.state.entity_type);
        setActiveButton(location.state.entity_type);

        // mulai spinner karena modal akan segera dibuka
        setLoadingModal(true);
    }
    }, [location.state]);

// useeffect untuk buka modal 
    useEffect(() => {
    if (!location.state?.openArchive) return;
    if (archiveData.length === 0) return;

    const target = archiveData.find(
        item =>
        item.entity_type === location.state.entity_type &&
        item.entity_id === location.state.entity_id
    );

    if (target) {
        setSelectedArchive(target);
    }
    }, [archiveData, location.state]);


    // {loadingModal && (
    // <div className="flex justify-center items-center h-[60vh]">
    //     <LoadingSpinnerDot text="Loading archive detail..." />
    // </div>
    // )}



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
                                onClick={()=>{setSelectedType('data_marketing'); setActiveButton('data_marketing');}}
                                className={activeButton === 'data_marketing' ? 'active':''}
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
                            {sortedData.map((item, index) => (
                                <tr key={`${item.entity_type}-${item.entity_id}`}>
                                <td className="nomor-box">{index + 1}</td>

                                <td className="entity-box">
                                    <EntityBadge type={item.entity_type} />
                                </td>

                                <td className="name-box">
                                    {['data_marketing', 'marketing_design'].includes(item.entity_type)
                                    ? [
                                        item.data?.buyer_name,
                                        item.data?.code_order,
                                        ].filter(Boolean).join(' - ')
                                    : item.data?.name || item.data?.title || '-'}
                                </td>

                                <td className="desc-box">
                                    {['cards', 'data_marketing', 'marketing_design'].includes(item.entity_type)
                                    ? (
                                        item.entity_type === 'cards'
                                            ? item.data?.description
                                            : item.data?.detail_project
                                        )
                                        ?.replace(/<[^>]+>/g, '')
                                        ?.replace(/\s+/g, ' ')
                                        ?.trim() || '-'
                                    : item.data?.description?.trim() || '-'}
                                </td>

                                <td className="action-box">
                                    <div className="action-action">
                                    <BootstrapTooltip title="View Data">
                                        <button
                                        className="btn-action"
                                        onClick={() => setSelectedArchive(item)}
                                        >
                                        <IoEyeSharp />
                                        </button>
                                    </BootstrapTooltip>

                                    <BootstrapTooltip title="Restore data">
                                        <button
                                        className="btn-action"
                                        onClick={() => openRestoreModal(item)}
                                        >
                                        <MdOutlineRestore />
                                        </button>
                                    </BootstrapTooltip>

                                    <BootstrapTooltip title="Delete data">
                                       <button
                                            className="btn-action"
                                            onClick={() => {
                                                console.log('DELETE CLICK ITEM:', item);
                                                console.log('ARCHIVE ID:', item.id);
                                                setDeleteTargetId(item.id); // 🔥 archive_universal.id
                                                setDeleteTarget(item);
                                                setIsDeleteOpen(true);
                                            }}
                                            >
                                            <IoTrash />
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

        {/* MODAL CONFIRM DELETE  */}
        {isDeleteOpen && (
            <div className="delete-modal-overlay">
                <div className="modal-delete">
                <h3>Delete archive data?</h3>

                <p>
                    This action will <strong>permanently delete</strong> this data.
                    <br />
                    You won’t be able to restore it.
                </p>

                <div className="modal-actions">
                    <button
                    className="btn-cancel"
                    onClick={() => setIsDeleteOpen(false)}
                    disabled={isDeleting}
                    >
                    Cancel
                    </button>

                    <button
                    className="btn-danger"
                    onClick={handleDeleteArchive}
                    disabled={isDeleting}
                    >
                    {isDeleting ? "Deleting..." : "Delete permanently"}
                    </button>
                </div>
                </div>
            </div>
         )}

    </div>
  )
}

export default Archives