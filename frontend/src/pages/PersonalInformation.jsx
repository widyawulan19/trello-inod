import React, { useEffect, useState } from 'react';
import '../style/pages/PersonalInformation.css';
import { useSnackbar } from '../context/Snackbar';
import { getUserSettingData, updateUserSettingData } from '../services/ApiServices';

const PersonalInformation = ({ fetchUserSettingData, userData, userId }) => {
    console.log('file ini menerima data fetchUserSettingData', fetchUserSettingData);
    console.log('file ini menerima data userData', userData);
  const { showSnackbar } = useSnackbar();
  
//   const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    name: '',
    nomor: '',
    divisi: '',
    jabatan: '',
    photo_url: ''
  });

  //ambil data saat komponen pertama kali dimuat
 useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await getUserSettingData(userId);
      console.log("✅ Data dari API:", res.data);
      setFormData(res.data);
    } catch (err) {
      console.error('Error fetching user setting:', err);
    }
  };

  fetchData();
}, [userId]);

 
   // Handle input perubahan
   const handleChange = (e) => {
     setFormData(prev => ({
       ...prev,
       [e.target.name]: e.target.value
     }));
   };
 
   // Submit update
   const handleSubmit = async (e) => {
     e.preventDefault();
     try {
       await updateUserSettingData(userId, formData);
       showSnackbar('Data berhasil diperbarui!', 'success');
     } catch (error) {
       console.error('Error updating data:', error);
       showSnackbar('Gagal memperbarui data', 'error');
     }
   };

  return (
    <div className='personal-container'>
      <div className="pc-title">
        <h3>Personal Information</h3>
        <p>Atur informasi dasar akunmu di sini untuk memaksimalkan fitur aplikasi.</p>
      </div>

       <form onSubmit={handleSubmit} className='form-pc'>
        <div className="box-form">
            <label>Username</label>
            <input name="username" value={formData.username || ''} onChange={handleChange} placeholder="Username" />
        </div>
        <div className="box-form">
            <label>Email</label>
            <input name="email" value={formData.email  || ''} onChange={handleChange} placeholder="Email" />
        </div>
        <div className="box-form">
            <label>Name</label>
            <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Nama Lengkap" />
        </div>
        <div className="box-form">
            <label>Nomor</label>
            <input name="nomor" value={formData.nomor || ''} onChange={handleChange} placeholder="Nomor WA" />
        </div>
        <div className="box-form">
            <label>Divisi</label>
            <input name="divisi" value={formData.divisi || ''} onChange={handleChange} placeholder="Divisi" />
        </div>
        <div className="box-form">
            <label>Jabatan</label>
            <input name="jabatan" value={formData.jabatan  || ''} onChange={handleChange} placeholder="Jabatan" />
        </div>
        <div className="box-form">
            <label>Photo</label>
            <input name="photo_url" value={formData.photo_url  || ''} onChange={handleChange} placeholder="Photo URL" />
        </div>
        <div className='pc-btn'>
            <button type="submit">Simpan Perubahan</button>
        </div>
      </form>

     
    </div>
  );
};

export default PersonalInformation;
