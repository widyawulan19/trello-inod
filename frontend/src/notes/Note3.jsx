// // context/UserContext.jsx
// import { createContext, useContext, useState } from "react";

// const UserContext = createContext();

// export const useUser = () => useContext(UserContext);

// export const UserProvider = ({ children }) => {
//   const [user, setUser] = useState(null); // null saat belum login

//   const login = (userData) => setUser(userData);
//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem("token");
//   };

//   return (
//     <UserContext.Provider value={{ user, login, logout }}>
//       {children}
//     </UserContext.Provider>
//   );
// };


// // login 
// import { useState } from "react";
// import { loginUser } from "../api/auth";
// import { useUser } from "../context/UserContext";
// import { useNavigate } from "react-router-dom";

// const LoginPage = () => {
//   const { login } = useUser();
//   const navigate = useNavigate();

//   const [form, setForm] = useState({ email: "", password: "" });
//   const [error, setError] = useState("");

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     try {
//       const res = await loginUser(form);
//       localStorage.setItem("token", res.data.token); // simpan token
//       login(res.data.user); // simpan user ke context
//       navigate("/dashboard"); // redirect setelah login
//     } catch (err) {
//       setError(err.response?.data?.message || "Login gagal");
//     }
//   };

//   return (
//     <div>
//       <h2>Login</h2>
//       {error && <p style={{ color: "red" }}>{error}</p>}
//       <form onSubmit={handleSubmit}>
//         <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
//         <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
//         <button type="submit">Login</button>
//       </form>
//     </div>
//   );
// };

// export default LoginPage;

// <>
// <input 
//     type="text" 
//     placeholder='Email'
//     value={email}
//     onChange={(e) => setEmail(e.target.value)}
// />
// <input 
//     type="password" 
//     placeholder='Password'
//     value={password}
//     onChange={(e) => setPassword(e.target.value)}
// />


// <div className="btn-login" onClick={handleLogin}>
//     Login
// </div>
// </>

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
                return <div className="fade"><div className='activity'><ActivityPage/></div></div>;
            case 'notification':
                return <div className="fade"><div className="notif"><PersonalNotification userId={userId}/></div></div>;
            case 'security':
                return <div className="fade"><h3>Security Settings</h3><p>Update your password and security settings.</p></div>;
            default:
                return <div className="fade"><h3>Personal Information</h3></div>;
        }
    };


  return (
    <div className='profile-container'>
        <div className="pc-container">
            <div className="pc-header">
                <div className="pch-left">
                    <HiCog className='pchl-icon'/>
                    <h2>Profile Settings</h2>
                </div>
                <p>Manage your profile, preferences, and account setting</p>
            </div>
            <div className="pc-body">
                <div className="pcb-left">
                    <div className="profile-photo">
                        <img src={userData.photo_url} alt={profile} />
                        {/* <img src={profile} alt={profile} /> */}
                        <h3>{userData.name}</h3>
                        <p>Member since May 2025</p>
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
                    </div>
                </div>
                
                <div className="pcb-right">
                    <div className="pcb-content">
                         {renderContent()}
                    </div>
                  
                </div>
            </div>
        </div>
    </div>
  )
}

export default Profile

// import React from 'react'
// import { Routes, Route} from 'react-router-dom';
// import Home from '../pages/Home';
// import Recent from '../pages/Recent';
// import NewWorkspace from '../pages/NewWorkspace';
// import WorkspacePage from '../pages/WorkspacePage';
// import BoardList from '../pages/BoardList';
// import Card from '../pages/Card';
// import CardDetail from '../pages/CardDetail';
// import Testing from '../pages/Testing';
// import DataEmployee from '../pages/DataEmployee';
// import DataMember from '../pages/DataMember';
// import DataMarketing from '../pages/DataMarketing';
// import ViewDataMarketing from '../pages/ViewDataMarketing';
// import EditMarketingForm from '../pages/EditMarketingForm';
// import FormDataMarketing from '../pages/FormDataMarketing';
// // import MarketingDesign from '../pages/marketing/MarketingDesign';
// import CoverCard from '../modules/CoverCard';
// import CoverSelect from '../UI/CoverSelect';
// import MarketingDesign from '../pages/MarketingDesign';
// import Setting from '../pages/Setting';
// import Archives from '../pages/Archives';
// import Profile from '../pages/Profile';
// import ActivityPage from '../pages/ActivityPage';
// import ChatUi from '../fitur/ChatUi';
// import AcceptDataDesign from '../pages/AcceptDataDesign';
// import ExampleDataMarketingDesign from '../pages/ExampleDataMarketingDesign';
// import EmployeeData from '../pages/EmployeeData';
// import LayoutTest from '../pages/LayoutTest';
// import NewCardDetail from '../pages/NewCardDetail';
// import TextEditor from '../modules/TextEditor';
// import FullNewCalendar from '../fitur/FullNewCalendar';
// import ExampleTailwind from '../pages/ExampleTailwind';
// import EmployeeSchedule from '../modules/EmployeeSchedule';
// import NotificationIcon from '../UI/NotificationIcon';
// import ArchiveUniversal from '../pages/ArchiveUniversal';
// import MainLp from '../landingpage/MainLp';
// import Layout from '../components/Layout';
// import PersonalNotes from '../modules/PersonalNotes';
// import AgendaPage from '../pages/AgendaPage';
// import NotesPage from '../pages/NotesPage';
// import ScheduleEmployeePage from '../pages/ScheduleEmployeePage';
// import Login from '../auth/Login';
// import Register from '../auth/Register';
// import RequestPass from '../auth/RequestPass';
// import ResetPass from '../auth/ResetPass';

// const AppRoutes=()=> {
//   return (
//     <Routes>

//         {/* <Route path='/landing-page' element={<MainLp/>}/> */}
//         <Route path='/' element={<MainLp/>}/>
//         <Route path='/login' element={<Login/>}/>
//         <Route path='/register' element={<Register/>}/>
//         <Route path='/req-reset' element={<RequestPass/>}/>
//         <Route path='/reset-pass' element={<ResetPass/>} />

//         {/* <Route path='/' element={<Layout/>}> */}
//         <Route path='/layout' element={<Layout/>}>
//         <Route index element={<Home/>}/>
//         <Route path='/recent' element={<Recent/>}/>
//         <Route path='/workspaces' element={<NewWorkspace/>}/>
//         <Route path='/workspaces/:workspaceId' element={<WorkspacePage/>}/>
//         <Route path='/workspaces/:workspaceId/board/:boardId' element={<BoardList/>}/>
//         <Route path='/workspaces/:workspaceId/board/:boardId/lists/:listId' element={<Card/>}/>
//         {/* <Route path='/workspaces/:workspaceId/board/:boardId/lists/:listId/cards/:cardId' element={<CardDetail/>}/> */}
//         <Route path='/workspaces/:workspaceId/board/:boardId/lists/:listId/cards/:cardId' element={<NewCardDetail/>}/>
//         <Route path='/testing' element={<Testing/>}/>
//         <Route path='/data-employee' element={<DataEmployee/>}/>
//         <Route path='/data-member' element={<DataMember/>}/>
//         <Route path='/data-marketing' element={<DataMarketing/>}/>
//         <Route path='/data-marketing/:marketingId' element={<ViewDataMarketing/>}/>
//         <Route path='/edit-data-marketing/:marketingId' element={<EditMarketingForm/>}/>
//         <Route path='/form-data-marketing/:marketingId' element={<FormDataMarketing/>}/>
//         {/* <Route path='/marketing-design' element={<MarketingDesign/>}/> */}
//         <Route path='/marketing-design' element={<MarketingDesign/>}/>
//         <Route path='/cover-card' element={<CoverCard/>}/>
//         <Route path='/cover-select' element={<CoverSelect/>}/>
//         {/* TYR  */}
//         <Route path='/text-editor' element={<TextEditor/>}/>
//         <Route path='/setting' element={<Setting/>}/>
//         <Route path='/archive' element={<Archives/>}/>
//         <Route path='/archive-data' element={<ArchiveUniversal/>}/>
//         <Route path='/user-profile' element={<Profile/>}/>
//         <Route path='/activity' element={<ActivityPage/>}/>
//         <Route path='/chat' element={<ChatUi/>}/>
//         <Route path='/data-accept' element={<AcceptDataDesign/>}/>
//         <Route path='/example-data' element={<ExampleDataMarketingDesign/>}/>
//         <Route path='/employee-data' element={<EmployeeData/>}/>
//         <Route path='/room-test' element={<LayoutTest/>}/>
//         <Route path='/calendar' element={<FullNewCalendar/>}/>
//         <Route path='/example-css' element={<ExampleTailwind/>}/>
//         <Route path='/employee-schedule' element={<EmployeeSchedule/>}/>
//         <Route path='/notif-icon' element={<NotificationIcon/>}/>
//         <Route path='/personal-notes' element={<PersonalNotes/>}/>
//         <Route path='/agenda-page' element={<AgendaPage/>}/>
//         <Route path='/note-page' element={<NotesPage/>}/>
//         <Route path='/new-employee-schedules' element={<ScheduleEmployeePage/>}/>
//         </Route>
//     </Routes>
//   )
// }

// export default AppRoutes