import type { PrismaClient } from "@prisma/client";
import { MessageRole } from "@prisma/client";
import type { DateTime } from "luxon";
import type { AiClient } from "../services/ai.ts";

const HISTORY_WINDOW = 12;

export interface UserMessage {
	timestamp: DateTime;
	text: string;
	username: string;
	displayName: string;
}

export interface MessageDependencies {
	prisma: PrismaClient;
	ai: AiClient;
	rag: {
		gatherContext: (query: string, limit?: number) => Promise<string>;
	};
}

export interface ChatMessageResult {
	reply: string;
}

export async function handleUserMessage(
	input: UserMessage,
	deps: MessageDependencies,
): Promise<ChatMessageResult> {
	const { text, username, displayName } = input;
	const { prisma, ai, rag } = deps;

	// Find or create conversation for this user
	const conversation = await prisma.conversationThread.upsert({
		where: {
			username,
		},
		create: {
			username,
			displayName,
		},
		update: {
			displayName,
		},
	});

	// Store user message
	await prisma.message.create({
		data: {
			conversationId: conversation.id,
			role: MessageRole.USER,
			content: text,
		},
	});

	// Retrieve recent conversation history
	const recentMessages = await prisma.message.findMany({
		where: { conversationId: conversation.id },
		orderBy: { createdAt: "desc" },
		take: HISTORY_WINDOW,
	});

	// Format history for AI (exclude current message)
	const historyForModel = recentMessages
		.reverse()
		.slice(0, -1)
		.map((msg) => ({
			role: msg.role.toLowerCase() as "user" | "assistant" | "system",
			content: msg.content,
		}));

	// Gather relevant context from knowledge base
	const context = await rag.gatherContext(text);

	// Generate AI response
	const response = await ai.respond({
		username,
		message: text,
		history: historyForModel,
		context,
	});

	// Store assistant message
	await prisma.message.create({
		data: {
			conversationId: conversation.id,
			role: MessageRole.ASSISTANT,
			content: response,
		},
	});

	return { reply: response };
}
