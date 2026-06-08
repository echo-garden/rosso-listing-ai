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

## 2026-06-07 Fix product list blank page

- Investigated the products page blank page report.
- Confirmed /products exists and returns 200 HTML with product data.
- Replaced Next image usage for local upload thumbnails on product list and detail pages with direct img tags to avoid local image optimization delays/issues in dev.
- Rebuilt the Docker app container and verified /products, product detail, and uploaded image URLs return 200.
- Verified npm run typecheck and npm run lint.

## 2026-06-08 Image analysis autofill milestones

- Added ProductAnalysis storage for image-derived product candidates, confidence scores, brand candidates, tags, warnings, and price estimates.
- Added AI image analysis using product, tag, and detail image roles with local upload files passed as data URLs for OpenAI vision input.
- Added mock analysis fallback when OPENAI_API_KEY is missing.
- Added automatic image analysis after new product image upload, with safe autofill for empty/default product fields only.
- Added product detail analysis panel with Analyze images and Apply candidates actions.
- Added conservative price estimate fallback and lightweight brand catalog normalization.
- Updated listing generation to use saved image analysis candidates while keeping human review and authenticity warnings.
- Verified npx prisma generate, npm run typecheck, npm run lint, docker compose up -d --build app, /products 200, /products/new 200, and analyze API 303.

## 2026-06-08 Prevent duplicate product submits

- Added a pending submit button for product forms.
- Disabled the save button while the server action is running and changed the button text to show saving/analyzing progress.
- Verified npm run typecheck and npm run lint.

## 2026-06-08 Auto-generate content after image analysis

- Added a shared generated-content save helper.
- Updated product create/edit flows to run image analysis, safe autofill, and generated content creation together after image upload.
- Updated manual Analyze images to regenerate listing content after refreshing image analysis.
- Added ProductAnalysis referenceSources debug storage and displayed Debug references on the detail page.
- Verified npx prisma generate, npm run typecheck, npm run lint, docker compose up -d --build app, analyze API 303, ProductAnalysis referenceSources persistence, and generated content refresh.

## 2026-06-08 Confirmed listing for Mercari Shops

- Added ConfirmedListing storage for human-confirmed listing data.
- Added a Confirmed listing form on product detail, prefilled from Product and GeneratedContent.
- Added a server action to save confirmed title, description, price, condition, category, shipping configuration, image URLs, stock, and confirmation metadata.
- Added sourceSnapshot storage so the confirmed data can be traced back to product, analysis, generated content, and image URLs.
- Added a Mercari Shops input mapper that only uses ConfirmedListing data and requires externally accessible image URLs.
- Verified npx prisma generate, npm run typecheck, npm run lint, docker compose up -d --build app, and product detail 200.
