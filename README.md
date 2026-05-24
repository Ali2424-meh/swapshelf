# SwapShelf

Local item swapping: books, games, board games, tech, and more. Trade what you have, get what you love.

## Stack

- **Next.js 16** App Router
- **TypeScript**
- **Tailwind CSS v4**
- **Supabase Auth, Postgres, Storage, and RLS**
- Pure local SVG icons in `src/components/icons.tsx`

## Getting started

```bash
npm install
```

Configure Supabase first:

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL Editor.
3. Follow `SUPABASE_SETUP.md`.
4. Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
```

Then run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing with live categories, stats, and nearby listings |
| `/browse` | Search and filter active listings |
| `/how-it-works` | How it works |
| `/login` | Supabase email/password sign in |
| `/signup` | Supabase email/password signup with email confirmation |
| `/auth/confirm` | Email confirmation callback |
| `/dashboard` | Protected user portal |
| `/admin` | Protected admin panel |

## Security

- `src/proxy.ts` refreshes Supabase sessions and redirects logged-out users from protected routes.
- Server Actions call `requireUser()` or `requireAdmin()` before mutating data.
- Supabase RLS is enabled on every app table.
- Storage policies restrict listing photo uploads to each user-owned folder.
