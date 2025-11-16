import { startBot } from "./src/apps/bot.ts";

if (import.meta.main) {
  await startBot();
}
