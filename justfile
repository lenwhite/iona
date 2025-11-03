up:
  docker compose up --build

bot:
  docker compose up --build telegram-bot

migrate:
  docker compose run --rm telegram-bot bunx prisma migrate deploy
