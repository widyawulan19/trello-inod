import React, { useEffect, useState } from 'react';
import '../style/UI/WorkspaceSummary.css'
import { getWorkspaceSummary, getBoardsByWorkspaceId, getBoardsWorkspace } from '../services/ApiServices';
import { RxDragHandleDots2 } from 'react-icons/rx';
import { HiOutlineArrowTopRightOnSquare } from 'react-icons/hi2';
import { HiLink } from 'react-icons/hi';
import BootstrapTooltip from '../components/Tooltip';
import { useNavigate } from 'react-router-dom';

const WorkspaceSummary = ({ userId }) => {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        if(userId) return ;
        const response = await getWorkspaceSummary(userId);
        setSummaries(response.data);
      } catch (error) {
        console.error('Error fetching workspace summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [userId]);

  if (loading) return <p className="summary-loading">Loading workspace summaries...</p>;

  // Navigate to first board in the workspace
  const navigateToFirstBoard = async (workspaceId) => {
    try {
      const response = await getBoardsWorkspace(workspaceId);
      const boards = response.data;

      if (boards.length > 0) {
        const firstBoardId = boards[0].id;
        // navigate(`/workspaces/${workspaceId}/board/${firstBoardId}`);
        navigate(`/workspaces/${workspaceId}`);
      } else {
        alert('No boards found in this workspace.');
      }
    } catch (error) {
      console.error('Error fetching boards:', error);
      alert('Failed to fetch boards for navigation.');
    }
  };

  return (
    <div className="summary-container">
      {summaries.map((workspace) => (
        <div className="sec-body" key={workspace.workspace_id}>
          <div className='sec-item'>
            <div className="item-left">
              <RxDragHandleDots2 size={17} />
              <div className="sc-content">
                <h4 className="summary-title">{workspace.workspace_name}</h4>
                <div className="sc-p">
                  <button>🧩 Boards: {workspace.board_count}</button>
                  <button>📑 Lists: {workspace.list_count}</button>
                  <button>🗂️ Cards: {workspace.card_count}</button>
                </div>
              </div>
            </div>
            <div className="item-right">
              <BootstrapTooltip title='Open in new tab' placement='top'>
                <button onClick={() => navigateToFirstBoard(workspace.workspace_id)}>
                    <HiOutlineArrowTopRightOnSquare/>
                </button>
              </BootstrapTooltip>
              <BootstrapTooltip title='Get link' placement='top'>
                <button>
                  <HiLink/>
                </button>
              </BootstrapTooltip>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorkspaceSummary;
