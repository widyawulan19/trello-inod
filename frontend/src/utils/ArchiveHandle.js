import { archiveData } from '../services/ApiServices';

export const ArchiveHandle = async ({ entity, id, refetch, showSnackbar }) => {
  try {
    await archiveData(entity, id);
    showSnackbar(`Successfully archived ${entity}`, 'success');
    if (refetch) refetch(); // optional refresh
  } catch (error) {
    console.error(`Failed to archive ${entity}:`, error);
    showSnackbar(`Failed to archive ${entity}`, 'error');
  }
};
