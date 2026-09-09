import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./NotificationBell.css";

function NotificationBell() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!token) return;

    try {
      const response = await fetch(
        "http://localhost:8000/notifications/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Unable to load notifications");
      }

      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error("Notification error:", error);
    }
  };

  useEffect(() => {
  fetchNotifications();

  const intervalId = setInterval(fetchNotifications, 10000); // re-check every 10s

  return () => clearInterval(intervalId);
}, [token]);
  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(
        `http://localhost:8000/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Unable to mark notification as read");
      }

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Mark notification read error:", error);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  return (
    <div className="notification-bell">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-count">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown">
          <h3>Notifications</h3>

          {notifications.length === 0 ? (
            <p>No notifications yet.</p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${
                  notification.read ? "read" : "unread"
                }`}
                onClick={() => {
                  if (!notification.read) {
                    markAsRead(notification.id);
                  }
                }}
              >
                <p>{notification.message}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;