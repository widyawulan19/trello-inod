import React, { useState, useEffect } from 'react';
import { getEmployeeById, updateDataEmployee } from '../services/ApiServices';
import { useSnackbar } from '../context/Snackbar';
import '../style/modules/FormEditDataEmployee.css';
import { FaXmark } from 'react-icons/fa6';
import BootstrapTooltip from '../components/Tooltip';

const FormEditDataEmployee = ({ fetchMember, onClose, employee }) => {
  const { showSnackbar } = useSnackbar();
  
  //DEBUG
  console.log('File form edit menerima data employee:', employee);

  const [formData, setFormData] = useState({
    name: '',
    jabatan: '',
    divisi: '',
    nomor_wa: '',
    // username: '',
    email: '',
  });

  useEffect(() => {
    if (employee) {
        console.log('Form edit menerima data employee:',employee)
      setFormData({
        name: employee.name || '',
        jabatan: employee.jabatan || '',
        divisi: employee.divisi || '',
        nomor_wa: employee.nomor_wa || '',
        // username: employee.username || '',
        email: employee.email_employee || '',
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDataEmployee(employee.employee_id, {
        name: formData.name,
        jabatan: formData.jabatan,
        divisi: formData.divisi,
        nomor_wa: formData.nomor_wa,
        username: formData.username,
        email_employee: formData.email,
      });
      showSnackbar('Data berhasil diperbarui');
      fetchMember?.();
      onClose();
    } catch (err) {
      console.error('Gagal update:', err);
      showSnackbar('Gagal memperbarui data');
    }
  };

  useEffect(() => {
  const fetchEmployeeDetail = async () => {
    try {
      const res = await getEmployeeById(employee); // karena `employee` = ID
      setFormData({
        name: res.name || '',
        jabatan: res.jabatan || '',
        divisi: res.divisi || '',
        nomor_wa: res.nomor_wa || '',
        username: res.username || '',
        email: res.email_employee || '',
      });
    } catch (err) {
      console.error('Gagal fetch detail employee:', err);
    }
  };

  if (employee) fetchEmployeeDetail();
}, [employee]);

  if (!employee) return <p>Memuat data...</p>;

  return (
    <div className='form-edit-cont'>
      <div className="fec-header">
        <div className="fec-title">
          <h4>FORM UPDATE DATA {employee.username}</h4>
          {/* <p>{employee.username}</p> */}
        </div>
        <BootstrapTooltip title='Close Form' placement='top'>
          <FaXmark onClick={onClose} className='fec-close' />
        </BootstrapTooltip>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-cont">
        <div className="form-edit-content">
          <label>Full Name</label>
          <input 
            type="text" 
            name='name'
            placeholder={employee?.name || 'Name'}
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-edit-content">
          <label>Username</label>
          <input 
            type="text" 
            name='username'
            placeholder='Username'
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-edit-content">
          <label>Email Address</label>
          <input 
            type="email" 
            name='email'
            placeholder='Email'
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-edit-content">
          <label>Nomor</label>
          <input 
            type="text" 
            name='nomor_wa'
            placeholder='Nomor'
            value={formData.nomor_wa}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-edit-content">
          <label>Posisi / Jabatan</label>
          <input 
            type="text" 
            name='jabatan'
            placeholder='Jabatan'
            value={formData.jabatan}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-edit-content">
          <label>Divisi</label>
          <input 
            type="text" 
            name='divisi'
            placeholder='Divisi'
            value={formData.divisi}
            onChange={handleChange}
            required
          />
        </div>

        <div className="btn-form-submit">
          <button type='submit'>
            Simpan Perubahan
          </button>
        </div>
        </div>
      </form>
    </div>
  );
};

export default FormEditDataEmployee;
