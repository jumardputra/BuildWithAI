# Build stage: pasang dependensi dan bangun frontend
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Runtime stage: hanya yang diperlukan untuk produksi
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY server ./server
COPY .env.example ./

# Jalankan sebagai pengguna tanpa hak istimewa
RUN addgroup -S app && adduser -S app -G app \
 && mkdir -p /data && chown -R app:app /data /app
USER app

ENV PORT=3000 \
    HOST=0.0.0.0 \
    DB_PATH=/data/buildwithai.db \
    DIST_DIR=/app/dist \
    TRUST_PROXY=1 \
    COOKIE_SECURE=1

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server/index.js"]
