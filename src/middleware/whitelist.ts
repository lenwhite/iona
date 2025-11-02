import type { MiddlewareFn } from "grammy";
import type { BotContext } from "../types/bot-context.ts";

export function createWhitelistMiddleware(
  whitelist: string[],
): MiddlewareFn<BotContext> {
  const allowed = whitelist.map((item) => item.toLowerCase());

  return async (ctx, next) => {
    const username = ctx.from?.username?.toLowerCase();

    if (!allowed.length) {
      await ctx.reply("Bot is locked. No users are whitelisted yet.");
      return;
    }

    if (!username || !allowed.includes(username)) {
      await ctx.reply("You are not allowed to use this bot.");
      return;
    }

    return next();
  };
}
