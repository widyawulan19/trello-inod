import React, { useEffect, useState } from 'react'
import { getMarketingMusicCounter, updateMarketingMusicCounter } from '../services/ApiServices';
import { useSnackbar } from '../context/Snackbar';
import '../style/fitur/ResetCounter.css';
import { FaXmark } from 'react-icons/fa6';
import { MdLockReset } from 'react-icons/md';

const ResetCounter=({onClose})=> {
    // state 
    const [counter, setCounter] = useState(null);
    const [orderNumber, setOrderNumber] = useState('');
    const [projectNumber, setProjectNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const {showSnackbar} = useSnackbar();

    // function. 
    useEffect(()=>{
        fetchCounterMusik();
    },[])

    //1.function fetch counter
    const fetchCounterMusik = async()=>{
        setLoading(true);
        try{
            const data = await getMarketingMusicCounter();
            setCounter(data);
            setOrderNumber(data.current_order_number);
            setProjectNumber(data.current_project_number);
        }catch(error){
            console.error(error);
            showSnackbar('Gagal memuat data counter 😢', 'error');
        }finally{
            setLoading(false);
        }
    };

    //2. handle update counter
    const handleUpdateCounter = async () =>{
        if(!orderNumber || !projectNumber){
            return showSnackbar('Isi dulu semua kolom ya bestie 😚', 'warning');
        }
        setLoading(true);
        try{
            const result = await updateMarketingMusicCounter({
                current_order_number: Number(orderNumber),
                current_project_number: Number(projectNumber),
            });
            showSnackbar(result.message || 'Counter berhasil diupdate ✅', 'success');
            setCounter(result.data);
        }catch(error){
            console.error(error);
            showSnackbar('Gagal update counter 😭', 'error');
        }finally{
            setLoading(false);
        }
    }

  return (
    <div className='counter-card'>
        <div className="counter-header">
            <h2 className='title'><MdLockReset style={{marginRight:'5px'}} className='close-icon'/> Reset Counter Marketing Music</h2>
            <FaXmark className='close-icon' onClick={onClose}/>
        </div>
        
        {/* {loading && <p>Loading...</p>} */}

        {counter && (
            <div className="counter-info">
            <p><strong>Counter Name:</strong> {counter.counter_name} musik</p>
            <p><strong>Project Number:</strong> {counter.current_project_number}</p>
            <p><strong>Order Number:</strong> {counter.current_order_number}</p>
            <p style={{color:'#b22234', backgroundColor: '#fff4b3', padding: '2px 4px', borderRadius: '4px'}}><em>Last Updated:</em> {new Date(counter.last_updated).toLocaleString()}</p>
            </div>
        )}

        <div className="counter-form">
            <div className="form-group">
                <label>Project Number</label>
                <input
                  type="number"
                  value={projectNumber}
                  onChange={(e) => setProjectNumber(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label>Order Number</label>
                <input
                type="number"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                />
            </div>
        
        <button className='update-btn' onClick={handleUpdateCounter}>
          Reset Counter
        </button>

      </div>

    </div>
  )
}

export default ResetCounter