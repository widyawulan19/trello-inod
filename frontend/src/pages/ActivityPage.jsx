import React, { useEffect, useState } from 'react';
import { getActivityForUserId } from '../services/ApiServices';

function ActivityPage({ userId }) {
  const [activities, setActivities] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActivityForUserId(userId)
      .then((res) => {
        setActivities(res.data.activities);
        setMessage(res.data.message);
      })
      .catch((err) => {
        console.error(err);
        setMessage('Terjadi kesalahan saat mengambil data aktivitas.');
      })
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>Aktivitas User</h2>
      {activities.length === 0 ? (
        <p>{message}</p>
      ) : (
        <ul>
          {activities.map((activity) => (
            <li key={activity.id}>
              <strong>{activity.action}</strong> on {activity.entity_type} (ID: {activity.entity_id}) at {new Date(activity.timestamp).toLocaleString()}
              {activity.details && <p>Details: {activity.details}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ActivityPage;
