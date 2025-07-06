import React, { useEffect, useState } from 'react'
import '../style/pages/PersonalInformation.css'
import { useSnackbar } from '../context/Snackbar'
import { updateUserSettingData } from '../services/ApiServices'

const PersonalInformation=({fetchUserSettingData,userData, userId})=> {
    //DEBUG
    console.log('Halaman personal information berhasil menerima data userData:', userData)
    console.log('halaman ini berhasil menerima userId:', userId);

    //STATE
    const {showSnackbar} = useSnackbar();
    const [formData, setFormData] = useState({
        name:'',
        username:'',
        email:'',
        nomor:'',
        jabatan:'',
        divisi:'',
        photo_url:'',
    })

    //FUNCTION
     useEffect(() => {
        if (userData) {
          setFormData({
            name: userData.name || '',
            username: userData.username || '',
            email: userData.email || '',
            nomor: userData.nomor || '',
            jabatan: userData.jabatan || '',
            divisi: userData.divisi || '',
            photo_url: userData.photo_url || '',
          });
        }
      }, [userData]);

      const handleChange = (e)=>{
        const {name, value} = e.target;
        setFormData((prev)=> ({...prev, [name]: value}));
      };

      const handleSave = async()=>{
        try{
            await updateUserSettingData(userId, formData);
            showSnackbar('User data updated successfully!','success');
            fetchUserSettingData()
        }catch(error){
            console.error('Failed to update user data:', error)
            showSnackbar('Failed to update data. Please try again!', 'error')
        }
      }
    
  return (
    <div className='personal-container'>
        <div className="pc-title">
            <h3>Personal Information</h3>
            <p>Atur informasi dasar akunmu di sini untuk memaksimalkan fitur aplikasi.</p>
        </div>
        {/* <div className="pc-header">
            <h3>Personal Information</h3>
            <p>Atur informasi dasar akunmu di sini untuk memaksimalkan fitur aplikasi.</p>
        </div> */}
        <div className="pch-body">
            <div className="pi">
                {/* <h4>Informasi Umum</h4> */}
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
                        type="text" 
                        name='email'
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>
                <div className="pc-box">
                    <label>Nomor</label>
                    <input 
                        type="text" 
                        name='nomor'
                        value={formData.nomor}
                        onChange={handleChange}
                    />
                </div>
            </div>
            <div className="pi-job">
                {/* <h4>Informasi Pekerjaan</h4> */}
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
  )
}

export default PersonalInformation

