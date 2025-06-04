import React, { useEffect, useState } from 'react';
import '../style/modules/CoverCard.css'

const CoverSelect = ({ selectedCover}) => {
    if(!selectedCover) return null;

    return (
        <div className='card-cover-display' style={{ padding: '5px' }}>
            <div
                className='cover-image'
                style={{
                    width: '100%',
                    height: '100px',
                    backgroundImage: selectedCover.cover_image_url
                        ? `url(${selectedCover.cover_image_url})`
                        : 'none',
                    backgroundColor: selectedCover.color_code || 'gray',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    borderRadius: '4px',
                    // border:'1px solid blue'
                }}
            />
        </div>
    );
};

export default CoverSelect;

// import React, { useEffect, useState } from 'react';
// import '../style/modules/CoverCard.css'
// import { getCoverByCard } from '../services/ApiServices';

// const CoverSelect = ({ cardId,fetchCardDetail }) => {
//     const [selectedCover, setSelectedCover] = useState(null);

//     useEffect(() => {
//         fetchCardCover();
//     }, [cardId]);

//     const fetchCardCover = async () => {
//         try {
//             const response = await getCoverByCard(cardId);
//             if (response.data.length > 0) {
//                 setSelectedCover(response.data[0]);
//                 fetchCardDetail()
//             } else {
//                 setSelectedCover(null);
//             }
//         } catch (error) {
//             console.error('Gagal mengambil cover kartu:', error);
//         }
//     };
//     if (!selectedCover) return null;

//     return (
//         <div className='card-cover-display' style={{padding:'5px'}}>
//             <div
//                 className='cover-image'
//                 style={{
//                     width: '100%',
//                     height: '60px',
//                     backgroundImage: selectedCover.cover_image_url ? `url(${selectedCover.cover_image_url})` : 'none',
//                     backgroundColor: selectedCover.color_code || 'gray',
//                     backgroundSize: 'cover',
//                     backgroundPosition: 'center',
//                     backgroundRepeat: 'no-repeat',
//                     borderRadius: '4px'
//                 }}
//             />
//         </div>
//     );
// };

// export default CoverSelect;
