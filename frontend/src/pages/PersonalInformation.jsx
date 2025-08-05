import React, { useEffect, useState } from 'react';
import '../style/pages/PersonalInformation.css';
import { useSnackbar } from '../context/Snackbar';
import { updateUserSettingData } from '../services/ApiServices';

const PersonalInformation = ({ fetchUserSettingData, userData, userId }) => {
  const { showSnackbar } = useSnackbar();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    name: '',
    nomor_wa: '',
    divisi: '',
    jabatan: '',
    photo_url: ''
  });

  // Saat userData berubah, update form
  useEffect(() => {
    if (userData) {
      setFormData({
        username: userData.username || '',
        email: userData.email || '',
        name: userData.name || '',
        nomor_wa: userData.nomor || userData.nomor_wa || '', // fallback jika key bernama nomor
        divisi: userData.divisi || '',
        jabatan: userData.jabatan || '',
        photo_url: userData.photo_url || ''
      });
    }
  }, [userData]);

  // Update form state ketika user mengetik
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit form
  const handleSave = async () => {
    try {
      await updateUserSettingData(userId, formData);
      showSnackbar('User data updated successfully!', 'success');
      fetchUserSettingData(); // refresh data
    } catch (error) {
      console.error('Failed to update user data:', error);
      showSnackbar('Failed to update data. Please try again!', 'error');
    }
  };

  return (
    <div className='personal-container'>
      <div className="pc-title">
        <h3>Personal Information</h3>
        <p>Atur informasi dasar akunmu di sini untuk memaksimalkan fitur aplikasi.</p>
      </div>

      <div className="pch-body">
        <div className="pi">
          <div className="pc-box">
            <label>Full Name</label>
            <input
              type="text"
              name='name'
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div className="pc-box">
            <label>Username</label>
            <input
              type="text"
              name='username'
              value={formData.username}
              onChange={handleChange}
            />
          </div>
          <div className="pc-box">
            <label>Email Address</label>
            <input
              type="email"
              name='email'
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="pc-box">
            <label>Nomor</label>
            <input
              type="text"
              name='nomor_wa'
              value={formData.nomor_wa}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="pi-job">
          <div className="pc-box">
            <label>Position / Jabatan</label>
            <input
              type="text"
              name='jabatan'
              value={formData.jabatan}
              onChange={handleChange}
            />
          </div>
          <div className="pc-box">
            <label>Divisi</label>
            <input
              type="text"
              name='divisi'
              value={formData.divisi}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="save-btn-container">
        <button onClick={handleSave} className='save-btn'>Save Change</button>
      </div>
    </div>
  );
};

export default PersonalInformation;
