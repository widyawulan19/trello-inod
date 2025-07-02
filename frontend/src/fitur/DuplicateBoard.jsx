import React, { useEffect, useState } from 'react';
import { duplicateBoards, getWorkspacesByUserId } from '../services/ApiServices';
import '../style/fitur/DuplicateBoard.css';
import { HiOutlineChevronDown, HiOutlineSquare2Stack, HiOutlineXMark } from 'react-icons/hi2';
import BootstrapTooltip from '../components/Tooltip';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from '../context/Snackbar';

const DuplicateBoard = ({ boardId, userId, onClose, fetchBoards }) => {
    console.log('user Id berhasil diterima pada duplicate board:', userId)
    const [workspaces, setWorkspaces] = useState([]);
    const [selectedWorkspace, setSelectedWorkspace] = useState('');
    const [showWorkspace, setShowWorkspace] = useState(false)
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const {showSnackbar} = useSnackbar()

    const handleShowWorkspace = ()=>{
        setShowWorkspace(!showWorkspace)
    }

    useEffect(() => {
        getWorkspacesByUserId(userId)
            .then((res) => {
                setWorkspaces(res.data);
            })
            .catch((err) => console.error('Error fetching workspaces:', err));
    }, [userId]);

    const handleDuplicateBoard = async () => {
        if (!selectedWorkspace) {
            alert('Pilih workspace tujuan!');
            return;
        }

        try {
            const result = await duplicateBoards(boardId, selectedWorkspace.id);
            // alert('Board berhasil diduplikasi!');
            showSnackbar('Board berhasil diduplikasi!', 'success')
            navigate(`/workspaces/${selectedWorkspace.id}`);
            // fetchBoards(selectedWorkspace.id)
            await fetchBoards(boardId)
        } catch (err) {
            console.error('Error Duplicate board:', err);
            // alert('Gagal menduplikasi board.');
            showSnackbar('Gagal menduplikasi board', 'error')
        }
    };

    const filteredWorkspaces = workspaces.filter((ws) =>
        ws.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className='duplicate-container'>
            <div className="db-header">
                <p>DUPLICATE WORKSPACE</p>
                <BootstrapTooltip title='close' placement='top'>
                    <HiOutlineXMark 
                        className='dbh-icon'
                        onClick={onClose}
                    />
                </BootstrapTooltip>
            </div>

            {/* <h5>SELECT WORKSPACE</h5> */}
    
            <div className="db-content">
                <button className='db-select' onClick={handleShowWorkspace}>
                    Select Workspace
                    <HiOutlineChevronDown/>
                </button>
                <button  className='db-sub' onClick={handleDuplicateBoard} disabled={!selectedWorkspace}>
                    <HiOutlineSquare2Stack/>
                    Duplicate
                </button>
            </div>

            {showWorkspace && (
                <div className='duplicate-box-con'>
                {/* SELECT WORKSPACE  */}
                <div className="duplicate-search">
                    <input
                        type='text'
                        placeholder='Search workspaces...'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <ul className='db-list'>
                    {filteredWorkspaces.length > 0 ? (
                        filteredWorkspaces.map((ws) =>(
                            <li 
                            key={ws.id} 
                            className={`db-item ${selectedWorkspace?.id === ws.id ? 'selected' : ''}`}
                            onClick={() => setSelectedWorkspace(ws)}
                            tabIndex="0"
                        >
                            {ws.name}
                        </li>
                        ))
                    ):(
                        <li>No workspace found</li>
                    )}
                </ul>
                </div>
            )}
        </div>
    );
};

export default DuplicateBoard;
