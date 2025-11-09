# Iona Telegram Bot

Personal Telegram bot scaffold built with Bun + TypeScript, Grammy, Prisma, and
the AI SDK. The bot authenticates users via a hard-coded username whitelist,
streams messages to OpenAI (defaulting to `gpt-5`), and stores conversation
history in Postgres for future retrieval augmented generation (RAG) experiments.

## Features

- Bun-native runtime with Grammy Telegram bot framework.
- AI SDK integration with OpenAI (easily swappable for other providers).
- Prisma data models for chat history and a placeholder knowledge base.
- Fully containerized with Docker Compose for both bot and Postgres.
- Justfile task runner for streamlined development workflow.
- Strict environment schema with `.env` bootstrap and username whitelist
  parsing.
- Minimal unit test example for env helpers.

## Prerequisites

- [Bun](https://bun.sh/) v1.0 or newer (for local development).
- [just](https://github.com/casey/just) command runner.
- Docker Desktop or Docker Engine (for containerized deployment).

## Getting Started

### Using Docker (Recommended)

1. **Copy environment template**
   ```sh
   cp .env.example .env
   ```
   Update the values:
   - `TELEGRAM_BOT_TOKEN`: token from [@BotFather](https://t.me/BotFather).
   - `TELEGRAM_WHITELIST`: comma-separated Telegram usernames allowed to talk to
     the bot.
   - `OPENAI_API_KEY`: API key for OpenAI.
   - `OPENAI_MODEL`: optional override (defaults to `gpt-5`).

2. **Apply the database schema**
   ```sh
   just migrate-dev initial
   ```

3. **Run the bot**
   ```sh
   just bot
   ```
   The bot logs its username and active OpenAI model on startup. Send a message
   from a whitelisted username to see the AI reply.

### Using Local Bun (Development)

1. **Install dependencies**
   ```sh
   bun install
   ```

2. **Start Postgres**
   ```sh
   docker compose up -d postgres
   ```

3. **Generate Prisma client**
   ```sh
   bun run prisma:generate
   ```

4. **Apply the database schema**
   ```sh
   bun run prisma:migrate
   ```
   Set `DATABASE_URL` in `.env` to `postgresql://postgres:postgres@localhost:5432/iona?schema=public`.

5. **Run the bot**
   ```sh
   bun run bot
   ```
   For auto-reload on file changes, use:
   ```sh
   bun run dev
   ```

## Project Layout

```
src/
  bot.ts                # Bot entrypoint + middleware wiring
  config/env.ts         # Environment schema & whitelist parser
  handlers/message.ts   # Text message handler with history persistence
  middleware/           # Whitelist guard
  services/             # AI client, Prisma singleton, RAG helpers
  types/                # Bot context type augmentation
prisma/
  schema.prisma         # Conversation + knowledge base models
main.ts                 # Application entry point
Dockerfile              # Bot container definition
docker-compose.yml      # Postgres + bot services orchestration
justfile                # Task runner commands
.env.example            # Environment bootstrap
```

## Database & RAG Notes

- `ConversationThread` and `Message` tables capture the full chat transcript.
- `KnowledgeDocument` is a placeholder for future RAG enrichment. Populate it
  manually or via migrations, then extend `gatherContext`
  (`src/services/rag.ts`) to perform semantic retrieval (e.g., connect pgvector
  or an embeddings service).
- Prisma enums ensure role integrity (`USER`, `ASSISTANT`, `SYSTEM`).

## Migration Management

### Creating Migrations

When you modify `prisma/schema.prisma`, create a new migration:

```sh
# Using Docker (recommended)
just migrate-dev "add_user_preferences"

# Using local Bun
bun run prisma:migrate
```

### Applying Migrations

Deploy pending migrations to your database:

```sh
# Using Docker
just migrate

# Using local Bun
bunx prisma migrate deploy
```

### Resetting the Database

To reset the database and reapply all migrations (⚠️ destroys all data):

```sh
# Using Docker
just migrate-reset

# Using local Bun
bunx prisma migrate reset
```

### Inspecting the Database

Open Prisma Studio to view and edit your database in a visual interface:

```sh
just studio
```

Prisma Studio will be available at `http://localhost:5555`.

## Testing

Run the existing unit tests (currently covering the whitelist parser):

```sh
bun test
```

## Operational Tips

- Update the whitelist before sharing the bot token—non-whitelisted users
  receive a polite rejection.
- When changing Prisma models, rerun `bun run prisma:generate` to keep the
  generated client in sync.
- For production, rotate secrets and set `TELEGRAM_WHITELIST` and
  `OPENAI_API_KEY` via your deployment platform's secret manager.
- Use `just studio` to open Prisma Studio for database inspection.
- Use `just migrate-reset` to reset the database during development.


## Future stuff

- [ ] https://github.com/vrtmrz/obsidian-livesync - obsidian integration somehow?