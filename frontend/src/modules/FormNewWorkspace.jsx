import { useState } from "react";
import { createWorkspaceUser } from '../services/ApiServices'
import { useNavigate } from "react-router-dom";
import '../style/pages/Workspace.css'
import { HiOutlineSquaresPlus, HiOutlineXMark, HiXMark } from "react-icons/hi2";
import BootstrapTooltip from "../components/Tooltip";
import { useSnackbar } from "../context/Snackbar";

const FormNewWorkspace = ({ userId,fetchWorkspaceUser, onCloseForm }) => {
    console.log('user id diterima pada file form new workspace:', userId)
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const {showSnackbar} = useSnackbar()

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const workspaceData = {
            name,
            description,
            userId,
            role: "admin", // Default role
        };

        try {
            await createWorkspaceUser(workspaceData);
            // alert("Workspace created successfully!");
            showSnackbar('Workspace created successfully!', 'success')
            fetchWorkspaceUser?.();
            onCloseForm()
            // navigate("/workspaces"); 
        } catch (err) {
            // setError(err.response?.data?.error || "Failed to create workspace");
            showSnackbar('Failed to create workspace', 'error')
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-workspace-container">
            <div className="cwc-header">
                <h4>
                    <div className="cwch-icon">
                        <HiOutlineSquaresPlus/>
                    </div>
                    Create new workspace
                </h4>
                <BootstrapTooltip title='Close Form' placement='top'>
                    <HiXMark  className='cwc-icon' onClick={onCloseForm} />
                </BootstrapTooltip>
            </div>
           
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit} className="form-workspace">
                <div className="box-form-name">
                    <label style={{fontSize:'12px', color:'#333', fontWeight:'bold'}}>Workspace Name: <span style={{color:'red'}}>*</span></label>
                    <input
                        type="text"
                        value={name}
                        placeholder="Enter workspace title"
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="box-form">
                    <label>Description: <span style={{color:'red'}}>*</span></label>
                    <textarea
                        value={description}
                        placeholder="Enter workspace description"
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>
                <div className="workspace-btn-form">
                    <button type="submit" disabled={loading}>
                        {loading ? "Creating..." : "CREATE"}
                    </button>
                </div>
               
            </form>
        </div>
    );
};

export default FormNewWorkspace;
