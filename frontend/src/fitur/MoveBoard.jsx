import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWorkspacesByUserId, moveBoardToWorkspace } from '../services/ApiServices';
import '../style/fitur/MoveBoard.css';
import { HiMiniArrowLeftStartOnRectangle, HiOutlineChevronDown, HiOutlineXMark } from 'react-icons/hi2';
import BootstrapTooltip from '../components/Tooltip';
import { useSnackbar } from '../context/Snackbar';

const MoveBoard = ({ boardId, userId, onClose, fetchBoards }) => {
    console.log('Move board berhasil menerima user ID:', userId)
    const [workspaces, setWorkspaces] = useState([]);
    const [selectedWorkspace, setSelectedWorkspace] = useState(null);
    const [showWorkspace, setShowWorkspace] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const {showSnackbar} = useSnackbar()

    useEffect(() => {
        getWorkspacesByUserId(userId)
            .then((res) => {
                setWorkspaces(res.data);
            })
            .catch((err) => console.error('Error fetching workspaces:', err));
    }, [userId]);

    const handleShowWorkspace = () => {
        setShowWorkspace(!showWorkspace);
    };

    const handleMoveBoard = async () => {
        if (!selectedWorkspace) {
            alert('Pilih workspace tujuan!');
            return;
        }

        try {
            const result = await moveBoardToWorkspace(boardId, selectedWorkspace.id);
            showSnackbar('Board berhasil dipindahkan!', 'success')
            navigate(`/workspaces/${selectedWorkspace.id}`);
            fetchBoards(selectedWorkspace.id)
        } catch (err) {
            console.error('Gagal memindahkan board:', err);
            showSnackbar('Gagal memindahkan board', 'error')
        }
    };

    const filteredWorkspaces = workspaces.filter((ws) =>
        ws.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className='move-container'>
            <div className='move-header'>
                <p>SELECT WORKSPACE</p>
                <BootstrapTooltip title='Close' placement='top'>
                    <HiOutlineXMark className='move-icon' onClick={onClose} />
                </BootstrapTooltip>
            </div>
            <div className='move-content'>
                <button className='select-btn' onClick={handleShowWorkspace}>
                    Select Workspace <HiOutlineChevronDown />
                </button>
                <button className='move-btn' onClick={handleMoveBoard} disabled={!selectedWorkspace}>
                    <HiMiniArrowLeftStartOnRectangle className='mb-icon'/>
                    Move Board
                </button>
            </div>

            {/* HiMiniArrowLeftStartOnRectangle */}

            {showWorkspace && (
                <div className='move-content-box'>
                 {/* Pencarian workspace */}
                    <div className='move-search'>
                        <input
                            type='text'
                            placeholder='Search workspaces...'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Daftar workspace */}
                    <ul className='workspace-list-container'>
                        {filteredWorkspaces.length > 0 ? (
                            filteredWorkspaces.map((ws) => (
                                <li
                                    key={ws.id}
                                    className={`workspace-list-item ${selectedWorkspace?.id === ws.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedWorkspace(ws)}
                                >
                                    {ws.name}
                                </li>
                            ))
                        ) : (
                            <li className='wlc-nomove'>No workspaces found</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default MoveBoard;
