import { archiveData } from '../services/ApiServices';

export const handleArchive = async ({ entity, id, userId, refetch, showSnackbar }) => {
  try {
    await archiveData(entity, id, userId);
    showSnackbar(`Successfully archived ${entity}`, 'success');
    if (refetch) refetch();
  } catch (error) {
    console.error(`Failed to archive ${entity}:`, error);
    showSnackbar(`Failed to archive ${entity}`, 'error');
  }
};
