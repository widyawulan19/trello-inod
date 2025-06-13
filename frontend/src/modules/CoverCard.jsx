import React, { useEffect, useState } from 'react';
import '../style/modules/CoverCard.css';
import { 
    addCoverCard, 
    deleteCoverCard, 
    getAllCovers, 
    updateCardCover 
} from '../services/ApiServices';
import { HiOutlinePhoto, HiOutlineXMark, HiCheckBadge, HiOutlineTrash, HiXMark } from "react-icons/hi2";
import OutsideClick from '../hook/OutsideClick';
import BootstrapTooltip from '../components/Tooltip';

const CoverCard = ({ 
    cardId, 
    fetchCardDetail, 
    selectedCover, 
    setSelectedCover, 
    fetchCardCover,
    onClose 
}) => {
    const [covers, setCovers] = useState([]); // Semua pilihan cover
    const [showCover, setShowCover] = useState(false);
    const [showSelectCover, setShowSelectCover] = useState(false);

    const refCover = OutsideClick(() => setShowCover(false));
    const refSelect = OutsideClick(() => setShowSelectCover(false));

    //FUNCTION SHOW
    const handleShowCover = (e) =>{
        e.stopPropagation()
        setShowCover((prev) => !prev)
    }
    const handleShowSelect = (e) =>{
        e.stopPropagation()
        setShowSelectCover((prev) => !prev)
    }
    const handleCloseSelect = () =>{
        setShowSelectCover(false)
    }


    // Ambil semua cover saat komponen mount
    useEffect(() => {
        fetchCovers();
    }, [cardId]);

    const fetchCovers = async () => {
        try {
            const response = await getAllCovers();
            setCovers(response.data);
        } catch (error) {
            console.error('Gagal mengambil daftar cover:', error);
        }
    };

    const handleSelectCover = async (coverId) => {
        try {
            const coverData = { card_id: cardId, cover_id: coverId };
            if (selectedCover) {
                await updateCardCover(coverData);
            } else {
                await addCoverCard(coverData);
            }
            await fetchCardCover(); // refresh dari parent
            fetchCardDetail(); // refresh detail
        } catch (error) {
            console.error('Gagal memilih cover:', error);
        }
    };

    const handleRemoveCover = async () => {
        try {
            await deleteCoverCard(cardId);
            setSelectedCover(null);
            fetchCardDetail(); // Refresh tampilan
        } catch (error) {
            console.error('Gagal menghapus cover:', error);
        }
    };

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


// import React, { useEffect, useState } from 'react';
// import '../style/modules/CoverCard.css';
// import { 
//     addCoverCard, 
//     deleteCoverCard, 
//     getAllCovers, 
//     updateCardCover 
// } from '../services/ApiServices';
// import { HiOutlinePhoto, HiOutlineXMark, HiCheckBadge, HiOutlineTrash } from "react-icons/hi2";
// import OutsideClick from '../hook/OutsideClick';

// const CoverCard = ({ 
//     cardId, 
//     fetchCardDetail, 
//     selectedCover, 
//     setSelectedCover, 
//     fetchCardCover 
// }) => {
//     const [covers, setCovers] = useState([]); // Semua pilihan cover
//     const [showCover, setShowCover] = useState(false);
//     const [showSelectCover, setShowSelectCover] = useState(false);

//     const refCover = OutsideClick(() => setShowCover(false));
//     const refSelect = OutsideClick(() => setShowSelectCover(false));

//     //FUNCTION SHOW
//     const handleShowCover = (e) =>{
//         e.stopPropagation()
//         setShowCover((prev) => !prev)
//     }
//     const handleShowSelect = (e) =>{
//         e.stopPropagation()
//         setShowSelectCover((prev) => !prev)
//     }


//     // Ambil semua cover saat komponen mount
//     useEffect(() => {
//         fetchCovers();
//     }, [cardId]);

//     const fetchCovers = async () => {
//         try {
//             const response = await getAllCovers();
//             setCovers(response.data);
//         } catch (error) {
//             console.error('Gagal mengambil daftar cover:', error);
//         }
//     };

//     const handleSelectCover = async (coverId) => {
//         try {
//             const coverData = { card_id: cardId, cover_id: coverId };
//             if (selectedCover) {
//                 await updateCardCover(coverData);
//             } else {
//                 await addCoverCard(coverData);
//             }
//             await fetchCardCover(); // refresh dari parent
//             fetchCardDetail(); // refresh detail
//         } catch (error) {
//             console.error('Gagal memilih cover:', error);
//         }
//     };

//     const handleRemoveCover = async () => {
//         try {
//             await deleteCoverCard(cardId);
//             setSelectedCover(null);
//             fetchCardDetail(); // Refresh tampilan
//         } catch (error) {
//             console.error('Gagal menghapus cover:', error);
//         }
//     };

//     const imageCovers = covers.filter((cover) => cover.cover_image_url);
//     const colorCovers = covers.filter((cover) => !cover.cover_image_url && cover.color_code);

//     return (
//         <div className="cover-container">
//             <div className="show-cover">
//                 <div className="cover">
//                     <div className="selected-cover">
//                         {/* <div
//                             style={{
//                                 width: '100%',
//                                 height: '200px',
//                                 backgroundImage: selectedCover?.cover_image_url ? `url(${selectedCover.cover_image_url})` : "none",
//                                 backgroundColor: selectedCover?.color_code || "gray",
//                                 backgroundSize: 'cover',
//                                 backgroundPosition: 'center',
//                                 backgroundRepeat: 'no-repeat',
//                                 border: '1px solid #eee',
//                                 borderRadius: '4px'
//                             }}
//                         /> */}
//                         <div className="button-cover">
//                             <button onClick={handleRemoveCover}>
//                                 <HiOutlineTrash className='bc-icon' />
//                                 Remove Cover
//                             </button>
//                             <button onClick={handleShowSelect}>
//                                 <HiOutlinePhoto className='bc-icon' />
//                                 Select Cover
//                             </button>
//                         </div>

//                         {/* {showSelectCover && ( */}
//                             <div className='sc-container' ref={refSelect}>
//                                 <h5>SELECT COVER</h5>
//                                 <div className="image-cover">
//                                 {imageCovers.length > 0 && (
//                                         <div>
//                                             <h5>Image Cover</h5>
//                                             <div className='image-content'>
//                                                 {imageCovers.map((cover) => (
//                                                     <div
//                                                         key={cover.id}
//                                                         style={{
//                                                             width: '120px',  // Ubah dari 200px menjadi 250px
//                                                             height: '60px',
//                                                             backgroundImage: `url(${cover.cover_image_url})`,
//                                                             backgroundSize: 'cover',
//                                                             backgroundPosition: 'center',
//                                                             backgroundRepeat: 'no-repeat',
//                                                             borderRadius:'5px',
//                                                             boxShadow:selectedCover?.id === cover.id ?' 0px 4px 8px rgba(0, 0, 0, 0.3)':'none',
//                                                             border: selectedCover?.id === cover.id ? '1px solid #9b2fad' : '1px solid #eee',
//                                                             cursor: 'pointer',
//                                                             flexShrink: 0 // Mencegah div mengecil saat overflow
//                                                         }}
//                                                         onClick={() => handleSelectCover(cover.id)}
//                                                     >
//                                                         {selectedCover?.id === cover.id && <span><HiCheckBadge className='check-icon'/></span>}
//                                                     </div>
//                                                 ))}
//                                             </div>
//                                         </div>
//                                     )}
//                                 </div>

//                                 <div className="default-color">
//                                     {colorCovers.length > 0 && (
//                                         <div>
//                                             <h5>Cover dengan Warna</h5>
//                                             <div className='default-content'>
//                                                 {colorCovers.map((cover) => (
//                                                     <div
//                                                         key={cover.id}
//                                                         style={{
//                                                             width: '120px',
//                                                             height: '60px',
//                                                             backgroundColor: cover.color_code,
//                                                             borderRadius: '5px',
//                                                             boxShadow: selectedCover?.id === cover.id ? '0px 4px 8px rgba(0, 0, 0, 0.3)' : 'none',
//                                                             border: selectedCover?.id === cover.id ? '1px solid #9b2fad' : '1px solid #eee',
//                                                             cursor: 'pointer'
//                                                         }}
//                                                         onClick={() => handleSelectCover(cover.id)}
//                                                     >
//                                                         {selectedCover?.id === cover.id && (
//                                                             <HiCheckBadge className='check-icon' />
//                                                         )}
//                                                     </div>
//                                                 ))}
//                                             </div>
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         {/* )} */}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default CoverCard;