import React, { useState } from 'react'
import { addEmployeeData } from '../services/ApiServices';
import { useSnackbar } from '../context/Snackbar';
import '../style/modules/FormDataEmployee.css'
import { FaPlus, FaXmark } from 'react-icons/fa6';

const FormDataEmployee=({onClose,fetchMember})=> {
    const {showSnackbar} = useSnackbar();
    const [formData, setFormData] = useState({
        name:'',
        divisi:'',
        jabatan:'',
        email_employee:'',
        nomor_wa:'',
    })

    //FUNCTION
    const handleChange = (e) => {
      const { name, value } = e.target;

      // Jika array (dipisah koma)
      if (['work_days', 'off_days', 'shifts'].includes(name)) {
        setFormData({ ...formData, [name]: value.split(',').map(item => item.trim()) });
      } else {
        setFormData({ ...formData, [name]: value });
      }
    };

    const handleSubmit = async(e)=>{
        e.preventDefault();

        try{
            const response = await addEmployeeData(formData);
            showSnackbar('Employee data added successfully!','success');
            console.log(response.data)
            fetchMember();
        }catch(error){
            console.error('Error adding new data employee');
            showSnackbar('Failed to add employee data!','error')
        }
    }


  return (
    <div className="form-data-container">
      <div className="fdc-header">
        <div className="fcd-left">
          <div className="fcd-icon">
            <FaPlus/>
          </div>
          <h2>Add New Data Employee</h2>
        </div>
          
          <FaXmark onClick={onClose} className='fdc-icon'/>
      </div>
       
      <form onSubmit={handleSubmit} className='form-content'>
      
      <div className='form-box' >
        <label>Name <span style={{color:'red'}}>*</span></label>
        <input 
          type="text" 
          name="name" 
          placeholder="Nama" 
          onChange={handleChange} 
          required 
        />
      </div>
      <div  className='form-box'>
        <label>Divisi <span style={{color:'red'}}>*</span></label>
         <input 
          type="text" 
          name="divisi" 
          placeholder="Divisi" 
          onChange={handleChange} 
          required 
        />
      </div>
      <div  className='form-box'>
        <label>Jabatan <span style={{color:'red'}}>*</span></label>
         <input 
          type="text" 
          name="jabatan" 
          placeholder="jabatan" 
          onChange={handleChange} 
          required 
        />
      </div>
      <div  className='form-box'>
        <label>Email <span style={{color:'red'}}>*</span></label>
         <input 
          type="text" 
          name="email_employee" 
          placeholder="Email" 
          onChange={handleChange} 
          required 
        />
      </div>
       <div  className='form-box'>
        <label>Nomor <span style={{color:'red'}}>*</span></label>
         <input 
          type="text" 
          name="nomor_wa" 
          placeholder="Nomor" 
          onChange={handleChange} 
          required 
        />
      </div>

      {/* BUTTON  */}
      <div className='form-box'>
          <button type="submit">Simpan</button>
      </div>
      </form>
    </div>
    
  )
}

export default FormDataEmployee