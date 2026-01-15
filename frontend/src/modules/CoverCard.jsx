import React, { useEffect, useState } from 'react';
import '../style/modules/CoverCard.css';
import { HiOutlinePhoto, HiOutlineXMark, HiCheckBadge, HiOutlineTrash, HiXMark, HiOutlinePlus } from "react-icons/hi2";
import OutsideClick from '../hook/OutsideClick';
import BootstrapTooltip from '../components/Tooltip';
import { useSnackbar } from '../context/Snackbar';
import { IoImage, IoPulse, IoTrashBin, IoWaterSharp } from 'react-icons/io5';
// import { useUser } from '../context/UserContext';

const CoverCard = ({ 
    cardId, 
    fetchCardDetail, 
    selectedCover, 
    setSelectedCover, 
    fetchCardCover,
    onClose ,
    fetchCardActivities,
    covers,
    setCovers,
    setShowCover,
    setShowSelectCover,
    handleSelectCover,
    handleRemoveCover,
    userId
}) => {
    

    const refCover = OutsideClick(() => setShowCover(false));
    const refSelect = OutsideClick(() => setShowSelectCover(false));

    const imageCovers = covers.filter((cover) => cover.cover_image_url);
    const colorCovers = covers.filter((cover) => !cover.cover_image_url && cover.color_code);

    return(
        <div className='card-cover-container'>
            <div className="cover-header">
                <div className="ch-left">
                    <h5> <IoImage/> Choose an image</h5>
                    <span>or</span>
                    <h5> <IoWaterSharp/> Choose a color</h5>
                </div>
                <div className="ch-right">
                    <BootstrapTooltip title='Close' placement='top'>
                        <button onClick={onClose}>
                            <HiXMark/>
                        </button>
                    </BootstrapTooltip>
                </div>

            </div>
            <div className="cover-select-body">
                <div className="cover-image">
                    <h5>Default covers</h5>
                    {imageCovers.length > 0 && (
                        <div className='image-cover-box'>
                            <div className='image-box-content'>
                                {imageCovers.map((cover) => (
                                    <div
                                        key={cover.id}
                                        className={`cover-thumb ${
                                            selectedCover?.id === cover.id ? 'selected' : ''
                                        }`}
                                        style={{
                                            width: '85px',  // Ubah dari 200px menjadi 250px
                                            height: '50px',
                                            backgroundImage: `url(${cover.cover_image_url})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            backgroundRepeat: 'no-repeat',
                                            borderRadius:'4px',
                                            boxShadow:selectedCover?.id === cover.id ?' 0px 4px 8px rgba(0, 0, 0, 0.3)':'none',
                                            // border:'1px solid red',
                                            border: selectedCover?.id === cover.id ? '1px solid #9b2fad' : '1px solid #eee',
                                            cursor: 'pointer',
                                            flexShrink: 0 // Mencegah div mengecil saat overflow
                                        }}
                                        onClick={() => handleSelectCover(cover.id)}
                                    >
                                        {selectedCover?.id === cover.id && <span><HiCheckBadge className='check-icon'/></span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="upload-image-btn">
                        <div className="upload-btn-img">
                            <HiOutlinePlus/> Upload image
                        </div>
                    </div>
                </div>
                <div className="cover-color">
                    <h5>Colors</h5>
                    {colorCovers.length > 0 && (
                        <div className='cw-box'>
                            <div className='color-default-content'>
                                {colorCovers.map((cover) => (
                                    <div
                                        key={cover.id}
                                         className={`color-box ${
                                            selectedCover?.id === cover.id ? 'selected' : ''
                                        }`}
                                        style={{
                                            width: '80px',
                                            height: '50px',
                                            backgroundColor: cover.color_code,
                                            borderRadius: '5px',
                                            boxShadow: selectedCover?.id === cover.id ? '0px 4px 8px rgba(0, 0, 0, 0.3)' : 'none',
                                            border: selectedCover?.id === cover.id ? '1px solid #9b2fad' : '1px solid #eee',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => handleSelectCover(cover.id)}
                                    >
                                        {selectedCover?.id === cover.id && (
                                            <HiCheckBadge className='check-icon' />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                     <div className="upload-image-btn">
                        <div className="upload-btn-img">
                            # Use hex code
                        </div>
                    </div>
                </div>
            </div>
            <div className="remove-cover-container">
                <h5 onClick={handleRemoveCover}> 
                    <IoTrashBin/> 
                    Remove Cover
                </h5>
            </div>
        </div>
    )
};

export default CoverCard;
