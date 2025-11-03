FROM oven/bun:1 AS deps
WORKDIR /app

COPY bun.lockb package.json ./
RUN bun install --frozen-lockfile

FROM oven/bun:1
WORKDIR /app

ENV NODE_ENV=production
# Provide a default so `prisma generate` can run during image build.
ENV DATABASE_URL=postgresql://postgres:postgres@postgres:5432/iona?schema=public

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/bun.lockb ./bun.lockb
COPY --from=deps /app/package.json ./package.json
COPY . .

RUN bunx prisma generate

CMD ["bun", "main.ts"]
