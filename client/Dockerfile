
# Definir o argumento que pode ser passado durante o build
ARG NEXT_PUBLIC_API_URL

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

# Expor o argumento como uma variável de ambiente DENTRO desta fase
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Agora o build do Next.js terá acesso à variável
RUN npm run build

# Imagem final de produção
FROM node:18-alpine AS runner
WORKDIR /app

# Variáveis de ambiente
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1

# Criar um grupo e utilizador dedicados para a aplicação
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar os ficheiros 
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Mudar para o utilizador não-privilegiado
USER nextjs

# Expor a porta 
EXPOSE 3000

# Comando para iniciar o servidor 
CMD ["npm", "start"]