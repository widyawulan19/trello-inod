import { useState } from "react";
import '../style/modules/FormNewList.css'
import { createLists } from '../services/ApiServices'; // Sesuaikan dengan path API service
import { HiOutlinePlus } from "react-icons/hi2";

const FormNewLists = ({ boardId, onListCreated }) => {
    const [listName, setListName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!listName.trim()) {
            setError("List name cannot be empty.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await createLists(boardId, listName);
            onListCreated(response.data); // Memperbarui UI setelah berhasil
            setListName("");
        } catch (err) {
            setError("Failed to create list.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-list-container">    
            <form onSubmit={handleSubmit} >
                <input
                    type="text"
                    value={listName}
                    onChange={(e) => setListName(e.target.value)}
                    placeholder="Enter list name..."
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
                <button
                    type="submit"
                    disabled={loading}
                >
                    <HiOutlinePlus/>
                    {loading ? "Creating..." : "Add List"}
                </button>
            </form>
        </div>
    );
};

export default FormNewLists;
