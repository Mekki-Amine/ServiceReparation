import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const useAdminNotifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const hasRequestedPermission = useRef(false);
  const lastNotificationIds = useRef(new Set());

  // Demander la permission pour les notifications du navigateur
  useEffect(() => {
    if ('Notification' in window && !hasRequestedPermission.current) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
        hasRequestedPermission.current = true;
      }
    }
  }, []);

  // Charger les notifications
  const fetchNotifications = async () => {
    if (!user?.userId || user?.role !== 'ADMIN') {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Récupérer les notifications non lues
      const unreadResponse = await axios.get(`/api/notifications/user/${user.userId}/unread`, { headers });
      const unreadNotifications = unreadResponse.data || [];

      // Récupérer le nombre de notifications non lues
      const countResponse = await axios.get(`/api/notifications/user/${user.userId}/count`, { headers });
      const count = countResponse.data || 0;

      // Détecter les nouvelles notifications
      const currentNotificationIds = new Set(unreadNotifications.map(n => n.id));
      const newNotifications = unreadNotifications.filter(n => !lastNotificationIds.current.has(n.id));
      
      setNotifications(unreadNotifications);
      setUnreadCount(count);
      lastNotificationIds.current = currentNotificationIds;

      // Afficher une notification du navigateur pour les nouvelles notifications
      if (newNotifications.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
        newNotifications.forEach((notification) => {
          const notificationKey = `admin_notification_${notification.id}`;
          if (!localStorage.getItem(notificationKey)) {
            const title = notification.type === 'NEW_MESSAGE' ? 'Nouveau message' : 'Nouvelle notification';
            try {
              new Notification(title, {
                body: notification.message,
                icon: '/favicon.ico',
                tag: `admin-notif-${notification.id}`,
                requireInteraction: notification.type === 'NEW_MESSAGE',
              });
              localStorage.setItem(notificationKey, 'true');
            } catch (err) {
              // Erreur silencieuse lors de l'affichage de la notification
            }
          }
        });
      }
    } catch (err) {
      if (err.response?.status === 500) {
        setNotifications([]);
        setUnreadCount(0);
      }
    }
  };

  // Charger les notifications au montage et périodiquement
  useEffect(() => {
    if (!user?.userId || user?.role !== 'ADMIN') {
      return;
    }

    // Charger immédiatement
    fetchNotifications();

    // Recharger toutes les 5 secondes
    const interval = setInterval(fetchNotifications, 5000);

    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.put(`/api/notifications/${notificationId}/read`, {}, { headers });
      
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      // Erreur silencieuse lors du marquage comme lu
    }
  };

  const markAllAsRead = async () => {
    if (!user?.userId) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.put(`/api/notifications/user/${user.userId}/read-all`, {}, { headers });
      
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      // Erreur silencieuse lors du marquage comme lu
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);

    if (notification.type === 'NEW_MESSAGE') {
      navigate('/admin?tab=messages');
    } else if (notification.publicationId) {
      navigate('/admin?tab=publications');
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    handleNotificationClick,
    refreshNotifications: fetchNotifications,
  };
};

