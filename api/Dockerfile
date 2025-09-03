# api/Dockerfile (CORRIGIDO)

# Fase 1: Instalar todas as dependências (incluindo as de desenvolvimento)
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --production=false
COPY prisma ./prisma
RUN npx prisma generate

# -----------------------------------------------------

# Fase 2: Construir a aplicação
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY src ./src
COPY tsconfig.json .
COPY package.json .
COPY env.d.ts .
# Executar o build da aplicação principal
RUN npm run build


FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm install --production=true

COPY --from=builder /app/dist ./dist

COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

COPY entrypoint.sh .
RUN chmod +x ./entrypoint.sh

EXPOSE 3001

CMD ["./entrypoint.sh"]