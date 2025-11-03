import { restoreDataArchive } from "../services/ApiServices";

export const handleRestoreArchive = async ({ entity, id, refetch, showSnackbar }) => {
  try {
    await restoreDataArchive(entity, id);
    showSnackbar(`Successfully restored ${entity}`, 'success');
    if (refetch) refetch(); // untuk refresh data jika perlu
  } catch (error) {
    console.error(`Failed to restore ${entity}:`, error);
    showSnackbar(`Failed to restore ${entity}`, 'error');
  }
};
