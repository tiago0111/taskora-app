# Fase de dependências
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

# Fase de construção da aplicação
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

# ==================== INÍCIO DAS ALTERAÇÕES ====================

# Criar um grupo e utilizador dedicados para a aplicação
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# ==================== FIM DAS ALTERAÇÕES ====================

# Copiar os ficheiros 
COPY --from=builder /app/public ./public
# Agora este comando vai funcionar porque o utilizador 'nextjs' e o grupo 'nodejs' existem
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# ==================== INÍCIO DAS ALTERAÇÕES ====================

# Mudar para o utilizador não-privilegiado
USER nextjs

# ==================== FIM DAS ALTERAÇÕES ====================

# Expor a porta 
EXPOSE 3000

# Comando para iniciar o servidor 
CMD ["npm", "start"]