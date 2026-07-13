# 1. Base image for installing dependencies
FROM node:20-slim AS base
RUN apt-get update && apt-get install -y openssl
WORKDIR /app
RUN npm install -g pnpm

# 2. Dependencies image
FROM base AS dependencies
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN pnpm install --frozen-lockfile

# 3. Build image
FROM base AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ARG DATABASE_URL
RUN pnpm prisma generate

# 4. Production image
FROM base AS runner
WORKDIR /app
COPY --from=builder /app .
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["pnpm", "start"]
