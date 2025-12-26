## Schema Change: Remove chatId from ConversationThread

### Goal
Simplify the schema to support single-user conversation model. Remove Telegram-specific `chatId` field and the unique constraint that depends on it.

### Current Schema (schema.prisma:10-20)

```prisma
model ConversationThread {
  id          String    @id @default(cuid())
  chatId      String
  username    String
  displayName String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  messages    Message[]

  @@unique([chatId, username])
}
```

### Target Schema

```prisma
model ConversationThread {
  id          String    @id @default(cuid())
  username    String
  displayName String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  messages    Message[]

  @@unique([username])
}
```

### Changes Required

1. **Remove field**: `chatId` from ConversationThread model
2. **Update unique constraint**: Change from `@@unique([chatId, username])` to `@@unique([username])`
3. **Generate migration**: `bunx prisma migrate dev --name remove_chatid`
4. **Update queries**: Change all Prisma queries that use `chatId`

### Code Impact Analysis

**Files that query by chatId:**
- `src/handlers/message.ts:17` - `prisma.conversationThread.upsert({ where: { chatId_username: { chatId, username } } })`
- Any other files importing/using conversation lookups

**Migration strategy:**
- Single-user deployment: `username` becomes the unique identifier
- Conversation lookup: `prisma.conversationThread.findFirst({ where: { username } })` or use latest conversation
- For now: Simply get latest conversation or create new one (per user's instruction)

### Steps

1. Update `prisma/schema.prisma`:
   - Remove `chatId` field (line 12)
   - Change unique constraint (line 19)
2. Generate migration: `bunx prisma migrate dev --name remove_chatid`
3. Update code in `src/handlers/message.ts`:
   - Remove `chatId` extraction from context
   - Change upsert to use `username` only or latest conversation pattern
4. Test that conversation lookup works correctly

### Future Extension Note
> The right conversation will eventually be dynamically found in an extension. For now, the service will simply get the latest conversation or create one if none exists.
