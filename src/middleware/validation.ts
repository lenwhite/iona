import type { MiddlewareFn } from "grammy";
import type { BotContext } from "../types/bot-context.ts";

/**
 * Authentication middleware that validates required user data and checks whitelist.
 * After this middleware runs, the context is guaranteed to have username.
 */
export function createAuthMiddleware(
	whitelist: string[],
): MiddlewareFn<BotContext> {
	const allowed = whitelist.map((item) => item.toLowerCase());

	return async (ctx, next) => {
		const chatId = ctx.chat?.id?.toString();
		const username = ctx.from?.username?.toLowerCase();

		if (!chatId || !username) {
			await ctx.reply(
				"This bot can only be used by whitelisted users with a Telegram username.",
			);
			return;
		}

		if (!allowed.length) {
			await ctx.reply("Bot is locked. No users are whitelisted yet.");
			return;
		}

		if (!allowed.includes(username)) {
			await ctx.reply("You are not allowed to use this bot.");
			return;
		}

		return next();
	};
}
