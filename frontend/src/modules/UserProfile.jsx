import React, { useEffect, useState } from 'react'
import { getAllProfile } from '../services/ApiServices';

const UserProfile=()=> {
    const [profiles, setProfiles] = useState([]);

    const fetchProfileData = async()=>{
        try{
            const response = await getAllProfile();
            setProfiles(response.data);
        }catch(error){
            console.log('error fetch profile data:', error);
        }
    }

    useEffect(()=>{
        fetchProfileData();
    })
  return (
    <div>
        {profiles.map(profil =>(
            <div key={profil.id}>
                <img src={profil.photo_url} alt="Profile" width={100} />
            </div>
        ))}
    </div>
  )
}

export default UserProfile