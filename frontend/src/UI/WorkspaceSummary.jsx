import React, { useEffect, useState } from 'react';
import '../style/UI/WorkspaceSummary.css';
import { GoDotFill } from "react-icons/go";
import { getWorkspaceSummary, getBoardsWorkspace } from '../services/ApiServices';
import { HiArrowRight } from 'react-icons/hi2';
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
        setLoading(false);
        return;
      }

      try {
        const response = await getWorkspaceSummary(userId);
        console.log('Hasil summary:', response.data);
        setSummaries(response.data);
      } catch (error) {
        console.error('Gagal fetch summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [userId]);

  const navigateToWorkspacePage = () => {
    navigate('workspaces');
  };

  const navigateToFirstBoard = async (workspaceId) => {
    try {
      const response = await getBoardsWorkspace(workspaceId);
      const boards = response.data;

      if (boards.length > 0) {
        navigate(`/workspaces/${workspaceId}`);
      } else {
        alert('No boards found in this workspace.');
      }
    } catch (error) {
      console.error('Error fetching boards:', error);
      alert('Failed to fetch boards for navigation.');
    }
  };

  if (loading) return <p>Loading workspace summaries...</p>;

  if (!summaries || summaries.length === 0) {
    return (
      <div className='no-workspace'>
        <h2>Belum Ada Workspace</h2>
        <p>Yuk mulai produktif! Buat workspace pertamamu untuk mengelola project dan kolaborasi tim.</p>
        <div className="btn-create-workspace" onClick={navigateToWorkspacePage}>
           Add New Workspace
        </div>
      </div>
    );
  }

  return (
    <div className="summary-container">
      {Array.isArray(summaries) && summaries.map((workspace) => (
        <div key={workspace.workspace_id} className='summary-content'>
          <div className="summary-header">
            <div className="sh-left">
              <h4 className="summary-title">{workspace.workspace_name}</h4>
            </div>
            <div className='view' onClick={() => navigateToFirstBoard(workspace.workspace_id)}>
              VIEW <HiArrowRight />
            </div>
          </div>
          <div className="summary-body">
            <div className="sb1">📋 Boards : {workspace.board_count}</div>
            <div className="sb1">📝 Lists : {workspace.list_count}</div>
            <div className="sb1">🗂️ Cards : {workspace.card_count}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorkspaceSummary;
