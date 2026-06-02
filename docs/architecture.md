# architecture.md

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- PostgreSQL
- Prisma
- Cloudflare R2
- OpenAI API
- Mercari Shops GraphQL API
- Docker Compose

## Main Entities

### User

Store staff or owner.

### Product

A product registered in the app.

### ProductImage

Images uploaded for a product.

### GeneratedContent

AI-generated content for each product.

### MercariSetting

Store-level Mercari Shops API settings.

### MercariCategoryMapping

Mapping between app product types and Mercari Shops category IDs.

## Main Flow

1. Staff creates a product.
2. Staff uploads product images.
3. Staff enters simple product notes.
4. AI generates content.
5. Staff reviews and edits content.
6. Staff saves the product.
7. Staff optionally registers the product to Mercari Shops as unpublished.
8. Staff reviews and publishes manually outside the MVP.

## Mercari Shops API Notes

- Use official Mercari Shops API only.
- Product images should be provided through imageUrls.
- Image URLs must use HTTPS and be publicly accessible.
- Product should be registered as unpublished first.
- Save the returned Mercari Shops product ID in the database.
