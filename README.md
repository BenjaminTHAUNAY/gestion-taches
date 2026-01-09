# Application de Gestion de Listes de Tâches

Application complète de gestion de listes de tâches avec support des listes personnelles et coopératives, authentification JWT, API RESTful et interface React.

## Architecture

- **Backend** : Node.js + Express + Sequelize
- **Base de données** : PostgreSQL
- **Frontend** : React + Vite
- **Authentification** : JWT (JSON Web Tokens)
- **Déploiement** : Docker Compose

## Structure du projet

```
gestion_taches/
├── api/                 # Backend API
│   ├── src/
│   │   ├── models/      # Modèles Sequelize
│   │   ├── routes/      # Routes Express
│   │   ├── middleware/  # Middleware (auth, permissions)
│   │   └── server.js    # Point d'entrée
│   ├── migrations/      # Migrations Sequelize
│   ├── config/          # Configuration Sequelize
│   └── package.json
├── web/                 # Frontend React
│   ├── src/
│   │   ├── pages/       # Composants de pages
│   │   ├── api/         # Client API
│   │   └── App.jsx
│   └── package.json
├── compose.yml          # Docker Compose
└── README.md
```

## Prérequis

- Docker et Docker Compose installés
- Node.js 18+ (pour le développement local)
- PostgreSQL 15+ (ou via Docker)

## Installation et lancement avec Docker

### 1. Lancer l'application complète

```bash
docker compose up
```

Cette commande va :
- Démarrer PostgreSQL sur le port 5432
- Lancer l'API sur le port 3000
- Lancer le frontend sur le port 5173
- Exécuter automatiquement les migrations

### 2. Accéder à l'application

- Frontend : http://localhost:5173
- API : http://localhost:3000
- Base de données : localhost:5432

### 3. Arrêter l'application

```bash
docker compose down
```

Pour supprimer également les volumes (données) :
```bash
docker compose down -v
```

## Développement local

### Backend (API)

#### 1. Installer les dépendances

```bash
cd api
npm install
```

#### 2. Configuration

Créer un fichier `.env` dans le dossier `api/` :

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/taskmanager
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskmanager
DB_USER=postgres
DB_PASSWORD=postgres
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
```

#### 3. Lancer PostgreSQL

```bash
docker compose up db -d
```

#### 4. Exécuter les migrations

```bash
npm run migrate
```

#### 5. Lancer l'API en mode développement

```bash
npm run dev
```

L'API sera accessible sur http://localhost:3000

### Frontend (Web)

#### 1. Installer les dépendances

```bash
cd web
npm install
```

#### 2. Configuration

Créer un fichier `.env` dans le dossier `web/` (optionnel) :

```env
VITE_API_URL=http://localhost:3000/api
```

#### 3. Lancer le serveur de développement

```bash
npm run dev
```

Le frontend sera accessible sur http://localhost:5173

## Exécution des migrations

### Avec Docker

Les migrations sont exécutées automatiquement au démarrage du service API.

### En développement local

```bash
cd api
npm run migrate
```

### Liste des migrations

Les migrations suivantes sont disponibles :
- `20260107-create-users.js` : Création de la table Users
- `20260107-create-tasklists.js` : Création de la table TaskLists
- `20260107-create-tasks.js` : Création de la table Tasks
- `20260107-create-listmembers.js` : Création de la table ListMembers avec contrainte d'unicité

## Modèle de données

### User
- `id` : Identifiant unique
- `email` : Email (unique)
- `password` : Mot de passe hashé (bcrypt)
- `createdAt`, `updatedAt` : Timestamps

### TaskList
- `id` : Identifiant unique
- `name` : Nom de la liste
- `ownerId` : Référence vers User (propriétaire)
- `isCoop` : Booléen (liste coopérative ou personnelle)
- `createdAt`, `updatedAt` : Timestamps

### Task
- `id` : Identifiant unique
- `listId` : Référence vers TaskList
- `title` : Titre de la tâche
- `done` : Booléen (tâche terminée)
- `dueDate` : Date d'échéance (nullable)
- `createdAt`, `updatedAt` : Timestamps

### ListMember
- `id` : Identifiant unique
- `listId` : Référence vers TaskList
- `userId` : Référence vers User
- `role` : Rôle (owner, editor, reader)
- `createdAt` : Timestamp
- Contrainte d'unicité : (`listId`, `userId`)

## API RESTful

### Authentification

- `POST /api/auth/register` : Inscription
- `POST /api/auth/login` : Connexion (retourne un token JWT)
- `GET /api/users/me` : Profil de l'utilisateur connecté (protégé)

### Listes

- `GET /api/lists` : Liste des listes accessibles
- `GET /api/lists/:id` : Détails d'une liste
- `POST /api/lists` : Créer une liste
- `PUT /api/lists/:id` : Renommer une liste (owner uniquement)
- `DELETE /api/lists/:id` : Supprimer une liste (owner uniquement)
- `GET /api/lists/:id/tasks` : Tâches d'une liste
- `POST /api/lists/:id/tasks` : Ajouter une tâche

### Membres (listes coopératives)

- `GET /api/lists/:id/members` : Liste des membres
- `POST /api/lists/:id/members` : Ajouter un membre (owner uniquement)
- `PUT /api/lists/:id/members/:userId` : Modifier le rôle (owner uniquement)
- `DELETE /api/lists/:id/members/:userId` : Retirer un membre (owner uniquement)

### Tâches

- `GET /api/tasks/:id` : Détails d'une tâche
- `PUT /api/tasks/:id` : Modifier une tâche (avec détection de conflit)
- `DELETE /api/tasks/:id` : Supprimer une tâche

### Authentification JWT

Toutes les routes (sauf `/api/auth/*`) nécessitent un token JWT dans l'en-tête :

```
Authorization: Bearer <token>
```

## Gestion des conflits

### Mécanisme de détection

L'application utilise un mécanisme de **versioning par timestamp** pour détecter les conflits lors de la modification des tâches.

#### Principe

1. Lorsqu'un client charge une tâche, il reçoit le champ `updatedAt` (timestamp de dernière modification).
2. Lors d'une modification, le client **doit** fournir le champ `updatedAt` de la version qu'il a chargée.
3. Le serveur compare ce timestamp avec celui de la version en base de données :
   - Si les timestamps correspondent : la modification est appliquée.
   - Si les timestamps diffèrent : un conflit est détecté.

#### Codes HTTP

- **428 Precondition Required** : Le champ `updatedAt` n'a pas été fourni par le client.
  ```json
  {
    "error": "Precondition Required",
    "message": "Le champ updatedAt est requis pour éviter les conflits de modification",
    "details": "Vous devez fournir le champ updatedAt de la version actuelle de la tâche que vous avez chargée"
  }
  ```

- **409 Conflict** : Le champ `updatedAt` fourni ne correspond pas à la version serveur.
  ```json
  {
    "error": "Conflict",
    "message": "La tâche a été modifiée par un autre utilisateur entre-temps",
    "details": "Vous devez recharger la tâche et réappliquer vos modifications",
    "serverVersion": {
      "id": 1,
      "title": "Tâche modifiée",
      "done": false,
      "dueDate": null,
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
  ```

#### Exemple d'utilisation

**1. Charger une tâche**
```javascript
GET /api/tasks/1
Response: {
  "id": 1,
  "title": "Ma tâche",
  "done": false,
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

**2. Modifier la tâche (avec updatedAt)**
```javascript
PUT /api/tasks/1
Body: {
  "title": "Ma tâche modifiée",
  "updatedAt": "2024-01-15T10:00:00.000Z"  // ⚠️ OBLIGATOIRE
}
```

**3. Si conflit détecté**
Le client doit :
- Recharger la tâche pour obtenir la nouvelle version
- Réappliquer ses modifications si nécessaire
- Renvoyer la requête avec le nouveau `updatedAt`

#### Pourquoi ce mécanisme ?

- **Simplicité** : Utilise le timestamp `updatedAt` déjà géré par Sequelize
- **Fiabilité** : Détecte toute modification concurrente
- **Performance** : Pas besoin d'un champ version supplémentaire
- **Standard** : Respecte les codes HTTP 428 et 409

## Règles d'autorisation (RBAC)

### Listes personnelles (`isCoop = false`)

- Seul le propriétaire peut :
  - Consulter la liste
  - Modifier la liste (renommer)
  - Supprimer la liste
  - Gérer les tâches (CRUD)

### Listes coopératives (`isCoop = true`)

#### Owner (propriétaire)
- Tous les droits :
  - Gestion complète de la liste (CRUD)
  - Gestion des membres (ajout, modification de rôle, retrait)
  - Gestion complète des tâches (CRUD)
  - Suppression de la liste

#### Editor (éditeur)
- Lecture de la liste
- Création, modification et suppression des tâches
- **Ne peut pas** :
  - Gérer les membres
  - Supprimer la liste
  - Modifier le nom de la liste

#### Reader (lecteur)
- Lecture seule :
  - Consultation de la liste
  - Consultation des tâches
- **Ne peut pas** :
  - Créer, modifier ou supprimer des tâches
  - Gérer les membres
  - Modifier ou supprimer la liste

## Sécurité

- Les mots de passe sont hashés avec bcrypt (10 rounds)
- Le token JWT est transmis via l'en-tête `Authorization: Bearer <token>`
- Le champ `password` n'apparaît jamais dans les réponses API
- Protection contre les accès non autorisés : les utilisateurs ne peuvent accéder qu'aux ressources auxquelles ils ont droit (pas de data-leak)

## Scripts disponibles

### API (`api/package.json`)

- `npm run dev` : Lance l'API en mode développement avec nodemon
- `npm start` : Lance l'API en mode production
- `npm run migrate` : Exécute les migrations Sequelize

### Web (`web/package.json`)

- `npm run dev` : Lance le serveur de développement Vite
- `npm run build` : Build de production
- `npm run preview` : Prévisualise le build de production

## Tests

Pour tester l'API, vous pouvez utiliser :

1. **Inscription et connexion** :
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

2. **Créer une liste** (avec le token obtenu) :
   ```bash
   curl -X POST http://localhost:3000/api/lists \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"name":"Ma liste","isCoop":false}'
   ```

## Développement

### Git Workflow

Le projet suit un workflow Git avec :
- Commits réguliers et descriptifs
- Messages de commit clairs
- Au moins 12 commits répartis sur plusieurs jours

### Structure des commits

Les commits sont organisés par fonctionnalité :
- `feat: ajout de l'authentification JWT`
- `feat: gestion des listes de tâches`
- `feat: gestion des membres des listes coopératives`
- `fix: correction de la détection de conflits`
- `docs: mise à jour du README`

## Troubleshooting

### Erreur de connexion à la base de données

Vérifier que PostgreSQL est bien lancé :
```bash
docker compose ps
```

### Erreur de migration

Si les migrations échouent, vérifier que la base de données est vide ou supprimer les tables existantes :
```bash
docker compose down -v
docker compose up
```

### Problème CORS

Le CORS est configuré pour autoriser toutes les origines en développement. En production, configurer les origines autorisées dans `api/src/server.js`.

## Licence

ISC
