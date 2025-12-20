import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Card } from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '../components/BackButton';
import EmojiPicker from '../components/EmojiPicker';

const Messages = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [adminId, setAdminId] = useState(null);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [location, setLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    findAdminId();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (adminId && user?.userId) {
      fetchConversation();
      // Polling pour mettre à jour les messages toutes les 3 secondes
      const interval = setInterval(() => {
        fetchConversation();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [adminId, user?.userId]);

  // Référence pour le conteneur de messages
  const messagesContainerRef = useRef(null);

  const findAdminId = async () => {
    try {
      const response = await axios.get('/api/messages/admin-id');
      if (response.data) {
        setAdminId(response.data);
        setError(null);
      }
    } catch (err) {
      // Fallback: essayer de trouver l'admin via les messages existants
      if (user?.userId) {
        try {
          const messagesResponse = await axios.get(`/api/messages/user/${user.userId}`);
          if (messagesResponse.data && messagesResponse.data.length > 0) {
            // Prendre le premier message et extraire l'admin (sender ou receiver)
            const firstMessage = messagesResponse.data[0];
            if (firstMessage.senderId !== user.userId) {
              setAdminId(firstMessage.senderId);
              setError(null);
            } else if (firstMessage.receiverId !== user.userId) {
              setAdminId(firstMessage.receiverId);
              setError(null);
            }
          } else {
            setError('Aucun Fixer trouvé. Veuillez contacter le support.');
          }
        } catch (fallbackErr) {
          setError('Impossible de trouver Fixer. Veuillez réessayer plus tard.');
        }
      } else {
        setError('Vous devez être connecté pour envoyer des messages.');
      }
    }
  };

  const fetchConversation = async () => {
    if (!adminId || !user?.userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `/api/messages/conversation/${user.userId}/${adminId}`
      );
      setMessages(response.data || []);
      // Marquer les messages comme lus
      const unreadMessages = (response.data || []).filter(
        m => !m.isRead && m.receiverId === user.userId
      );
      if (unreadMessages.length > 0) {
        try {
          await axios.put(`/api/messages/user/${user.userId}/read-all`);
        } catch (markErr) {
          // Erreur silencieuse lors du marquage des messages comme lus
        }
      }
    } catch (err) {
      // Si c'est une erreur 404, c'est normal s'il n'y a pas encore de messages
      if (err.response?.status !== 404) {
        setMessages([]);
      }
    } finally {
      setLoading(false);
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
      await fetchConversation();
    } catch (err) {
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
      await fetchConversation();
    } catch (err) {
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

    if (!adminId || !user?.userId) {
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
        senderId: user.userId,
        receiverId: adminId,
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
      setError(null);
      await fetchConversation();
    } catch (err) {
      // Le serveur retourne maintenant le message d'erreur dans le body
      let errorMessage = 'Erreur lors de l\'envoi du message. Veuillez réessayer.';
      
      if (err.response?.data) {
        // Si c'est une string, c'est le message d'erreur
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        }
      } else if (err.response?.statusText) {
        errorMessage = err.response.statusText;
      }
      
      alert(errorMessage);
      setError(errorMessage);
    } finally {
      setSending(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading && messages.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            <p className="mt-4 text-gray-600">Chargement des messages...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <BackButton to="/" />
        </div>
        <Card className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Discuter avec{' '}
            {adminId && (
              <span 
                className="text-yellow-600 hover:text-yellow-700 cursor-pointer underline font-semibold"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/user/${adminId}`);
                }}
                title="Cliquez pour voir le profil de Fixer"
              >
                Fixer
              </span>
            )}
            {!adminId && 'Fixer'}
          </h1>
          
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <p>{error}</p>
            </div>
          )}
          
          {!adminId && !loading && (
            <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
              <p>Chargement de Fixer...</p>
            </div>
          )}

          {/* Messages */}
          <div 
            ref={messagesContainerRef}
            className="h-96 overflow-y-auto space-y-4 mb-6 pr-2 border-b border-gray-200 pb-4"
          >
            {messages.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Aucun message. Commencez la conversation !
              </p>
            ) : (
              <>
                {user?.role === 'ADMIN' && messages.length > 0 && (
                  <div className="mb-2 flex justify-end">
                    <button
                      onClick={() => {
                        const allMessageIds = messages.map(m => m.id);
                        if (allMessageIds.length > 0) {
                          handleDeleteMultipleMessages(allMessageIds);
                        }
                      }}
                      className="text-xs text-red-600 hover:text-red-800 underline"
                    >
                      Supprimer tous les messages
                    </button>
                  </div>
                )}
                {messages.map((message) => {
                const isUser = message.senderId === user.userId;
                const senderId = isUser ? user.userId : adminId;
                const canDelete = user?.role === 'ADMIN'; // Seul l'admin peut supprimer
                return (
                  <div
                    key={message.id}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 relative ${
                        isUser
                          ? 'bg-yellow-500 text-black'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p 
                            className="text-xs font-semibold mb-1 cursor-pointer hover:underline"
                            onClick={() => senderId && navigate(`/user/${senderId}`)}
                            title="Voir le profil"
                          >
                            {isUser ? (user?.username || user?.email || 'Vous') : 'Fixer'}
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
          {adminId && (
            <form onSubmit={handleSendMessage} noValidate>
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
                    disabled={sending || !adminId}
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-input"
                    accept="image/*,application/pdf,.doc,.docx"
                  />
                  <label
                    htmlFor="file-input"
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
                  disabled={sending || (!newMessage.trim() && !selectedFile && !location) || !adminId}
                  className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {sending ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Messages;

