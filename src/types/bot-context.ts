import type { Context } from "grammy";
import type { PrismaClient } from "@prisma/client";
import type { EnvConfig } from "../config/env.ts";
import type { AiClient } from "../services/ai.ts";

export interface BotContext extends Context {
	env: EnvConfig;
	prisma: PrismaClient;
	ai: AiClient;
}

export interface ValidatedContext extends BotContext {
	chat: NonNullable<BotContext["chat"]>;
	from: NonNullable<BotContext["from"]> & {
		username: string;
	};
}
