import React, { useEffect, useState } from 'react';
import { getActivityCardTesting } from '../services/ApiServices';
import '../style/modules/CardActivity.css';

const COLOR_BORDER = {
  moved: '#f59e0b',
  duplicate: '#0ea5e9',
  updated_title: '#3b82f6',
  updated_desc: '#6366f1',
  remove_label: '#ef4444',
  remove_user: '#ef4444',
  remove_cover: '#ef4444',
  add_user: '#22c55e',
  add_label: '#22c55e',
  add_cover: '#22c55e',
  updated_due: '#a855f7',
  updated_prio: '#ec4899',
  updated_status: '#14b8a6'
};

const MESSAGE_ACTIVITY = {
  updated_title: 'updated title to',
  updated_desc: 'updated description',
  remove_label: 'removed label',
  remove_user: 'removed user',
  remove_cover: 'removed cover from card',
  add_user: 'added a user',
  add_label: 'added a new label',
  add_cover: 'added a new cover',
  updated_due: 'updated due date',
  updated_prio: 'updated priority card',
  updated_status: 'updated status',
  moved: 'moved this card',
  duplicate: 'duplicated this card'
};

const NewCardActivity = ({ cardId }) => {
  const [cardActivities, setCardActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCardActivities = async () => {
    try {
      setLoading(true);
      const response = await getActivityCardTesting(cardId);
      // tambahkan username dari movedby
      const activitiesWithUser = response.activities.map(act => {
        const detail = act.action_detail ? JSON.parse(act.action_detail) : {};
        return {
            ...act,
            username: act.movedby || detail.movedBy?.username || 'Unknown',
            detail
        };
        });
        setCardActivities(activitiesWithUser);
    } catch (error) {
      console.error('Failed to fetch card activity:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cardId) fetchCardActivities();
  }, [cardId]);

  return (
    <div className="ca-container">
      {loading ? (
        <p>Loading...</p>
      ) : cardActivities.length === 0 ? (
        <p style={{ textAlign: 'center', fontSize: '12px' }}>No activity yet.</p>
      ) : (
        <ul className="space-y-3">
          {cardActivities.map(activity => {
            const { detail, username } = activity;
            // const detail = activity.action_detail ? JSON.parse(activity.action_detail) : {};
            const borderColor = COLOR_BORDER[activity.action_type] || '#ddd';

            let messageElement = null;

            if (activity.action_type === 'moved' && detail.cardTitle) {
                messageElement = (
                <>
                    <span className="font-semibold">{username}</span> moved{' '}
                    <span className="font-bold">"{detail.cardTitle}"</span> from{' '}
                    <span className="text-red-500">"{detail.fromListName}"</span> to{' '}
                    <span className="text-green-600">"{detail.toListName}"</span> on board{' '}
                    <span className="italic">"{detail.toBoardName}"</span>
                </>
                );
            } else if (activity.action_type === 'duplicate' && detail.cardTitle) {
                messageElement = (
                <>
                    <span className="font-semibold">{username}</span> duplicated{' '}
                    <span className="font-bold">"{detail.cardTitle}"</span>
                </>
                );
            } else {
                messageElement = (
                <>
                    <span className="font-semibold">{username}</span> {MESSAGE_ACTIVITY[activity.action_type] || 'performed an action'}
                </>
                );
            }

            return (
              <li
                key={activity.id}
                className="ca-li"
                style={{
                  padding: '0.25rem',
                  borderLeftWidth: '4px',
                  borderLeftStyle: 'solid',
                  borderLeftColor: borderColor,
                  backgroundColor: '#f8fafc',
                  borderRadius: '0.25rem'
                }}
              >
                <p style={{ fontSize: '12px', margin: 0 }}>{messageElement}</p>
                <p
                  style={{
                    fontSize: '10px',
                    textAlign: 'right',
                    margin: 0
                  }}
                >
                  {new Date(activity.created_at).toLocaleString()}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default NewCardActivity;
