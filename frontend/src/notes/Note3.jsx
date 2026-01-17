const [showRestoreModal, setShowRestoreModal] = useState(false);
const [restoreTarget, setRestoreTarget] = useState(null);


const openRestoreModal = (item) => {
  setRestoreTarget(item);
  setShowRestoreModal(true);
};

const closeRestoreModal = () => {
  setShowRestoreModal(false);
  setRestoreTarget(null);
};

const confirmRestore = async () => {
  if (!restoreTarget) return;

  await handleRestoreArchive({
    entity: restoreTarget.entity_type,
    id: restoreTarget.entity_id,
    refetch: fetchArchiveData,
    showSnackbar,
  });

  closeRestoreModal();
};


