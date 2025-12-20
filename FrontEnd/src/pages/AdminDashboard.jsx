import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserManagement from '../components/admin/UserManagement';
import PublicationManagement from '../components/admin/PublicationManagement';
import MessageManagement from '../components/admin/MessageManagement';
import { usePublicationNotifications } from '../components/admin/PublicationNotifications';
import { useAdminNotifications } from '../components/admin/AdminNotifications';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('publications');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { unverifiedCount, notifications: publicationNotifications, clearNotification, clearAllNotifications } = usePublicationNotifications();
  const { notifications: adminNotifications, unreadCount: adminUnreadCount, markAsRead, markAllAsRead, handleNotificationClick } = useAdminNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  
  // Combiner les notifications de publications et les notifications générales (messages, etc.)
  const allNotifications = [
    ...publicationNotifications,
    ...adminNotifications
  ].sort((a, b) => {
    const dateA = a.timestamp ? new Date(a.timestamp) : (a.createdAt ? new Date(a.createdAt) : new Date(0));
    const dateB = b.timestamp ? new Date(b.timestamp) : (b.createdAt ? new Date(b.createdAt) : new Date(0));
    return dateB - dateA;
  });
  
  const totalUnreadCount = unverifiedCount + adminUnreadCount;

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gray-900 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-yellow-400">Administration</h1>
              <p className="text-sm text-gray-300">Bienvenue, {user?.username || user?.email}</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <span>🔔</span>
                  {totalUnreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                    </span>
                  )}
                </button>
                
                {/* Dropdown des notifications */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      {allNotifications.length > 0 && (
                        <div className="flex gap-2">
                          {adminUnreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Tout marquer comme lu
                            </button>
                          )}
                          {publicationNotifications.length > 0 && (
                            <button
                              onClick={clearAllNotifications}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Effacer publications
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {allNotifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          Aucune notification
                        </div>
                      ) : (
                        allNotifications.map((notification) => {
                          const isAdminNotification = adminNotifications.some(n => n.id === notification.id);
                          const isPublicationNotification = publicationNotifications.some(n => n.id === notification.id);
                          const notificationDate = notification.timestamp 
                            ? new Date(notification.timestamp) 
                            : (notification.createdAt ? new Date(notification.createdAt) : new Date());
                          
                          return (
                            <div
                              key={notification.id}
                              className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                                isAdminNotification && !notification.isRead ? 'bg-blue-50' : ''
                              }`}
                              onClick={() => {
                                if (isAdminNotification) {
                                  handleNotificationClick(notification);
                                  setShowNotifications(false);
                                } else if (isPublicationNotification) {
                                  if (notification.publicationId) {
                                    setActiveTab('publications');
                                    setShowNotifications(false);
                                  }
                                  clearNotification(notification.id);
                                }
                              }}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {notificationDate.toLocaleString('fr-FR')}
                                  </p>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isAdminNotification) {
                                      markAsRead(notification.id);
                                    } else {
                                      clearNotification(notification.id);
                                    }
                                  }}
                                  className="ml-2 text-gray-400 hover:text-gray-600"
                                  title={isAdminNotification ? "Marquer comme lu" : "Fermer"}
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                    {unverifiedCount > 0 && (
                      <div className="p-4 border-t border-gray-200 bg-yellow-50">
                        <button
                          onClick={() => {
                            setActiveTab('publications');
                            setShowNotifications(false);
                          }}
                          className="w-full text-center text-sm font-semibold text-yellow-800 hover:text-yellow-900"
                        >
                          Voir {unverifiedCount} publication{unverifiedCount > 1 ? 's' : ''} non vérifiée{unverifiedCount > 1 ? 's' : ''}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Retour au site
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('publications')}
              className={`px-6 py-4 font-semibold transition-colors relative ${
                activeTab === 'publications'
                  ? 'text-yellow-600 border-b-2 border-yellow-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Gérer les Publications
              {unverifiedCount > 0 && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {unverifiedCount > 9 ? '9+' : unverifiedCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-4 font-semibold transition-colors ${
                activeTab === 'users'
                  ? 'text-yellow-600 border-b-2 border-yellow-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Gérer les Utilisateurs
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-6 py-4 font-semibold transition-colors ${
                activeTab === 'messages'
                  ? 'text-yellow-600 border-b-2 border-yellow-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Messages
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'publications' && <PublicationManagement />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'messages' && <MessageManagement />}
      </main>
    </div>
  );
};

export default AdminDashboard;

