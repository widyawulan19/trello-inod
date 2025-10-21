import React, { useEffect, useState } from 'react';
import '../style/modules/CoverCard.css';
import { HiOutlinePhoto, HiOutlineXMark, HiCheckBadge, HiOutlineTrash, HiXMark } from "react-icons/hi2";
import OutsideClick from '../hook/OutsideClick';
import BootstrapTooltip from '../components/Tooltip';
import { useSnackbar } from '../context/Snackbar';
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
            <div className="card-cover-header">
                <div className="cch-title">
                    <HiOutlinePhoto/>
                    <h5>SELECT CARD COVER</h5>
                </div>
                <div className="cch-btn">
                    <BootstrapTooltip title='Delete Cover' placement='top'>
                        <button onClick={handleRemoveCover}>
                            <HiOutlineTrash/>
                        </button>
                    </BootstrapTooltip>
                    <BootstrapTooltip title='Close' placement='top'>
                        <button onClick={onClose}>
                            <HiXMark/>
                        </button>
                    </BootstrapTooltip>
                </div>
            </div>

            {/* BODY  */}
                <div className='card-cover-body' ref={refSelect}>
                    <div className="image-cover">
                    {/* <h5>SELECT COVER</h5> */}
                    {imageCovers.length > 0 && (
                            <div className='ci'>
                                <h5>Image Cover</h5>
                                <div className='image-content'>
                                    {imageCovers.map((cover) => (
                                        <div
                                            key={cover.id}
                                            style={{
                                                width: '120px',  // Ubah dari 200px menjadi 250px
                                                height: '60px',
                                                backgroundImage: `url(${cover.cover_image_url})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                backgroundRepeat: 'no-repeat',
                                                borderRadius:'5px',
                                                boxShadow:selectedCover?.id === cover.id ?' 0px 4px 8px rgba(0, 0, 0, 0.3)':'none',
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
                    </div>

                                <div className="default-color">
                                    {colorCovers.length > 0 && (
                                        <div className='cw'>
                                            <h5>Cover dengan Warna</h5>
                                            <div className='default-content'>
                                                {colorCovers.map((cover) => (
                                                    <div
                                                        key={cover.id}
                                                        style={{
                                                            width: '120px',
                                                            height: '60px',
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
                                </div>
                            </div>
                        {/* )} */}
        </div>
    )
};

export default CoverCard;
