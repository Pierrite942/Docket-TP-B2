# TP2 - Multi-conteneurs avec Docker Compose

## Structure du projet

```
TP2/
├── docker-compose.yml    # Orchestration des services
├── .env                  # Variables d'environnement
├── api/                  # API Node.js
│   ├── Dockerfile
│   ├── package.json
│   └── index.js
├── frontend/             # Frontend statique
│   ├── Dockerfile
│   └── index.html
└── README.md
```

## Installation et lancement

### 1. Démarrer tous les services

```bash
docker-compose up --build
```

### 2. Arrêter les services

```bash
docker-compose down
```

## Accès aux services

- **Frontend** : http://localhost:8080
- **API** : http://localhost:3000
- **Adminer (gestion DB)** : http://localhost:8081
  - Serveur : database
  - Utilisateur : tp2user
  - Mot de passe : tp2password...
  - Base de données : tp2db

## Services

- **database** : PostgreSQL 16 Alpine
- **api** : Application Node.js
- **frontend** : Serveur web statique
- **adminer** : Interface de gestion de base de données

## Variables d'environnement

Voir le fichier `.env` pour les identifiants PostgreSQL.
