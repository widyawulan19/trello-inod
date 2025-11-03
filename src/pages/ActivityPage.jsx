import React, { useEffect, useState } from 'react';
import { getActivityForUserId } from '../services/ApiServices';
import '../style/pages/ActivityPage.css';
import { useUser } from '../context/UserContext';
import { MdOutlineHistory } from "react-icons/md";
import OutsideClick from '../hook/OutsideClick';

const UserActivityPage = () => {
  const { user } = useUser();
  const userId = user?.id;

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchActivities();
    }
  }, [userId]);

 const fetchActivities = async () => {
    try {
      const response = await getActivityForUserId(userId);
      const logs = Array.isArray(response.data) ? response.data : response.data.activities || [];

      if (logs.length === 0) {
        setMessage('Pengguna belum memiliki aktivitas saat ini.');
      }

      setActivities(logs);
    } catch (error) {
      console.error(error);
      setMessage('Gagal memuat aktivitas.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAction = (action) => {
    setSelectedAction(action);
    setDropdownOpen(false);
  };

  const filteredActivities = selectedAction
    ? activities.filter((log) => log.action === selectedAction)
    : activities;

  const renderActionLabel = (action) => {
    switch (action) {
      case 'create':
        return 'Create';
      case 'update':
        return 'Update';
      case 'delete':
        return 'Delete';
      default:
        return action || 'Semua Aksi';
    }
  };

  const formatDate = (isoDate) => {
    return new Date(isoDate).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div className="activity-container">
      <div className="ac-header">
        <div className="ach-left">
          <div className="ac-title">
            <div className="ac-icon">
              <MdOutlineHistory />
            </div>
            <h2>Riwayat Aktivitas Pengguna</h2>
          </div>
          <p className="page-description">
            Pantau semua tindakan yang telah dilakukan oleh pengguna pada kartu, list, dan board secara real-time.
          </p>
        </div>

        {/* <div className="ach-right">
            <div className="custom-dropdown">
              <div
                className="dropdown-trigger"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {renderActionLabel(selectedAction)}
              </div>
              {dropdownOpen && (
                <ul className="dropdown-list">
                  <li onClick={() => handleSelectAction('')}>Semua Aksi</li>
                  <li onClick={() => handleSelectAction('create')}>Membuat</li>
                  <li onClick={() => handleSelectAction('update')}>Memperbarui</li>
                  <li onClick={() => handleSelectAction('delete')}>Menghapus</li>
                </ul>
              )}
            </div>
        </div> */}
      </div>

      {loading ? (
        <p>Memuat aktivitas...</p>
      ) : filteredActivities.length === 0 ? (
        // <p>{message}</p>
        <div className="no-activity">
          <h4>
            Wah, masih sepi banget nih 🙈
Saatnya bikin aktivitas biar halaman ini jadi lebih hidup!
          </h4>
        </div>
      ) : (
        <div className="activity-table-container">
          <table className="activity-table">
            <thead>
              <tr>
                <th style={{ borderTopLeftRadius: '8px' }}>Aksi</th>
                <th>Entitas</th>
                <th>Detail</th>
                <th style={{ borderTopRightRadius: '8px' }}>Waktu</th>
              </tr>
            </thead>
            <tbody>
              {filteredActivities.map((activity) => (
                <tr key={activity.id}>
                  <td style={{ minWidth: '15vw' }}>{renderActionLabel(activity.action)}</td>
                  <td style={{ minWidth: '18vw' }}>
                    {activity.entity_type} #{activity.entity_id}
                  </td>
                  <td>{activity.details}</td>
                  <td style={{ minWidth: '20vw', textAlign: 'center' }}>
                    {formatDate(activity.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserActivityPage;
