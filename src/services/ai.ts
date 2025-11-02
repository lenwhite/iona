import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

export type AiMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export interface AiClient {
  respond: (
    params: {
      username: string;
      message: string;
      history: AiMessage[];
      context?: string;
    },
  ) => Promise<string>;
}

export function createAiClient(apiKey: string, modelId: string): AiClient {
  const openai = createOpenAI({ apiKey });

  return {
    async respond({ username, message, history, context }): Promise<string> {
      const contextInstruction = context
        ? `\nRelevant context:\n${context.trim()}`
        : "";

      const systemPrompt = [
        "You are a personal Telegram assistant for the bot owner.",
        "Be concise but helpful.",
        "Refer to the user by their Telegram username when appropriate.",
        "If the context is empty, rely on the conversation history only.",
      ].join(" ");

      const { text } = await generateText({
        model: openai(modelId),
        messages: [
          { role: "system", content: systemPrompt },
          ...history,
          {
            role: "user",
            content: `@${username}: ${message}${contextInstruction}`,
          },
        ],
      });

      return text.trim();
    },
  };
}
