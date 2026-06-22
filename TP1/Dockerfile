FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build
#C'est pour donner les droits à l'utilisateur node sur le dossier /app
RUN chown -R node:node /app

USER node 

EXPOSE 3000

CMD ["node", "dist/index.js"]
