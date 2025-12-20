import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Logo } from "../../components/Logo";
import { useUserNotifications } from "../../components/UserNotifications";
import { useCart } from "../../components/useCart";
import { api, API_BASE_URL } from "../../api";

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, logout, user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, handleNotificationClick } = useUserNotifications();
  const { cartItemCount } = useCart();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Fonction pour obtenir l'URL complète de la photo de profil
  const getProfilePhotoUrl = (photoPath) => {
    if (!photoPath) return null;
    if (photoPath.startsWith('http')) return photoPath;
    // En développement, utiliser localhost:9090, sinon utiliser API_BASE_URL
    const isDev = import.meta.env.DEV;
    const baseUrl = isDev ? 'http://localhost:9090' : API_BASE_URL;
    return `${baseUrl}${photoPath}`;
  };

  // Charger la photo de profil depuis le backend
  useEffect(() => {
    const fetchProfilePhoto = async () => {
      if (isAuthenticated && user?.userId) {
        try {
          const response = await api.get(`/api/utilis/profile/${user.userId}`);
          console.log("Profile data:", response.data);
          if (response.data?.profilePhoto) {
            console.log("Profile photo path:", response.data.profilePhoto);
            setProfilePhoto(response.data.profilePhoto);
          } else {
            console.log("No profile photo found");
            setProfilePhoto(null);
          }
        } catch (err) {
          console.error("Error fetching profile photo:", err);
          setProfilePhoto(null);
        }
      } else {
        setProfilePhoto(null);
      }
    };

    fetchProfilePhoto();
  }, [isAuthenticated, user?.userId]);

  // Fermer le dropdown des notifications quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    if (showNotifications || showProfileDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications, showProfileDropdown]);

  // Fermer le menu mobile quand on clique sur un lien
  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  // Empêcher le scroll du body quand le menu mobile est ouvert
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <nav className="bg-gray-900 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 relative">
          <Link
            to="/"
            className="flex items-center gap-0 text-xl font-bold text-yellow-400 hover:text-yellow-300 transition-colors duration-200 flex-shrink-0 z-10"
            onClick={handleMobileLinkClick}
          >
            <Logo className="w-20 h-20 md:w-28 md:h-28 flex-shrink-0 mb-0.5 -ml-6 md:-ml-8" />
            <span className="-ml-5 md:-ml-7 text-base md:text-xl">Fixer</span>
          </Link>

          {/* Menu Desktop - Masqué sur mobile */}
          <div className="hidden md:flex items-center space-x-4 absolute left-1/2 transform -translate-x-1/2 z-10">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                isActive("/") ? "bg-yellow-500 text-black" : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              Accueil
            </Link>

            <Link
              to="/shop"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                isActive("/shop") ? "bg-yellow-500 text-black" : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              Catalogue
            </Link>

            <Link
              to="/publications"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                isActive("/publications") ? "bg-yellow-500 text-black" : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              Appareils
            </Link>

            {isAuthenticated && !isAdmin() && (
              <Link
                to="/messages"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive("/messages") ? "bg-yellow-500 text-black" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                Messages
              </Link>
            )}

            {!isAdmin() && (
              <Link
                to="/contact"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive("/contact") ? "bg-yellow-500 text-black" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                Contact
              </Link>
            )}


            {isAuthenticated && !isAdmin() && (
              <Link
                to="/cart"
                className={`relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center ${
                  isActive("/cart") ? "bg-yellow-500 text-black" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
                title="Panier"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
                  />
                </svg>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount > 9 ? "9+" : cartItemCount}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated && !isAdmin() && (
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 text-gray-300 hover:bg-gray-700 hover:text-white"
                  title="Notifications"
                >
                  🔔
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 border border-gray-200 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      {notifications.length > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Tout marquer comme lu
                        </button>
                      )}
                    </div>

                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        Aucune notification
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                              !notification.isRead ? "bg-blue-50" : ""
                            }`}
                            onClick={() => {
                              handleNotificationClick(notification);
                              setShowNotifications(false);
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(notification.createdAt).toLocaleString("fr-FR")}
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="ml-2 text-gray-400 hover:text-gray-600"
                                title="Marquer comme lu"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {isAuthenticated && isAdmin() && (
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  location.pathname.startsWith("/admin")
                    ? "bg-yellow-500 text-black"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                Admin
              </Link>
            )}
          </div>

          {/* Menu Desktop - Actions utilisateur - Masqué sur mobile */}
          <div className="hidden md:flex items-center space-x-2 ml-auto flex-shrink-0">
            {isAuthenticated ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-800 transition-colors"
                >
                  <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors cursor-pointer overflow-hidden">
                    {profilePhoto ? (
                      <img
                        src={getProfilePhotoUrl(profilePhoto)}
                        alt="Profil"
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          console.error("Error loading profile photo:", e);
                          e.target.style.display = "none";
                          // Afficher l'initiale si l'image ne charge pas
                          const parent = e.target.parentElement;
                          if (parent && !parent.querySelector('span:not(.absolute)')) {
                            const initial = document.createElement('span');
                            initial.className = "text-gray-900 font-semibold text-sm";
                            initial.textContent = (user?.username || user?.email || "U").charAt(0).toUpperCase();
                            parent.appendChild(initial);
                          }
                        }}
                      />
                    ) : null}
                    {!profilePhoto && (
                      <span className="text-gray-900 font-semibold text-sm">
                        {(user?.username || user?.email || "U").charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 z-10"></span>
                  </div>
                  <span className="text-sm text-gray-300 font-medium">
                    {user?.username || user?.email || "Utilisateur"}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-300 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setShowProfileDropdown(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>Mon profil</span>
                        </div>
                      </Link>
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          handleLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Déconnexion</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-md text-sm font-medium transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium transition-colors"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>

          {/* Bouton Hamburger - Visible uniquement sur mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 z-50 relative"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Menu Mobile - Drawer depuis la droite */}
      <div
        className={`fixed inset-y-0 right-0 w-80 max-w-[85vw] bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out z-[100] md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header du menu mobile */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-yellow-400">Menu</h2>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
              aria-label="Fermer le menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Contenu du menu mobile */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                onClick={handleMobileLinkClick}
                className={`px-4 py-3 rounded-md text-base font-medium transition-all duration-200 ${
                  isActive("/") ? "bg-yellow-500 text-black" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                Accueil
              </Link>

              <Link
                to="/shop"
                onClick={handleMobileLinkClick}
                className={`px-4 py-3 rounded-md text-base font-medium transition-all duration-200 ${
                  isActive("/shop") ? "bg-yellow-500 text-black" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                Catalogue
              </Link>

              <Link
                to="/publications"
                onClick={handleMobileLinkClick}
                className={`px-4 py-3 rounded-md text-base font-medium transition-all duration-200 ${
                  isActive("/publications") ? "bg-yellow-500 text-black" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                Appareils
              </Link>

              {isAuthenticated && !isAdmin() && (
                <Link
                  to="/messages"
                  onClick={handleMobileLinkClick}
                  className={`px-4 py-3 rounded-md text-base font-medium transition-all duration-200 ${
                    isActive("/messages") ? "bg-yellow-500 text-black" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  Messages
                </Link>
              )}

              {!isAdmin() && (
                <Link
                  to="/contact"
                  onClick={handleMobileLinkClick}
                  className={`px-4 py-3 rounded-md text-base font-medium transition-all duration-200 ${
                    isActive("/contact") ? "bg-yellow-500 text-black" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  Contact
                </Link>
              )}


              {isAuthenticated && !isAdmin() && (
                <Link
                  to="/cart"
                  onClick={handleMobileLinkClick}
                  className={`relative px-4 py-3 rounded-md text-base font-medium transition-all duration-200 flex items-center space-x-2 ${
                    isActive("/cart") ? "bg-yellow-500 text-black" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <svg 
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
                    />
                  </svg>
                  <span>Panier</span>
                  {cartItemCount > 0 && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount > 9 ? "9+" : cartItemCount}
                    </span>
                  )}
                </Link>
              )}

              {isAuthenticated && !isAdmin() && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative w-full px-4 py-3 rounded-md text-base font-medium transition-all duration-200 text-gray-300 hover:bg-gray-700 hover:text-white text-left"
                  >
                    🔔 Notifications
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="mt-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 max-h-96 overflow-y-auto">
                      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                        <h3 className="font-semibold text-white">Notifications</h3>
                        {notifications.length > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-yellow-400 hover:text-yellow-300"
                          >
                            Tout marquer comme lu
                          </button>
                        )}
                      </div>

                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-400 text-sm">
                          Aucune notification
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-700">
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 hover:bg-gray-700 cursor-pointer transition-colors ${
                                !notification.isRead ? "bg-gray-800" : ""
                              }`}
                              onClick={() => {
                                handleNotificationClick(notification);
                                setShowNotifications(false);
                              }}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-white">{notification.message}</p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {new Date(notification.createdAt).toLocaleString("fr-FR")}
                                  </p>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className="ml-2 text-gray-400 hover:text-gray-200"
                                  title="Marquer comme lu"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {isAuthenticated && isAdmin() && (
                <Link
                  to="/admin"
                  onClick={handleMobileLinkClick}
                  className={`px-4 py-3 rounded-md text-base font-medium transition-all duration-200 ${
                    location.pathname.startsWith("/admin")
                      ? "bg-yellow-500 text-black"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  Admin
                </Link>
              )}
            </div>

            {/* Section utilisateur en bas du menu mobile */}
            <div className="mt-8 pt-8 border-t border-gray-700">
              {isAuthenticated ? (
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-3">
                    <Link
                      to="/profile"
                      onClick={handleMobileLinkClick}
                      className="relative flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors cursor-pointer overflow-hidden"
                      title="Voir mon profil"
                    >
                      {profilePhoto ? (
                        <img
                          src={getProfilePhotoUrl(profilePhoto)}
                          alt="Profil"
                          className="w-full h-full rounded-full object-cover"
                          onError={(e) => {
                            console.error("Error loading profile photo:", e);
                            e.target.style.display = "none";
                            const parent = e.target.parentElement;
                            if (parent && !parent.querySelector('span:not(.absolute)')) {
                              const initial = document.createElement('span');
                              initial.className = "text-gray-900 font-semibold text-base";
                              initial.textContent = (user?.username || user?.email || "U").charAt(0).toUpperCase();
                              parent.appendChild(initial);
                            }
                          }}
                        />
                      ) : null}
                      {!profilePhoto && (
                        <span className="text-gray-900 font-semibold text-base">
                          {(user?.username || user?.email || "U").charAt(0).toUpperCase()}
                        </span>
                      )}
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 z-10"></span>
                    </Link>
                    <div className="flex-1">
                      <p className="text-sm text-gray-300 font-medium">
                        {user?.username || user?.email || "Utilisateur"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      handleMobileLinkClick();
                    }}
                    className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 rounded-md text-base font-medium transition-colors text-center"
                  >
                    Déconnexion
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link
                    to="/login"
                    onClick={handleMobileLinkClick}
                    className="w-full px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-black rounded-md text-base font-medium transition-colors text-center"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/signup"
                    onClick={handleMobileLinkClick}
                    className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-md text-base font-medium transition-colors text-center"
                  >
                    Inscription
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay pour fermer le menu mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[90] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </nav>
  );
};
