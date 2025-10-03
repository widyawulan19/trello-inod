import React from 'react';
import '../style/UI/WorkspaceSummary.css';
import { LiaNetworkWiredSolid } from "react-icons/lia";
import { HiArrowRight } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import { getBoardsWorkspace } from '../services/ApiServices';

const WorkspaceSummary = ({ summaries, loading }) => {
  const navigate = useNavigate();

  const navigateToWorkspacePage = () => {
    navigate('workspaces');
  };

  const navigateToFirstBoard = async (workspaceId) => {
    try {
      const response = await getBoardsWorkspace(workspaceId);
      const boards = response.data;

      if (boards.length > 0) {
        navigate(`workspaces/${workspaceId}`);
      } else {
        alert('No boards found in this workspace.');
      }
    } catch (error) {
      console.error('Error fetching boards:', error);
      alert('Failed to fetch boards for navigation.');
    }
  };



  // ✅ Kondisi loading
  if (loading) return <p>Loading workspace summaries...</p>;

  // ✅ Kondisi jika tidak ada workspace
  if (!summaries || summaries.length === 0) {
    return (
      <div className='no-workspace'>
        <div className="no-icon">
          <LiaNetworkWiredSolid />
        </div>
        <h2>Let’s create your first Workspace!</h2>
        <p>Yuk mulai produktif! Buat workspace pertamamu untuk mengelola project dan kolaborasi tim.</p>
        <div className="btn-create-workspace" onClick={navigateToWorkspacePage}>
          Add New Workspace
        </div>
      </div>
    );
  }

  // ✅ Kondisi ada workspace
  return (
    <div className="summary-container">
      {summaries.map((workspace) => (
        <div key={workspace.workspace_id} className='summary-content'>
          <div className="summary-header">
            <div className="sh-left">
              <h4 
              className="summary-title"
              onClick={() => navigateToFirstBoard(workspace.workspace_id)}
              >{workspace.workspace_name}</h4>
            </div>
            <div
              className='view'
              onClick={() => navigateToFirstBoard(workspace.workspace_id)}
            >
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
