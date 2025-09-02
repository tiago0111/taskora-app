FROM node:18-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm install

RUN npx prisma generate

FROM node:18-alpine AS builder
WORKDIR /app

COPY --from=deps /app .

COPY tsconfig.json ./
COPY src ./src


RUN echo "### Ficheiros antes do build: ###" && ls -la

RUN npm run build

RUN echo "### Ficheiros após o build em /dist: ###" && ls -la dist

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001

CMD ["node", "dist/index.js"]