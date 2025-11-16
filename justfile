up:
  docker compose up --build

bot:
  docker compose up --build telegram-bot

migrate:
  docker compose run --rm telegram-bot bunx prisma migrate deploy

migrate-dev name:
  docker compose run --rm telegram-bot bunx prisma migrate dev --name {{name}}

migrate-reset:
  docker compose run --rm telegram-bot bunx prisma migrate reset

studio:
  docker compose run --rm -p 5555:5555 telegram-bot bunx prisma studio

lint:
  bunx biome lint .
  bunx tsc --noEmit

format:
  bunx biome format --write .
