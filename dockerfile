FROM node:18-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS production-deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS production
WORKDIR /app

RUN apk add --no-cache \
    postgresql-client \
    mongodb-tools

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=production-deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --chown=nestjs:nodejs package.json ./

ENV NODE_ENV=production
ENV PORT=3000

USER nestjs

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -q --spider http://localhost:3000/health || exit 1

EXPOSE 3000

CMD ["node", "dist/main"]