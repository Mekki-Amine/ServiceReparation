import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "./components/Card";
import { useAuth } from "./contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { BackButton } from "./components/BackButton";

const Shop = () => {
  const navigate = useNavigate();
  const [publications, setPublications] = useState([]);
  const [filteredPublications, setFilteredPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPublication, setSelectedPublication] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date', 'price-asc', 'price-desc', 'title'
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
  });
  const [processingPayment, setProcessingPayment] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchVerifiedPublications();
  }, []);

  const fetchVerifiedPublications = async () => {
    try {
      setLoading(true);
      // Récupérer uniquement les publications vérifiées (catalogue)
      const response = await axios.get("/api/pub");
      setPublications(response.data || []);
      setFilteredPublications(response.data || []);
      setError(null);
    } catch (err) {
      setError("Impossible de charger le catalogue. Vérifiez que le serveur est démarré.");
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

  const handleAddToCart = async (publication) => {
    if (!isAuthenticated || !user?.userId) {
      alert('Veuillez vous connecter pour ajouter des articles au panier');
      navigate('/login');
      return;
    }

    try {
      setAddingToCart(true);
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.post(
        `/api/cart/user/${user.userId}/items`,
        {
          publicationId: publication.id,
          quantity: 1
        },
        { headers }
      );
      
      alert(`${publication.title} a été ajouté au panier !`);
    } catch (err) {
      alert('Erreur lors de l\'ajout au panier');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyClick = (publication) => {
    if (!isAuthenticated) {
      alert("Vous devez être connecté pour effectuer un paiement.");
      navigate("/login");
      return;
    }
    setSelectedPublication(publication);
    setShowPaymentModal(true);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessingPayment(true);

    try {
      // Simulation de paiement - Dans un vrai système, vous utiliseriez Stripe, PayPal, etc.
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simuler le traitement

      // Ici, vous pouvez appeler un endpoint backend pour enregistrer la transaction
      // await axios.post("/api/payments/process", {
      //   publicationId: selectedPublication.id,
      //   userId: user.userId,
      //   amount: selectedPublication.price,
      //   paymentInfo: paymentInfo
      // });

      alert(`Paiement de ${selectedPublication.price} DT effectué avec succès pour "${selectedPublication.title}"!`);
      setShowPaymentModal(false);
      setSelectedPublication(null);
      setPaymentInfo({
        cardNumber: "",
        cardHolder: "",
        expiryDate: "",
        cvv: "",
      });
    } catch (err) {
      alert("Erreur lors du paiement. Veuillez réessayer.");
    } finally {
      setProcessingPayment(false);
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      Reparation: "bg-blue-100 text-blue-800",
      Achat: "bg-green-100 text-green-800",
      Vente: "bg-purple-100 text-purple-800",
      exchange: "bg-orange-100 text-orange-800",
      donation: "bg-pink-100 text-pink-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[type] || colors.other;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <BackButton to="/" />
        </div>
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Notre Catalogue
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Découvrez notre sélection de produits et services vérifiés pour tous vos besoins en réparation
          </p>
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

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
                <p className="mt-4 text-gray-600">Chargement du catalogue...</p>
              </div>
            ) : error ? (
              <Card className="text-center py-12">
                <p className="text-red-500">{error}</p>
                <button
                  onClick={fetchVerifiedPublications}
                  className="mt-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg"
                >
                  Réessayer
                </button>
              </Card>
            ) : filteredPublications.length === 0 ? (
              <div className="max-w-2xl mx-auto">
                <Card className="text-center py-12">
                  <div className="text-6xl mb-4">📦</div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    {(typeFilter || searchQuery.trim() || priceMin || priceMax) 
                      ? 'Aucune publication trouvée' 
                      : 'Aucune publication disponible pour le moment'}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {(typeFilter || searchQuery.trim() || priceMin || priceMax)
                      ? 'Essayez de modifier vos critères de recherche ou consultez toutes les publications.'
                      : 'Le catalogue sera bientôt rempli. En attendant, n\'hésitez pas à nous contacter pour vos besoins spécifiques.'}
                  </p>
                  {(typeFilter || searchQuery.trim() || priceMin || priceMax) && (
                    <button
                      onClick={() => {
                        setTypeFilter('');
                        setSearchQuery('');
                        setPriceMin('');
                        setPriceMax('');
                      }}
                      className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-6 rounded-lg transition-colors duration-200 mr-4"
                    >
                      Voir toutes les publications
                    </button>
                  )}
                  <a
                    href="/contact"
                    className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
                  >
                    Nous contacter
                  </a>
                </Card>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredPublications.map((publication) => (
              <Card key={publication.id} hover className="flex flex-col">
                {/* Image */}
                {publication.fileUrl && publication.fileType?.startsWith("image/") && (
                  <div className="w-full h-48 mb-4 rounded-lg overflow-hidden">
                    <img
                      src={`http://localhost:9090${publication.fileUrl}`}
                      alt={publication.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}
                
                <div className="flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 flex-1">
                      {publication.title}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getTypeColor(publication.type)} ml-2`}>
                      {publication.type}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                    {publication.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="text-2xl font-bold text-yellow-600">
                      {publication.price} DT
                    </span>
                    {/* Masquer les boutons panier et acheter pour les admins */}
                    {user?.role !== 'ADMIN' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddToCart(publication)}
                          disabled={addingToCart}
                          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
                          title="Ajouter au panier"
                        >
                          🛒
                        </button>
                        <button
                          onClick={() => handleBuyClick(publication)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                          Acheter
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
              </div>
            )}
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && selectedPublication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Paiement - {selectedPublication.title}
              </h2>
              <p className="text-gray-600 mb-2">
                Montant: <span className="font-bold text-yellow-600">{selectedPublication.price} DT</span>
              </p>
              
              <form onSubmit={handlePayment} className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Numéro de carte
                  </label>
                  <input
                    type="text"
                    value={paymentInfo.cardNumber}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value.replace(/\D/g, "").slice(0, 16) })}
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Titulaire de la carte
                  </label>
                  <input
                    type="text"
                    value={paymentInfo.cardHolder}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, cardHolder: e.target.value })}
                    placeholder="NOM PRÉNOM"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Date d'expiration
                    </label>
                    <input
                      type="text"
                      value={paymentInfo.expiryDate}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, "");
                        if (value.length >= 2) {
                          value = value.slice(0, 2) + "/" + value.slice(2, 4);
                        }
                        setPaymentInfo({ ...paymentInfo, expiryDate: value });
                      }}
                      placeholder="MM/AA"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      maxLength={5}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={paymentInfo.cvv}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value.replace(/\D/g, "").slice(0, 3) })}
                      placeholder="123"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      maxLength={3}
                      required
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentModal(false);
                      setSelectedPublication(null);
                      setPaymentInfo({
                        cardNumber: "",
                        cardHolder: "",
                        expiryDate: "",
                        cvv: "",
                      });
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                    disabled={processingPayment}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={processingPayment}
                  >
                    {processingPayment ? "Traitement..." : `Payer ${selectedPublication.price} DT`}
                  </button>
                </div>
              </form>
              
              <p className="text-xs text-gray-500 mt-4 text-center">
                Note: Ceci est une simulation. Dans un environnement de production, utilisez un système de paiement sécurisé.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;