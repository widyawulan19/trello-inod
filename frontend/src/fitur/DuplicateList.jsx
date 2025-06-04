import React, {useEffect, useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { duplicateList, getBoardsWorkspace, getWorkspacesByUserId } from '../services/ApiServices'
import BootstrapTooltip from '../components/Tooltip'
import { HiOutlineChevronDown, HiOutlineSquare2Stack, HiOutlineXMark } from 'react-icons/hi2'
import '../style/fitur/DuplicateList.css'
import { useSnackbar } from '../context/Snackbar'

const DuplicateList=({boardId, userId, onClose, listId})=> {
    // STATE 
    console.log('User Id diterima di file duplicate list:',userId)
    const [workspaces, setWorkspaces] = useState([])
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null)
    const [selectedBoardId, setSelectedBoardId] = useState(null);
    const [filterBoards, setFilterBoards] = useState([]);
    const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false)
    const [showBoardDropdown, setShowBoardDropdown] = useState(false)
    const [isDuplicate, setIsDuplicate] = useState(false)
    const navigate = useNavigate();
    //alert
    const {showSnackbar} = useSnackbar();

    //FUNCTION
    //1. fetch workspace data
    useEffect(()=>{
        const fetchWorkspace = async()=>{
            try{
                 const response = await getWorkspacesByUserId(userId);
                 setWorkspaces(response.data)
            }catch(error){
                console.error('Error fetching workspace data:', error)
            }
        };
        if(userId){
            fetchWorkspace()
        }
    },[userId]);

    //2. handle workspace selected
    const handleWorkspaceChange = async(workspaceId)=>{
        if(!workspaceId) return;

        setSelectedWorkspaceId(workspaceId)
        setSelectedBoardId(null);

        try{
            const response = await getBoardsWorkspace(workspaceId)
            setFilterBoards(response.data)
        }catch(error){
            console.error('Error fetching board by workspace:', error)
        }
    }

    //3. handle duplicate list
    const handleDuplicateList = async()=>{
        if(!selectedBoardId){
            alert('Please select a board')
            return;
        }
        setIsDuplicate(true);
        try{
            await duplicateList(listId, {newBoardId : selectedBoardId})
            // alert('List duplicated successfully!');
            showSnackbar('List duplicated successfully!', 'success');
            onClose();
            navigate(`/workspaces/${selectedWorkspaceId}/board/${selectedBoardId}`);
        }catch (error) {
            console.error('Error duplicate list:', error);
            showSnackbar('Failed to duplicate the list. Please try again.', 'error');
            // alert('Failed to duplicate the list. Please try again.');
        } finally {
            setIsDuplicate(false);
        }
    }

  return (
    <div className='dl-container'>
        <div className="dl-header">
            <p>Duplicate List</p>
            <BootstrapTooltip title='Close' placement='top'>
                <HiOutlineXMark className='dl-close' onClick={onClose}/>
            </BootstrapTooltip>
        </div>
        <div className="dl-body">
            <div className="dl-workspace">
                <label>Choose Workspace</label>
                <div className="dlw-dropdown" onClick={()=> setShowWorkspaceDropdown(!showWorkspaceDropdown)}>
                    <button className='dlw-btn'>
                        {selectedWorkspaceId ? workspaces.find(workspace => workspace.id === selectedWorkspaceId)?.name :'Select a workspace'}
                        <HiOutlineChevronDown className='dlw-icon'/>
                    </button>
                    {showWorkspaceDropdown && (
                        <ul className='dlw-menu'>
                            {workspaces.map((workspace)=>(
                                <li key={workspace.id} onClick={()=> handleWorkspaceChange(workspace.id)} className='dlw-item'>
                                    {workspace.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* HiOutlineSquare2Stack */}
            {selectedWorkspaceId && (
                <div className="dl-select-board">
                    <label>Choose Board</label>
                    <div className="dlb-dropdown" onClick={()=> setShowBoardDropdown(!showBoardDropdown)}>
                        <button className='dlb-btn'>
                            {selectedBoardId ? filterBoards.find(board => board.id === selectedBoardId)?.name :'Select a board'}
                            <HiOutlineChevronDown className='dlw-icon'/>
                        </button>
                        {showBoardDropdown && (
                            <ul className='dlb-menu'>
                                {filterBoards.map((board)=>(
                                    <li key={board.id} onClick={()=> setSelectedBoardId(board.id)} className='dlb-item'>
                                    {board.name}
                                </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}

            <div className="div-btn">
                <button className='dl-move-btn' onClick={handleDuplicateList} disabled={isDuplicate}>
                    <HiOutlineSquare2Stack className='dlm-icon'/>
                    {isDuplicate ? 'Duplicating...':'Duplicate List'}
                </button>
            </div>
            
        </div>
    </div>
  )
}

export default DuplicateList


// import React, { useEffect, useState } from 'react'
// import { getBoards, duplicateList } from '../services/ApiServices';
// import { HiOutlineArrowRight, HiOutlineChevronDown, HiOutlineSquare2Stack, HiOutlineXMark } from 'react-icons/hi2';
// import BootstrapTooltip from '../components/Tooltip';
// import '../style/fitur/DuplicateList.css'
// import { useNavigate } from 'react-router-dom';

// const DuplicateList=({listId, workspaceId, onClose, userId})=> {
//     //STATE
//     const [boards, setBoards] = useState([]); // State untuk menyimpan data boards
//     const [selectedBoard, setSelectedBoard] = useState(null); // State untuk board yang dipilih
//     const [showBoardList, setShowBoardList] = useState(false);
//     const [searchQuery, setSearchQuery] = useState('');
//     const navigate = useNavigate()

//     //FUNCTION
//     const handleShowBoard = () =>{
//         setShowBoardList(!showBoardList)
//     }

//     useEffect(() => {
//         getBoards()
//             .then((res) => {
//                 setBoards(res.data); // Menyimpan data boards ke dalam state
//             })
//             .catch((err) => {
//                 console.error('Error fetching boards:', err);
//             });
//     }, []);

//     const handleDuplicateList = async () => {
//         if (!listId) {
//             console.error('❌ ERROR: listId tidak ditemukan!');
//             alert('List ID tidak ditemukan!');
//             return;
//         }
    
//         console.log('✅ listId:', listId);
//         console.log('✅ newBoardId yang dikirim:', selectedBoard.id); // 🔴 Pastikan ini benar
    
//         try {
//             const result = await duplicateList(listId, { newBoardId: selectedBoard.id }); // 🔴 Gunakan `newBoardId`
//             console.log('✅ API Response:', result.data); // 🔍 Cek respons API
    
//             if (!result.data || !result.data.duplicatedListId) {
//                 console.error('❌ API tidak mengembalikan duplicatedListId');
//                 alert('Terjadi kesalahan, list tidak berhasil diduplikasi.');
//                 return;
//             }
    
//             console.log('✅ Duplicated List ID:', result.data.duplicatedListId);
//             alert('List berhasil diduplikasi!');
//             // Redirect ke board yang dituju
//             navigate(`/workspaces/${workspaceId}/board/${selectedBoard.id}`);
//         } catch (error) {
//             console.error('❌ ERROR duplicating list:', error.response?.data || error.message);
//             alert('Gagal menduplikasi list!');
//         }
//     };
    
//     // http://localhost:3000/workspaces/62/board/106

//     //fungsi filter
//     const filteredBoards = boards.filter((board)=>
//         board.name.toLowerCase().includes(searchQuery.toLowerCase())
//     )

//   return(
//     <div className="dp-container">
//         <div className="dp-header">
//             <p>DUPLICATE LISTS</p>
//             <BootstrapTooltip title='close' placement='top'>
//                 <HiOutlineXMark
//                     className='dp-icon'
//                     onClick={onClose}
//                 />
//             </BootstrapTooltip>
            
//         </div>
//         <div className="dp-content">
//             <button className='select-btn' onClick={handleShowBoard}>Select <HiOutlineChevronDown/></button>
//             <button className='sub-btn' onClick={()=>handleDuplicateList(listId,selectedBoard.id)} disabled={!selectedBoard}>
//                 Duplicate 
//                 <HiOutlineSquare2Stack/>
//             </button>
//         </div>

//         {/* Search input  */}
//         <div className="search-container">
//             <input
//                 type="text"
//                 placeholder="Search boards..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)} // Update searchQuery saat input berubah
//             />
//         </div>
//         {showBoardList && (
//                 <ul className='board-list' onClick={() => console.log("Board list clicked")}>
//                     {filteredBoards.length > 0 ? (
//                         filteredBoards.map((board) => (
//                             <li 
//                                 key={board.id} 
//                                 className={`board-item ${selectedBoard?.id === board.id ? 'selected' : ''}`}
//                                 // onClick={() => setSelectedBoard(board)}
//                                 // tabIndex="0"
//                                 onClick={() => {
//                                     console.log('Board selected:', board.id);
//                                     setSelectedBoard(board);
//                                 }}
//                                 style={{cursor:'pointer'}}
//                                 role='button'
//                             >
//                                 {board.name}
//                             </li>
//                         ))
//                     ) : (
//                         <li>No boards found</li> // Menampilkan pesan jika tidak ada board yang ditemukan
//                     )}
//                 </ul>
//             )}
//     </div>
//   )
// }

// export default DuplicateList