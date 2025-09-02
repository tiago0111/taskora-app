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
# Copiar dependências e cliente Prisma da fase anterior
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
# Copiar o resto do código fonte e ficheiros de configuração
COPY src ./src
COPY tsconfig.json .
COPY package.json .
COPY env.d.ts .
# Executar o build
RUN npm run build

# -----------------------------------------------------

# Fase 3: Imagem final de produção (mais leve)
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Copiar package.json e instalar APENAS as dependências de produção
COPY package.json package-lock.json ./
RUN npm install --production=true
# Copiar os ficheiros compilados (dist) da fase de build
COPY --from=builder /app/dist ./dist
# Copiar o schema do Prisma e o cliente gerado para o runtime
COPY --from=builder /app/prisma/schema.prisma ./prisma/schema.prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3001
CMD ["node", "dist/index.js"]