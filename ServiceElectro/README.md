# ServiceElectro - Service de Réparation Électronique

Application Spring Boot pour la gestion d'un service de réparation électronique avec système de publications, commentaires et utilisateurs.

## 🚀 Fonctionnalités

- **Gestion des utilisateurs** : Création de compte avec validation et hashage sécurisé des mots de passe
- **Gestion des publications** : Création, consultation et suppression de publications de services
- **Upload de fichiers** : Support de l'upload de fichiers (images, PDF, documents) pour les publications
- **Système de commentaires** : Ajout et gestion de commentaires sur les publications
- **Sécurité** : Configuration Spring Security avec BCrypt pour le hashage des mots de passe
- **Validation des données** : Validation automatique avec Jakarta Validation
- **Gestion d'erreurs centralisée** : Handler global pour les exceptions
- **Architecture DTO** : Séparation des entités et des données exposées via l'API
- **Audit automatique** : Timestamps automatiques (createdAt, updatedAt) sur toutes les entités

## 📋 Prérequis

- Java 21
- Maven 3.6+
- MySQL 8.0+

## 🛠️ Configuration

### Base de données

Modifiez le fichier `application.properties` avec vos paramètres de base de données :

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/serviceelectro
spring.datasource.username=votre_username
spring.datasource.password=votre_password
```

### Port

Le serveur démarre sur le port **9090** par défaut.

### Upload de fichiers

Les fichiers sont stockés dans le répertoire `uploads/` (créé automatiquement). Vous pouvez configurer :
- Le répertoire de stockage : `file.upload-dir`
- La taille maximale : `file.max-file-size` (par défaut 10MB)
- Les types autorisés : `file.allowed-types`

Types de fichiers autorisés par défaut :
- Images : JPEG, PNG, GIF
- Documents : PDF, DOC, DOCX

## 🏗️ Architecture

### Structure du projet

```
src/main/java/org/example/serviceelectro/
├── config/              # Configurations (Security, CORS, Exception Handler)
├── controler/           # Contrôleurs REST
├── dto/                 # Data Transfer Objects
├── entities/            # Entités JPA
├── mapper/              # Mappers DTO <-> Entity
├── repository/          # Repositories JPA
└── servicees/           # Services métier
```

### Endpoints API

#### Utilisateurs (`/api/utilis`)
- `GET /api/utilis` - Liste tous les utilisateurs
- `GET /api/utilis/{id}` - Récupère un utilisateur par ID
- `POST /api/utilis` - Crée un nouveau compte utilisateur

#### Publications (`/api/pub`)
- `GET /api/pub` - Liste toutes les publications **vérifiées** (publiques)
- `GET /api/pub/{id}` - Récupère une publication par ID
- `GET /api/pub/user/{userId}` - Liste les publications d'un utilisateur
- `POST /api/pub` - Crée une nouvelle publication (non vérifiée par défaut)
- `POST /api/pub/with-file` - Crée une publication avec un fichier joint (multipart/form-data)
- `PUT /api/pub/{id}/file` - Met à jour le fichier d'une publication
- `DELETE /api/pub/{id}` - Supprime une publication (et son fichier associé)

#### Gestion des Fichiers (`/api/files`)
- `POST /api/files/upload` - Upload un fichier (retourne fileName et fileUrl)
- `GET /api/files/{fileName}` - Télécharge un fichier
- `DELETE /api/files/{fileName}` - Supprime un fichier

#### Administration des Publications (`/api/pub/admin`)
- `GET /api/pub/admin/all` - Liste toutes les publications (vérifiées et non vérifiées)
- `GET /api/pub/admin/unverified` - Liste uniquement les publications non vérifiées
- `POST /api/pub/admin/verify/{id}` - Vérifie une publication (nécessite adminId dans le body)
- `POST /api/pub/admin/unverify/{id}` - Annule la vérification d'une publication

#### Commentaires (`/api/comments`)
- `GET /api/comments` - Liste tous les commentaires
- `GET /api/comments/publication/{publicationId}` - Liste les commentaires d'une publication
- `POST /api/comments` - Crée un nouveau commentaire
- `DELETE /api/comments/{id}` - Supprime un commentaire

## 🔒 Sécurité

- **Hashage des mots de passe** : Utilisation de BCrypt
- **CORS configuré** : Origines autorisées : localhost:3000, localhost:4200, localhost:8080
- **Validation des données** : Validation automatique avec Jakarta Validation
- **Gestion des erreurs** : Handler global pour les exceptions

## ✅ Système de Vérification des Publications

Le système permet de vérifier les publications soit **automatiquement** soit **manuellement par un administrateur**.

### Vérification Automatique

Les publications peuvent être vérifiées automatiquement selon des critères configurables :

1. **Par type de publication** : Certains types (ex: "REPARATION_SIMPLE", "CONSULTATION") sont vérifiés automatiquement
2. **Par prix** : Publications avec un prix inférieur à 100€ sont vérifiées automatiquement
3. **Par rôle utilisateur** : Utilisateurs avec le rôle "PREMIUM_USER" ont leurs publications vérifiées automatiquement
4. **Par délai** : Publications en attente depuis plus de 24h peuvent être vérifiées automatiquement (tâche planifiée)

### Vérification Manuelle par Admin

Un administrateur peut vérifier manuellement une publication via l'endpoint :
```http
POST /api/pub/admin/verify/{id}
Content-Type: application/json

{
  "adminId": 1
}
```

### Comportement

- **Par défaut** : Toutes les nouvelles publications sont créées avec `verified = false`
- **Affichage public** : Seules les publications vérifiées sont retournées par `GET /api/pub`
- **Affichage admin** : Les admins peuvent voir toutes les publications via `GET /api/pub/admin/all`
- **Traçabilité** : Chaque vérification enregistre l'ID de l'admin et la date de vérification

## 📎 Upload de Fichiers

Le système permet d'attacher des fichiers aux publications. Les fichiers sont stockés localement et peuvent être téléchargés via l'API.

### Créer une publication avec un fichier

```http
POST /api/pub/with-file
Content-Type: multipart/form-data

title: "Réparation iPhone"
description: "Réparation écran iPhone 12"
type: "REPARATION"
price: 150.0
status: "DISPONIBLE"
utilisateurId: 1
file: [fichier à uploader]
```

### Mettre à jour le fichier d'une publication

```http
PUT /api/pub/{id}/file
Content-Type: multipart/form-data

file: [nouveau fichier]
```

### Uploader un fichier indépendamment

```http
POST /api/files/upload
Content-Type: multipart/form-data

file: [fichier à uploader]
```

Réponse :
```json
{
  "fileName": "uuid-filename.ext",
  "fileUrl": "/api/files/uuid-filename.ext",
  "fileType": "image/jpeg",
  "fileSize": 123456,
  "message": "Fichier uploadé avec succès"
}
```

### Télécharger un fichier

```http
GET /api/files/{fileName}
```

### Configuration

Les paramètres de configuration sont dans `application.properties` :
- `file.upload-dir` : Répertoire de stockage (défaut: `uploads`)
- `file.max-file-size` : Taille maximale en octets (défaut: 10MB)
- `file.allowed-types` : Types MIME autorisés

## 📝 Améliorations apportées

1. ✅ **Validation des données** : Ajout de Jakarta Validation avec messages d'erreur personnalisés
2. ✅ **Gestion d'erreurs centralisée** : GlobalExceptionHandler pour une gestion uniforme
3. ✅ **Architecture DTO** : Séparation claire entre entités et données API
4. ✅ **Hashage des mots de passe** : Sécurisation avec BCrypt
5. ✅ **Configuration Spring Security** : Base configurée (prête pour JWT)
6. ✅ **Timestamps automatiques** : Audit automatique avec @EntityListeners
7. ✅ **Service Commentaires** : Implémentation complète du service et contrôleur
8. ✅ **Configuration améliorée** : CORS, logging, JPA optimisés
9. ✅ **Nettoyage du code** : Suppression de la duplication avec Lombok
10. ✅ **Repositories enrichis** : Méthodes de recherche personnalisées

## 🚦 Démarrage

1. Clonez le projet
2. Configurez votre base de données MySQL
3. Exécutez l'application :
```bash
mvn spring-boot:run
```

L'application sera accessible sur `http://localhost:9090`

## 📦 Dépendances principales

- Spring Boot 3.4.3
- Spring Data JPA
- Spring Security
- MySQL Connector
- Lombok
- Jakarta Validation
- JWT (déjà inclus, prêt pour implémentation)

## 🔄 Prochaines étapes suggérées

- [x] Système de vérification des publications (automatique et manuelle)
- [ ] Implémentation complète de l'authentification JWT avec rôles
- [ ] Sécurisation des endpoints admin (nécessite authentification)
- [ ] Ajout de tests unitaires et d'intégration
- [ ] Pagination pour les listes
- [ ] Upload de fichiers/images pour les publications
- [ ] Système de notifications
- [ ] Documentation API avec Swagger/OpenAPI
- [ ] Configuration des critères de vérification automatique via properties

## 📄 Licence

Ce projet est sous licence MIT.


