import React, { useEffect, useState } from 'react'
import { deleteArchiveDataUniversalById, getAllDataArchive } from '../services/ApiServices';
import '../style/pages/Archives.css'
import { HiArchiveBoxArrowDown } from "react-icons/hi2";
import { IoSearchOutline, IoTrash } from 'react-icons/io5';
import { MdOutlineRestore } from "react-icons/md";
import BootstrapTooltip from '../components/Tooltip';
import { handleRestoreArchive } from '../utils/handleRestoreArchive';
import { useSnackbar } from '../context/Snackbar';

const ArchiveUniversal=()=> {
    //STATE
    const [archiveData, setArchiveData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filteredData, setFilteredData] = useState([]);
    const [filterType, setFilterType] = useState('');
    const {showSnackbar} = useSnackbar();



    //FUNCTION
    //1. fetch data archive
    const fetchArchiveData = async() =>{
        setLoading(true);
        try {
          const response = await getAllDataArchive();
          setArchiveData(response.data);
          setFilteredData(response.data);
          setError(null);
        } catch (error) {
          console.error('Error fetching archive data', error);
          setError(error.message);
        } finally {
          setLoading(false);
        }
    }

    useEffect(()=>{
        fetchArchiveData();
    },[])

    //2. fungsi filter data
    const handleFilterChange = (e) => {
        const selectedType = e.target.value.toLowerCase();
        setFilterType(selectedType);   

        if (selectedType === '') {
            setFilteredData(archiveData); // reset
        } else {
            const filtered = archiveData.filter(item =>
                item.entity_type.toLowerCase().includes(selectedType)
            );
            setFilteredData(filtered);
        }
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

   //ACTION BACKGROUND COLOR
  const ENTITY_COLORS={
    workspaces: '#c7e2fe',  // DodgerBlue - menandakan pembaruan atau perubahan
    boards: '#cbffd7',     // Green - untuk penambahan, identik dengan positif
    lists: '#ffc2c8',  // Red - umum digunakan untuk aksi hapus
    cards: '#E3D095',  // Blue - mirip "add" tapi bisa dibedakan sebagai aksi baru
    marketing_design: '#d8d8d8',
    data_marketing:'#f9d4f0',
  }

  //ACTION TEXT
  const TEXT_ENTITY_COLORS={
    workspaces: '#1E90FF',  // DodgerBlue - menandakan pembaruan atau perubahan
    boards: '#28A745',     // Green - untuk penambahan, identik dengan positif
    lists: '#DC3545',  // Red - umum digunakan untuk aksi hapus
    cards: '#4B352A',  // Blue - mirip "add" tapi bisa dibedakan sebagai aksi baru
    marketing_design: '#6C757D',
    data_marketing:'#533B4D',
  }

  return (
    <div className="archive-container">
        <div className="archive-header">
            <div className="ah-left">
                <h2><HiArchiveBoxArrowDown/> Archive Data</h2>
                <div className="header-desc">
                    <strong>
                        Semua Aktivitas Terdokumentasi, Tersimpan dengan Aman
                    </strong>
                    <p>
                        Selamat datang di halaman Arsip Data. Di sini, Anda dapat menelusuri seluruh riwayat aktivitas proyek, mulai dari Workspace, Board, List, Card, hingga detail lengkap dari Data Marketing yang pernah dibuat.
                    </p>
                </div>
            </div>
            <div className="ah-right">
                <div className="search-archive">
                    <IoSearchOutline className='sa-icon'/>
                     <input
                        type="text"
                        placeholder="Search by entity_type (e.g. boards)"
                        value={filterType}
                        onChange={handleFilterChange}
                    />
                </div>
            </div>
        </div>
      

      

     {loading ? (
        <p>Loading...</p>
        ) : (
        <div className="archive-table-container">
            <table className="archive-table">
            <thead>
                <tr>
                    <th style={{borderTopLeftRadius:'8px', textAlign:'center'}}>No</th>
                    <th>Entity ID</th>
                    <th>Entity Type</th>
                    <th>Entity Name</th>
                    <th>Archived At</th>
                    <th style={{borderTopRightRadius:'8px'}}>Action</th>
                </tr>
            </thead>
            <tbody>
                {filteredData.map((item, index) => (
                <tr key={item.id}>
                    <td className="entity-no" style={{borderTopLeftRadius:'8px', borderBottomLeftRadius:'8px'}}>{index + 1}</td>
                    <td className='entity-box'>{item.entity_id}</td>
                    <td>
                        <p style={{
                            backgroundColor:ENTITY_COLORS[item.entity_type],
                            color: TEXT_ENTITY_COLORS[item.entity_type]
                            }}>
                            {item.entity_type}
                        </p>
                    </td>
                    {/* <td className='entity-name'>{item.data?.name || '-'}</td> */}
                    <td>
                        {item.entity_type === 'data_marketing'
                            ? `${item.data.jenis_track || '-'} - ${item.data.buyer_name || '-'} (${item.data.account || '-'}) [${item.data.order_number || '-'}]`
                            : item.entity_type === 'marketing_design'
                            ? `${item.data.style || '-'} - ${item.data.buyer_name || '-'} (${item.data.account || '-'})`
                            : item.entity_type === 'cards'
                            ? `${item.data.title || '-'}`
                            : item.data?.name || '-'}
                    </td>
                    <td>{new Date(item.archived_at).toLocaleString()}</td>
                    <td style={{borderTopRightRadius:'8px', borderBottomRightRadius:'8px'}}>
                        <BootstrapTooltip title='Restore data' placement="top">
                            <button onClick={()=>
                                handleRestoreArchive({
                                    entity: item.entity_type,
                                    id: item.entity_id,
                                    refetch:fetchArchiveData,
                                    showSnackbar,
                                })
                            }>
                                <MdOutlineRestore/>
                            </button>
                        </BootstrapTooltip>
                        <BootstrapTooltip title='Delete data' placement='top'>
                            <button onClick={()=> handleDeleteArchive(item.id)}>
                                <IoTrash/>
                            </button>
                        </BootstrapTooltip>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        )}


    </div>
  );
}

export default ArchiveUniversal