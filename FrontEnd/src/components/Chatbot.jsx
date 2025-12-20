import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const Chatbot = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Bonjour ! Je suis l'assistant virtuel de Fixer. 👋\n\nJe peux vous aider à :\n• Rechercher dans notre catalogue de publications\n• Trouver des réparateurs spécialisés\n• Répondre à vos questions sur nos services\n\nTapez 'catalogue' ou 'publications' pour voir nos offres disponibles !",
      sender: 'bot',
      timestamp: new Date(),
      publications: [],
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [publications, setPublications] = useState([]);
  const [catalogPublications, setCatalogPublications] = useState([]);
  const [isLoadingPublications, setIsLoadingPublications] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Le scroll automatique a été désactivé - l'utilisateur peut scroller manuellement

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (isOpen) {
      loadPublications();
    }
  }, [isOpen]);

  const loadPublications = async () => {
    try {
      setIsLoadingPublications(true);
      // Charger les publications du catalogue
      const catalogResponse = await axios.get('/api/pub');
      const catalogData = catalogResponse.data || [];
      setCatalogPublications(catalogData);
      
      // Charger les publications de la page publications
      const publicationsResponse = await axios.get('/api/pub/publications-page');
      const publicationsData = publicationsResponse.data || [];
      setPublications(publicationsData);
    } catch (error) {
      // Ne pas bloquer le chatbot si les publications ne peuvent pas être chargées
      setCatalogPublications([]);
      setPublications([]);
    } finally {
      setIsLoadingPublications(false);
    }
  };

  const botResponses = {
    bonjour: "Bonjour ! Comment puis-je vous aider avec votre appareil électroménager ?",
    salut: "Salut ! Que puis-je faire pour vous aujourd'hui ?",
    prix: "Nos prix varient selon le type de réparation. Pour un devis précis, pouvez-vous me donner plus de détails sur votre appareil ?",
    devis: "Pour obtenir un devis gratuit, vous pouvez remplir le formulaire sur notre page d'accueil ou me donner quelques informations sur votre problème.",
    réparation: "Nous réparons tous types d'appareils électroménagers : lave-linge, lave-vaisselle, réfrigérateur, four, micro-ondes, etc. Quel appareil vous pose problème ?",
    contact: "Vous pouvez nous contacter par email à contact@fixer.fr ou par téléphone au +216 71 234 567. Nous sommes disponibles du lundi au vendredi de 9h à 18h.",
    horaires: "Nous sommes ouverts du lundi au vendredi de 9h à 18h. Le samedi de 9h à 13h.",
    garantie: "Toutes nos réparations sont garanties. La durée de garantie dépend du type d'intervention.",
    merci: "De rien ! N'hésitez pas si vous avez d'autres questions.",
    au_revoir: "Au revoir ! N'hésitez pas à revenir si vous avez besoin d'aide.",
  };

  // Dictionnaire de synonymes et variations pour améliorer la recherche
  const getSearchTerms = (query) => {
    const lowerQuery = query.toLowerCase().trim();
    const terms = [lowerQuery];
    
    // Synonymes et variations courants
    const synonyms = {
      'climatiseur': ['climatisation', 'ac', 'air conditionné', 'air conditionne', 'climatiseurs'],
      'réfrigérateur': ['frigo', 'réfrigérateurs', 'refrigerateur', 'refrigerateurs'],
      'lave-linge': ['machine à laver', 'machine a laver', 'lave linge', 'lave-linges'],
      'lave-vaisselle': ['lave vaisselle', 'lave-vaisselles', 'lave vaisselles'],
      'micro-ondes': ['microonde', 'micro ondes', 'four micro-ondes'],
      'four': ['fours', 'four électrique', 'four electrique'],
      'télévision': ['tv', 'téléviseur', 'television', 'televiseur'],
      'ordinateur': ['pc', 'computer', 'laptop', 'portable'],
      'réparation': ['reparer', 'réparer', 'reparation', 'fix', 'fixer'],
    };
    
    // Ajouter les synonymes si trouvés
    for (const [key, values] of Object.entries(synonyms)) {
      if (lowerQuery.includes(key) || values.some(v => lowerQuery.includes(v))) {
        terms.push(key, ...values);
      }
    }
    
    // Extraire les mots-clés importants (mots de plus de 3 caractères)
    const words = lowerQuery.split(/\s+/).filter(w => w.length > 3);
    terms.push(...words);
    
    return [...new Set(terms)]; // Supprimer les doublons
  };

  const searchPublications = (query) => {
    if (!query || !query.trim()) return [];
    
    const allPublications = [...catalogPublications, ...publications];
    if (allPublications.length === 0) return [];
    
    const searchTerms = getSearchTerms(query);
    const lowerQuery = query.toLowerCase().trim();
    
    // Scoring des publications
    const scoredPublications = allPublications.map(pub => {
      let score = 0;
      const pubTitle = (pub.title || '').toLowerCase();
      const pubDescription = (pub.description || '').toLowerCase();
      const pubType = (pub.type || '').toLowerCase();
      const fullText = `${pubTitle} ${pubDescription} ${pubType}`;
      
      // Correspondance exacte dans le titre (score le plus élevé)
      if (pubTitle === lowerQuery) {
        score += 100;
      } else if (pubTitle.includes(lowerQuery)) {
        score += 50;
      }
      
      // Correspondance exacte dans le type
      if (pubType === lowerQuery) {
        score += 80;
      } else if (pubType.includes(lowerQuery)) {
        score += 40;
      }
      
      // Correspondance dans la description
      if (pubDescription.includes(lowerQuery)) {
        score += 20;
      }
      
      // Recherche par mots-clés avec synonymes
      searchTerms.forEach(term => {
        if (pubTitle.includes(term)) score += 30;
        if (pubType.includes(term)) score += 25;
        if (pubDescription.includes(term)) score += 10;
      });
      
      // Bonus si plusieurs termes correspondent
      const matchingTerms = searchTerms.filter(term => 
        pubTitle.includes(term) || pubType.includes(term) || pubDescription.includes(term)
      );
      if (matchingTerms.length > 1) {
        score += matchingTerms.length * 5;
      }
      
      return { publication: pub, score };
    });
    
    // Filtrer et trier par score (seulement les publications avec score > 0)
    const results = scoredPublications
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.publication);
    
    return results;
  };

  const formatPublicationMessage = (publications) => {
    if (!publications || publications.length === 0) {
      return {
        text: "Je n'ai trouvé aucune publication pour le moment. Les publications seront disponibles une fois qu'elles auront été vérifiées par notre équipe.",
        publications: []
      };
    }

    const displayedPublications = publications.slice(0, 5);
    let message = `📋 J'ai trouvé ${publications.length} publication(s) disponible(s) :\n\n`;
    
    displayedPublications.forEach((pub, index) => {
      message += `🔹 ${index + 1}. ${pub.title || 'Sans titre'}\n`;
      if (pub.type) {
        message += `   📌 Type: ${pub.type}\n`;
      }
      if (pub.price && pub.price > 0) {
        message += `   💰 Prix: ${pub.price} DT\n`;
      } else if (pub.price === 0 || !pub.price) {
        message += `   💰 Prix: Gratuit ou à discuter\n`;
      }
      if (pub.description) {
        const shortDesc = pub.description.length > 80 
          ? pub.description.substring(0, 80) + '...' 
          : pub.description;
        message += `   📝 ${shortDesc}\n`;
      }
      if (pub.utilisateurUsername) {
        message += `   👤 Réparateur: ${pub.utilisateurUsername}\n`;
      }
      message += `\n`;
    });

    if (publications.length > 5) {
      message += `\n... et ${publications.length - 5} autre(s) publication(s).\n`;
    }

    message += `\n💡 Vous pouvez visiter notre catalogue (menu "Catalogue") pour voir toutes les publications et contacter les réparateurs directement.`;

    return {
      text: message,
      publications: displayedPublications
    };
  };

  const getBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase().trim();
    const allPublications = [...catalogPublications, ...publications];
    
    // Détecter les demandes de voir le catalogue ou les publications
    const catalogKeywords = ['catalogue', 'catalog', 'shop', 'boutique'];
    const publicationKeywords = ['publication', 'publications', 'services', 'offres'];
    const searchKeywords = ['recherche', 'trouve', 'cherche', 'disponible', 'trouver', 'rechercher'];
    const questionKeywords = ['qu\'est-ce', 'qu\'est ce', 'quelles', 'quels', 'quoi', 'montre', 'affiche', 'liste'];
    
    const wantsCatalog = catalogKeywords.some(keyword => lowerMessage.includes(keyword));
    const wantsPublications = publicationKeywords.some(keyword => lowerMessage.includes(keyword));
    const wantsSearch = searchKeywords.some(keyword => lowerMessage.includes(keyword));
    const isQuestion = questionKeywords.some(keyword => lowerMessage.includes(keyword));
    
    const isPublicationRequest = wantsCatalog || wantsPublications || wantsSearch || isQuestion;

    // Si l'utilisateur demande le catalogue ou les publications
    if (isPublicationRequest && allPublications.length > 0) {
      // Si c'est une demande de catalogue/publications sans recherche spécifique
      if ((wantsCatalog || wantsPublications) && !wantsSearch) {
        // Afficher toutes les publications disponibles
        return formatPublicationMessage(allPublications);
      }
      
      // Si c'est une recherche spécifique
      if (wantsSearch || (isQuestion && lowerMessage.length > 10)) {
        const searchResults = searchPublications(userMessage);
        if (searchResults.length > 0) {
          return formatPublicationMessage(searchResults);
        } else {
          // Si aucune correspondance, ne pas afficher toutes les publications
          return {
            text: `Je n'ai trouvé aucune publication correspondant à "${userMessage}".\n\nEssayez de rechercher avec d'autres mots-clés comme : climatiseur, réfrigérateur, lave-linge, four, etc.\n\nOu tapez "catalogue" pour voir toutes les publications disponibles.`,
            publications: []
          };
        }
      }
      
      // Par défaut, afficher toutes les publications
      return formatPublicationMessage(allPublications);
    }

    // Si l'utilisateur demande des publications mais qu'aucune n'est chargée
    if (isPublicationRequest && allPublications.length === 0) {
      return {
        text: "Je suis en train de charger les publications. Veuillez patienter quelques instants et réessayez.",
        publications: []
      };
    }

    // Recherche de mots-clés spécifiques (seulement si ce n'est pas une demande de publications)
    for (const [keyword, response] of Object.entries(botResponses)) {
      if (lowerMessage.includes(keyword) && !isPublicationRequest) {
        return {
          text: response,
          publications: []
        };
      }
    }

    // Réponses par défaut
    if (lowerMessage.includes('problème') || lowerMessage.includes('panne')) {
      if (allPublications.length > 0) {
        return {
          text: "Je comprends que vous avez un problème. Je peux rechercher dans nos publications pour trouver un réparateur spécialisé. Que recherchez-vous exactement ?",
          publications: []
        };
      }
      return {
        text: "Je comprends que vous avez un problème. Pouvez-vous me donner plus de détails sur votre appareil et le symptôme que vous observez ?",
        publications: []
      };
    }

    if (lowerMessage.includes('urgence') || lowerMessage.includes('urgent')) {
      return {
        text: "Pour les urgences, contactez-nous directement au +216 71 234 567. Nous ferons de notre mieux pour intervenir rapidement.",
        publications: []
      };
    }

    // Si le message contient des mots liés aux appareils électroménagers, faire une recherche intelligente
    const applianceKeywords = [
      'lave-linge', 'lave-vaisselle', 'réfrigérateur', 'four', 'micro-ondes', 
      'lave linge', 'lave vaisselle', 'machine', 'appareil', 'climatiseur',
      'climatisation', 'ac', 'air conditionné', 'frigo', 'télévision', 'tv',
      'ordinateur', 'pc', 'laptop', 'portable', 'réparation', 'reparer'
    ];
    
    // Vérifier si le message contient des mots-clés d'appareils ou semble être une recherche
    const hasApplianceKeyword = applianceKeywords.some(keyword => lowerMessage.includes(keyword));
    const isLikelySearch = lowerMessage.length > 3 && !lowerMessage.includes('?') && 
                          (lowerMessage.split(' ').length <= 5 || hasApplianceKeyword);
    
    if ((hasApplianceKeyword || isLikelySearch) && allPublications.length > 0) {
      const searchResults = searchPublications(userMessage);
      if (searchResults.length > 0) {
        return formatPublicationMessage(searchResults);
      } else if (hasApplianceKeyword) {
        // Si c'est un mot-clé d'appareil mais aucun résultat, suggérer des alternatives
        return {
          text: `Je n'ai trouvé aucune publication correspondant à "${userMessage}".\n\nEssayez de rechercher avec d'autres termes ou tapez "catalogue" pour voir toutes les publications disponibles.`,
          publications: []
        };
      }
    }

    return {
      text: "Je comprends votre question. Je peux vous aider à rechercher dans nos publications (tapez 'catalogue' ou 'publications') ou vous pouvez nous contacter directement par email à contact@fixer.fr ou par téléphone au +216 71 234 567.",
      publications: []
    };
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Ajouter le message de l'utilisateur
    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');

    // Simuler un délai avant la réponse du bot
    setTimeout(() => {
      const response = getBotResponse(inputMessage);
      const botResponse = {
        id: messages.length + 2,
        text: typeof response === 'string' ? response : response.text,
        sender: 'bot',
        timestamp: new Date(),
        publications: typeof response === 'object' && response.publications ? response.publications : [],
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 pointer-events-none">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md h-[600px] flex flex-col pointer-events-auto border-2 border-yellow-400">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 px-4 py-3 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-2xl">💬</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Service Clientèle</h3>
              <p className="text-xs text-gray-700">En ligne</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-900 hover:text-gray-700 transition-colors"
            aria-label="Fermer le chatbot"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {isLoadingPublications && messages.length === 1 && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 border border-gray-200 rounded-lg px-4 py-2">
                <p className="text-sm">Chargement du catalogue...</p>
              </div>
            </div>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col ${
                message.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-2 ${
                  message.sender === 'user'
                    ? 'bg-yellow-400 text-gray-900'
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}
              >
                <p className="text-sm whitespace-pre-line">{message.text}</p>
                
                {/* Afficher les publications avec leurs images */}
                {message.publications && message.publications.length > 0 && (
                  <div className="mt-3 space-y-3">
                    {message.publications.map((pub) => (
                      <div
                        key={pub.id}
                        className="border border-gray-200 rounded-lg p-3 bg-gray-50 hover:border-yellow-400 transition-colors"
                      >
                        {/* Image de la publication - cliquable */}
                        {pub.fileUrl && pub.fileType?.startsWith('image/') && (
                          <div 
                            className="mb-2 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => {
                              // Fermer le chatbot
                              onClose();
                              // Naviguer vers le catalogue
                              navigate('/shop');
                            }}
                            title="Cliquez pour voir la publication dans le catalogue"
                          >
                            <img
                              src={`http://localhost:9090${pub.fileUrl}`}
                              alt={pub.title || 'Publication'}
                              className="w-full h-32 object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        
                        {/* Informations de la publication */}
                        <div className="space-y-1">
                          <h4 className="font-semibold text-sm text-gray-900">
                            {pub.title || 'Sans titre'}
                          </h4>
                          {pub.type && (
                            <p className="text-xs text-gray-600">
                              📌 {pub.type}
                            </p>
                          )}
                          {pub.price !== undefined && pub.price !== null && (
                            <p className="text-xs text-gray-600">
                              💰 {pub.price > 0 ? `${pub.price} DT` : 'Gratuit ou à discuter'}
                            </p>
                          )}
                          {pub.utilisateurUsername && (
                            <p className="text-xs text-gray-600">
                              👤 {pub.utilisateurUsername}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <p className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
          <div className="flex space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Tapez votre message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              Envoyer
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Réponses automatiques • Pour une assistance personnalisée, contactez-nous directement
          </p>
        </form>
      </div>
    </div>
  );
};

