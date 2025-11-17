import { MessageRole } from "@prisma/client";
import type { ValidatedContext } from "../types/bot-context.ts";
import { gatherContext } from "../services/rag.ts";

const HISTORY_WINDOW = 12;

export async function handleTextMessage(ctx: ValidatedContext): Promise<void> {
	const chatId = ctx.chat.id.toString();
	const username = ctx.from.username.toLowerCase();
	const displayName = ctx.from.first_name ?? ctx.from.last_name ?? "";

	const text = ctx.message?.text?.trim();
	if (!text) {
		return;
	}

	const conversation = await ctx.prisma.conversationThread.upsert({
		where: {
			chatId_username: {
				chatId,
				username,
			},
		},
		create: {
			chatId,
			username,
			displayName,
		},
		update: {
			displayName,
		},
	});

	await ctx.prisma.message.create({
		data: {
			conversationId: conversation.id,
			role: MessageRole.USER,
			content: text,
		},
	});

	const recentMessages = await ctx.prisma.message.findMany({
		where: { conversationId: conversation.id },
		orderBy: { createdAt: "desc" },
		take: HISTORY_WINDOW,
	});

	const historyForModel = recentMessages
		.reverse()
		.slice(0, -1)
		.map((msg) => ({
			role: msg.role.toLowerCase() as "user" | "assistant" | "system",
			content: msg.content,
		}));

	const context = await gatherContext(ctx.prisma, text);

	try {
		const response = await ctx.ai.respond({
			username,
			message: text,
			history: historyForModel,
			context,
		});

		await ctx.prisma.message.create({
			data: {
				conversationId: conversation.id,
				role: MessageRole.ASSISTANT,
				content: response,
			},
		});

		await ctx.reply(response);
	} catch (error) {
		console.error("AI response error", error);
		await ctx.reply(
			"Sorry, something went wrong while talking to the AI provider.",
		);
	}
}
