const handleAssignBgColorToLabel = async (labelId, bgColorId) => {
    try {
        const data = { bg_color_id: bgColorId };
        await addColorToBgColorLabel(labelId, data);
        showSnackbar('Label background updated successfully', 'success');
        fetchAllLabels(); // refresh label list
    } catch (error) {
        console.error('Failed to assign bg color to label:', error);
        showSnackbar('Failed to update label background', 'error');
    }
};
