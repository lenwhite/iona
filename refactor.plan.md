## Telegram Adapter Refactor Plan

### Goals
- Keep grammy-specific code (bot wiring, middleware, handlers) under `src/apps/telegram/`.
- Expose conversation logic via a transport-agnostic service that can be reused by HTTP or other adapters.
- Keep Prisma, AI client, and context gathering dependencies injectable so tests and future adapters can swap implementations.

### Target Folder Structure
```
src/
  apps/
    telegram/
      bot.ts              # Instantiates Bot, registers middleware + handlers.
      middleware/
        auth.ts           # grammy MiddlewareFn implementations.
      handlers/
        text-message.ts   # Thin adapters that map grammy ctx -> service calls.
  handlers/
      handleUserMessage.ts     # Transport-agnostic orchestration of chat message handling
```

### Proposed Service API (sketch)
```ts
interface UserMessage {
  timestamp: DateTime; // import type { DateTime } from "luxon";
  text: string;
}

interface MessageDependencies {
  prisma: PrismaClient;
  ai: AiClient;
  rag: { // rag service, interface tbd
    gatherContext: (query: string, limit?: number) => Promise<string>
  };
}

interface ChatMessageResult {
  reply: string;
}

async function handleChatMessage(
  input: UserMessage,
  deps: MessageDependencies,
): Promise<ChatMessageResult>;
```

### Adapter Responsibilities After Refactor
- `src/apps/telegram/bot.ts`: load env, construct dependencies, register middleware/handlers.
- `src/apps/telegram/middleware/auth.ts`: validate Telegram usernames; attach validated metadata to context.
- `src/apps/telegram/handlers/text-message.ts`: extract data from `ValidatedContext`, call `handleChatMessage`, send `ctx.reply(result.reply)`, and handle adapter-specific error messages.
- Future HTTP adapter could parse an HTTP request into `UserMessage`, call `handleChatMessage`, and respond with `result.reply`.
