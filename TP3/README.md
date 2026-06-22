# TP3 - Application multi-services avec Redis

## Structure du projet

```
TP3/
├── docker-compose.yml    # Orchestration des services
├── .env.example          # Template variables d'environnement
├── .dockerignore          # Fichiers à ignorer
├── backend/              # API Node.js
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── frontend/             # Frontend statique
│   ├── Dockerfile
│   └── index.html
└── README.md
```

## Installation et lancement

### 1. Configuration

```bash
cp .env.example .env
```

### 2. Démarrer tous les services

```bash
docker-compose up --build
```

### 3. Arrêter les services

```bash
docker-compose down
```

## Accès aux services

- **Frontend** : http://localhost:8080
- **Backend** : http://localhost:3001
- **Redis** : localhost:6379 (accès interne)

## Services

- **frontend** : Serveur web statique (port 8080)
- **backend** : API Node.js (port 3001)
- **cache** : Redis 7 Alpine (stockage en cache)

## Variables d'environnement

Voir le fichier `.env.example` pour les valeurs requises.
