import React, { useEffect, useState } from 'react';
import { getActivityForUserId } from '../services/ApiServices';

const ActivityPage = ({ userId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await getActivityForUserId(userId);
        setActivities(response.data.activities);
      } catch (err) {
        setError('Gagal mengambil data aktivitas');
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [userId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Activity Logs</h2>
      {activities.length === 0 ? (
        <p>Pengguna belum memiliki aktivitas</p>
      ) : (
        <ul>
          {activities.map((log) => (
            <li key={log.id}>
              <strong>{log.action}</strong> pada {log.entity_type} #{log.entity_id} <br />
              <small>{new Date(log.timestamp).toLocaleString()}</small>
              {log.details && <p>Details: {log.details}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ActivityPage;
