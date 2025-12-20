import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '../components/BackButton';

const Cart = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
  });

  const hasLoadedCart = useRef(false);

  useEffect(() => {
    if (user?.userId && !hasLoadedCart.current) {
      hasLoadedCart.current = true;
      fetchCart();
    }
  }, [user?.userId]);

  const fetchCart = async (showLoading = true) => {
    if (!user?.userId) return;

    try {
      if (showLoading) {
        setLoading(true);
      }
      // L'intercepteur axios ajoute automatiquement le token
      const response = await axios.get(`/api/cart/user/${user.userId}`);
      
      // Vérifier que les données sont valides
      if (response.data && Array.isArray(response.data.items)) {
        // Filtrer les items invalides et normaliser les IDs
        const validItems = response.data.items
          .filter(item => item && item.id)
          .map(item => ({
            ...item,
            id: typeof item.id === 'string' ? parseInt(item.id, 10) : Number(item.id)
          }));
        setCart({
          ...response.data,
          items: validItems
        });
        console.log('✅ Cart loaded with', validItems.length, 'items');
      } else {
        setCart(response.data);
      }
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching cart:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement du panier';
      setError(errorMessage);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const removeItem = async (cartItemId) => {
    console.log('🖱️ removeItem called with ID:', cartItemId, 'type:', typeof cartItemId);
    
    // Validation basique
    if (!cartItemId) {
      console.error('❌ No cartItemId provided');
      alert('❌ Erreur: ID de l\'article invalide');
      return;
    }

    if (!user?.userId) {
      console.error('❌ User not authenticated');
      alert('❌ Erreur: Vous devez être connecté');
      return;
    }

    // Empêcher les suppressions multiples simultanées
    if (deletingItemId !== null) {
      console.warn('⚠️ Suppression déjà en cours');
      return;
    }

    // Convertir l'ID en nombre pour l'API
    const itemId = Number(cartItemId);
    if (isNaN(itemId)) {
      console.error('❌ Invalid ID:', cartItemId);
      alert('❌ Erreur: ID invalide');
      return;
    }

    // Trouver l'item à supprimer
    const itemToDelete = cart?.items?.find(item => Number(item.id) === itemId);
    console.log('🔍 Item to delete:', itemToDelete);
    
    if (!itemToDelete) {
      console.error('❌ Item not found. Cart items:', cart?.items?.map(i => ({ id: i.id, type: typeof i.id })));
      alert('❌ Erreur: Article introuvable dans le panier');
      return;
    }

    // Confirmation
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${itemToDelete.publicationTitle || 'cet article'}" du panier ?`)) {
      console.log('❌ User cancelled deletion');
      return;
    }

    console.log('✅ Starting deletion for item ID:', itemId);
    setDeletingItemId(itemId);
    setError(null);

    try {
      console.log('🔄 Sending DELETE request to:', `/api/cart/user/${user.userId}/items/${itemId}`);
      
      // Supprimer l'item
      const response = await axios.delete(`/api/cart/user/${user.userId}/items/${itemId}`);
      console.log('✅ Delete response:', response.status, response.statusText);
      
      // Mettre à jour l'état local immédiatement
      if (cart && cart.items) {
        const updatedItems = cart.items.filter(item => Number(item.id) !== itemId);
        console.log('📝 Updating local state. Before:', cart.items.length, 'After:', updatedItems.length);
        setCart({
          ...cart,
          items: updatedItems
        });
      }
      
      // Vérifier immédiatement que l'item est bien supprimé côté serveur
      try {
        const verifyResponse = await axios.get(`/api/cart/user/${user.userId}`);
        const serverItems = verifyResponse.data?.items || [];
        const serverItemsCount = serverItems.length;
        const localItemsCount = cart?.items?.filter(item => Number(item.id) !== itemId).length || 0;
        
        console.log('🔍 Verification: Server items:', serverItemsCount, 'Local items:', localItemsCount);
        console.log('🔍 Server items IDs:', serverItems.map(i => i.id));
        
        // Si le serveur a toujours l'item, forcer un refresh
        const itemStillExists = serverItems.some(item => Number(item.id) === itemId);
        if (itemStillExists) {
          console.warn('⚠️ Item still exists on server! This should not happen.');
          // Attendre un peu et recharger
          setTimeout(async () => {
            await fetchCart(false);
          }, 300);
        } else if (serverItemsCount !== localItemsCount) {
          console.warn('⚠️ Count mismatch! Refreshing from server...');
          await fetchCart(false);
        } else {
          console.log('✅ Verification passed: Item correctly deleted from server');
        }
      } catch (verifyErr) {
        console.error('❌ Error verifying deletion:', verifyErr);
      }
      
      console.log('✅ Item removed successfully');
    } catch (err) {
      console.error('❌ Error removing item:', err);
      console.error('❌ Error response:', err.response);
      console.error('❌ Error status:', err.response?.status);
      console.error('❌ Error data:', err.response?.data);
      
      let errorMessage = 'Erreur lors de la suppression de l\'article';
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      }
      
      alert(`❌ ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setDeletingItemId(null);
    }
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (!user?.userId || newQuantity <= 0) return;

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.put(
        `/api/cart/user/${user.userId}/items/${cartItemId}`,
        { quantity: newQuantity },
        { headers }
      );
      fetchCart(); // Recharger le panier
    } catch (err) {
      console.error('Error updating quantity:', err);
      setError('Erreur lors de la mise à jour de la quantité');
    }
  };

  const clearCart = async () => {
    if (!user?.userId) return;

    if (!window.confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.delete(`/api/cart/user/${user.userId}/clear`, { headers });
      fetchCart(); // Recharger le panier
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError('Erreur lors de la suppression du panier');
    }
  };

  const calculateTotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((total, item) => {
      return total + (item.publicationPrice || 0) * (item.quantity || 1);
    }, 0);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessingPayment(true);

    try {
      // Simulation de paiement
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const total = calculateTotal();
      alert(`Paiement de ${total.toFixed(2)} DT effectué avec succès !`);
      
      // Vider le panier après paiement réussi
      await clearCart();
      setShowPaymentModal(false);
      setPaymentInfo({
        cardNumber: "",
        cardHolder: "",
        expiryDate: "",
        cvv: "",
      });
    } catch (err) {
      console.error('Error processing payment:', err);
      alert('Erreur lors du traitement du paiement');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">Veuillez vous connecter pour accéder à votre panier.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">Chargement du panier...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-4">
          <BackButton to="/shop" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Mon Panier</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {!cart || !cart.items || cart.items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 mb-4">Votre panier est vide.</p>
            <button
              onClick={() => navigate('/shop')}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition-colors"
            >
              Parcourir le catalogue
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {cart.items
                .filter(item => item && item.id != null)
                .map((item) => {
                  // Normaliser l'ID pour éviter les problèmes de type
                  const normalizedItemId = typeof item.id === 'string' ? parseInt(item.id, 10) : Number(item.id);
                  return (
                <div key={`cart-item-${normalizedItemId}`} className="bg-white rounded-lg shadow-md p-4 flex items-start gap-4">
                  {item.publicationFileUrl && (
                    <img
                      src={`http://localhost:9090${item.publicationFileUrl}`}
                      alt={item.publicationTitle}
                      className="w-24 h-24 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {item.publicationTitle}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {item.publicationDescription}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-700">Quantité:</label>
                        <button
                          onClick={() => updateQuantity(normalizedItemId, (item.quantity || 1) - 1)}
                          className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="px-3 py-1 bg-gray-100 rounded min-w-[3rem] text-center">
                          {item.quantity || 1}
                        </span>
                        <button
                          onClick={() => updateQuantity(normalizedItemId, (item.quantity || 1) + 1)}
                          className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {(item.publicationPrice || 0) * (item.quantity || 1)} DT
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.publicationPrice} DT / unité
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeItem(item.id);
                      }}
                      disabled={deletingItemId !== null}
                      className={`mt-2 px-3 py-1 text-sm font-semibold rounded transition-colors ${
                        deletingItemId !== null
                          ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                          : 'text-white bg-red-500 hover:bg-red-600'
                      }`}
                      title="Supprimer cet article du panier"
                    >
                      {deletingItemId === Number(item.id) ? '⏳ Suppression...' : '🗑️ Supprimer'}
                    </button>
                  </div>
                </div>
                  );
                })}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Résumé</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Articles:</span>
                    <span>{cart.items.length}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Total:</span>
                    <span className="text-xl font-bold text-gray-900">{calculateTotal().toFixed(2)} DT</span>
                  </div>
                </div>
                <button
                  onClick={clearCart}
                  className="w-full mb-3 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
                >
                  Vider le panier
                </button>
                <button
                  className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition-colors"
                  onClick={() => setShowPaymentModal(true)}
                >
                  Passer la commande
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Paiement
              </h2>
              <p className="text-gray-600 mb-2">
                Montant total: <span className="font-bold text-yellow-600">{calculateTotal().toFixed(2)} DT</span>
              </p>
              <p className="text-sm text-gray-500 mb-4">
                {cart?.items?.length || 0} article(s) dans votre panier
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
                      setPaymentInfo({
                        cardNumber: "",
                        cardHolder: "",
                        expiryDate: "",
                        cvv: "",
                      });
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    disabled={processingPayment}
                    className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingPayment ? "Traitement..." : `Payer ${calculateTotal().toFixed(2)} DT`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

