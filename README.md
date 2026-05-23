# SwapShelf

Local item swapping — books, games, board games, and more. Trade what you have, get what you love.

## Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Lucide React** icons

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing — hero search, categories, nearby listings |
| `/browse` | Browse all listings |
| `/how-it-works` | How it works |
| `/login` | Sign in (demo → dashboard) |
| `/signup` | Create account |
| `/dashboard` | User portal — listings, offers, messages, wishlist, profile |
| `/admin` | Admin panel — analytics, users, listings, reports, categories |

## Next steps (Phase 2)

- PostgreSQL + Prisma data models
- Auth (NextAuth / Clerk) with email verification
- Image uploads for listings
- Geo search with radius
- Swap offers, messaging, trust scores
- Wishlist alerts

## Demo

Login form submits to `/dashboard`. Use the footer link on login for `/admin`.
