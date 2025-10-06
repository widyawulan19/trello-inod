import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { getBoardsWorkspace, getWorkspacesByUserId, moveListToBoard } from '../services/ApiServices';
import BootstrapTooltip from '../components/Tooltip';
import { HiMiniArrowLeftStartOnRectangle, HiOutlineChevronDown, HiOutlineXMark } from 'react-icons/hi2';
import '../style/fitur/MoveList.css'
import { useSnackbar } from '../context/Snackbar';

const MoveList = ({ boardId, userId, onClose, listId ,fetchLists,fetchCardList}) => {
    // STATE
    console.log("user Id diterima pada halaman move list :", userId)
    const [workspaces, setWorkspaces] = useState([]);
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);
    const [selectedBoardId, setSelectedBoardId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [filterBoards, setFilterBoards] = useState([]);
    const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
    const [showBoardDropdown, setShowBoardDropdown] = useState(false);
    const [isMoving, setIsMoving] = useState(false)
    const navigate = useNavigate();
    const {showSnackbar} = useSnackbar()

    // Fetch workspaces
    useEffect(() => {
        const fetchWorkspace = async () => {
            try {
                const response = await getWorkspacesByUserId(userId);
                setWorkspaces(response.data);
            } catch (error) {
                console.error('Error fetching workspace data:', error);
            }
        };

        if (userId) {
            fetchWorkspace();
        }
    }, [userId]);

    // Handle workspace selection
    const handleWorkspaceChange = async (workspaceId) => {
        if (!workspaceId) return;

        setSelectedWorkspaceId(workspaceId);
        setSelectedBoardId(null);

        try {
            const response = await getBoardsWorkspace(workspaceId);
            setFilterBoards(response.data);
        } catch (error) {
            console.error('Error fetching board by workspace:', error);
        }
    };

    //handle move lists
    const handleMoveList = async() =>{
        if(!selectedBoardId){
            alert("Pilih Board terlebih dahulu")
            return;
        }
        setIsMoving(true);
        try {
            await moveListToBoard(listId, { newBoardId: selectedBoardId });
            // alert('List moved successfully!');
            showSnackbar('List moved successfully!', 'success')
            onClose();
            navigate(`/layout/workspaces/${selectedWorkspaceId}/board/${selectedBoardId}`);
            fetchCardList()
        } catch (error) {
            console.error('Error moving list:', error);
            showSnackbar('Failed to move the list. Please try again', 'error')
            // alert('Failed to move the list. Please try again.');
        } finally {
            setIsMoving(false);
        }
    }

    return (
        <div className='ml-container'>
            <div className="ml-head">
                <div className="head-left">
                    <div className="move-icon">
                        <HiMiniArrowLeftStartOnRectangle className='mini-icon'/>
                    </div>
                    <p>Move List</p>
                </div>
                
                <div className="head-right">
                    <BootstrapTooltip title="Close" placement='top'>
                        <HiOutlineXMark className='ml-close' onClick={onClose}/>
                    </BootstrapTooltip>
                </div>
            </div>
            
            <div className="ml-body">
                <div className="ml-workspace">
                    <label>Choose Workspace</label>
                    <div className="mlw-dropdown" onClick={() => setShowWorkspaceDropdown(!showWorkspaceDropdown)}>
                        <button className='mlw-btn'>
                            {selectedWorkspaceId ? workspaces.find(workspace => workspace.id === selectedWorkspaceId)?.name : "Select a workspace"}
                            <HiOutlineChevronDown className='mlw-icon' />
                        </button>
                        {showWorkspaceDropdown && (
                            <ul className='mlw-menu'>
                                {workspaces.map((workspace) => (
                                    <li key={workspace.id} onClick={() => handleWorkspaceChange(workspace.id)} className='mlw-item'>
                                        {workspace.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {selectedWorkspaceId && (
                    <div className="ml-select-board">
                        <label>Choose Board</label>
                        <div className="ml-board-dropdown" onClick={()=> setShowBoardDropdown(!showBoardDropdown)}>
                            <button className='ml-board-btn'>
                                {selectedBoardId ? filterBoards.find(board => board.id === selectedBoardId)?.name : "Select a board"}
                                <HiOutlineChevronDown className='mlw-icon'/>
                            </button>
                            {showBoardDropdown && (
                                <ul className='mlb-menu'>
                                    {filterBoards.map((board)=>(
                                        <li key={board.id} onClick={()=> setSelectedBoardId(board.id)} className='mlb-item'>
                                            {board.name}
                                        </li>
                                    ))}
                                </ul>
                            )}

                        </div>
                    </div>
                )}

                <div className="div-btn">
                    <button className='ml-move-btn' onClick={handleMoveList} disabled={isMoving}>
                        <HiMiniArrowLeftStartOnRectangle className='ml-icon'/>
                        {isMoving ? 'Moving...' : 'Move List'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MoveList;
