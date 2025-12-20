import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./contexts/AuthContext";
import { BackButton } from "./components/BackButton";

// Button Component
const Button = ({ children, className = "", disabled, ...props }) => (
  <button
    className={`px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg shadow-md transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed ${className}`}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
);

// Input Component
const Input = ({ label, id, required, className = "", ...props }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-semibold mb-2 text-gray-800">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      id={id}
      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 ${className}`}
      required={required}
      {...props}
    />
  </div>
);

// Textarea Component
const Textarea = ({ label, id, required, className = "", ...props }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-semibold mb-2 text-gray-800">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      id={id}
      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 ${className}`}
      required={required}
      {...props}
    />
  </div>
);

// Card Component
const Card = ({ children, hover, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-lg p-6 ${hover ? 'hover:shadow-xl transition-shadow duration-200' : ''} ${className}`}>
    {children}
  </div>
);

function Pup() {
  const { user, isAuthenticated } = useAuth();
  const [publications, setPublications] = useState([]);
  const [filteredPublications, setFilteredPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date', 'price-asc', 'price-desc', 'title'
  const [newPublication, setNewPublication] = useState({
    title: "",
    description: "",
    type: "Reparation",
    price: 0,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPublications();
  }, []);

  const fetchPublications = () => {
    setLoading(true);
    axios
      .get("/api/pub/publications-page")
      .then((response) => {
        setPublications(response.data);
        setFilteredPublications(response.data);
        setError(null);
      })
      .catch((error) => {
        setError("Impossible de charger les publications. Vérifiez que le serveur est démarré.");
      })
      .finally(() => setLoading(false));
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
    
    // Filtrer par statut
    if (statusFilter !== '') {
      filtered = filtered.filter(pub => {
        if (!pub.status) return false;
        const pubStatus = pub.status.toLowerCase().trim();
        const filterStatus = statusFilter.toLowerCase().trim();
        
        // Gérer les différents formats de statut
        if (filterStatus === 'traité' || filterStatus === 'traite' || filterStatus === 'processed') {
          return (pubStatus === 'traité' || pubStatus === 'traite' || pubStatus === 'processed') && 
                 !pubStatus.includes('pas') && !pubStatus.includes('non');
        }
        if (filterStatus === 'non traité' || filterStatus === 'non traite' || filterStatus === 'not_processed') {
          return pubStatus.includes('pas') || pubStatus.includes('non') || 
                 pubStatus === 'not_processed' || pubStatus === 'is_not_processed';
        }
        if (filterStatus === 'disponible' || filterStatus === 'available') {
          return pubStatus.includes('disponible') || pubStatus === 'available';
        }
        return pubStatus === filterStatus;
      });
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
  }, [typeFilter, searchQuery, priceMin, priceMax, statusFilter, sortBy, publications]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewPublication((prevState) => {
      const updatedState = {
        ...prevState,
        [name]: name === "price" ? parseFloat(value) || 0 : value,
      };
      // Si le type change et n'est plus "Vente", réinitialiser le prix à 0
      if (name === "type" && value !== "Vente") {
        updatedState.price = 0;
      }
      return updatedState;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError("Le fichier est trop volumineux. Taille maximale: 10MB");
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError("Type de fichier non autorisé. Utilisez: JPEG, PNG, GIF ou PDF");
        return;
      }

      // Validate image dimensions for image files
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = (event) => {
          const img = new Image();
          img.onload = () => {
            const maxDimension = 4000;
            if (img.width > maxDimension || img.height > maxDimension) {
              setError(`L'image est trop grande. Dimensions maximales: ${maxDimension}x${maxDimension} pixels. Image actuelle: ${img.width}x${img.height} pixels.`);
              setSelectedFile(null);
              setFilePreview(null);
              // Reset file input
              e.target.value = '';
              return;
            }
            // Image dimensions are valid
            setSelectedFile(file);
            setError(null);
            setFilePreview(event.target.result);
          };
          img.onerror = () => {
            setError("Erreur lors de la lecture de l'image. Veuillez réessayer avec un autre fichier.");
            setSelectedFile(null);
            setFilePreview(null);
            e.target.value = '';
          };
          img.src = event.target.result;
        };
        reader.onerror = () => {
          setError("Erreur lors de la lecture du fichier. Veuillez réessayer.");
          setSelectedFile(null);
          setFilePreview(null);
          e.target.value = '';
        };
        reader.readAsDataURL(file);
      } else {
        // For non-image files (like PDF), just set the file
        setSelectedFile(file);
        setError(null);
        setFilePreview(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!isAuthenticated || !user?.userId) {
      setError("Vous devez être connecté pour publier une annonce.");
      return;
    }
    
    // Validation : le prix est requis uniquement pour les ventes
    if (newPublication.type === 'Vente' && (!newPublication.price || newPublication.price <= 0)) {
      setError("Le prix est requis pour les publications de type Vente.");
      return;
    }
    
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setError(null);

    // Create FormData for multipart/form-data
    const formData = new FormData();
    formData.append('title', newPublication.title);
    formData.append('description', newPublication.description);
    formData.append('type', newPublication.type);
    // Le prix est requis uniquement pour les ventes, sinon 0
    formData.append('price', newPublication.type === 'Vente' ? newPublication.price : 0);
    // Ajouter utilisateurId seulement si l'utilisateur est connecté
    if (isAuthenticated && user?.userId) {
      formData.append('utilisateurId', user.userId);
    }

    // Add file if selected
    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    // Use the /create endpoint that handles file uploads
    axios
      .post("/api/pub/create", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((response) => {
        setPublications([response.data, ...publications]);
        setNewPublication({
          title: "",
          description: "",
          type: "Reparation",
          price: 0,
        });
        setSelectedFile(null);
        setFilePreview(null);
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 8000); // Afficher le message plus longtemps
        setShowModal(false); // Fermer la modale après succès
      })
      .catch((error) => {
        let errorMessage = "Erreur lors de la publication. Veuillez réessayer.";
        
        if (error.response) {
          const errorData = error.response.data;
          // Try different possible error message fields from Spring Boot
          errorMessage = errorData?.message || 
                        errorData?.error || 
                        (typeof errorData === 'string' ? errorData : null) ||
                        `Erreur ${error.response.status}: ${error.response.statusText}`;
        } else if (error.request) {
          errorMessage = "Impossible de contacter le serveur. Vérifiez que le serveur est démarré.";
        }
        
        setError(errorMessage);
      })
      .finally(() => setIsSubmitting(false));
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

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-800";
    
    const statusLower = status.toLowerCase().trim();
    
    // Vérifier d'abord les cas les plus spécifiques (pour éviter les faux positifs)
    // Cas "non traité" - badge jaune
    if (statusLower === "non traité" || 
        statusLower === "non traite" ||
        statusLower === "is_not_processed" || 
        statusLower === "not_processed" || 
        statusLower.includes("pas traité") || 
        statusLower.includes("pas traite") ||
        statusLower === "n'est pas traité") {
      return "bg-yellow-100 text-yellow-800";
    }
    
    // Cas "traité" - badge vert (seulement si pas "pas traité")
    if (statusLower === "processed" || 
        statusLower === "traité" ||
        statusLower === "traite") {
      return "bg-green-100 text-green-800";
    }
    
    // Cas contenant "traité" mais pas "pas traité" - badge vert
    if ((statusLower.includes("traité") || statusLower.includes("traite")) && 
        !statusLower.includes("pas")) {
      return "bg-green-100 text-green-800";
    }
    
    // Cas "disponible" - badge bleu
    if (statusLower === "available" || statusLower.includes("disponible")) {
      return "bg-blue-100 text-blue-800";
    }
    
    // Par défaut - badge gris
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <BackButton to="/" />
        </div>
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Publications
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Publiez vos annonces de réparation, achat, vente ou échange
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
                
                {/* Filtre par statut */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white text-gray-900"
                  >
                    <option value="">Tous les statuts</option>
                    <option value="non traité">Non traité</option>
                    <option value="traité">Traité</option>
                    <option value="disponible">Disponible</option>
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
                  {(typeFilter || searchQuery.trim() || priceMin || priceMax || statusFilter) && (
                    <button
                      onClick={() => {
                        setTypeFilter('');
                        setSearchQuery('');
                        setPriceMin('');
                        setPriceMax('');
                        setStatusFilter('');
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

        <div className="mb-6 text-center">
          <Button
            onClick={() => setShowModal(true)}
            className="w-full md:w-auto"
          >
            Ajouter un appareil
          </Button>
        </div>

        {/* Modale */}
        {showModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowModal(false);
                setError(null);
                setSubmitSuccess(false);
              }
            }}
          >
            <div 
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Publier une nouvelle annonce
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setError(null);
                    setSubmitSuccess(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              <div className="p-6">
                {submitSuccess && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-300 text-blue-800 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <span className="text-2xl">✅</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold mb-1">Publication créée avec succès !</p>
                        <p className="text-sm">
                          Votre publication sera examinée par Fixer avant d'être publiée. 
                          Vous serez notifié une fois qu'elle sera approuvée et visible sur le site.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Titre"
                    id="title"
                    name="title"
                    type="text"
                    placeholder="Titre de votre annonce"
                    value={newPublication.title}
                    onChange={handleChange}
                    required
                  />

                  <Textarea
                    label="Description"
                    id="description"
                    name="description"
                    placeholder="Description détaillée..."
                    value={newPublication.description}
                    onChange={handleChange}
                    required
                    rows={5}
                  />

                  <div className="mb-4">
                    <label
                      htmlFor="type"
                      className="block text-sm font-semibold mb-2 text-gray-800"
                    >
                      Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={newPublication.type}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="Reparation">Réparation</option>
                      <option value="Achat">Achat</option>
                      <option value="Vente">Vente</option>
                      <option value="exchange">Échange</option>
                      <option value="donation">Donation</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>

                  {/* Prix - requis uniquement pour les ventes */}
                  {newPublication.type === 'Vente' && (
                    <Input
                      label="Prix (DT) *"
                      id="price"
                      name="price"
                      type="number"
                      placeholder="0.00"
                      value={newPublication.price}
                      onChange={handleChange}
                      min="0.01"
                      step="0.01"
                      required
                    />
                  )}

                  {/* File Upload Section */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2 text-gray-800">
                      Image ou Document (optionnel)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-yellow-500 transition-colors">
                      <input
                        type="file"
                        id="file"
                        onChange={handleFileChange}
                        accept="image/jpeg,image/png,image/jpg,image/gif,application/pdf"
                        className="hidden"
                      />
                      <label
                        htmlFor="file"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        {!selectedFile ? (
                          <>
                            <svg
                              className="w-12 h-12 text-gray-400 mb-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                            <span className="text-gray-600 font-medium">
                              Cliquez pour télécharger
                            </span>
                            <span className="text-sm text-gray-500 mt-1">
                              PNG, JPG, GIF ou PDF (max. 10MB)
                            </span>
                          </>
                        ) : (
                          <div className="w-full">
                            {filePreview ? (
                              <img
                                src={filePreview}
                                alt="Preview"
                                className="max-h-48 mx-auto rounded-lg mb-3"
                              />
                            ) : (
                              <div className="text-4xl mb-3">📄</div>
                            )}
                            <p className="text-gray-700 font-medium mb-2">
                              {selectedFile.name}
                            </p>
                            <p className="text-sm text-gray-500 mb-3">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <button
                              type="button"
                              onClick={handleRemoveFile}
                              className="text-red-600 hover:text-red-800 font-medium text-sm"
                            >
                              Supprimer le fichier
                            </button>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full md:w-auto min-w-[150px]"
                    >
                      {isSubmitting ? "Publication..." : "Publier"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
                <p className="mt-4 text-gray-600">Chargement des publications...</p>
              </div>
            ) : filteredPublications.length === 0 ? (
              <div className="max-w-2xl mx-auto">
                <Card className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    {(typeFilter || searchQuery.trim() || priceMin || priceMax || statusFilter) 
                      ? 'Aucune publication trouvée' 
                      : 'Aucune publication pour le moment'}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {(typeFilter || searchQuery.trim() || priceMin || priceMax || statusFilter)
                      ? 'Essayez de modifier vos critères de recherche ou consultez toutes les publications.'
                      : 'Soyez le premier à publier !'}
                  </p>
                  {(typeFilter || searchQuery.trim() || priceMin || priceMax || statusFilter) && (
                    <button
                      onClick={() => {
                        setTypeFilter('');
                        setSearchQuery('');
                        setPriceMin('');
                        setPriceMax('');
                        setStatusFilter('');
                      }}
                      className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
                    >
                      Voir toutes les publications
                    </button>
                  )}
                </Card>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredPublications.map((publication) => (
                <Card key={publication.id} hover className="flex flex-col">
                  {/* Propriétaire avec photo de profil */}
                  {(publication.utilisateurId || publication.utilisateurUsername || publication.utilisateurEmail) && (
                    <div className="mb-3 pb-3 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center cursor-pointer hover:bg-yellow-200 transition-colors overflow-hidden relative"
                          onClick={() => {
                            if (publication.utilisateurId) {
                              window.location.href = `/user/${publication.utilisateurId}`;
                            }
                          }}
                          title="Voir le profil"
                        >
                          {publication.utilisateurProfilePhoto ? (
                            <img
                              src={`http://localhost:9090${publication.utilisateurProfilePhoto}`}
                              alt={publication.utilisateurUsername || publication.utilisateurEmail || "Utilisateur"}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Si l'image ne charge pas, cacher l'image et afficher l'initiale
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
                        <div 
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => {
                            if (publication.utilisateurId) {
                              window.location.href = `/user/${publication.utilisateurId}`;
                            }
                          }}
                          title="Voir le profil"
                        >
                          <p className="text-sm font-semibold text-gray-900 truncate hover:text-yellow-600 transition-colors">
                            {publication.utilisateurUsername || publication.utilisateurEmail || `Utilisateur #${publication.utilisateurId}` || "Utilisateur"}
                          </p>
                          {publication.utilisateurEmail && publication.utilisateurEmail !== publication.utilisateurUsername && (
                            <p className="text-xs text-gray-500 truncate">
                              {publication.utilisateurEmail}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Display image if available */}
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
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {publication.title}
                        </h3>
                        <span className="text-sm text-gray-500 font-medium">
                          #{publication.id}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getTypeColor(publication.type)} ml-2`}>
                        {publication.type}
                      </span>
                    </div>
                    
                    {publication.status && (
                      <div className="mb-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                            publication.status
                          )}`}
                        >
                          {publication.status}
                        </span>
                      </div>
                    )}
                    
                    <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                      {publication.description}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className="text-2xl font-bold text-yellow-600">
                        {publication.price} DT
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pup;