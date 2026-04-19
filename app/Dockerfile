# ── Étape 1 : build du frontend React ──────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /build
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build
# → génère /build/build/ avec index.html + JS/CSS

# ── Étape 2 : image finale Node.js ──────────────────────
FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production
COPY index.js ./
COPY --from=frontend-builder /build/build ./build
EXPOSE 3000
CMD ["node", "index.js"]