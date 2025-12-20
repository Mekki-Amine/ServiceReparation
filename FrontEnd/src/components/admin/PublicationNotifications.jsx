import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

export const usePublicationNotifications = () => {
  const { user } = useAuth();
  const [unverifiedCount, setUnverifiedCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const lastCountRef = useRef(0);
  const hasRequestedPermission = useRef(false);

  // Demander la permission pour les notifications du navigateur
  useEffect(() => {
    if ('Notification' in window && !hasRequestedPermission.current) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
        hasRequestedPermission.current = true;
      }
    }
  }, []);

  // Vérifier les nouvelles publications périodiquement
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      return;
    }

    const checkNewPublications = async () => {
      try {
        const response = await axios.get('/api/admin/publications/unverified');
        const currentCount = response.data?.length || 0;
        
        // Si le nombre a augmenté, il y a de nouvelles publications
        if (currentCount > lastCountRef.current && lastCountRef.current > 0) {
          const newPublications = response.data.slice(0, currentCount - lastCountRef.current);
          
          // Créer des notifications pour chaque nouvelle publication
          newPublications.forEach((pub) => {
            const notification = {
              id: Date.now() + Math.random(),
              type: 'new_publication',
              message: `Nouvelle publication: "${pub.title}"`,
              publicationId: pub.id,
              timestamp: new Date(),
            };
            
            setNotifications((prev) => [notification, ...prev].slice(0, 10)); // Garder max 10 notifications
            
            // Notification du navigateur
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Nouvelle publication', {
                body: `"${pub.title}" - ${pub.price} DT`,
                icon: '/favicon.ico',
                tag: `pub-${pub.id}`,
              });
            }
          });
        }
        
        lastCountRef.current = currentCount;
        setUnverifiedCount(currentCount);
      } catch (err) {
        console.error('Error checking new publications:', err);
      }
    };

    // Vérifier immédiatement
    checkNewPublications();

    // Vérifier toutes les 10 secondes
    const interval = setInterval(checkNewPublications, 10000);

    return () => clearInterval(interval);
  }, [user]);

  const clearNotification = (notificationId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return {
    unverifiedCount,
    notifications,
    clearNotification,
    clearAllNotifications,
  };
};

