# ── Étape 1 : image de base légère ────────────────────────
FROM node:20-alpine

# Créer le dossier de l'application
WORKDIR /usr/src/app

# ── Étape 2 : installer les dépendances ───────────────────
# On copie d'abord package.json pour profiter du cache Docker
COPY package*.json ./
RUN npm install --only=production

# ── Étape 3 : copier le code source ───────────────────────
COPY . .

# ── Étape 4 : exposer le port ─────────────────────────────
EXPOSE 3000

# ── Étape 5 : lancer l'app ────────────────────────────────
CMD ["node", "index.js"]