# Cahier des charges

## Informations générales

| **Intitulé du projet** | Fixer - Plateforme de Gestion de Services de Réparation d'Électroménagers |
|------------------------|---------------------------------------------------------------------------|
| **Réalisé par** | [VOTRE NOM ET PRÉNOM] |
| **Entreprise d'accueil** | **CCA** |
| **Encadrant Entreprise** | **Kais Elech - Chef de projet technique** |
| **Encadrant SESAME** | [NOM DE VOTRE ENCADRANT UNIVERSITAIRE] |

---

## Sommaire

1. [Contexte et définition du problème](#1---contexte-et-définition-du-problème)
2. [Objectif de projet](#2---objectif-de-projet)
3. [Acteurs](#3---acteurs)
4. [Les actions associées à chaque acteur](#4---les-actions-associées-à-chaque-acteur)
5. [Choix de technologie](#5---choix-de-technologie)
6. [Modules à développer](#6---modules-à-développer)
7. [Méthodologie de conception adoptée](#7---méthodologie-de-conception-adoptée)
8. [Architecture](#8---architecture)
9. [Choix technologiques](#9---choix-technologiques)

---

## 1 - Contexte et définition du problème

Dans un contexte où la digitalisation transforme profondément le secteur des services, les plateformes web de mise en relation entre clients et prestataires de services connaissent un essor considérable. L'émergence des applications web transactionnelles et des services en ligne traduit un besoin croissant d'autonomie, de rapidité et de transparence dans la gestion des services de réparation d'électroménagers.

Actuellement, les particuliers et les professionnels rencontrent plusieurs difficultés lorsqu'ils souhaitent faire réparer leurs appareils électroménagers :

- **Manque de visibilité :** Les réparateurs ont du mal à se faire connaître et à trouver des clients.
- **Difficulté de mise en relation :** Les clients ne savent pas où trouver des réparateurs compétents et fiables près de chez eux.
- **Absence de centralisation :** Les informations sur les services de réparation sont dispersées et difficiles à consulter.
- **Manque de transparence :** Absence d'informations claires sur les prix, les délais et la qualité des services.
- **Gestion manuelle :** Les réparateurs gèrent leurs demandes de manière manuelle, ce qui est chronophage et source d'erreurs.

**Problématique :**  
Il existe un besoin réel de créer une plateforme web moderne qui facilite la mise en relation entre les clients ayant besoin de services de réparation et les réparateurs professionnels, tout en offrant une expérience utilisateur fluide, sécurisée et intuitive.

---

## 2 - Objectif de projet

L'objectif principal de ce projet est de développer une **plateforme web complète de gestion de services de réparation d'électroménagers** permettant :

### Aux clients :
- De publier des demandes de réparation avec description détaillée
- De consulter un catalogue de services et de publications vérifiées
- De communiquer directement avec les réparateurs via un système de messagerie
- De gérer un panier d'achat pour les services
- De recevoir des notifications en temps réel

### Aux réparateurs :
- De publier leurs services et compétences
- De consulter les demandes de réparation
- De communiquer avec les clients
- De gérer leur profil et leurs publications

### Aux administrateurs :
- De valider ou refuser les publications
- De gérer les utilisateurs et leurs rôles
- De superviser l'ensemble de la plateforme
- De consulter les statistiques et rapports

**Objectifs secondaires :**
- Mettre en place une architecture logicielle robuste et évolutive
- Assurer la sécurité des données et des transactions
- Offrir une interface utilisateur moderne et responsive
- Garantir une bonne performance et une disponibilité élevée

---

## 3 - Acteurs

Les acteurs du système sont les suivants :

1. **Client (Utilisateur standard)**  
   Utilisateur non authentifié ou authentifié ayant le rôle "CLIENT". Il peut consulter le catalogue, publier des demandes, communiquer avec les réparateurs, gérer un panier d'achat.

2. **Administrateur**  
   Utilisateur authentifié ayant le rôle "ADMIN". Il a accès à toutes les fonctionnalités et peut gérer l'ensemble de la plateforme (publications, utilisateurs, messages).

3. **Système**  
   Entité technique qui gère l'authentification, les notifications, la base de données, et les services backend.

---

## 4 - Les actions associées à chaque acteur

### Actions du Client

#### Authentification
- S'inscrire sur la plateforme
- Se connecter / Se déconnecter
- Gérer son profil (modifier informations, photo de profil)

#### Consultation
- Consulter le catalogue de publications vérifiées
- Rechercher des services par mots-clés
- Filtrer les publications (type, prix, statut)
- Consulter les détails d'une publication

#### Publication
- Publier une demande de réparation
- Publier une annonce d'achat/vente/échange
- Modifier ses propres publications
- Supprimer ses propres publications
- Uploader des images/documents pour les publications

#### Communication
- Envoyer des messages à d'autres utilisateurs
- Recevoir et consulter les messages
- Partager sa localisation dans les messages

#### Panier et commandes
- Ajouter des services au panier
- Consulter le panier
- Modifier les quantités dans le panier
- Effectuer un paiement (simulation)

#### Notifications
- Recevoir des notifications en temps réel
- Consulter l'historique des notifications
- Marquer les notifications comme lues

### Actions de l'Administrateur

#### Gestion des publications
- Consulter toutes les publications (vérifiées et non vérifiées)
- Valider une publication pour la mettre au catalogue
- Refuser une publication
- Modifier les informations d'une publication
- Supprimer une publication
- Filtrer les publications par statut, type, utilisateur

#### Gestion des utilisateurs
- Consulter la liste des utilisateurs
- Modifier les informations d'un utilisateur
- Changer le rôle d'un utilisateur
- Désactiver/Activer un compte utilisateur

#### Gestion des messages
- Consulter tous les messages
- Supprimer des messages inappropriés
- Modérer les conversations

#### Statistiques
- Consulter les statistiques de la plateforme
- Générer des rapports d'activité

### Actions du Système

- Authentifier les utilisateurs et générer des tokens JWT
- Valider les données saisies
- Gérer la persistance des données en base
- Envoyer des notifications automatiques
- Gérer les fichiers uploadés (images, documents)
- Assurer la sécurité des communications

---

## 5 - Choix de technologie

### Frontend
- **React.js 18** : Framework JavaScript moderne pour créer des interfaces utilisateur interactives et réactives
- **React Router v6** : Bibliothèque de routage pour la navigation entre les pages
- **Tailwind CSS** : Framework CSS utility-first pour un design moderne et responsive
- **Axios** : Bibliothèque HTTP pour les appels API
- **Context API** : Gestion de l'état global de l'application
- **Vite** : Outil de build moderne et rapide

### Backend
- **Spring Boot 3.4.3** : Framework Java pour développer des applications backend robustes
- **Spring Security** : Framework de sécurité pour l'authentification et l'autorisation
- **Spring Data JPA** : Abstraction pour l'accès aux données
- **Hibernate** : ORM (Object-Relational Mapping) pour la gestion de la base de données
- **JWT (JSON Web Token)** : Mécanisme d'authentification sécurisé
- **Java 21** : Langage de programmation backend

### Base de données
- **MySQL 8.0+** : Système de gestion de base de données relationnelle
- **InnoDB Engine** : Moteur de stockage transactionnel

### Outils de développement
- **IntelliJ IDEA** : IDE pour le développement backend
- **Visual Studio Code** : Éditeur pour le développement frontend
- **Postman** : Outil de test des APIs REST
- **MySQL Workbench** : Outil de gestion de base de données
- **Git** : Système de contrôle de version

---

## 6 - Modules à développer

### Module M1 « Authentification et Gestion des Utilisateurs »

**Tâches :**
- Développement du système d'inscription (formulaire, validation, enregistrement)
- Développement du système de connexion (authentification JWT)
- Gestion des rôles utilisateurs (CLIENT, ADMIN)
- Gestion du profil utilisateur (modification, photo de profil)
- Gestion de la déconnexion
- Protection des routes selon les rôles

**Acteurs :** Client, Administrateur, Système

---

### Module M2 « Gestion des Publications »

**Tâches :**
- Création de publications (titre, description, type, prix, fichier)
- Consultation des publications (liste, détails)
- Filtrage et recherche de publications
- Modification et suppression de publications
- Upload et gestion des fichiers (images, documents)
- Validation des publications par l'administrateur

**Acteurs :** Client, Administrateur, Système

---

### Module M3 « Catalogue et Recherche »

**Tâches :**
- Affichage du catalogue de publications vérifiées
- Système de recherche par mots-clés
- Filtres avancés (type, prix min/max, statut)
- Tri des résultats (date, prix, nom)
- Affichage responsive des publications
- Pagination des résultats

**Acteurs :** Client, Système

---

### Module M4 « Système de Messagerie »

**Tâches :**
- Envoi de messages entre utilisateurs
- Réception et affichage des messages
- Partage de localisation dans les messages
- Notifications en temps réel pour nouveaux messages
- Gestion des conversations
- Suppression de messages (admin uniquement)

**Acteurs :** Client, Administrateur, Système

---

### Module M5 « Panier d'Achat et Paiement »

**Tâches :**
- Ajout de services au panier
- Consultation du panier
- Modification des quantités
- Suppression d'articles du panier
- Calcul du total
- Simulation de paiement

**Acteurs :** Client, Système

---

### Module M6 « Système de Notifications »

**Tâches :**
- Génération de notifications automatiques
- Affichage des notifications en temps réel
- Marquage des notifications comme lues
- Historique des notifications
- Badge de compteur de notifications non lues

**Acteurs :** Client, Système

---

### Module M7 « Dashboard Administrateur »

**Tâches :**
- Interface d'administration complète
- Gestion des publications (validation, refus, modification, suppression)
- Gestion des utilisateurs (liste, modification, changement de rôle)
- Gestion des messages (consultation, suppression)
- Statistiques et rapports
- Filtres et recherche avancée

**Acteurs :** Administrateur, Système

---

### Module M8 « Chatbot Intelligent »

**Tâches :**
- Interface de chat intégrée
- Recherche intelligente dans le catalogue
- Suggestions de publications pertinentes
- Gestion des synonymes et variantes de recherche
- Scoring de pertinence des résultats

**Acteurs :** Client, Système

---

## 7 - Méthodologie de conception adoptée

### Approche Agile

Le développement du projet a été mené selon une **approche agile** avec les principes suivants :

- **Itérations courtes :** Développement par sprints successifs
- **Adaptabilité :** Possibilité d'ajuster les fonctionnalités selon les retours
- **Collaboration :** Communication régulière avec l'équipe et l'encadrant
- **Livraison incrémentale :** Chaque sprint livre des fonctionnalités opérationnelles

### Modélisation UML

Pour la conception, nous avons utilisé le langage de modélisation UML :

- **Diagramme de cas d'utilisation :** Identification des acteurs et des fonctionnalités
- **Diagramme de classes :** Modélisation des entités et de leurs relations
- **Diagramme de séquence :** Modélisation des interactions entre les composants
- **Diagramme d'architecture :** Représentation de l'architecture logicielle et physique

### Architecture en couches

L'application suit une **architecture en 3 couches** :

1. **Couche Présentation :** Interface utilisateur (React.js)
2. **Couche Logique Métier :** Traitements et règles métier (Spring Boot)
3. **Couche Données :** Persistance des données (MySQL)

### Gestion de version

Utilisation de **Git** pour :
- Versioning du code source
- Gestion des branches (main, develop, feature)
- Historique des modifications
- Collaboration en équipe

---

## 8 - Architecture

### Architecture Logicielle

L'architecture logicielle de l'application suit le modèle **3-tier (trois couches)** :

#### 1. Couche Présentation (Frontend)
- Pages React (Login, SignUp, Shop, Publications, Messages, Profile, Admin)
- Composants réutilisables (Button, Card, Input, Chatbot, Logo)
- Context API pour la gestion de l'état global
- Services API (api.js avec Axios)
- Technologies : React 18, React Router v6, Tailwind CSS, Vite

#### 2. Couche Logique Métier (Backend)
- Controllers REST API (AuthController, PubController, UserController, MessageController)
- Services métier (UserImpl, PubImpl, MessageImpl)
- Repositories JPA (UserRepository, PublicationRepository, MessageRepository)
- Configuration sécurité (Spring Security, JWT)
- Technologies : Spring Boot 3.4.3, Spring Security, Spring Data JPA, Hibernate, Java 21

#### 3. Couche Données (Base de données)
- Tables principales : utilisateur, publication, message, notification, cart, cart_item, comment, recommendation
- Relations : Utilisateur 1→N Publication, Utilisateur 1→N Message, Utilisateur 1→1 Cart, Publication 1→N Comment
- Technologies : MySQL 8.0+, InnoDB Engine, UTF-8 Encoding

### Architecture Physique

L'architecture physique suit une structure **client-serveur** :

- **Client léger :** Navigateur web exécutant l'application React
- **Serveur d'application :** Serveur hébergeant le backend Spring Boot (port 9090)
- **Serveur de base de données :** Serveur MySQL (port 3306)

### Flux de Communication

- **Frontend → Backend :** Communication via HTTP/REST API (JSON, JWT Token)
- **Backend → Database :** Communication via JPA/Hibernate (ORM, SQL)

---

## 9 - Choix technologiques

### Justification des choix

#### Frontend : React.js
- **Popularité et communauté :** Framework très populaire avec une large communauté
- **Performance :** Virtual DOM pour des performances optimales
- **Composants réutilisables :** Architecture modulaire facilitant la maintenance
- **Ecosystème riche :** Nombreuses bibliothèques et outils disponibles
- **Responsive :** Facilite la création d'interfaces adaptatives

#### Backend : Spring Boot
- **Robustesse :** Framework mature et éprouvé pour les applications d'entreprise
- **Sécurité :** Spring Security offre une sécurité intégrée
- **Productivité :** Auto-configuration réduisant le code boilerplate
- **Intégration :** Excellente intégration avec les bases de données et autres services
- **Documentation :** Documentation complète et nombreux tutoriels

#### Base de données : MySQL
- **Fiabilité :** Base de données relationnelle fiable et stable
- **Performance :** Bonnes performances pour les applications web
- **Gratuité :** Open source et gratuit
- **Compatibilité :** Compatible avec Spring Data JPA et Hibernate
- **Communauté :** Large communauté et support

### Stack technologique complète

| **Couche** | **Technologies** |
|------------|------------------|
| **Présentation** | React.js 18, React Router v6, Tailwind CSS, Axios, Context API, Vite |
| **Logique Métier** | Spring Boot 3.4.3, Spring Security, Spring Data JPA, Hibernate, Java 21 |
| **Données** | MySQL 8.0+, InnoDB Engine |
| **Sécurité** | JWT (JSON Web Token), BCrypt, Spring Security |
| **Outils** | IntelliJ IDEA, VS Code, Postman, MySQL Workbench, Git |

---

**Cahier des charges rempli le :** _______________

