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
