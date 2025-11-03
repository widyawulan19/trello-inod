import React, { useEffect, useState } from 'react';
import { getCoverByCard } from '../services/ApiServices';
// import '../style/modules/CoverCard.css';
import '../style/modules/BoxStatus.css'

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
        <div className="card-cover-display">
            <div className="cover-image">
                {cover.cover_image_url ? (
                    <img src={cover.cover_image_url} alt="cover" className="cover-img" />
                ) : (
                    <div className="color-mode" style={{ backgroundColor: cover.color_code || 'gray' }} />
                )}
            </div>
        </div>
    );
};

export default CardCoverDisplay;
