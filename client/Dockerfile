
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

# onstrução da aplicação
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Imagem final de produção
FROM node:18-alpine AS runner
WORKDIR /app

# Variáveis de ambiente
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1

# Copiar os ficheiros 
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expor a porta 
EXPOSE 3000

# Comando para iniciar o servidor 
CMD ["npm", "start"]