# Iona Telegram Bot

Personal Telegram bot scaffold built with Deno + TypeScript, Grammy, Prisma, and
the AI SDK. The bot authenticates users via a hard-coded username whitelist,
streams messages to OpenAI (defaulting to `gpt-5`), and stores conversation
history in Postgres for future retrieval augmented generation (RAG) experiments.

## Features

- Deno-native runtime with Grammy Telegram bot framework.
- AI SDK integration with OpenAI (easily swappable for other providers).
- Prisma data models for chat history and a placeholder knowledge base.
- Docker Compose Postgres for local development/testing.
- Strict environment schema with `.env` bootstrap and username whitelist
  parsing.
- Minimal unit test example for env helpers.

## Prerequisites

- [Deno](https://deno.land/manual/getting_started/installation) v1.39 or newer.
- Node.js ≥18 (for Prisma CLI via `npx`).
- Docker Desktop or Docker Engine (for the bundled Postgres service).

## Getting Started

1. **Install dependencies**
   ```sh
   deno install --allow-scripts=npm:@prisma/client
   deno task prisma:generate
   ```

2. **Copy environment template**
   ```sh
   cp .env.example .env
   ```
   Update the values:
   - `TELEGRAM_BOT_TOKEN`: token from [@BotFather](https://t.me/BotFather).
   - `TELEGRAM_WHITELIST`: comma-separated Telegram usernames allowed to talk to
     the bot.
   - `OPENAI_API_KEY`: API key for OpenAI.
   - `OPENAI_MODEL`: optional override (defaults to `gpt-5`).
   - `DATABASE_URL`: connection string used by Prisma (matches
     `docker-compose.yml` by default).

3. **Start Postgres locally**
   ```sh
   docker compose up -d
   ```

4. **Apply the database schema**
   ```sh
   deno task prisma:migrate
   ```

5. **Run the bot**
   ```sh
   deno task bot
   ```
   The bot logs its username and active OpenAI model on startup. Send a message
   from a whitelisted username to see the AI reply.

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
docker-compose.yml      # Postgres dev instance
.env.example            # Environment bootstrap
```

## Database & RAG Notes

- `ConversationThread` and `Message` tables capture the full chat transcript.
- `KnowledgeDocument` is a placeholder for future RAG enrichment. Populate it
  manually or via migrations, then extend `gatherContext`
  (`src/services/rag.ts`) to perform semantic retrieval (e.g., connect pgvector
  or an embeddings service).
- Prisma enums ensure role integrity (`USER`, `ASSISTANT`, `SYSTEM`).

## Testing

Run the existing unit tests (currently covering the whitelist parser):

```sh
deno test
```

## Operational Tips

- Update the whitelist before sharing the bot token—non-whitelisted users
  receive a polite rejection.
- When changing Prisma models, rerun `deno task prisma:generate` to keep the
  generated client in sync.
- For production, rotate secrets and set `TELEGRAM_WHITELIST` and
  `OPENAI_API_KEY` via your deployment platform's secret manager.
