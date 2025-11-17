import type { MiddlewareFn } from "grammy";
import type { BotContext } from "../types/bot-context.ts";

export function createValidationMiddleware(): MiddlewareFn<BotContext> {
  return async (ctx, next) => {
    const chatId = ctx.chat?.id?.toString();
    const username = ctx.from?.username?.toLowerCase();

    if (!chatId || !username) {
      await ctx.reply(
        "This bot can only be used by whitelisted users with a Telegram username.",
      );
      return;
    }

    return next();
  };
}
