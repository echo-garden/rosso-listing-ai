# AI Worklog

## Initial Setup

Created project structure for rosso-listing-ai.

## 2026-06-03 Task 001 MVP

- Built the Rosso Listing AI MVP with Next.js, TypeScript, Tailwind CSS, Prisma, PostgreSQL, and Docker Compose.
- Added product ledger, create/edit/detail flows, local image upload storage, AI generation with OpenAI and mock fallback, generated content editing, copy buttons, and settings placeholders.
- Added Mercari Shops stub files only; no real API call, scraping, Selenium, Playwright, or unofficial API usage.
- Verified npm run lint, npm run typecheck, and docker compose up --build.

## 2026-06-03 Fix product image save limit

- Investigated product save failure after image upload.
- Found Next.js Server Actions rejected the request with Body exceeded 1 MB limit.
- Increased serverActions.bodySizeLimit to 20mb in next.config.mjs.
- Restarted Docker Compose and verified npm run typecheck and npm run lint.

## 2026-06-03 Fix product detail route params

- Investigated blank page after product registration.
- Found Next.js 16 dynamic params were being read synchronously, causing product detail lookup with id undefined.
- Updated product detail, edit, generate, and generated-content routes to await params.
- Added allowedDevOrigins for the current IP-based development access.
- Verified npm run typecheck, npm run lint, docker compose up -d --build, /products 200, and product detail 200.

## 2026-06-03 Fix generated content value normalization

- Investigated Generate AI content failure.
- Found OpenAI returned arrays/numbers for fields stored as strings in Prisma.
- Updated AI prompt to request string values and normalized generated values before saving.
- Verified npm run typecheck, npm run lint, docker compose up -d --build, generate API 303, product detail 200, and generated content persisted.
