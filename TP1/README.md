# TP1 - Application Docker avec Node.js

## Structure du projet

```
TP1/
├── Dockerfile
├── .dockerignore
├── package.json
├── index.js
└── README.md
```

## Installation

### Avec Docker

```bash
docker build -t tp1:corrige .
docker run --rm -p 3000:3000 tp:corrige
```

L'application est accessible à **http://localhost:3000**
