import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card } from '../Card';
import { useAuth } from '../../contexts/AuthContext';

const PublicationManagement = () => {
  const [publications, setPublications] = useState([]);
  const [filteredPublications, setFilteredPublications] = useState([]);
  const [unverifiedOnly, setUnverifiedOnly] = useState(true);
  const [statusFilter, setStatusFilter] = useState(''); // Filtre par statut
  const [typeFilter, setTypeFilter] = useState(''); // Filtre par type
  const [searchQuery, setSearchQuery] = useState(''); // Recherche par nom
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date', 'price-asc', 'price-desc', 'title'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newPublication, setNewPublication] = useState({
    title: "",
    description: "",
    type: "Reparation",
    price: 0,
    utilisateurId: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [editingStatus, setEditingStatus] = useState(null); // ID de la publication en cours d'édition
  const [editingPrice, setEditingPrice] = useState(null); // ID de la publication en cours d'édition du prix
  const [editingPriceValue, setEditingPriceValue] = useState(''); // Valeur du prix en cours d'édition
  const [editingType, setEditingType] = useState(null); // ID de la publication en cours d'édition du type
  const [editingTitle, setEditingTitle] = useState(null); // ID de la publication en cours d'édition du titre
  const [editingTitleValue, setEditingTitleValue] = useState(''); // Valeur du titre en cours d'édition
  const [editingDescription, setEditingDescription] = useState(null); // ID de la publication en cours d'édition de la description
  const [editingDescriptionValue, setEditingDescriptionValue] = useState(''); // Valeur de la description en cours d'édition
  const [openMenuId, setOpenMenuId] = useState(null); // ID de la publication dont le menu hamburger est ouvert
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPublications();
  }, [unverifiedOnly, statusFilter]);

  // Fermer le menu hamburger quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId !== null) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId !== null) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [openMenuId]);

  const fetchPublications = async () => {
    try {
      setLoading(true);
      let endpoint;
      if (statusFilter) {
        // Filtrer par statut
        endpoint = `/api/admin/publications/status/${encodeURIComponent(statusFilter)}`;
      } else if (unverifiedOnly) {
        endpoint = '/api/admin/publications/unverified';
      } else {
        endpoint = '/api/admin/publications';
      }
      const response = await axios.get(endpoint);
      setPublications(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching publications:', err);
      setError('Erreur lors du chargement des publications');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer et trier les publications
  useEffect(() => {
    let filtered = publications;
    
    // Filtrer par type
    if (typeFilter !== '') {
      filtered = filtered.filter(pub => pub.type === typeFilter);
    }
    
    // Filtrer par nom/titre
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(pub => 
        pub.title && pub.title.toLowerCase().includes(query)
      );
    }
    
    // Filtrer par prix minimum
    if (priceMin !== '' && !isNaN(parseFloat(priceMin))) {
      filtered = filtered.filter(pub => pub.price >= parseFloat(priceMin));
    }
    
    // Filtrer par prix maximum
    if (priceMax !== '' && !isNaN(parseFloat(priceMax))) {
      filtered = filtered.filter(pub => pub.price <= parseFloat(priceMax));
    }
    
    // Trier les résultats
    let sorted = [...filtered];
    switch (sortBy) {
      case 'price-asc':
        sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-desc':
        sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'title':
        sorted.sort((a, b) => {
          const titleA = (a.title || '').toLowerCase();
          const titleB = (b.title || '').toLowerCase();
          return titleA.localeCompare(titleB);
        });
        break;
      case 'date':
      default:
        // Tri par date (plus récent en premier) - utiliser l'ID comme substitut si createdAt n'est pas disponible
        sorted.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
          }
          // Utiliser l'ID comme substitut (IDs plus grands = plus récents)
          return (b.id || 0) - (a.id || 0);
        });
        break;
    }
    
    setFilteredPublications(sorted);
  }, [typeFilter, searchQuery, priceMin, priceMax, sortBy, publications]);

  const handleSetInCatalog = async (publicationId, inCatalog) => {
    try {
      // Si la publication n'est pas vérifiée, la vérifier d'abord
      const publication = publications.find(p => p.id === publicationId);
      if (publication && !publication.verified) {
        await axios.post(`/api/admin/publications/${publicationId}/verify`, {
          adminId: user.userId,
        });
      }
      
      await axios.put(`/api/admin/publications/${publicationId}/catalog`, {
        inCatalog: inCatalog
      });
      fetchPublications();
      alert(
        inCatalog 
          ? '✅ Publication mise au catalogue ! Elle est maintenant visible sur la page /shop.'
          : '✅ Publication retirée du catalogue.'
      );
    } catch (err) {
      console.error('Error setting publication in catalog:', err);
      const errorMessage = err.response?.data?.message || 'Erreur lors de la mise à jour';
      alert(errorMessage);
    }
  };

  const handleSetInPublications = async (publicationId, inPublications) => {
    try {
      // Si la publication n'est pas vérifiée, la vérifier d'abord
      const publication = publications.find(p => p.id === publicationId);
      if (publication && !publication.verified) {
        await axios.post(`/api/admin/publications/${publicationId}/verify`, {
          adminId: user.userId,
        });
      }
      
      await axios.put(`/api/admin/publications/${publicationId}/publications`, {
        inPublications: inPublications
      });
      fetchPublications();
      alert(
        inPublications 
          ? '✅ Publication mise dans les publications ! Elle est maintenant visible sur la page /publications.'
          : '✅ Publication retirée des publications.'
      );
    } catch (err) {
      console.error('Error setting publication in publications:', err);
      const errorMessage = err.response?.data?.message || 'Erreur lors de la mise à jour';
      alert(errorMessage);
    }
  };

  const handleUnverify = async (publicationId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir retirer cette publication du catalogue ? Elle ne sera plus visible dans la page des publications.')) {
      return;
    }
    try {
      await axios.post(`/api/admin/publications/${publicationId}/unverify`);
      fetchPublications();
      alert('⚠️ Publication retirée du catalogue. Elle n\'est plus visible dans la page des publications.');
    } catch (err) {
      console.error('Error unverifying publication:', err);
      const errorMessage = err.response?.data?.message || 'Erreur lors de l\'annulation de la vérification';
      alert(errorMessage);
    }
  };

  const handleDelete = async (publicationId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette publication ?\n\nCette action est irréversible.')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/publications/${publicationId}`);
      alert('✅ Publication supprimée avec succès');
      fetchPublications(); // Rafraîchir la liste
    } catch (err) {
      console.error('Error deleting publication:', err);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      
      // Extraire le message d'erreur du backend
      let errorMessage = 'Erreur lors de la suppression de la publication';
      
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Message plus spécifique pour les erreurs 409 (Conflict)
      if (err.response?.status === 409) {
        const fullError = JSON.stringify(err.response?.data, null, 2);
        console.error('Full error details:', fullError);
        errorMessage = errorMessage || 'Impossible de supprimer cette publication car elle est liée à d\'autres données (notifications, commentaires, etc.).';
        alert(`❌ Conflit de données (409)\n\n${errorMessage}\n\nVérifiez les logs du serveur pour plus de détails.\n\nDétails complets dans la console.`);
      } else {
        alert(`❌ Erreur: ${errorMessage}\n\nCode d'erreur: ${err.response?.status || 'Inconnu'}`);
      }
    }
  };

  const handleStatusChange = async (publicationId, newStatus) => {
    try {
      await axios.put(`/api/admin/publications/${publicationId}/status`, {
        status: newStatus
      });
      setEditingStatus(null);
      fetchPublications();
    } catch (err) {
      console.error('Error updating status:', err);
      const errorMessage = err.response?.data?.message || 'Erreur lors de la mise à jour du statut';
      alert(errorMessage);
    }
  };

  const handlePriceChange = async (publicationId, newPrice) => {
    try {
      const price = parseFloat(newPrice);
      if (isNaN(price) || price <= 0) {
        alert('Le prix doit être un nombre positif');
        return;
      }
      await axios.put(`/api/admin/publications/${publicationId}/price`, {
        price: price
      });
      setEditingPrice(null);
      setEditingPriceValue('');
      fetchPublications();
      alert('✅ Prix mis à jour avec succès !');
    } catch (err) {
      console.error('Error updating price:', err);
      const errorMessage = err.response?.data?.message || 'Erreur lors de la mise à jour du prix';
      alert(errorMessage);
    }
  };

  const handleTypeChange = async (publicationId, newType) => {
    try {
      if (!newType || newType.trim() === '') {
        alert('Le type ne peut pas être vide');
        return;
      }
      await axios.put(`/api/admin/publications/${publicationId}/type`, {
        type: newType
      });
      setEditingType(null);
      fetchPublications();
      alert('✅ Type mis à jour avec succès !');
    } catch (err) {
      console.error('Error updating type:', err);
      const errorMessage = err.response?.data?.message || 'Erreur lors de la mise à jour du type';
      alert(errorMessage);
    }
  };

  const handleTitleChange = async (publicationId, newTitle) => {
    try {
      if (!newTitle || newTitle.trim() === '') {
        alert('Le titre ne peut pas être vide');
        return;
      }
      await axios.put(`/api/admin/publications/${publicationId}/title`, {
        title: newTitle
      });
      setEditingTitle(null);
      setEditingTitleValue('');
      fetchPublications();
      alert('✅ Titre mis à jour avec succès !');
    } catch (err) {
      console.error('Error updating title:', err);
      const errorMessage = err.response?.data?.message || 'Erreur lors de la mise à jour du titre';
      alert(errorMessage);
    }
  };

  const handleDescriptionChange = async (publicationId, newDescription) => {
    try {
      if (!newDescription || newDescription.trim() === '') {
        alert('La description ne peut pas être vide');
        return;
      }
      await axios.put(`/api/admin/publications/${publicationId}/description`, {
        description: newDescription
      });
      setEditingDescription(null);
      setEditingDescriptionValue('');
      fetchPublications();
      alert('✅ Description mise à jour avec succès !');
    } catch (err) {
      console.error('Error updating description:', err);
      const errorMessage = err.response?.data?.message || 'Erreur lors de la mise à jour de la description';
      alert(errorMessage);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'non traité': 'bg-red-100 text-red-800',
      'en cours': 'bg-yellow-100 text-yellow-800',
      'traité': 'bg-green-100 text-green-800',
      'terminé': 'bg-blue-100 text-blue-800',
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type) => {
    const colors = {
      Reparation: 'bg-blue-100 text-blue-800',
      Achat: 'bg-green-100 text-green-800',
      Vente: 'bg-purple-100 text-purple-800',
      exchange: 'bg-orange-100 text-orange-800',
      donation: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || colors.other;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        <p className="mt-4 text-gray-600">Chargement des publications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchPublications}
          className="mt-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg"
        >
          Réessayer
        </button>
      </Card>
    );
  }

  const handleCreateAndVerify = async (publicationId) => {
    try {
      // Créer et vérifier immédiatement
      await handleVerify(publicationId);
      fetchPublications();
    } catch (err) {
      console.error('Error creating and verifying publication:', err);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestion des Publications</h2>
            <p className="text-gray-600">
              Total: {publications.length} publication(s)
              {statusFilter && ` (statut: "${statusFilter}")`}
              {!statusFilter && unverifiedOnly && ' (non vérifiées)'}
              {(typeFilter || searchQuery.trim()) && (
                <span className="ml-2 text-yellow-600">
                  ({filteredPublications.length} résultat{(typeFilter || searchQuery.trim()) ? 's' : ''})
                </span>
              )}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              💡 Astuce: Vous pouvez créer une publication via /publications puis la vérifier ici pour la mettre au catalogue.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={unverifiedOnly}
                onChange={(e) => {
                  setUnverifiedOnly(e.target.checked);
                  if (e.target.checked) {
                    setStatusFilter(''); // Réinitialiser le filtre de statut
                  }
                }}
                className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500"
              />
              <span className="text-gray-700">Non vérifiées uniquement</span>
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setUnverifiedOnly(false); // Désactiver le filtre non vérifiées
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            >
              <option value="">Tous les statuts</option>
              <option value="non traité">Non traité</option>
              <option value="en cours">En cours</option>
              <option value="traité">Traité</option>
              <option value="terminé">Terminé</option>
            </select>
            <button
              onClick={fetchPublications}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Actualiser
            </button>
          </div>
        </div>

        {/* Layout avec filtres à gauche */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar des filtres à gauche */}
          <div className="lg:w-80 flex-shrink-0 order-2 lg:order-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Filtres</h2>
              
              <div className="space-y-4">
                {/* Recherche par nom */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Recherche
                  </label>
                  <input
                    type="text"
                    placeholder="Rechercher par nom..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white text-gray-900"
                  />
                </div>
                
                {/* Filtre par type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white text-gray-900"
                  >
                    <option value="">Tous les types</option>
                    <option value="Reparation">Réparation</option>
                    <option value="Achat">Achat</option>
                    <option value="Vente">Vente</option>
                    <option value="exchange">Échange</option>
                    <option value="donation">Donation</option>
                  </select>
                </div>
                
                {/* Tri */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Trier par
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white text-gray-900"
                  >
                    <option value="date">Plus récent</option>
                    <option value="price-asc">Prix croissant</option>
                    <option value="price-desc">Prix décroissant</option>
                    <option value="title">Nom (A-Z)</option>
                  </select>
                </div>
                
                {/* Prix minimum */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Prix minimum (DT)
                  </label>
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white text-gray-900"
                  />
                </div>
                
                {/* Prix maximum */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Prix maximum (DT)
                  </label>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white text-gray-900"
                  />
                </div>
                
                {/* Résultats et réinitialiser */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">
                    {filteredPublications.length} publication{filteredPublications.length > 1 ? 's' : ''} trouvée{filteredPublications.length > 1 ? 's' : ''}
                  </p>
                  {(typeFilter || searchQuery.trim() || priceMin || priceMax) && (
                    <button
                      onClick={() => {
                        setTypeFilter('');
                        setSearchQuery('');
                        setPriceMin('');
                        setPriceMax('');
                      }}
                      className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors duration-200"
                    >
                      Réinitialiser les filtres
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contenu principal - Publications */}
          <div className="flex-1 order-1 lg:order-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {publications.length === 0 ? (
          <Card className="col-span-full text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-600">
              {statusFilter
                ? `Aucune publication avec le statut "${statusFilter}"`
                : unverifiedOnly
                ? 'Aucune publication non vérifiée'
                : 'Aucune publication trouvée'}
            </p>
          </Card>
        ) : filteredPublications.length === 0 ? (
          <Card className="col-span-full text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-600 mb-4">
              Aucune publication trouvée avec les critères de recherche
            </p>
            {(typeFilter || searchQuery.trim() || priceMin || priceMax) && (
              <button
                onClick={() => {
                  setTypeFilter('');
                  setSearchQuery('');
                  setPriceMin('');
                  setPriceMax('');
                }}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
              >
                Réinitialiser les filtres
              </button>
            )}
          </Card>
        ) : (
          filteredPublications.map((publication) => (
            <Card key={publication.id} className="p-6 flex flex-col">
              {/* Informations du propriétaire - EN HAUT */}
              {publication.utilisateurId && (
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Propriétaire:</p>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center cursor-pointer hover:bg-yellow-200 transition-colors overflow-hidden relative"
                      onClick={() => navigate(`/user/${publication.utilisateurId}`)}
                      title="Voir le profil"
                    >
                      {publication.utilisateurProfilePhoto ? (
                        <img
                          src={`http://localhost:9090${publication.utilisateurProfilePhoto}`}
                          alt={publication.utilisateurUsername || publication.utilisateurEmail || "Utilisateur"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : null}
                      <span 
                        className={`text-yellow-600 font-semibold text-sm absolute inset-0 flex items-center justify-center ${publication.utilisateurProfilePhoto ? 'hidden' : ''}`}
                      >
                        {(publication.utilisateurUsername || publication.utilisateurEmail || "U").charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p 
                        className="text-sm font-semibold text-gray-900 truncate cursor-pointer hover:text-yellow-600 hover:underline transition-colors"
                        onClick={() => navigate(`/user/${publication.utilisateurId}`)}
                        title="Cliquez pour voir le profil"
                      >
                        {publication.utilisateurUsername || publication.utilisateurEmail || `Utilisateur #${publication.utilisateurId}`}
                      </p>
                      {publication.utilisateurEmail && publication.utilisateurEmail !== publication.utilisateurUsername && (
                        <p 
                          className="text-xs text-gray-500 truncate cursor-pointer hover:text-yellow-600 hover:underline transition-colors"
                          onClick={() => navigate(`/user/${publication.utilisateurId}`)}
                          title="Cliquez pour voir le profil"
                        >
                          {publication.utilisateurEmail}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">ID: {publication.utilisateurId}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Image */}
              {publication.fileUrl && publication.fileType?.startsWith('image/') && (
                <div className="w-full h-48 mb-4 rounded-lg overflow-hidden">
                  <img
                    src={`http://localhost:9090${publication.fileUrl}`}
                    alt={publication.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <div className="flex-1 flex flex-col">

              <div className="flex items-start justify-between mb-3">
                {editingTitle === publication.id ? (
                  <div className="flex-1 flex items-center space-x-2">
                    <input
                      type="text"
                      value={editingTitleValue}
                      onChange={(e) => setEditingTitleValue(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="Nouveau titre"
                      autoFocus
                    />
                    <button
                      onClick={() => handleTitleChange(publication.id, editingTitleValue)}
                      className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm"
                    >
                      ✓ Valider
                    </button>
                    <button
                      onClick={() => {
                        setEditingTitle(null);
                        setEditingTitleValue('');
                      }}
                      className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-sm"
                    >
                      Annuler
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center space-x-2">
                    <h3 className="text-xl font-bold text-gray-900 flex-1">{publication.title}</h3>
                    <button
                      onClick={() => {
                        setEditingTitle(publication.id);
                        setEditingTitleValue(publication.title);
                      }}
                      className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded transition-colors"
                      title="Modifier le titre"
                    >
                      ✏️
                    </button>
                  </div>
                )}
                {editingType === publication.id ? (
                  <div className="flex items-center space-x-2">
                    <select
                      value={publication.type || 'Reparation'}
                      onChange={(e) => {
                        handleTypeChange(publication.id, e.target.value);
                      }}
                      className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-xs font-semibold"
                      autoFocus
                    >
                      <option value="Reparation">Reparation</option>
                      <option value="Achat">Achat</option>
                      <option value="Vente">Vente</option>
                      <option value="exchange">Exchange</option>
                      <option value="donation">Donation</option>
                    </select>
                    <button
                      onClick={() => setEditingType(null)}
                      className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(
                        publication.type
                      )}`}
                    >
                      {publication.type}
                    </span>
                    <button
                      onClick={() => setEditingType(publication.id)}
                      className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded transition-colors"
                      title="Modifier le type"
                    >
                      ✏️
                    </button>
                  </div>
                )}
              </div>

              {editingDescription === publication.id ? (
                <div className="mb-4">
                  <textarea
                    value={editingDescriptionValue}
                    onChange={(e) => setEditingDescriptionValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 min-h-[100px]"
                    placeholder="Nouvelle description"
                    autoFocus
                  />
                  <div className="flex items-center space-x-2 mt-2">
                    <button
                      onClick={() => handleDescriptionChange(publication.id, editingDescriptionValue)}
                      className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm"
                    >
                      ✓ Valider
                    </button>
                    <button
                      onClick={() => {
                        setEditingDescription(null);
                        setEditingDescriptionValue('');
                      }}
                      className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-sm"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-4 flex items-start space-x-2">
                  <p className="text-gray-700 flex-1 line-clamp-3">{publication.description}</p>
                  <button
                    onClick={() => {
                      setEditingDescription(publication.id);
                      setEditingDescriptionValue(publication.description);
                    }}
                    className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded transition-colors flex-shrink-0"
                    title="Modifier la description"
                  >
                    ✏️
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                {editingPrice === publication.id ? (
                  <div className="flex items-center space-x-2 flex-1">
                    <span className="text-lg font-semibold text-gray-700">Prix:</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={editingPriceValue}
                      onChange={(e) => setEditingPriceValue(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="Nouveau prix"
                      autoFocus
                    />
                    <span className="text-lg font-semibold text-gray-700">DT</span>
                    <button
                      onClick={() => handlePriceChange(publication.id, editingPriceValue)}
                      className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm"
                    >
                      ✓ Valider
                    </button>
                    <button
                      onClick={() => {
                        setEditingPrice(null);
                        setEditingPriceValue('');
                      }}
                      className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-sm"
                    >
                      Annuler
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 flex-1">
                    <span className="text-2xl font-bold text-yellow-600">{publication.price} DT</span>
                    <button
                      onClick={() => {
                        setEditingPrice(publication.id);
                        setEditingPriceValue(publication.price.toString());
                      }}
                      className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded transition-colors"
                      title="Modifier le prix"
                    >
                      ✏️ Modifier
                    </button>
                  </div>
                )}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    publication.verified
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {publication.verified ? '✓ Vérifiée' : '✗ Non vérifiée'}
                </span>
              </div>

              {/* Affichage et modification du statut */}
              <div className="mb-3">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Statut:
                </label>
                {editingStatus === publication.id ? (
                  <div className="flex items-center space-x-2">
                    <select
                      value={publication.status || 'non traité'}
                      onChange={(e) => {
                        handleStatusChange(publication.id, e.target.value);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      autoFocus
                    >
                      <option value="non traité">Non traité</option>
                      <option value="en cours">En cours</option>
                      <option value="traité">Traité</option>
                      <option value="terminé">Terminé</option>
                    </select>
                    <button
                      onClick={() => setEditingStatus(null)}
                      className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        publication.status
                      )}`}
                    >
                      {publication.status || 'non traité'}
                    </span>
                    <button
                      onClick={() => setEditingStatus(publication.id)}
                      className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded transition-colors"
                      title="Modifier le statut"
                    >
                      ✏️ Modifier
                    </button>
                  </div>
                )}
              </div>

              <div className="mb-3 text-sm text-gray-600">
                {publication.createdAt && (
                  <p className="mb-1"><strong>Créée le:</strong> {new Date(publication.createdAt).toLocaleDateString('fr-FR')}</p>
                )}
                {publication.verifiedAt && (
                  <p><strong>Vérifiée le:</strong> {new Date(publication.verifiedAt).toLocaleDateString('fr-FR')}</p>
                )}
              </div>
              </div>

              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                {!publication.verified && (
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
                      ⚠️ Non vérifiée - Cliquez sur un bouton ci-dessous pour vérifier et placer
                    </span>
                  </div>
                )}
                <div className="flex flex-col space-y-2">
                  {/* Indicateurs d'état */}
                  {publication.verified && (
                    <div className="flex items-center gap-2 mb-2">
                      {publication.inCatalog && (
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                          📋 Catalogue
                        </span>
                      )}
                      {publication.inPublications && (
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          📄 Publications
                        </span>
                      )}
                      {!publication.inCatalog && !publication.inPublications && (
                        <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                          ⚠️ Vérifiée mais pas encore placée
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Menu Hamburger */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === publication.id ? null : publication.id);
                      }}
                      className="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors font-semibold flex items-center justify-center space-x-2"
                      title="Menu d'actions"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                      <span>Actions</span>
                    </button>
                    
                    {/* Menu déroulant */}
                    {openMenuId === publication.id && (
                      <div 
                        className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex flex-col">
                          <button
                            onClick={() => {
                              handleSetInCatalog(publication.id, !publication.inCatalog);
                              setOpenMenuId(null);
                            }}
                            className={`w-full px-4 py-2 text-left transition-colors font-semibold ${
                              publication.inCatalog
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-green-500 text-white hover:bg-green-600'
                            }`}
                            title={publication.inCatalog ? "Retirer du catalogue" : "Mettre dans le catalogue - Visible sur /shop (vérifie automatiquement)"}
                          >
                            {publication.inCatalog ? '📋 Retirer du Catalogue' : '📋 Mettre au Catalogue'}
                          </button>
                          
                          <button
                            onClick={() => {
                              handleSetInPublications(publication.id, !publication.inPublications);
                              setOpenMenuId(null);
                            }}
                            className={`w-full px-4 py-2 text-left transition-colors font-semibold ${
                              publication.inPublications
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                            title={publication.inPublications ? "Retirer des publications" : "Mettre dans les publications - Visible sur /publications (vérifie automatiquement)"}
                          >
                            {publication.inPublications ? '📄 Retirer des Publications' : '📄 Mettre dans Publications'}
                          </button>
                          
                          {(!publication.inCatalog || !publication.inPublications) && (
                            <button
                              onClick={() => {
                                if (!publication.inCatalog) handleSetInCatalog(publication.id, true);
                                if (!publication.inPublications) handleSetInPublications(publication.id, true);
                                setOpenMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-left bg-purple-500 hover:bg-purple-600 text-white transition-colors font-semibold"
                              title="Mettre dans le catalogue ET dans les publications (vérifie automatiquement)"
                            >
                              📋📄 Mettre dans les Deux
                            </button>
                          )}
                          
                          {publication.verified && (
                            <button
                              onClick={() => {
                                handleUnverify(publication.id);
                                setOpenMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-left bg-yellow-500 hover:bg-yellow-600 text-white transition-colors font-semibold"
                              title="Retirer - La publication ne sera plus visible publiquement"
                            >
                              ✗ Retirer (Dévérifier)
                            </button>
                          )}
                          
                          <button
                            onClick={() => {
                              handleDelete(publication.id);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-4 py-2 text-left bg-red-500 hover:bg-red-600 text-white transition-colors font-semibold"
                            title="Supprimer définitivement"
                          >
                            🗑️ Supprimer
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicationManagement;

