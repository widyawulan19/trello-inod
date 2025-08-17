import React, { useEffect, useState } from 'react'
import '../style/pages/Profile.css'
import { HiCog, HiLockClosed, HiMiniUser } from "react-icons/hi2";
import profile from '../assets/manuser.png'
import { FiUser } from "react-icons/fi";
import { FaRegChartBar } from "react-icons/fa";
import { HiBellAlert } from "react-icons/hi2";
import { addProfileToUser, getAllProfile, getProfileByUserId, getUserSettingData, updateProfileUser } from '../services/ApiServices';
import PersonalInformation from './PersonalInformation';
import AvatarUser from '../modules/AvatarUser';
import { useSnackbar } from '../context/Snackbar';
import ActivityPage from './ActivityPage';
import NotificationPage from '../UI/NotificationPage';
import PersonalNotification from '../UI/PersonalNotification';
import { useUser } from '../context/UserContext';
import Logout from '../auth/Logout';

const formatDateToReadable = (dateString) => {
  if (!dateString) return '';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString));
};


const Profile=()=> {
    //STATE
    // const userId = 13;
    const {user} = useUser(); 
    const userId = user?.id;
    const {showSnackbar} = useSnackbar();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('personal');
    const [showAvatar, setShowAvatar] = useState(false);
    //STATE UNTUK AVATAR
    const [allProfiles, setAllProfiles] = useState([]);
    const [selectedProfileId, setSelectedProfileId] = useState(null)
    const [currentProfileId, setCurrentProfileId] = useState(null);


    //DEBUG
    console.log('File Profile.jsx menerima data user dan userId:', userId);

    //FUNCTION
    //1. fetch user setting data
    const fetchUserSettingData = async () =>{
        try{
            const response = await getUserSettingData(userId);
            setUserData(response.data)
        }catch(error){
            console.error('Error fetching user settings:', error);
        }finally{
            setLoading(false)
        }
    };

    useEffect(()=>{
        if(userId){
            fetchUserSettingData()
        }
    },[userId]);

    //2. show avatar setting
    const handleShowAvatar = () =>{
        setShowAvatar(!showAvatar)
    }
    const handleCloseAvatar = () =>{
        setShowAvatar(false)
    }

    //FUNCTION FOR AVATAR USER
    //1. fetch all profile
    const fetchAllProfiles = async()=>{
        try{
            const response = await getAllProfile();
            setAllProfiles(response.data)
        }catch(error){
            console.error('Error fetcing all profile data:', error)
        }
    }

     //2. fetch user profile
    const fetchUserProfile = async() =>{
        try{
            const response = await getProfileByUserId(userId);
            if(response.data && response.data.profil_id){
                setCurrentProfileId(response.data.profil_id)
                setSelectedProfileId(response.data.profil_id)
            }
        }catch(error){
            console.error('Failed to fetch user pofile:', error)
        }
    }

    //3. function select 
    const handleSelectProfile = (profilId) =>{
        setSelectedProfileId(profilId)
    }
    
    //4. fungsi save 
    const handleSave = async()=>{
        try {
              if (currentProfileId) {
                // Jika user sudah punya profil, update
                await updateProfileUser(userId, { profil_id: selectedProfileId });
              } else {
                // Jika belum punya, tambah baru
                await addProfileToUser({ user_id: userId, profil_id: selectedProfileId });
              }
              showSnackbar('Profile updated successfully!', 'success');
              setCurrentProfileId(selectedProfileId);
              fetchUserSettingData();
            } catch (error) {
              console.error('Failed to update profile:', error);
              showSnackbar('Failed to update profile!', 'error');
            }
    }
    
    //5. fungsi useEffect
    useEffect(()=>{
        fetchAllProfiles();
        fetchUserProfile();
    },[])

    



    if (loading) return <p>Loading...</p>;
    if (!userData) return <p>No user data found.</p>;
  
    const renderContent = () => {
        switch (activeSection) {
            case 'personal':
                return <div className="fade"><PersonalInformation fetchUserSettingData={fetchUserSettingData} userData={userData} userId={userId}/></div>;
            case 'activity':
                return <div className="fade"><div className='activity'><ActivityPage userId={userId}/></div></div>;
            case 'notification':
                return <div className="fade"><div className="notif"><PersonalNotification userId={userId}/></div></div>;
            case 'security':
                return <div className="fade"><h3>Security Settings</h3><p>Update your password and security settings.</p></div>;
            case 'logout':
                return <div className="fade"><Logout/></div>
            default:
                return <div className="fade"><h3>Personal Information</h3></div>;
        }
    };


  return (
    <div className='profile-container'>
        <div className="header-profile">
            <div className="header-title">
                <div className="pchl-icon">
                    <HiCog/>
                </div>
                <h2>Profile Settings</h2>
            </div>
            <p>Manage your profile, preferences, and account setting</p>
        </div>
        <div className="profile-page-main">
            <div className="profile-left">
                <div className="profile-photo">
                    <img src={userData.photo_url} alt={profile} />
                    <h3>{userData.name}</h3>
                    <p>
                        Member since {formatDateToReadable(userData.create_at)}
                    </p>

                    <button onClick={handleShowAvatar}>Change Avatar</button>
                     {/* SHOW SELECT AVATAR  */}
                        {showAvatar && (
                                <div className='ava-container'>
                                    <AvatarUser 
                                        userId={userId}
                                        allProfiles={allProfiles}
                                        selectedProfileId={selectedProfileId}
                                        currentProfileId={currentProfileId}
                                        handleSelectProfile={handleSelectProfile}
                                        handleSave={handleSave}
                                        onClose={handleCloseAvatar}
                                    />
                                </div>
                            )}
                        {/* END SHOW SELECT AVATAR  */}
                        
                </div>
                <div className="profile-setting">
                    <button 
                        className={activeSection === 'personal' ? 'active' : ''} 
                        onClick={() => setActiveSection('personal')}
                    >
                        <HiMiniUser className='ps-icon' />
                        <span className="ps-label">Personal Info</span>
                    </button>
                    <button 
                        className={activeSection === 'activity' ? 'active' : ''} 
                        onClick={() => setActiveSection('activity')}
                    >
                        <FaRegChartBar className='ps-icon' />
                        <span className="ps-label">Activity & Schedule</span>
                    </button>
                    <button 
                        className={activeSection === 'notification' ? 'active' : ''} 
                        onClick={() => setActiveSection('notification')}
                    >
                        <HiBellAlert className='ps-icon' />
                        <span className="ps-label">Notification</span>
                    </button>
                    <button 
                        className={activeSection === 'security' ? 'active' : ''} 
                        onClick={() => setActiveSection('security')}
                    >
                        <HiLockClosed className='ps-icon' />
                        <span className="ps-label">Security</span>
                    </button>
                    <button 
                        className={activeSection === 'logout' ? 'active' : ''} 
                        onClick={() => setActiveSection('logout')}
                    >
                        <HiLockClosed className='ps-icon' />
                        <span className="ps-label">Logout</span>
                    </button>
                </div>
            </div>
            <div className="profile-right">
                <div className="profil-content">
                    {renderContent()}
                </div>
            </div>
        </div>
        
    </div>
  )
}

export default Profile