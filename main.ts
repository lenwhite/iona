import { startBot } from "./src/bot.ts";

if (import.meta.main) {
  await startBot();
}
