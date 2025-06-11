import React, { useEffect, useState } from 'react';
import '../style/UI/WorkspaceSummary.css';
import { getWorkspaceSummary, getBoardsWorkspace } from '../services/ApiServices';
import { HiOutlineArrowTopRightOnSquare } from 'react-icons/hi2';
import { HiLink } from 'react-icons/hi';
import BootstrapTooltip from '../components/Tooltip';
import { useNavigate } from 'react-router-dom';

const WorkspaceSummary = ({ userId }) => {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  console.log('Halaman workspace summary menerima userId:', userId);

  useEffect(() => {
    const fetchSummary = async () => {
      console.log('Fetching summary for userId:', userId);

      if (!userId) {
        console.warn('userId belum ada, fetch dibatalkan');
        return;
      }

     try {
        const response = await getWorkspaceSummary(userId);
        console.log('Hasil summary:', response.data);
        setSummaries(response.data); // langsung data array, bukan response.data.data
      } catch (error) {
        console.error('Gagal fetch summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [userId]);

  if (loading) return <p className="summary-loading">Loading workspace summaries...</p>;

  const navigateToFirstBoard = async (workspaceId) => {
    try {
      const response = await getBoardsWorkspace(workspaceId);
      const boards = response.data;

      if (boards.length > 0) {
        const firstBoardId = boards[0].id;
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
      {Array.isArray(summaries) && summaries.map((workspace) => (
        <div className="sec-body" key={workspace.workspace_id}>
          <div className="item-header">
            <h4 className="summary-title">{workspace.workspace_name}</h4>
            <div className="summary-btn">
              <BootstrapTooltip title='Open in new tab' placement='top'>
                <button onClick={() => navigateToFirstBoard(workspace.workspace_id)}>
                  <HiOutlineArrowTopRightOnSquare />
                </button>
              </BootstrapTooltip>
              <BootstrapTooltip title='Get link' placement='top'>
                <button>
                  <HiLink />
                </button>
              </BootstrapTooltip>
            </div>
          </div>

          <div className="item-left">
            <div className="sc-p">
              <button>🧩 Boards: {workspace.board_count}</button>
              <button>📑 Lists: {workspace.list_count}</button>
              <button>🗂️ Cards: {workspace.card_count}</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorkspaceSummary;
