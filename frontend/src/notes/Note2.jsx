const [deleteTargetId, setDeleteTargetId] = useState(null);
const [isDeleteOpen, setIsDeleteOpen] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);

// FUNGSI 
const handleDeleteArchive = async () => {
  if (!deleteTargetId) return;

  try {
    setIsDeleting(true);
    await deleteArchiveDataUniversalById(deleteTargetId);
    showSnackbar("Archive data deleted permanently 🗑️", "success");
    fetchArchiveData();
  } catch (error) {
    console.log("Failed to delete archive data:", error);
    showSnackbar("Failed to delete archive data", "error");
  } finally {
    setIsDeleting(false);
    setIsDeleteOpen(false);
    setDeleteTargetId(null);
  }
};


// BUTTON TRIGGER 
<button
  className="btn-delete"
  onClick={() => {
    setDeleteTargetId(row.id);
    setIsDeleteOpen(true);
  }}
>
  Delete
</button>

// MODAL CONFIRM 
{isDeleteOpen && (
  <div className="modal-overlay">
    <div className="modal">
      <h3>Delete archive data?</h3>

      <p>
        This action will <strong>permanently delete</strong> this data.
        <br />
        You won’t be able to restore it.
      </p>

      <div className="modal-actions">
        <button
          className="btn-cancel"
          onClick={() => setIsDeleteOpen(false)}
          disabled={isDeleting}
        >
          Cancel
        </button>

        <button
          className="btn-danger"
          onClick={handleDeleteArchive}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete permanently"}
        </button>
      </div>
    </div>
  </div>
)}
