import React, { useEffect, useState } from 'react';
import { getActivityForUserId } from '../services/ApiServices';
import '../style/pages/ActivityPage.css'
import { HiMiniCalendarDateRange } from 'react-icons/hi2';
import OutsideClick from '../hook/OutsideClick';
import { useUser } from '../context/UserContext';

const ActivityPage = ({userId}) => {
  // const {user} = useUser();
  // const userId = user.id;
  // const userId = 3;
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [showFilterDate, setShowFIlterDate] = useState(false);
  const filterData = OutsideClick(()=>setShowFIlterDate(false)); 

  //debug
  console.log('FIle activity page ini menerima user id:', userId);

  //ACTION BACKGROUND COLOR
  const ACTION_COLORS={
    update: '#c7e2fe',  // DodgerBlue - menandakan pembaruan atau perubahan
    add: '#cbffd7',     // Green - untuk penambahan, identik dengan positif
    delete: '#ffc2c8',  // Red - umum digunakan untuk aksi hapus
    create: '#E3D095',  // Blue - mirip "add" tapi bisa dibedakan sebagai aksi baru
    archive: '#d8d8d8',
    duplicate:'#f9d4f0',
    move:'#e8fdfd'
  }

  //ACTION TEXT
  const TEXT_ACTION_COLORS={
    update: '#1E90FF',  // DodgerBlue - menandakan pembaruan atau perubahan
    add: '#28A745',     // Green - untuk penambahan, identik dengan positif
    delete: '#DC3545',  // Red - umum digunakan untuk aksi hapus
    create: '#4B352A',  // Blue - mirip "add" tapi bisa dibedakan sebagai aksi baru
    archive: '#6C757D',
    duplicate:'#533B4D',
    move:'#096B68'
  }

  //FORMAT DATE
  function formatToLocalTimestamp(timestamp) {
  const date = new Date(timestamp);

  const day = date.getDate().toString().padStart(2, '0');
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  let hour = date.getHours();
  const minute = date.getMinutes().toString().padStart(2, '0');
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;

  return `${day} ${month} ${year}, ${hour.toString().padStart(2, '0')}.${minute}${ampm}`;
}


  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await getActivityForUserId(userId);
        setActivities(response.data.activities);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [userId]);

  if (loading) {
    return <div>Loading activities...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (activities.length === 0) {
    return <div>No activity logs found for user ID {userId}.</div>;
  }


  //function show filter date
  const handleShowFilterDate = () =>{
    setShowFIlterDate(!showFilterDate);
  }

 const filteredActivities = selectedDate
  ? activities.filter((activity) => {
      const activityDate = new Date(activity.timestamp).toISOString().split('T')[0];
      return activityDate === selectedDate;
    })
  : activities; 

  return (
    <div className='activity-container'>
      <div className="activity-header">
        <h3>Activity Logs</h3>
        <button onClick={handleShowFilterDate}> <HiMiniCalendarDateRange/> View Logs by Date</button>
      </div>
      {/* SHOW ACTIVITY BY DATE  */}
      {showFilterDate && (
        <div className='activity-filter' ref={filterData}>
            <label>Filter berdasarkan tanggal :</label>
            <div className="date-input">
              <HiMiniCalendarDateRange className='di-icon'/>
              <input 
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)} 
              />
            </div>
        </div>
      )}
    
      <div className="activity-tabel">
      {filteredActivities.length === 0 ? (
        <div className="no-activity-message">
          <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            💤 User belum memiliki activity sekarang.
          </p>
        </div>
      ) : (
        <table cellPadding="10" cellSpacing='0'>
          <thead className='sticky-thead'>
            <tr>
              <th style={{borderTopLeftRadius:'4px'}}>DATE / TIME</th>
              <th>ENTITY</th>
              <th>ACTION</th>
              <th style={{textAlign:'left', borderTopRightRadius:'4px'}}>DETAILS</th>
            </tr>
          </thead>

          <tbody>
            {filteredActivities.map((activity) => (
              <tr key={activity.id}>
                <td className='td-date'>
                  <p>{formatToLocalTimestamp(activity.timestamp)}</p>
                </td>
                <td>{activity.entity_type}</td>
                <td>
                  <p
                    style={{
                      color: TEXT_ACTION_COLORS[activity.action],
                      backgroundColor: ACTION_COLORS[activity.action],
                      padding: '3px 8px',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}
                  >
                    {activity.action}
                  </p>
                </td>
                <td>{activity.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>

    </div>
  );
};

export default ActivityPage;

{/* <div className='bg-white rounded-lg'>
      <h3>Activity Logs for User ID: {userId}</h3>
      <ul>
        {activities.map((activity) => (
          <li key={activity.id}>
            <strong>{activity.timestamp}</strong>: {activity.description}
            <strong>{activity.entity_type}</strong>:
            <strong>{activity.action}</strong>
            <strong>{activity.details}</strong>
          </li>
        ))}
      </ul>
    </div> */}