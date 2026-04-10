# Stage 1: Build
FROM node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY backend/package.json ./backend/

RUN pnpm install --filter backend

COPY backend/ ./backend/

RUN pnpm --filter backend build

# Stage 2: Runtime
FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/backend/package.json ./package.json
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./dist

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/main"]
