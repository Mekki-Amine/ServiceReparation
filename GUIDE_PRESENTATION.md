# Guide de Présentation - Projet Fixer

## Structure de la présentation (15-20 slides)

### Slide 1 : Page de titre
- **Titre :** Fixer - Plateforme de Services de Réparation d'Électroménagers
- **Sous-titre :** Projet de Fin d'Études
- **Auteur :** Amine Mekki
- **Encadrants :** Sameh BENNOUR (SESAME) / Kais EUCHI (C.C.A)
- **Année :** 2024-2025

### Slide 2 : Plan de la présentation
1. Introduction
2. Contexte et Cadre du Projet
3. Analyse et Spécification
4. Sprint 1 - Authentification
5. Sprint 2 - Publications et Catalogue
6. Sprint 3 - Panier et Messagerie
7. Sprint 4 - Notifications et Chatbot
8. Résultats et Réalisations
9. Conclusion

---

## Slide 3 : Introduction Générale

**Contenu :**
- Contexte : Digitalisation du secteur des services
- Problématique : Difficultés de mise en relation
- Solution : Plateforme web moderne
- Objectif : Faciliter l'accès aux services de réparation

**Valeur ajoutée :**
- Interface intuitive et moderne
- Sécurité renforcée (JWT)
- Architecture modulaire
- Expérience utilisateur optimale

---

## Slide 4 : Présentation de l'organisme d'accueil

**CCA :**
- Startup tunisienne fondée en 2010
- Spécialisée en développement web
- Secteur : Communication et marketing digital
- Siège : 97 Avenue Habib Bourguiba, Ariana
- Effectif : 10 employés
- Directeur/CEO : Youssef Berhouma

**Mission :** Fournir des solutions digitales innovantes et des services de communication sur mesure.

---

## Slide 5 : Cadre du projet

**Objectifs fonctionnels :**
- Développer une plateforme complète
- Permettre publication et consultation
- Faciliter la communication
- Gérer transactions et paiements

**Objectifs techniques :**
- Architecture modulaire
- Sécurité renforcée
- Interface responsive
- Performance élevée

---

## Slide 6 : Méthodologie de travail

**Approche Agile :**
- Développement par sprints
- Itérations courtes (2-4 semaines)
- Adaptation continue
- Livraison incrémentale

**Modélisation UML :**
- Diagramme de cas d'utilisation
- Diagramme de classes
- Diagramme de séquence
- Diagramme d'architecture

**4 Sprints** répartis sur la durée du stage

---

## Slide 7 : Besoins fonctionnels

**Client :**
- Authentification sécurisée
- Publication de demandes
- Consultation du catalogue
- Messagerie
- Panier d'achat
- Notifications

**Administrateur :**
- Validation des publications
- Gestion des utilisateurs
- Gestion des messages
- Statistiques et rapports

---

## Slide 8 : Architecture générale

**Architecture en 3 couches :**

1. **Couche Présentation** : React.js 18
   - Pages, Composants, Context API
   - Tailwind CSS, React Router

2. **Couche Logique Métier** : Spring Boot 3.4.3
   - Controllers, Services, Repositories
   - Spring Security, JWT

3. **Couche Données** : MySQL 8.0+
   - Tables : utilisateur, publication, message, etc.

---

## Slide 9 : Stack technologique

| Frontend | React.js 18, React Router v6, Tailwind CSS, Axios, Vite |
|----------|----------------------------------------------------------|
| Backend | Spring Boot 3.4.3, Spring Security, Spring Data JPA, Java 21 |
| Base de données | MySQL 8.0+, InnoDB Engine |
| Sécurité | JWT, BCrypt, Spring Security |
| Outils | IntelliJ IDEA, VS Code, Postman, Git |

---

## Slide 10 : Sprint 1 - Authentification

**Objectifs :**
- Système d'authentification sécurisé
- Gestion des rôles (CLIENT, ADMIN)
- Interface d'inscription et de connexion

**Fonctionnalités :**
- Inscription avec validation
- Connexion avec JWT
- Gestion du profil utilisateur
- Protection des routes selon les rôles

---

## Slide 11 : Sprint 2 - Publications et Catalogue

**Objectifs :**
- Système de publication de demandes
- Catalogue de publications vérifiées
- Gestion des publications par l'admin

**Fonctionnalités :**
- Création de publications (titre, description, type, prix, fichier)
- Upload d'images et documents
- Filtrage et recherche dans le catalogue
- Validation/Refus des publications par l'admin

---

## Slide 12 : Sprint 3 - Panier et Messagerie

**Objectifs :**
- Système de panier d'achat
- Système de messagerie entre utilisateurs
- Gestion des utilisateurs par l'admin

**Fonctionnalités :**
- Ajout/Suppression d'articles au panier
- Calcul du total
- Envoi et réception de messages
- Partage de localisation
- Notifications en temps réel

---

## Slide 13 : Sprint 4 - Notifications et Chatbot

**Objectifs :**
- Système de notifications en temps réel
- Chatbot intelligent pour la recherche
- Finalisation de l'application

**Fonctionnalités :**
- Notifications automatiques (validation, messages, etc.)
- Chatbot avec recherche intelligente
- Scoring de pertinence des résultats
- Gestion des synonymes

---

## Slide 14 : Fonctionnalités réalisées

**Côté Client :**
- ✓ Authentification sécurisée (JWT)
- ✓ Publication de demandes avec fichiers
- ✓ Catalogue avec filtres avancés
- ✓ Panier d'achat fonctionnel
- ✓ Système de messagerie complet
- ✓ Notifications en temps réel
- ✓ Chatbot intelligent

**Côté Administrateur :**
- ✓ Dashboard complet
- ✓ Gestion des publications
- ✓ Gestion des utilisateurs
- ✓ Gestion des messages

---

## Slide 15 : Statistiques du projet

| Composants React | 15+ composants réutilisables |
|------------------|------------------------------|
| Endpoints API REST | 25+ endpoints |
| Entités de base de données | 8 entités principales |
| Pages développées | 12+ pages |
| Sprints réalisés | 4 sprints |
| Durée du projet | 12-16 semaines |

---

## Slide 16 : Conclusion

**Réalisations :**
- Plateforme web complète et fonctionnelle
- Architecture modulaire et évolutive
- Sécurité renforcée avec JWT
- Interface moderne et responsive
- Toutes les fonctionnalités prévues implémentées

**Compétences acquises :**
- Développement full-stack (React, Spring Boot)
- Modélisation UML
- Gestion de projet agile
- Sécurité des applications web
- Travail en équipe

---

## Slide 17 : Perspectives d'évolution

**Améliorations futures :**
- Application mobile (iOS/Android)
- Tableau de bord analytique avancé
- Notifications temps réel via WebSocket
- Chatbot avec machine learning
- Système de paiement en ligne
- Système de notation et d'avis

---

## Slide 18 : Questions

**Merci pour votre attention**

**Questions ?**

---

## Conseils pour la présentation

1. **Durée recommandée :** 15-20 minutes
2. **Temps par slide :** 1-2 minutes
3. **Préparez des démonstrations :** Montrez l'application en action
4. **Soyez concis :** Évitez les détails techniques trop poussés
5. **Mettez en avant :** Les fonctionnalités principales et les défis relevés
6. **Préparez des réponses :** Aux questions fréquentes sur les technologies et choix techniques

