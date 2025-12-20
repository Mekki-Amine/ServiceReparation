import axios from 'axios';

// Configuration de l'URL de base de l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://electro-433v.onrender.com';

// Créer une instance axios avec la configuration de base
const isDevelopment = import.meta.env.DEV;
const useProxy = isDevelopment && !import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: useProxy ? '' : API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Gérer les erreurs 401 (non autorisé) - déconnexion automatique
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export { api, API_BASE_URL };
