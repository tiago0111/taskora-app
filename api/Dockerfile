# Fase 1: Base com todas as dependências instaladas
FROM node:18-alpine AS base
WORKDIR /app

# Copia primeiro os ficheiros de dependências e instala
COPY package.json package-lock.json ./
RUN npm install --production=false

# Copia o schema do Prisma e gera o cliente
COPY prisma ./prisma
RUN npx prisma generate

# -----------------------------------------------------

# Fase 2: Construir a aplicação
FROM base AS builder
WORKDIR /app

# Copia TODO o código-fonte
COPY . .

# --- Diagnóstico Passo 1: Verificar se os ficheiros TS existem ---
RUN echo "### Listando ficheiros na raiz do build:" && ls -la
RUN echo "### Listando ficheiros na pasta src:" && ls -la src

# Compila o TypeScript para JavaScript
RUN npm run build

# --- Diagnóstico Passo 2: Verificar se a pasta 'dist' foi criada ---
RUN echo "### Listando o conteúdo da pasta 'dist' após o build:" && ls -la dist

# -----------------------------------------------------

# Fase 3: Imagem final de produção
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Instala apenas as dependências de produção para uma imagem mais pequena
COPY package.json package-lock.json ./
RUN npm install --production=true

# Copia os artefactos da fase de 'builder'
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
# Copia o cliente Prisma gerado
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3001

CMD ["node", "dist/index.js"]