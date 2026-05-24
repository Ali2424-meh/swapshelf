# Supabase Setup for SwapShelf

Follow these steps once after creating your Supabase project.

## 1. Create the project

1. Go to <https://supabase.com/dashboard>.
2. Create a new project.
3. Wait for the database and Auth services to finish provisioning.

## 2. Run the schema

1. Open **SQL Editor**.
2. Paste the full contents of `supabase/schema.sql`.
3. Click **Run**.

This creates the application tables, RLS policies, helper functions, seed categories, and the `listing-photos` storage bucket.

## 3. Configure Auth

1. Go to **Authentication > Providers**.
2. Enable **Email**.
3. Turn on **Confirm email** / **Require email confirmation**.
4. Go to **Authentication > URL Configuration**.
5. Set **Site URL** to:

```txt
http://localhost:3000
```

6. Add this redirect URL:

```txt
http://localhost:3000/auth/confirm
```

7. Go to **Authentication > Email Templates**.
8. Select **Confirm signup**.
9. Replace the confirmation link with:

```txt
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
```

## 4. Add local environment variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
```

Supabase may label the public browser-safe key as **publishable**, **anon**, or **public anon** depending on the dashboard version. Do not use the service role key in this app.

Restart the dev server after changing `.env.local`:

```bash
npm run dev
```

## 5. Create the first admin

1. Start the app.
2. Sign up normally at `/signup`.
3. Confirm the email from your inbox.
4. In Supabase **SQL Editor**, run:

```sql
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where email = 'YOUR_ADMIN_EMAIL'
);
```

5. Log in again and open `/admin`.

## 6. Storage notes

The schema creates a public bucket named `listing-photos`.

Expected settings:

- Public bucket: enabled
- Maximum file size: 10 MB
- Allowed MIME types: `image/png`, `image/jpeg`, `image/webp`, `image/gif`
- Upload paths: `{user_id}/{listing_id}/{filename}`

RLS on `storage.objects` allows authenticated users to upload, update, and delete only files under their own user ID folder.

## 7. Verification checklist

Run these locally after setup:

```bash
npm run lint
npm run build
```

Then verify:

- Logged-out users are redirected from `/dashboard` and `/admin`.
- Signup requires email confirmation.
- Normal users can create listings and upload photos.
- Normal users cannot access `/admin`.
- The promoted admin can access `/admin`, see stats, review users/listings/reports, and manage categories.
