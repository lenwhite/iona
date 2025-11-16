import { Bot } from "grammy";
import { loadEnv } from "../config/env.ts";
import { prisma } from "../services/prisma.ts";
import { createAiClient } from "../services/ai.ts";
import type { BotContext } from "../types/bot-context.ts";
import { createWhitelistMiddleware } from "../middleware/whitelist.ts";
import { handleTextMessage } from "../handlers/message.ts";

export async function createBot(): Promise<Bot<BotContext>> {
  const env = await loadEnv();
  const aiClient = createAiClient(env.openAiApiKey, env.openAiModel);

  const bot = new Bot<BotContext>(env.telegramBotToken);

  bot.use((ctx, next) => {
    ctx.env = env;
    ctx.prisma = prisma;
    ctx.ai = aiClient;

    return next();
  });

  bot.use(createWhitelistMiddleware(env.whitelistedUsernames));

  bot.catch((err) => {
    console.error("Telegram bot error", err);
  });

  bot.command("start", async (ctx) => {
    await ctx.reply(
      "Hey there! Send me a message and I'll ask the AI for help.",
    );
  });

  bot.on("message:text", handleTextMessage);
  bot.on("message", async (ctx) => {
    await ctx.reply("I only understand text messages for now.");
  });

  return bot;
}

export async function startBot(): Promise<void> {
  const bot = await createBot();
  const env = await loadEnv();

  let stopping = false;
  const stop = async () => {
    if (stopping) {
      return;
    }
    stopping = true;
    await bot.stop();
    await prisma.$disconnect();
    console.log("Bot shut down gracefully.");
  };

  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);

  await bot.start({
    onStart: (botInfo) => {
      console.log(
        `Bot @${botInfo.username} is running. Using OpenAI model ${env.openAiModel}.`,
      );
    },
  });
}
