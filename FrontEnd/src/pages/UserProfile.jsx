import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card } from '../components/Card';
import { BackButton } from '../components/BackButton';
import { useAuth } from '../contexts/AuthContext';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchProfile();
      // Ne plus charger la recommandation - section masquée
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/utilis/profile/${userId}`);
      setProfile(response.data);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };


  const formatDate = (dateString) => {
    if (!dateString) return 'Jamais';
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
          <p className="mt-4 text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-6">
            <BackButton to="/" />
          </div>
          <Card className="p-8 text-center">
            <p className="text-red-500">{error || 'Profil non trouvé'}</p>
          </Card>
        </div>
      </div>
    );
  }

  // Si c'est le profil de l'utilisateur connecté, rediriger vers la page de profil
  if (currentUser?.userId && parseInt(userId) === currentUser.userId) {
    navigate('/profile');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <BackButton to="/" />
        </div>

        <Card className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Photo de profil */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {profile.profilePhoto ? (
                    <img
                      src={`http://localhost:9090${profile.profilePhoto}`}
                      alt="Photo de profil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl text-gray-400">
                      {(profile.username || profile.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                {profile.isOnline && (
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
                )}
              </div>
            </div>

            {/* Informations du profil */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">
                Profil de {profile.username || profile.email || 'Utilisateur'}
              </h1>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom d'utilisateur
                  </label>
                  <p className="px-4 py-2 bg-gray-50 rounded-lg">
                    {profile.username || 'Non défini'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <p className="px-4 py-2 bg-gray-50 rounded-lg">{profile.email}</p>
                </div>

                {profile.phone && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <p className="px-4 py-2 bg-gray-50 rounded-lg">{profile.phone}</p>
                  </div>
                )}

                {profile.address && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Adresse
                    </label>
                    <p className="px-4 py-2 bg-gray-50 rounded-lg">{profile.address}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Statut
                    </label>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          profile.isOnline ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                      ></div>
                      <span className="text-gray-700">
                        {profile.isOnline ? 'En ligne' : 'Hors ligne'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Dernière connexion
                    </label>
                    <p className="text-gray-700">{formatDate(profile.lastLogin)}</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;

