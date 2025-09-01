# Instalar dependências
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

#  Construir o código TypeScript
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build 

#  Imagem final de produção
FROM node:18-alpine AS runner
WORKDIR /app

# Copiar o código 
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expor a porta 
EXPOSE 3001


CMD ["node", "dist/index.js"]