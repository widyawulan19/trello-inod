import React, { useEffect, useState } from 'react';
import { getActivityCardTesting } from '../services/ApiServices';
import '../style/modules/CardActivity.css';

const COLOR_BORDER = {
  moved: '#f59e0b', //done
  duplicate: '#0ea5e9', //done
  updated_title: '#3b82f6',
  updated_desc: '#6366f1',
  updated_cover:'#22c55e',
  remove_label: '#ef4444',
  remove_user: '#ef4444',
  remove_cover: '#ef4444',
  add_user: '#22c55e',
  add_label: '#22c55e',
  add_cover: '#22c55e',
  updated_due: '#a855f7',
  updated_prio: '#ec4899',
  updated_status: '#14b8a6' //done
};

const MESSAGE_ACTIVITY = {
  updated_title: 'updated title to',
  updated_desc: 'updated description',
  updated_cover:'updated cover',
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

const NewCardActivity = ({ cardId, fetchCardActivities, cardActivities, setCardActivities }) => {
  const [loading, setLoading] = useState(false);

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
                    <span className="italic text-purple-600">"{detail.toBoardName}"</span>
                </>
                );
            } else if (activity.action_type === 'duplicate' && detail.cardTitle) {
                messageElement = (
                <>
                    <span className="font-semibold">{username}</span> duplicated card{' '}
                    <span className="font-bold">"{detail.cardTitle}"</span> from lists{' '}
                    <span className="text-red-500">"{detail.fromListName}"</span> to{' '}
                    <span className="text-green-600">"{detail.toListName}"</span> on board{' '}
                    <span className="italic text-purple-600">"{detail.toBoardName}"</span>
                </>
                );
                
            } else if (activity.action_type === 'updated_status' && detail.to){
             messageElement = (
                <>
                  <span className="font-semibold">{username}</span> updated status from{' '}
                  <span className="text-red-500">"{detail.from || '-'}"</span> to{' '}
                  <span className="text-green-600">"{detail.to}"</span>
                  {/* {detail.description && (
                    <>
                      <br />
                      <span className="text-gray-500 text-[11px]">
                        Description: {detail.description}
                      </span>
                    </>
                  )} */}
                </>
              );
            }else {
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