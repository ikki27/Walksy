# Walksy API image, built in stages so the final image only contains what's needed to run.
#   docker compose build   (from the repo root, see docker-compose.yml)

# ---- 1. build: install everything, generate the Prisma client, compile TypeScript ----
FROM node:24-bookworm-slim AS build
WORKDIR /app

# Prisma's migration engine needs OpenSSL
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

# install packages first: this layer is reused as long as package*.json don't change
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# prisma.config.ts reads DATABASE_URL; generating the client doesn't connect, so a placeholder is enough
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" npx prisma generate \
    && npm run build

# ---- 2. migrate: used once on start to apply database migrations (has the Prisma CLI) ----
FROM build AS migrate
CMD ["npx", "prisma", "migrate", "deploy"]

# ---- 3. runtime: only the compiled app + production packages ----
FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist

# don't run as root inside the container
USER node
EXPOSE 3000

# Docker marks the container "unhealthy" when GET / stops answering
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "dist/main"]
