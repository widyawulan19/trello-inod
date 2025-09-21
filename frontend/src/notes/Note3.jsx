import React, { useEffect, useState } from "react";
import { getNotifications, markNotificationAsRead } from "../services/ApiServices";

function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notif dari backend
  const fetchNotifications = async () => {
    try {
      const res = await getNotifications(userId);
      setNotifications(res.data);

      // hitung unread
      const unread = res.data.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Error fetch notifications:", err);
    }
  };

  // Tandai notif sudah dibaca
  const handleMarkAsRead = async (notifId) => {
    try {
      await markNotificationAsRead(notifId);
      fetchNotifications(); // refresh notif
    } catch (err) {
      console.error("Error mark as read:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // optional polling setiap 10 detik
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="notification-bell">
      <button className="bell-btn">
        🔔
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>

      <div className="dropdown">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`notif-item ${notif.is_read ? "" : "unread"}`}
            onClick={() => handleMarkAsRead(notif.id)}
          >
            {notif.type === "mention" && <span className="icon mention">⭐</span>}
            {notif.type === "reply" && <span className="icon reply">💬</span>}
            {notif.type === "newchat" && <span className="icon newchat">🆕</span>}

            <div className="notif-content">
              <strong>{notif.sender_name}</strong>: {notif.message}
              <small>in {notif.card_name}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NotificationBell;
