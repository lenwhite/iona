import { config } from "dotenv";
import { z } from "zod";

const envSchema = z.object({
	TELEGRAM_BOT_TOKEN: z.string().min(1, "TELEGRAM_BOT_TOKEN is required"),
	OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
	OPENAI_MODEL: z.string().default("gpt-5"),
	DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
	TELEGRAM_WHITELIST: z.string().optional().default(""),
});

export interface EnvConfig {
	telegramBotToken: string;
	openAiApiKey: string;
	openAiModel: string;
	databaseUrl: string;
	whitelistedUsernames: string[];
}

let cachedConfig: EnvConfig | null = null;

export async function loadEnv(): Promise<EnvConfig> {
	if (cachedConfig) {
		return cachedConfig;
	}

	config();

	const parsed = envSchema.parse({
		TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
		OPENAI_API_KEY: process.env.OPENAI_API_KEY,
		OPENAI_MODEL: process.env.OPENAI_MODEL,
		DATABASE_URL: process.env.DATABASE_URL,
		TELEGRAM_WHITELIST: process.env.TELEGRAM_WHITELIST,
	});

	cachedConfig = {
		telegramBotToken: parsed.TELEGRAM_BOT_TOKEN,
		openAiApiKey: parsed.OPENAI_API_KEY,
		openAiModel: parsed.OPENAI_MODEL || "gpt-5",
		databaseUrl: parsed.DATABASE_URL,
		whitelistedUsernames: parseWhitelist(parsed.TELEGRAM_WHITELIST),
	};

	return cachedConfig;
}

export function parseWhitelist(raw: string | undefined): string[] {
	if (!raw) {
		return [];
	}

	return raw
		.split(",")
		.map((entry) => entry.trim().toLowerCase())
		.filter(Boolean);
}
