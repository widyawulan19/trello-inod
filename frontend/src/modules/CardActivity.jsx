import React, { useEffect, useState } from 'react';
import { getActivityCard } from '../services/ApiServices';
import { useUser } from '../context/UserContext';

const COLOR_BORDER = {
  updated_title: 'border-blue-500',
  updated_desc: 'border-indigo-500',
  remove_label: 'border-red-500',
  remove_user: 'border-red-500',
  remove_cover:'border-red-500',
  add_user: 'border-green-500',
  add_label: 'border-green-500',
  add_cover: 'border-green-500',
  // updated_cover: 'border-yellow-500',
  updated_due: 'border-purple-500',
  updated_prio: 'border-pink-500',
  updated_status: 'border-teal-500'
};

const MESSAGE_ACTIVITY = {
  updated_title: 'updated title to',
  updated_desc: 'updated description',
  remove_label: 'removed label',
  remove_user: 'removed user',
  remove_cover: 'removed cover from card',
  add_user: 'added a user',
  add_label: 'added a new label',
  add_cover:'added a new cover',
  // updated_cover: 'updated cover card',
  updated_due: 'updated due date',
  updated_prio: 'updated priority card',
  updated_status: 'updated status'
};

const CardActivity = ({ cardId, fetchCardById }) => {
  const { user } = useUser();
  const userId = user.id;
  const [cardActivities, setCardActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  //debug
  console.log('file card activity menerima fetchcardById', fetchCardById);

  const fetchCardActivites = async () => {
    try {
      setLoading(true);
      const response = await getActivityCard(cardId);
      setCardActivities(response.data.activities); // Pastikan sesuai struktur
    } catch (error) {
      console.error('Failed to fetch card activity:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cardId) {
      fetchCardActivites();
    }
  }, [cardId]);

  return (
    <div className="mt-1"
      style={{padding:'10px'}}
    >
      {loading ? (
        <p>Loading...</p>
      ) : cardActivities.length === 0 ? (
        <p
          style={{
            // border:'1px solid red',
            width:'100%',
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            fontSize:'12px'
          }}
        >No activity yet.</p>
      ) : (
        <ul className="space-y-3">
          {cardActivities.map((activity) => {
            const detail = activity.action_detail ? JSON.parse(activity.action_detail) : {};
            const actionKey = `${activity.action_type}_${activity.entity}`;
            const borderColor = COLOR_BORDER[activity.action_type] || 'border-gray-300';
            const messageText = MESSAGE_ACTIVITY[activity.action_type] || `${activity.action_type}`;
            
            let message = `${activity.username} ${messageText}`;
            


            if (detail.old_title && detail.new_title) {
              message += ` "${detail.new_title}"`;
              // message += ` from "${detail.old_title}" to "${detail.new_title}"`;
            } else if (detail.new_title) {
              message += ` "${detail.new_title}"`;
            }

            return (
              <li
                key={activity.id}
                className={`p-1 border-l-4 ${borderColor} bg-gray-100 rounded`}
                style={{
                  width:'100%'
                }}
              >
                <p 
                  style={{
                    fontSize:'12px',
                    padding:'0px',
                    margin:'0px'
                  }}
                className="text-sm">{message}</p>
                <p 
                  style={{
                    fontSize:'10px',
                    // border:'1px solid red',
                    width:'100%',
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'flex-end'
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

export default CardActivity;
