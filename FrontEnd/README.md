# Fixer - Site de réparation d'électroménagers

Site web moderne pour un service de réparation d'électroménagers, développé avec React, Vite et Tailwind CSS.

## 🚀 Technologies utilisées

- **React 19** - Bibliothèque UI
- **Vite** - Build tool et serveur de développement
- **React Router** - Navigation entre les pages
- **Tailwind CSS** - Framework CSS utilitaire
- **Axios** - Client HTTP pour les appels API

## 📦 Installation

```bash
npm install
```

## 🛠️ Développement

```bash
npm run dev
```

Le site sera accessible sur `http://localhost:5173`

## 🏗️ Build

```bash
npm run build
```

## ✨ Fonctionnalités

### Pages disponibles

- **Accueil** (`/`) - Page d'accueil avec présentation des services, formulaire de devis et avis clients
- **Catalogue** (`/shop`) - Page de catalogue de produits (à venir)
- **Contact** (`/contact`) - Formulaire de contact avec validation
- **Publications** (`/publications`) - Publication et consultation d'annonces

### Composants réutilisables

- `Button` - Bouton avec variantes (primary, secondary, outline)
- `Input` - Champ de saisie avec validation et gestion d'erreurs
- `Textarea` - Zone de texte avec validation
- `Card` - Carte avec effet hover optionnel
- `Layout` - Layout principal avec Navbar et Footer
- `Navbar` - Navigation avec indication de la page active
- `Footer` - Pied de page avec liens et informations

### Améliorations apportées

✅ **Architecture**
- Structure modulaire avec composants réutilisables
- Layout centralisé pour éviter la répétition
- Organisation claire des fichiers

✅ **Design & UX**
- Design moderne et responsive
- Animations et transitions fluides
- Interface utilisateur intuitive
- Navigation avec indication de page active

✅ **Formulaires**
- Validation en temps réel
- Gestion d'état avec React hooks
- Messages d'erreur clairs
- Feedback visuel lors de la soumission

✅ **Accessibilité & SEO**
- Métadonnées HTML optimisées
- Structure sémantique
- Support des lecteurs d'écran
- Langue définie (français)

✅ **Performance**
- Code optimisé
- Composants légers
- Chargement efficace

## 📁 Structure du projet

```
src/
├── components/          # Composants réutilisables
│   ├── Button.jsx
│   ├── Input.jsx
│   ├── Textarea.jsx
│   └── Card.jsx
├── shared/             # Composants partagés
│   ├── layout/         # Layout principal
│   ├── nav/            # Navigation
│   └── footer/         # Pied de page
├── HomePage.jsx        # Page d'accueil
├── Contact.jsx         # Page de contact
├── shop.jsx            # Page catalogue
├── pup.jsx             # Page publications
├── App.jsx             # Composant principal
└── main.jsx            # Point d'entrée
```

## 🔧 Configuration

### API Backend

La page Publications nécessite un backend API accessible sur `http://localhost:9090/api/pub`.

Pour utiliser une autre URL, modifiez les appels axios dans `src/pup.jsx`.

## 📝 Scripts disponibles

- `npm run dev` - Lance le serveur de développement
- `npm run build` - Crée une build de production
- `npm run preview` - Prévisualise la build de production
- `npm run lint` - Vérifie le code avec ESLint
