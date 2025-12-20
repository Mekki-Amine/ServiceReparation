import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const RecommendationForm = () => {
  const { user, isAdmin } = useAuth();
  const [rating, setRating] = useState(0);
  const [userRating, setUserRating] = useState(null);
  const [stats, setStats] = useState(null);
  const [allRecommendations, setAllRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserRecommendation();
    fetchStats();
    // Charger toutes les recommandations uniquement pour les admins
    if (user && isAdmin()) {
      fetchAllRecommendations();
    }
  }, [user]);

  const fetchUserRecommendation = async () => {
    if (!user?.userId) return;

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`/api/recommendations/user/${user.userId}`, { headers });
      if (response.data) {
        setUserRating(response.data.rating);
        setRating(response.data.rating);
      }
    } catch (err) {
      // Pas de recommandation existante
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/recommendations/stats');
      setStats(response.data);
    } catch (err) {
      // Erreur silencieuse lors du chargement des statistiques
    }
  };

  const fetchAllRecommendations = async () => {
    try {
      setLoadingRecommendations(true);
      setError(null);
      // L'endpoint est public, mais on envoie le token si disponible
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get('/api/recommendations', { headers });
      if (response.data && Array.isArray(response.data)) {
        setAllRecommendations(response.data);
      } else {
        setAllRecommendations([]);
      }
    } catch (err) {
      setAllRecommendations([]);
      // Afficher l'erreur pour déboguer
      if (err.response) {
        setError(`Erreur ${err.response.status}: Impossible de charger les recommandations`);
      } else if (err.request) {
        setError('Impossible de contacter le serveur');
      }
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.userId) {
      setError('Vous devez être connecté pour recommander');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.post(
        `/api/recommendations/user/${user.userId}`,
        { rating },
        { headers }
      );

      setUserRating(rating);
      setSuccess('Votre recommandation a été enregistrée avec succès !');
      fetchStats();
      // Rafraîchir la liste des recommandations uniquement pour les admins
      if (isAdmin()) {
        fetchAllRecommendations();
      }
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Erreur lors de l\'enregistrement de votre recommandation');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecommendation = async (recommendationId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette recommandation ?')) {
      return;
    }

    setDeletingId(recommendationId);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vous devez être connecté pour supprimer une recommandation');
        setDeletingId(null);
        return;
      }
      
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.delete(`/api/recommendations/${recommendationId}`, { headers });
      
      // Rafraîchir la liste des recommandations
      await fetchAllRecommendations();
      setSuccess('Recommandation supprimée avec succès');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erreur suppression recommandation:', err);
      if (err.response) {
        if (err.response.status === 403) {
          setError('Vous n\'avez pas les permissions pour supprimer cette recommandation');
        } else if (err.response.status === 404) {
          setError('Recommandation non trouvée');
        } else if (err.response.status === 401) {
          setError('Vous devez être connecté pour supprimer une recommandation');
        } else {
          setError(`Erreur ${err.response.status}: ${err.response.data?.message || 'Erreur lors de la suppression'}`);
        }
      } else if (err.request) {
        setError('Impossible de contacter le serveur');
      } else {
        setError('Erreur lors de la suppression de la recommandation');
      }
    } finally {
      setDeletingId(null);
    }
  };

  // Pour les admins, afficher uniquement la liste des recommandations
  if (user && isAdmin()) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Recommandations des utilisateurs
        </h2>

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        {loadingRecommendations ? (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-yellow-500"></div>
            <p className="mt-2 text-sm text-gray-600">Chargement des recommandations...</p>
          </div>
        ) : allRecommendations.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Aucune recommandation pour le moment.
          </p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {allRecommendations.map((recommendation) => (
              <div
                key={recommendation.id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-yellow-400 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">
                        {recommendation.username || recommendation.userEmail || `Utilisateur #${recommendation.userId}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(10)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-lg ${
                              i < recommendation.rating
                                ? 'text-yellow-500'
                                : 'text-gray-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {recommendation.rating} / 10
                      </span>
                    </div>
                    {recommendation.createdAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(recommendation.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteRecommendation(recommendation.id)}
                    disabled={deletingId === recommendation.id}
                    className="ml-4 px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Supprimer cette recommandation"
                  >
                    {deletingId === recommendation.id ? 'Suppression...' : 'Supprimer'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Recommanderais-tu Fixer à tes amis ou à tes proches ?
      </h2>
      <p className="text-gray-600 mb-4">
        (10 étant la meilleure note) 0 = pas du tout probable, 10 = très probable
      </p>

      {stats && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Note moyenne : <span className="font-bold text-yellow-600">{stats.averageRating?.toFixed(1) || '0.0'}</span> / 10
          </p>
          <p className="text-sm text-gray-600">
            Nombre total de recommandations : <span className="font-bold">{stats.totalRecommendations || 0}</span>
          </p>
        </div>
      )}

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Votre note : {rating} / 10
          </label>
          <input
            type="range"
            min="0"
            max="10"
            value={rating}
            onChange={(e) => setRating(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>

        {userRating !== null && (
          <p className="text-sm text-gray-600">
            Votre note actuelle : <span className="font-semibold">{userRating} / 10</span>
          </p>
        )}

        {success && (
          <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg mb-4">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Enregistrement...' : userRating !== null ? 'Mettre à jour ma recommandation' : 'Soumettre ma recommandation'}
        </button>
      </form>
      ) : (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-gray-700">
            <Link to="/login" className="text-yellow-600 hover:text-yellow-700 font-semibold underline">
              Connectez-vous
            </Link>
            {' '}pour soumettre votre recommandation.
          </p>
        </div>
      )}
    </div>
  );
};

export default RecommendationForm;

