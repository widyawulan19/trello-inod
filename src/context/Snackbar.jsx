// context/SnackbarContext.js
import React, { createContext, useContext, useState } from 'react';
import CustomSnackbar from '../components/CustomSnackbar';

const Snackbar = createContext();

export const SnackbarProvider = ({ children }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const closeSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Snackbar.Provider value={{ showSnackbar }}>
      {children}
      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        handleClose={closeSnackbar}
      />
    </Snackbar.Provider>
  );
};

export const useSnackbar = () => useContext(Snackbar);
