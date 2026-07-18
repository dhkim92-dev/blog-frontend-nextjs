FROM oven/bun:1 AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN bun install

COPY . ./
RUN bun run build

FROM oven/bun:1 AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

# API_BASE_URL=... DOMAIN_URL=... 실행 시 환경변수 필요함

CMD ["bun", "server.js"]
