# Agent capabilities
- Single user, personal bot only (white-listed Telegram user IDs)
- Stores conversation history in a Postgres database using Prisma ORM
- Uses OpenAI's GPT-5 model for generating responses
- Personality and behavior can be customized via system prompts

# Storage / Context management
- MVP: stores full conversation history in Postgres
  - Full context retrieval for each message
  - No context window management yet (e.g., summarization, trimming)
- V1: basic RAG support
    - Conversation histories chunked by time intervals - each message is tagged with conversation id