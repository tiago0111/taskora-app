FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --production=false
COPY prisma ./prisma
RUN npx prisma generate


FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY src ./src
COPY tsconfig.json .
COPY env.d.ts .
COPY hash-password.ts .
RUN npm run build

# -----------------------------------------------------

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm install --production=true
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma/schema.prisma ./prisma/schema.prisma

EXPOSE 3001
CMD ["node", "dist/index.js"]