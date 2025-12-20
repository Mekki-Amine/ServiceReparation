import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card } from '../Card';
import { useAuth } from '../../contexts/AuthContext';
import EmojiPicker from '../EmojiPicker';

const MessageManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [adminId, setAdminId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [location, setLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchUsersWithConversations();
    findAdminId();
  }, []);

  useEffect(() => {
    if (selectedUserId && adminId) {
      fetchConversation(selectedUserId);
      // Polling pour mettre à jour les messages toutes les 3 secondes
      const interval = setInterval(() => {
        fetchConversation(selectedUserId);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedUserId, adminId]);

  // Le scroll automatique a été désactivé - l'utilisateur peut scroller manuellement

  const findAdminId = async () => {
    try {
      const response = await axios.get('/api/messages/admin-id');
      if (response.data) {
        setAdminId(response.data);
      }
    } catch (err) {
      console.error('Error finding admin:', err);
      // Fallback pour l'admin: utiliser l'ID de l'utilisateur connecté si c'est un admin
      if (user?.role === 'ADMIN') {
        setAdminId(user.userId);
      }
    }
  };

  const fetchUsersWithConversations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/messages/admin/users');
      setUsers(response.data);
      if (response.data.length > 0 && !selectedUserId) {
        setSelectedUserId(response.data[0].id);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversation = async (userId) => {
    if (!userId || !adminId) return;
    
    try {
      const response = await axios.get(`/api/messages/admin/conversation/${userId}`);
      setMessages(response.data || []);
      // Marquer les messages comme lus
      const unreadMessages = (response.data || []).filter(
        m => !m.isRead && m.receiverId === adminId
      );
      if (unreadMessages.length > 0) {
        try {
          await axios.put(`/api/messages/user/${adminId}/read-all`);
        } catch (markErr) {
          console.error('Error marking messages as read:', markErr);
        }
      }
    } catch (err) {
      console.error('Error fetching conversation:', err);
      // Si c'est une erreur 404, c'est normal s'il n'y a pas encore de messages
      if (err.response?.status !== 404) {
        setMessages([]);
      }
    }
  };

  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Le fichier ne doit pas dépasser 10MB');
        return;
      }
      setSelectedFile(file);
      
      // Prévisualisation pour les images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par votre navigateur');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Impossible d\'obtenir votre localisation');
        setGettingLocation(false);
      }
    );
  };

  const removeLocation = () => {
    setLocation(null);
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.delete(`/api/messages/${messageId}`, { headers });
      await fetchConversation(selectedUserId);
    } catch (err) {
      console.error('Error deleting message:', err);
      alert('Erreur lors de la suppression du message');
    }
  };

  const handleDeleteMultipleMessages = async (messageIds) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${messageIds.length} message(s) ?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.delete('/api/messages/bulk', {
        data: {
          messageIds
        },
        headers
      });
      await fetchConversation(selectedUserId);
    } catch (err) {
      console.error('Error deleting messages:', err);
      alert('Erreur lors de la suppression des messages');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Empêcher la propagation de l'événement
    
    const hasContent = newMessage.trim().length > 0;
    const hasFile = selectedFile !== null;
    const hasLocation = location !== null;
    
    if (!hasContent && !hasFile && !hasLocation) {
      alert('Veuillez ajouter du texte, un fichier ou une localisation');
      return;
    }

    if (!adminId || !selectedUserId) {
      alert('Veuillez remplir tous les champs nécessaires');
      return;
    }

    try {
      setSending(true);
      
      let fileUrl = null;
      let fileName = null;
      let fileType = null;
      
      // Upload du fichier si présent
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        headers['Content-Type'] = 'multipart/form-data';
        
        const fileResponse = await axios.post('/api/messages/upload-file', formData, { headers });
        fileUrl = fileResponse.data.fileUrl;
        fileName = fileResponse.data.fileName;
        fileType = fileResponse.data.fileType;
      }
      
      const response = await axios.post('/api/messages', {
        content: newMessage.trim() || null,
        senderId: adminId,
        receiverId: selectedUserId,
        fileUrl,
        fileName,
        fileType,
        latitude: location?.latitude,
        longitude: location?.longitude,
        locationName: location ? `Lat: ${location.latitude.toFixed(6)}, Lng: ${location.longitude.toFixed(6)}` : null,
      });
      
      setNewMessage('');
      setSelectedFile(null);
      setFilePreview(null);
      setLocation(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      await fetchConversation(selectedUserId);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.statusText || 
                          'Erreur lors de l\'envoi du message. Veuillez réessayer.';
      alert(errorMessage);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        <p className="mt-4 text-gray-600">Chargement des conversations...</p>
      </div>
    );
  }

  const selectedUser = users.find(u => u.id === selectedUserId);

  return (
    <div className="space-y-6">
      <div className="flex gap-6 h-[600px]">
        {/* Liste des utilisateurs */}
        <div className="w-1/3 border-r border-gray-200 pr-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Conversations</h2>
          </div>
          
          {/* Champ de recherche */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          
          <div className="space-y-2 overflow-y-auto max-h-[500px]">
            {(() => {
              const filteredUsers = users.filter((u) => {
                if (!searchQuery.trim()) return true;
                const query = searchQuery.toLowerCase();
                return (
                  (u.username && u.username.toLowerCase().includes(query)) ||
                  (u.email && u.email.toLowerCase().includes(query)) ||
                  (u.id && u.id.toString().includes(query))
                );
              });
              
              if (users.length === 0) {
                return <p className="text-gray-500 text-center py-8">Aucune conversation</p>;
              }
              
              if (filteredUsers.length === 0) {
                return (
                  <p className="text-gray-500 text-center py-8">
                    Aucun utilisateur trouvé pour "{searchQuery}"
                  </p>
                );
              }
              
              return filteredUsers.map((u) => {
                return (
                <Card
                  key={u.id}
                  className={`p-4 transition-colors ${
                    selectedUserId === u.id
                      ? 'bg-yellow-50 border-yellow-500'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center cursor-pointer hover:bg-yellow-200 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/user/${u.id}`;
                      }}
                      title="Voir le profil"
                    >
                      <span className="text-yellow-600 font-semibold">
                        {(u.username || u.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p 
                        className="font-semibold text-gray-900 truncate cursor-pointer hover:text-yellow-600 hover:underline transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          window.location.href = `/user/${u.id}`;
                        }}
                        title="Cliquez pour voir le profil"
                      >
                        {u.username || u.email || 'Utilisateur'}
                      </p>
                      <p 
                        className="text-xs text-gray-500 truncate cursor-pointer hover:text-yellow-600 hover:underline transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          window.location.href = `/user/${u.id}`;
                        }}
                        title="Cliquez pour voir le profil"
                      >
                        {u.email}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setSelectedUserId(u.id);
                        }}
                        className="mt-1 text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        Ouvrir la conversation
                      </button>
                    </div>
                  </div>
                </Card>
                );
              });
            })()}
          </div>
        </div>

        {/* Zone de conversation */}
        <div className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              <div className="border-b border-gray-200 pb-4 mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Conversation avec{' '}
                  <span 
                    className="text-yellow-600 hover:text-yellow-700 cursor-pointer underline font-semibold"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/user/${selectedUser.id}`;
                    }}
                    title="Cliquez pour voir le profil"
                  >
                    {selectedUser.username || selectedUser.email}
                  </span>
                </h3>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                {messages.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Aucun message. Commencez la conversation !
                  </p>
                ) : (
                  <>
                    {messages.filter(m => m.senderId === adminId || m.receiverId === adminId).length > 0 && (
                      <div className="mb-2 flex justify-end">
                        <button
                          onClick={() => {
                            const adminMessageIds = messages
                              .filter(m => m.senderId === adminId || m.receiverId === adminId)
                              .map(m => m.id);
                            if (adminMessageIds.length > 0) {
                              handleDeleteMultipleMessages(adminMessageIds);
                            }
                          }}
                          className="text-xs text-red-600 hover:text-red-800 underline"
                        >
                          Supprimer tous mes messages
                        </button>
                      </div>
                    )}
                    {messages.map((message) => {
                      const isAdmin = message.senderId === adminId;
                      const senderId = isAdmin ? adminId : selectedUserId;
                      const canDelete = message.senderId === adminId || message.receiverId === adminId;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 relative ${
                              isAdmin
                                ? 'bg-yellow-500 text-black'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p 
                                  className="text-xs font-semibold mb-1 cursor-pointer hover:underline"
                                  onClick={() => navigate(`/user/${senderId}`)}
                                  title="Voir le profil"
                                >
                                  {isAdmin ? (selectedUser?.username || selectedUser?.email || 'Admin') : (selectedUser?.username || selectedUser?.email || 'Utilisateur')}
                                </p>
                                {message.content && (
                                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                )}
                                
                                {/* Fichier attaché */}
                                {message.fileUrl && (
                                  <div className="mt-2">
                                    {message.fileType?.startsWith('image/') ? (
                                      <img
                                        src={`http://localhost:9090${message.fileUrl}`}
                                        alt={message.fileName || 'Image'}
                                        className="max-w-full h-auto rounded-lg cursor-pointer"
                                        onClick={() => window.open(`http://localhost:9090${message.fileUrl}`, '_blank')}
                                      />
                                    ) : (
                                      <a
                                        href={`http://localhost:9090${message.fileUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                      >
                                        📎 {message.fileName || 'Fichier'}
                                      </a>
                                    )}
                                  </div>
                                )}
                                
                                {/* Localisation */}
                                {message.latitude && message.longitude && (
                                  <div className="mt-2">
                                    <div className="mb-2">
                                      <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                                        📍 {message.locationName || 'Localisation'}
                                      </span>
                                    </div>
                                    <div className="rounded-lg overflow-hidden border border-gray-300 shadow-sm">
                                      <iframe
                                        width="100%"
                                        height="300"
                                        style={{ border: 0 }}
                                        loading="lazy"
                                        allowFullScreen
                                        referrerPolicy="no-referrer-when-downgrade"
                                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${message.longitude - 0.01},${message.latitude - 0.01},${message.longitude + 0.01},${message.latitude + 0.01}&layer=mapnik&marker=${message.latitude},${message.longitude}`}
                                      ></iframe>
                                    </div>
                                    <a
                                      href={`https://www.google.com/maps?q=${message.latitude},${message.longitude}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-block"
                                    >
                                      Ouvrir dans Google Maps →
                                    </a>
                                  </div>
                                )}
                                
                                <p className="text-xs mt-1 opacity-70">
                                  {new Date(message.createdAt).toLocaleString('fr-FR')}
                                </p>
                              </div>
                              {canDelete && (
                                <button
                                  onClick={() => handleDeleteMessage(message.id)}
                                  className="text-red-500 hover:text-red-700 text-sm ml-2"
                                  title="Supprimer ce message"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Formulaire d'envoi */}
              <form onSubmit={handleSendMessage} noValidate className="border-t border-gray-200 pt-4">
                {/* Prévisualisation du fichier */}
                {filePreview && (
                  <div className="mb-2 relative inline-block">
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="max-w-xs h-auto rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeFile}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}
                
                {/* Fichier sélectionné (non-image) */}
                {selectedFile && !filePreview && (
                  <div className="mb-2 flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
                    <span>📎 {selectedFile.name}</span>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                )}
                
                {/* Localisation sélectionnée */}
                {location && (
                  <div className="mb-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                        📍 Localisation: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                      </span>
                      <button
                        type="button"
                        onClick={removeLocation}
                        className="text-red-500 hover:text-red-700 font-bold text-lg"
                      >
                        ×
                      </button>
                    </div>
                    <div className="rounded-lg overflow-hidden border border-gray-300 shadow-sm">
                      <iframe
                        width="100%"
                        height="250"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.longitude - 0.01},${location.latitude - 0.01},${location.longitude + 0.01},${location.latitude + 0.01}&layer=mapnik&marker=${location.latitude},${location.longitude}`}
                      ></iframe>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 border border-gray-300 rounded-lg px-2">
                    <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      placeholder="Tapez votre message..."
                      className="flex-1 px-2 py-2 focus:outline-none"
                      disabled={sending}
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-input-admin"
                      accept="image/*,application/pdf,.doc,.docx"
                    />
                    <label
                      htmlFor="file-input-admin"
                      className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded cursor-pointer transition-colors"
                      title="Ajouter un fichier"
                    >
                      📎
                    </label>
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={gettingLocation}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                      title="Ajouter ma localisation"
                    >
                      {gettingLocation ? '⏳' : '📍'}
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={sending || (!newMessage.trim() && !selectedFile && !location)}
                    className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {sending ? 'Envoi...' : 'Envoyer'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Sélectionnez un utilisateur pour commencer</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageManagement;

