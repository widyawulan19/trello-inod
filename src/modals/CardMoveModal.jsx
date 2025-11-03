import ReactDOM from 'react-dom';
import MoveCard from '../fitur/MoveCard';
import '../style/pages/Card.css'

const MoveCardPortal = ({ cardId, listId, workspaceId, onClose }) => {
  return ReactDOM.createPortal(
    <div className="move-card-modal">
      <div className="move-card-content">
        <MoveCard
          cardId={cardId}
          listId={listId}
          workspaceId={workspaceId}
          onClose={onClose}
        />
      </div>
    </div>,
    document.getElementById('portal-root')
  );
};

export default MoveCardPortal;
