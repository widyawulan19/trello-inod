import React, { useEffect, useState } from 'react';
import { getCoverByCard } from '../services/ApiServices';
import '../style/modules/CoverCard.css';

const CardCoverDisplay = ({ cardId }) => {
    const [cover, setCover] = useState(null);

    useEffect(() => {
        const fetchCover = async () => {
            try {
                const response = await getCoverByCard(cardId);
                if (response.data.length > 0) {
                    setCover(response.data[0]);
                } else {
                    setCover(null);
                }
            } catch (error) {
                console.error('Gagal memuat cover:', error);
            }
        };

        if (cardId) {
            fetchCover();
        }
    }, [cardId]);

    if (!cover) return null;

    return (
        <div className="card-cover-display" style={{ padding: '5px' }}>
            <div
                className="cover-image"
                style={{
                    width: '100%%',
                    height: '40px',
                    backgroundImage: cover.cover_image_url ? `url(${cover.cover_image_url})` : 'none',
                    backgroundColor: cover.color_code || 'gray',
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

export default CardCoverDisplay;
