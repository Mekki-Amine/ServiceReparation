import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/Card';
import { BackButton } from '../components/BackButton';
import RecommendationForm from '../components/RecommendationForm';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    address: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.userId) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [user?.userId, isAuthenticated]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/utilis/profile/${user.userId}`);
      setProfile(response.data);
      setFormData({
        username: response.data.username || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        address: response.data.address || '',
      });
      if (response.data.profilePhoto) {
        setPhotoPreview(`http://localhost:9090${response.data.profilePhoto}`);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('La photo ne doit pas dépasser 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner une image');
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return;

    try {
      setUploading(true);
      setError(null);
      const formData = new FormData();
      formData.append('file', photoFile);

      const response = await axios.post(
        `/api/utilis/profile/${user.userId}/photo`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setProfile(response.data);
      setPhotoPreview(`http://localhost:9090${response.data.profilePhoto}`);
      setPhotoFile(null);
      setSuccess('Photo de profil mise à jour avec succès');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error uploading photo:', err);
      setError('Erreur lors de l\'upload de la photo');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const response = await axios.put(
        `/api/utilis/profile/${user.userId}`,
        formData
      );
      setProfile(response.data);
      setEditing(false);
      setSuccess('Profil mis à jour avec succès');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-red-500">Erreur lors du chargement du profil</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <BackButton to="/" />
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        <Card className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Photo de profil */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
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
              <div className="mt-4 space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="block w-full text-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg cursor-pointer transition-colors"
                >
                  Choisir une photo
                </label>
                {photoFile && (
                  <button
                    onClick={handlePhotoUpload}
                    disabled={uploading}
                    className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors disabled:bg-gray-400"
                  >
                    {uploading ? 'Upload...' : 'Enregistrer la photo'}
                  </button>
                )}
              </div>
            </div>

            {/* Informations du profil */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Mon Profil</h1>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom d'utilisateur
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  ) : (
                    <p className="px-4 py-2 bg-gray-50 rounded-lg">
                      {profile.username || 'Non défini'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <p className="px-4 py-2 bg-gray-50 rounded-lg">{profile.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Téléphone
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Ex: +216 XX XXX XXX ou 0X XXX XXX"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  ) : (
                    <p className="px-4 py-2 bg-gray-50 rounded-lg">
                      {profile.phone || 'Non défini'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Adresse
                  </label>
                  {editing ? (
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Votre adresse complète"
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  ) : (
                    <p className="px-4 py-2 bg-gray-50 rounded-lg">
                      {profile.address || 'Non définie'}
                    </p>
                  )}
                </div>

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

                <div className="flex gap-4 pt-4">
                  {editing ? (
                    <>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition-colors disabled:bg-gray-400"
                      >
                        {saving ? 'Enregistrement...' : 'Enregistrer'}
                      </button>
                      <button
                        onClick={() => {
                          setEditing(false);
                          setFormData({
                            username: profile.username || '',
                            email: profile.email || '',
                            phone: profile.phone || '',
                            address: profile.address || '',
                          });
                        }}
                        className="flex-1 px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
                      >
                        Annuler
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditing(true)}
                      className="flex-1 px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition-colors"
                    >
                      Modifier le profil
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Formulaire de recommandation */}
        <RecommendationForm />
      </div>
    </div>
  );
};

export default Profile;

