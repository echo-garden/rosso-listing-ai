# rosso-listing-ai

Rosso Listing AI is a mobile-first product listing assistant for Rosso&Nero staff.

## MVP

- Product ledger
- Product creation and editing
- Local image uploads
- AI listing content generation
- Mock AI output when OPENAI_API_KEY is missing
- Editable generated content
- Copy buttons for listing text
- Settings placeholders for future R2 and Mercari Shops configuration

## Start

cp .env.example .env
docker compose up

Open http://localhost:3000.

## Basic Workflow

1. Read AGENTS.md.
2. Read docs/requirements.md.
3. Read tasks/current.md.
4. Plan the implementation.
5. Make changes.
6. Update logs/ai-worklog.md.
7. Commit changes.
