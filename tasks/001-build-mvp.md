# Task 001: Build MVP

## Goal

Build a working MVP for Rosso Listing AI.

Rosso Listing AI is a mobile-first product listing assistant for Rosso&Nero.
The app helps store staff create product listings from product photos and short notes.

The MVP should work locally/VPS with Docker Compose.

## Important

This task should create a usable MVP in one PR.

Do not aim for perfect production quality.
Prioritize a working end-to-end flow.

## Read First

Before implementation, read:

- AGENTS.md
- requirements.md
- architecture.md

Follow all rules in those files.

## MVP Flow

The user should be able to:

1. Open the app on a smartphone-sized screen.
2. Create a new product.
3. Enter product information.
4. Upload product images.
5. Save the product.
6. Generate listing content using AI.
7. Edit generated content.
8. Copy generated content.
9. See the product in a product ledger.
10. Open product detail later.

## Tech Stack

Use:

- Next.js
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- Docker Compose
- OpenAI API

Use simple UI components.
Do not spend too much time on design polish.

## Required Pages

Create the following pages:

- `/`
  - Dashboard
  - Show simple stats:
    - total products
    - generated products
    - Mercari draft products
    - sold products

- `/products`
  - Product list
  - Mobile card layout
  - Show:
    - thumbnail
    - title
    - product type
    - status
    - sale price
    - updated date

- `/products/new`
  - Product creation form
  - Fields:
    - images
    - product type
    - condition
    - brand name
    - character name
    - size
    - color
    - cost price
    - sale price
    - staff memo

- `/products/[id]`
  - Product detail
  - Show product information
  - Show images
  - Show generated content
  - Buttons:
    - edit product
    - generate AI content
    - copy generated text

- `/products/[id]/edit`
  - Product edit form

- `/settings`
  - Settings placeholder
  - Show fields for future configuration:
    - OpenAI API status
    - Cloudflare R2 settings placeholder
    - Mercari Shops API token placeholder
    - default category ID
    - default shipping configuration ID

## Database

Use Prisma.

Create these models:

### Product

Fields:

- id
- title
- productType
- condition
- brandName
- characterName
- size
- color
- costPrice
- salePrice
- staffMemo
- status
- mercariProductId
- mercariProductStatus
- createdAt
- updatedAt

### ProductImage

Fields:

- id
- productId
- url
- storageKey
- sortOrder
- createdAt

### GeneratedContent

Fields:

- id
- productId
- mercariTitle
- mercariDescription
- instagramCaption
- onlineStoreDescription
- hashtags
- priceSuggestion
- conditionText
- checkPoints
- riskWarnings
- createdAt
- updatedAt

### AppSetting

Fields:

- id
- key
- value
- createdAt
- updatedAt

## Product Status

Use these statuses:

- draft
- generated
- mercari_unopened
- mercari_opened
- listed_other
- sold
- archived

Use a TypeScript enum or const object.

## Image Upload

For this MVP, implement image upload in a simple way.

Preferred:
- Save uploaded images to local `/public/uploads`
- Save image URL in DB

Also create a storage abstraction so Cloudflare R2 can be added later.

Example:

- `lib/storage/index.ts`
- `lib/storage/local.ts`
- Future:
  - `lib/storage/r2.ts`

Do not implement full Cloudflare R2 in this task unless it is simple and does not block the MVP.

## AI Generation

Implement AI generation with OpenAI API.

Create an API route or server action that:

1. Reads product information.
2. Uses the product fields and staff memo.
3. Generates JSON output with:
   - mercariTitle
   - mercariDescription
   - instagramCaption
   - onlineStoreDescription
   - hashtags
   - priceSuggestion
   - conditionText
   - checkPoints
   - riskWarnings
4. Saves the result to GeneratedContent.
5. Updates Product status to `generated`.

If `OPENAI_API_KEY` is missing:
- Do not crash.
- Return mock generated content.
- Show a clear message that mock mode was used.

## AI Prompt Requirements

The generated content must follow Rosso&Nero brand voice:

- Appeal to people who love red fashion
- Work well for character T-shirts, used clothing, sneakers, and red fashion items
- Feel energetic but not exaggerated
- Be honest about condition
- Do not claim authenticity
- Do not make unsupported brand or character claims
- Include risk warnings when needed
- Mercari Shops text should be polite and trustworthy
- Instagram text can be more energetic
- Online store text should be clean and polished

## Copy Buttons

On the product detail page, add copy buttons for:

- Mercari title
- Mercari description
- Instagram caption
- Online store description
- Hashtags

Use client-side clipboard API.

## Mercari Shops Integration

Do not implement real Mercari Shops product registration in this task.

However, create placeholders:

- `lib/mercari-shops/client.ts`
- `lib/mercari-shops/types.ts`
- `lib/mercari-shops/create-product.ts`

The create product function should be a stub that clearly says:
"Mercari Shops API integration is not implemented yet."

Do not call the real API in this MVP task.

## Critical Restrictions

Do not do any of the following:

- Do not automate the normal Mercari app.
- Do not use Selenium.
- Do not use Playwright.
- Do not scrape Mercari.
- Do not use unofficial Mercari APIs.
- Do not auto-publish products.
- Do not register products publicly.
- Do not hard-code API keys.
- Do not store secrets in git.

## UI Requirements

Mobile-first.

Use:

- Large tap targets
- Card layout
- Bottom navigation
- Simple forms
- Clear primary buttons
- Sticky bottom actions where useful

Design should be simple but usable.

Do not spend too much time on visual perfection.

## Docker

Create Docker Compose setup with:

- app
- db

The app should start with:

```bash
docker compose up
