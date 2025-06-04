import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const CustomSnackbar = ({ open, handleClose, message, severity }) => {
  // Warna border berdasarkan severity
  const borderColor = {
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
  };

  const shadowColor = borderColor[severity] || '#ccc';

  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        sx={{
          width: '100%',
          border: `0.5px solid ${borderColor[severity] || '#ccc'}`,
          borderRadius:'12px',
          boxShadow: `0 4px 8px ${shadowColor}4D`, // tambahkan transparansi (50%)
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default CustomSnackbar;
