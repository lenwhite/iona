import { startBot } from "./src/apps/telegram-bot.ts";

if (import.meta.main) {
  await startBot();
}
