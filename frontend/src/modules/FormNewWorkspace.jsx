import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Services
import { createWorkspaceUser } from "../services/ApiServices";

// Context
import { useSnackbar } from "../context/Snackbar";

// Components
import BootstrapTooltip from "../components/Tooltip";

// Icons
import { HiSquaresPlus, HiXMark } from "react-icons/hi2";

// Styles
import "../style/pages/Workspace.css";

const FormNewWorkspace = ({ userId, fetchWorkspaceUser, onCloseForm }) => {
  /* =========================
   * STATE
   * ========================= */
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* =========================
   * HOOKS
   * ========================= */
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  /* =========================
   * HANDLERS
   * ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const workspaceData = {
      name,
      description,
      userId,
      role: "admin", // default role
    };

    try {
      await createWorkspaceUser(workspaceData);

      showSnackbar("Workspace created successfully!", "success");
      fetchWorkspaceUser?.();
      onCloseForm();
    } catch (err) {
      setError("Failed to create workspace");
      showSnackbar("Failed to create workspace", "error");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
   * RENDER
   * ========================= */
  return (
    <div className="create-workspace-container">
      {/* Header */}
      <div className="cwc-header">
        <h4>
          <span className="cwch-icon">
            <HiSquaresPlus />
          </span>
          Create new workspace
        </h4>

        <BootstrapTooltip title="Close Form" placement="top">
          <HiXMark className="cwc-icon" onClick={onCloseForm} />
        </BootstrapTooltip>
      </div>

      {/* Error */}
      {error && <p className="error">{error}</p>}

      {/* Form */}
      <form onSubmit={handleSubmit} className="form-workspace">
        <div className="box-form-name">
          <label>
            Workspace Name <span className="required">*</span>
          </label>
          <input
            type="text"
            value={name}
            placeholder="Enter workspace title"
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="box-form">
          <label>Description</label>
          <textarea
            value={description}
            placeholder="Enter workspace description"
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="workspace-btn-form">
          <button type="submit" disabled={loading}>
            {loading ? "CREATING..." : "CREATE WORKSPACE"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormNewWorkspace;
