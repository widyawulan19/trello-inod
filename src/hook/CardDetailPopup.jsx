import React from 'react';
import '../style/hook/CardDetailPopup.css'
import CardDetail from '../pages/CardDetail';
// import '../style/pages/CardDetailPopup.css'; // Tambahkan CSS jika diperlukan

const CardDetailPopup = ({ isOpen, onClose,cardId }) => {
  if (!isOpen) return null;

  return (
    <div className="detail-con" onClick={onClose}>
      <div className="card-detail-container" onClick={(e) => e.stopPropagation()}>
      <button className="close-btn" onClick={onClose}>✖</button>
      <CardDetail cardId={cardId} />
      {/* <p>CARD DETAIL</p> */}
      </div>
    </div>
  );
};

export default CardDetailPopup;
