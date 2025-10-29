import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { duplicateList, getBoardsWorkspace, getWorkspacesByUserId } from '../services/ApiServices';
import BootstrapTooltip from '../components/Tooltip';
import { HiOutlineChevronDown, HiOutlineSquare2Stack, HiOutlineXMark } from 'react-icons/hi2';
import '../style/fitur/DuplicateList.css';
import { useSnackbar } from '../context/Snackbar';
import { useUser } from '../context/UserContext';

const DuplicateList = ({ boardId, onClose, listId }) => {
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [filterBoards, setFilterBoards] = useState([]);
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
  const [showBoardDropdown, setShowBoardDropdown] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const {user} = useUser()
  const userId = user?.id;

  // 🧭 Fetch workspaces for user
  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const response = await getWorkspacesByUserId(userId);
        setWorkspaces(response.data);
      } catch (error) {
        console.error('Error fetching workspace data:', error);
      }
    };
    if (userId) fetchWorkspace();
  }, [userId]);

  // 🧭 When workspace is selected, fetch its boards
  const handleWorkspaceChange = async (workspaceId) => {
    if (!workspaceId) return;

    setSelectedWorkspaceId(workspaceId);
    setSelectedBoardId(null);

    try {
        // ✅ Sesuaikan: panggil getBoardsWorkspace dengan workspaceId dan userId
        const data = await getBoardsWorkspace(workspaceId, userId);
        console.log("Boards yang ditemukan:", data);
        setFilterBoards(data);
    } catch (error) {
      console.error('Error fetching board by workspace:', error);
    }
  };

  // 🧩 Handle duplicate list
  const handleDuplicateList = async () => {
    if (!selectedBoardId) {
      alert('Please select a board first!');
      return;
    }
    setIsDuplicate(true);

    try {
      const res = await duplicateList(listId, { newBoardId: selectedBoardId });

      // ✅ anggap berhasil untuk 200–299
      if (res?.status >= 200 && res?.status < 300) {
        showSnackbar('List duplicated successfully!', 'success');
        onClose();
        // navigate(`/layout/workspaces/${selectedWorkspaceId}/board/${selectedBoardId}`);
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (error) {
      console.error('Error duplicating list:', error);
      showSnackbar('Failed to duplicate the list. Please try again.', 'error');
    } finally {
      setIsDuplicate(false);
    }
  };

  return (
    <div className='dl-container'>
      <div className='dl-header'>
        <div className='dl-left'>
          <div className='dl-icon'>
            <HiOutlineSquare2Stack className='mini-icon' />
          </div>
          <p>Duplicate List</p>
        </div>
        <div className='dl-right'>
          <BootstrapTooltip title='Close' placement='top'>
            <HiOutlineXMark className='dl-close' onClick={onClose} />
          </BootstrapTooltip>
        </div>
      </div>

      <div className='dl-body'>
        {/* Select Workspace */}
        <div className='dl-workspace'>
          <label>Choose Workspace</label>
          <div
            className='dlw-dropdown'
            onClick={() => setShowWorkspaceDropdown(!showWorkspaceDropdown)}
          >
            <button className='dlw-btn'>
              {selectedWorkspaceId
                ? workspaces.find((workspace) => workspace.id === selectedWorkspaceId)?.name
                : 'Select a workspace'}
              <HiOutlineChevronDown className='dlw-icon' />
            </button>
            {showWorkspaceDropdown && (
              <ul className='dlw-menu'>
                {workspaces.map((workspace) => (
                  <li
                    key={workspace.id}
                    onClick={() => handleWorkspaceChange(workspace.id)}
                    className='dlw-item'
                  >
                    {workspace.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Select Board */}
        {selectedWorkspaceId && (
          <div className='dl-select-board'>
            <label>Choose Board</label>
            <div
              className='dlb-dropdown'
              onClick={() => setShowBoardDropdown(!showBoardDropdown)}
            >
              <button className='dlb-btn'>
                {selectedBoardId
                  ? filterBoards.find((board) => board.id === selectedBoardId)?.name
                  : 'Select a board'}
                <HiOutlineChevronDown className='dlw-icon' />
              </button>
              {showBoardDropdown && (
                <ul className='dlb-menu'>
                  {filterBoards.map((board) => (
                    <li
                      key={board.id}
                      onClick={() => setSelectedBoardId(board.id)}
                      className='dlb-item'
                    >
                      {board.name}
                    </li>
                  ))}
                  {/* {Array.isArray(filterBoards) && filterBoards.length > 0 ? (
                    <ul className="mlb-menu">
                        {filterBoards.map((board) => (
                        <li key={board.id} onClick={() => setSelectedBoardId(board.id)} className="mlb-item">
                            {board.name}
                        </li>
                        ))}
                    </ul>
                    ) : (
                    <p className="mlb-empty">No boards found in this workspace</p>
                    )} */}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Duplicate button */}
        <div className='div-btn'>
          <button
            className='dl-move-btn'
            onClick={handleDuplicateList}
            disabled={isDuplicate}
          >
            <HiOutlineSquare2Stack className='dlm-icon' />
            {isDuplicate ? 'Duplicating...' : 'Duplicate List'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DuplicateList;
