import React, { useEffect, useState } from 'react';
import { getActivityCard } from '../services/ApiServices';
import { useUser } from '../context/UserContext';
import '../style/modules/CardActivity.css';

const COLOR_BORDER = {
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
  updated_status: '#14b8a6',
  move: '#f59e0b',
  duplicate: '#0ea5e9'
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
  move: 'moved this card',
  duplicate: 'duplicated this card'
};

const CardActivity = ({ cardId }) => {
  const { user } = useUser();
  const [cardActivities, setCardActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCardActivites = async () => {
    try {
      setLoading(true);
      const response = await getActivityCard(cardId);
      setCardActivities(response.data.activities);
    } catch (error) {
      console.error('Failed to fetch card activity:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cardId) fetchCardActivites();
  }, [cardId]);

  return (
    <div className="ca-container">
      {loading ? (
        <p>Loading...</p>
      ) : cardActivities.length === 0 ? (
        <p
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px'
          }}
        >
          No activity yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {cardActivities.map((activity) => {
            const detail = activity.action_detail ? JSON.parse(activity.action_detail) : {};
            const borderColor = COLOR_BORDER[activity.action_type] || '#ddd';

            let messageElement = null;

            // --- Khusus beberapa aksi yang punya detail tambahan ---
            if (activity.action_type === 'updated_title' && detail.new_title) {
              messageElement = (
                <>
                  <span className="font-semibold">{activity.username}</span>{' '}
                  {MESSAGE_ACTIVITY.updated_title}{' '}
                  <span className="font-bold">"{detail.new_title}"</span>
                </>
              );
            } else if (activity.action_type === 'move' && detail.cardTitle) {
              if (detail.fromBoardName === detail.toBoardName) {
                messageElement = (
                  <>
                    <span className="font-semibold">{activity.username}</span> moved{' '}
                    <span className="font-bold">"{detail.cardTitle}"</span> from{' '}
                    <span className="text-red-500">"{detail.fromListName}"</span> to{' '}
                    <span className="text-green-600">"{detail.toListName}"</span> on board{' '}
                    <span className="italic">"{detail.toBoardName}"</span>
                  </>
                );
              } else {
                messageElement = (
                  <>
                    <span className="font-semibold">{activity.username}</span> moved{' '}
                    <span className="font-bold">"{detail.cardTitle}"</span> from{' '}
                    <span className="text-red-500">"{detail.fromListName}"</span> (board{' '}
                    <span className="italic">"{detail.fromBoardName}"</span>) to{' '}
                    <span className="text-green-600">"{detail.toListName}"</span> (board{' '}
                    <span className="italic">"{detail.toBoardName}"</span>)
                  </>
                );
              }
            } else if (activity.action_type === 'duplicate' && detail.cardTitle) {
              if (detail.fromBoardName === detail.toBoardName) {
                messageElement = (
                  <>
                    <span className="font-semibold">{activity.username}</span> duplicated card as{' '}
                    <span className="font-bold">"{detail.cardTitle}"</span> in list{' '}
                    <span className="text-green-600">"{detail.toListName}"</span> on board{' '}
                    <span className="italic">"{detail.toBoardName}"</span>
                  </>
                );
              } else {
                messageElement = (
                  <>
                    <span className="font-semibold">{activity.username}</span> duplicated card as{' '}
                    <span className="font-bold">"{detail.cardTitle}"</span> from list{' '}
                    <span className="text-red-500">"{detail.fromListName}"</span> (board{' '}
                    <span className="italic">"{detail.fromBoardName}"</span>) to list{' '}
                    <span className="text-green-600">"{detail.toListName}"</span> (board{' '}
                    <span className="italic">"{detail.toBoardName}"</span>)
                  </>
                );
              }
            } else {
              // --- Default message pakai MESSAGE_ACTIVITY ---
              const messageText = MESSAGE_ACTIVITY[activity.action_type];
              messageElement = messageText ? (
                <>
                  <span className="font-semibold">{activity.username}</span> {messageText}
                </>
              ) : (
                <>
                  <span className="font-semibold">{activity.username}</span> performed an action
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
                <p style={{ fontSize: '10px', margin: 0 }}>{messageElement}</p>
                <p
                  style={{
                    fontSize: '10px',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end'
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


// import React, { useEffect, useState } from 'react';
// import { getActivityCard } from '../services/ApiServices';
// import { useUser } from '../context/UserContext';
// import '../style/modules/CardActivity.css';

// const COLOR_BORDER = {
//   updated_title: '#3b82f6',      // blue-500
//   updated_desc: '#6366f1',       // indigo-500
//   remove_label: '#ef4444',       // red-500
//   remove_user: '#ef4444',        // red-500
//   remove_cover: '#ef4444',       // red-500
//   add_user: '#22c55e',           // green-500
//   add_label: '#22c55e',          // green-500
//   add_cover: '#22c55e',          // green-500
//   // updated_cover: '#eab308',   // yellow-500 (optional, uncomment if needed)
//   updated_due: '#a855f7',        // purple-500
//   updated_prio: '#ec4899',       // pink-500
//   updated_status: '#14b8a6',      // teal-500
//   move: '#f59e0b',
//   duplicate:''
// };

// const MESSAGE_ACTIVITY = {
//   updated_title: 'updated title to',
//   updated_desc: 'updated description',
//   remove_label: 'removed label',
//   remove_user: 'removed user',
//   remove_cover: 'removed cover from card',
//   add_user: 'added a user',
//   add_label: 'added a new label',
//   add_cover:'added a new cover',
//   // updated_cover: 'updated cover card',
//   updated_due: 'updated due date',
//   updated_prio: 'updated priority card',
//   updated_status: 'updated status',
//   move: 'moved this card',
//   duplicate: 'duplicate this card'
// };

// const CardActivity = ({ cardId, fetchCardById }) => {
//   const { user } = useUser();
//   const userId = user?.id;
//   const [cardActivities, setCardActivities] = useState([]);
//   const [loading, setLoading] = useState(false);

//   //debug
//   console.log('file card activity menerima fetchcardById', fetchCardById);

//   const fetchCardActivites = async () => {
//     try {
//       setLoading(true);
//       const response = await getActivityCard(cardId);
//       setCardActivities(response.data.activities); // Pastikan sesuai struktur
//     } catch (error) {
//       console.error('Failed to fetch card activity:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (cardId) {
//       fetchCardActivites();
//     }
//   }, [cardId]);

//   return (
//     <div className="ca-container">
//       {loading ? (
//         <p>Loading...</p>
//       ) : cardActivities.length === 0 ? (
//         <p
//           style={{
//             // border:'1px solid red',
//             width:'100%',
//             display:'flex',
//             alignItems:'center',
//             justifyContent:'center',
//             fontSize:'12px'
//           }}
//         >No activity yet.</p>
//       ) : (
//         <ul className="space-y-3">
//           {cardActivities.map((activity) => {
//             const detail = activity.action_detail ? JSON.parse(activity.action_detail) : {};
//             const actionKey = `${activity.action_type}_${activity.entity}`;
//             const borderColor = COLOR_BORDER[activity.action_type] || '#ddd';
//             const messageText = MESSAGE_ACTIVITY[activity.action_type] || `${activity.action_type}`;
            
//             let message = `${activity.username} ${messageText}`;
            


//             if (detail.old_title && detail.new_title) {
//               message += ` "${detail.new_title}"`;
//               // message += ` from "${detail.old_title}" to "${detail.new_title}"`;
//             } else if (detail.new_title) {
//               message += ` "${detail.new_title}"`;
//             }

//             return (
//               <li
//                 key={activity.id}
//                 className='ca-li'
//                 style={{
//                   padding: '0.25rem',
//                   borderLeftWidth: '4px',
//                   borderLeftStyle: 'solid',
//                   borderLeftColor: borderColor,
//                   backgroundColor: '#f8fafc', // slate-50
//                   borderRadius: '0.25rem',
//                 }}
//               >
//                 <p 
//                   style={{
//                     fontSize:'12px',
//                     padding:'0px',
//                     margin:'0px'
//                   }}
//                 className="text-sm">{message}</p>
//                 <p 
//                   style={{
//                     fontSize:'10px',
//                     // border:'1px solid red',
//                     width:'100%',
//                     display:'flex',
//                     alignItems:'center',
//                     justifyContent:'flex-end'
//                   }}
//                 >
//                   {new Date(activity.created_at).toLocaleString()}
//                 </p>
//               </li>
//             );
//           })}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default CardActivity;