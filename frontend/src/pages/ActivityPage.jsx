import React, { useEffect, useState } from 'react';
import { getActivityForUserId } from '../services/ApiServices';
import '../style/pages/ActivityPage.css'
import { HiMiniCalendarDateRange } from 'react-icons/hi2';
import OutsideClick from '../hook/OutsideClick';

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
  <div className='activity-container'>
    <div className="activity-header">
      <h3>Aktivitas User</h3>
    </div>

    {activities.length === 0 ? (
      <p className='no-activity'>{message}</p>
    ) : (
      <table className="activity-table">
        <thead>
          <tr>
            <th>Aksi</th>
            <th>Entity</th>
            <th>Entity ID</th>
            <th>Waktu</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity) => (
            <tr key={activity.id}>
              <td>{activity.action}</td>
              <td>{activity.entity_type}</td>
              <td>{activity.entity_id}</td>
              <td>{new Date(activity.timestamp).toLocaleString()}</td>
              <td>{activity.details || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

}

export default ActivityPage;
