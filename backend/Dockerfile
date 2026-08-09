# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl

# ---- Dependencies (Cài ĐẦY ĐỦ cả devDependencies để phục vụ Build) ----
FROM base AS deps
COPY package*.json ./
COPY prisma ./prisma

RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm ci

# ---- Build ----
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# ---- Production runtime ----
FROM base AS production
ENV NODE_ENV=production
COPY package*.json ./
# Ở stage này mới dùng --omit=dev để loại bỏ devDependencies, giữ image siêu nhẹ
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
RUN npx prisma generate

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]