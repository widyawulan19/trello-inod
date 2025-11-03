import React from 'react'
import { Alert } from '@mui/material'
import {AlertTitle} from '@mui/material'
import {Button} from '@mui/material'
import '../style/hook/Alert.css'

const CustomAlert=({severity,title, message, showAlert, onClose})=> {
    if(!showAlert) return null;

  return (
    <div className='alert-container'>
        <Alert severity={severity}>
            <AlertTitle>{title}</AlertTitle>
            {message}
            <Button 
                onClick={onClose}
                color='inherit'
                size='small'
                style={{ position: 'absolute', top: '10px', right: '10px' }}
            >
                Close
            </Button>
        </Alert>
    </div>
  )
}

export default CustomAlert