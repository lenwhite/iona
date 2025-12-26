import { DateTime } from "luxon";
import type { ValidatedContext } from "../types/context.ts";
import { handleUserMessage } from "../../../handlers/handleUserMessage.ts";
import { gatherContext } from "../../../services/rag.ts";

export async function handleTextMessage(ctx: ValidatedContext): Promise<void> {
	const username = ctx.from.username.toLowerCase();
	const displayName = ctx.from.first_name ?? ctx.from.last_name ?? "";

	const text = ctx.message?.text?.trim();
	if (!text) {
		return;
	}

	try {
		const result = await handleUserMessage(
			{
				timestamp: DateTime.now(),
				text,
				username,
				displayName,
			},
			{
				prisma: ctx.prisma,
				ai: ctx.ai,
				rag: {
					gatherContext: (query: string, limit?: number) =>
						gatherContext(ctx.prisma, query, limit),
				},
			},
		);

		await ctx.reply(result.reply);
	} catch (error) {
		console.error("AI response error", error);
		await ctx.reply(
			"Sorry, something went wrong while talking to the AI provider.",
		);
	}
}
