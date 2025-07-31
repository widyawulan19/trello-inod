import React from 'react'
import BootstrapTooltip from '../components/Tooltip'
import '../style/pages/Profile.css'
import { HiXMark } from 'react-icons/hi2'
import { IoIosImages } from "react-icons/io";

const AvatarUser = ({
  userId,
  allProfiles,
  selectedProfileId,
  currentProfileId,
  handleSelectProfile,
  handleSave,
  onClose
}) => {
  return (
    <div className='all-profile-cont'>
      <div className="apc-header">
        <div className="apch-left">
          <div className="ava-icon">
            <IoIosImages/>
          </div>
          <h5>Select Your Avatar</h5>
        </div>
        
        <HiXMark onClick={onClose} className='apc-icon'/>
      </div>
      <div className="apc-body">
        {allProfiles.map((profile) => (
          <div
            key={profile.id}
            onClick={() => handleSelectProfile(profile.id)}
            style={{
              borderRadius: '8px',
              cursor: 'pointer',
              width: '60px',
              height: '30px',
              // marginTop: '5px',
            }}
          >
            <BootstrapTooltip title={profile.profile_name} placement='top'>
              <img
                src={profile.photo_url}
                alt={profile.profile_name}
                style={{
                  border:
                    selectedProfileId === profile.id
                      ? '1px solid #5D12EB'
                      : '1px solid white',
                  boxShadow:
                    selectedProfileId === profile.id
                      ? '0px 4px 8px #5e12eb46'
                      : '',
                }}
              />
            </BootstrapTooltip>
          </div>
        ))}
      </div>
      <div className="apc-btn">
        <button
          onClick={handleSave}
          disabled={selectedProfileId === currentProfileId}
        >
          Save Avatar
        </button>
      </div>
    </div>
  )
}

export default AvatarUser
