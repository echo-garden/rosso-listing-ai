# Setup

## Docker Compose

Run:

cp .env.example .env
docker compose up

Open http://localhost:3000.

OPENAI_API_KEY is optional. If it is missing, AI generation uses mock content and shows a mock-mode message.

## Local Node

Run:

npm install
cp .env.example .env
docker compose up db
npm run db:push
npm run dev

Images are saved to public/uploads for the MVP. Cloudflare R2 is intentionally left as a future storage provider.
