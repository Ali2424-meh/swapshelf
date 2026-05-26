-- SwapShelf Supabase schema
-- Run this in the Supabase SQL Editor after creating your project.

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

do $$ begin
  create type public.profile_role as enum ('user', 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.profile_status as enum ('active', 'flagged', 'banned');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.listing_status as enum ('active', 'pending', 'flagged', 'swapped', 'archived');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.listing_condition as enum ('like_new', 'good', 'fair');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.offer_status as enum ('pending', 'accepted', 'declined', 'cancelled', 'completed');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.report_status as enum ('open', 'reviewing', 'resolved', 'dismissed');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.report_target_type as enum ('listing', 'user', 'message');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.notification_type as enum ('offer', 'message', 'report', 'system');
exception when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.make_initials(display_name text)
returns text
language sql
immutable
as $$
  select upper(
    left(coalesce(nullif(split_part(trim(display_name), ' ', 1), ''), 'U'), 1) ||
    left(coalesce(nullif(split_part(trim(display_name), ' ', 2), ''), left(trim(display_name), 1), 'S'), 1)
  );
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null,
  initials text not null,
  avatar_url text,
  avatar_path text,
  role public.profile_role not null default 'user',
  status public.profile_status not null default 'active',
  city text,
  postal_code text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  search_radius_km integer not null default 10 check (search_radius_km between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.public_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  display_name text not null,
  initials text not null,
  avatar_url text,
  avatar_path text,
  trust_score numeric(3,2) not null default 5.00 check (trust_score >= 0 and trust_score <= 5),
  completed_swaps integer not null default 0 check (completed_swaps >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  emoji text not null default '📦',
  description text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists avatar_path text;
alter table public.public_profiles add column if not exists avatar_path text;

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid not null references public.categories(id),
  title text not null check (char_length(title) between 3 and 120),
  description text,
  condition public.listing_condition not null,
  wants text,
  status public.listing_status not null default 'active',
  city text,
  postal_code text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists listings_owner_idx on public.listings(owner_id);
create index if not exists listings_category_idx on public.listings(category_id);
create index if not exists listings_status_created_idx on public.listings(status, created_at desc);
create index if not exists listings_active_created_idx on public.listings(created_at desc) where status = 'active';
create index if not exists listings_search_trgm_idx
on public.listings using gin (
  (coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(wants, '')) gin_trgm_ops
)
where status = 'active';

create table if not exists public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null unique,
  public_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists listing_images_listing_idx on public.listing_images(listing_id, sort_order);

create table if not exists public.saved_listings (
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create index if not exists saved_listings_listing_idx on public.saved_listings(listing_id, created_at desc);

create table if not exists public.wishlist_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  query text not null,
  category_id uuid references public.categories(id) on delete set null,
  radius_km integer not null default 10 check (radius_km between 1 and 100),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists wishlist_alerts_user_idx on public.wishlist_alerts(user_id, active, created_at desc);

create table if not exists public.swap_offers (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  offered_listing_id uuid references public.listings(id) on delete set null,
  message text,
  status public.offer_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (sender_id <> receiver_id)
);

create index if not exists swap_offers_sender_idx on public.swap_offers(sender_id, created_at desc);
create index if not exists swap_offers_receiver_idx on public.swap_offers(receiver_id, created_at desc);
create index if not exists swap_offers_listing_status_idx on public.swap_offers(listing_id, status, created_at desc);
create index if not exists swap_offers_offered_listing_idx on public.swap_offers(offered_listing_id) where offered_listing_id is not null;

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid unique references public.swap_offers(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create index if not exists conversation_participants_user_idx on public.conversation_participants(user_id, conversation_id);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_idx on public.messages(conversation_id, created_at desc);

create table if not exists public.swap_reviews (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.swap_offers(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  reviewee_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (offer_id, reviewer_id),
  check (reviewer_id <> reviewee_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type public.notification_type not null default 'system',
  title text not null,
  body text,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on public.notifications(user_id, read_at, created_at desc);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type public.report_target_type not null,
  target_listing_id uuid references public.listings(id) on delete set null,
  target_user_id uuid references public.profiles(id) on delete set null,
  target_message_id uuid references public.messages(id) on delete set null,
  reason text not null,
  details text,
  status public.report_status not null default 'open',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reports_status_created_idx on public.reports(status, created_at desc);

create index if not exists reports_status_idx on public.reports(status, created_at desc);

create or replace function public.current_user_role()
returns public.profile_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.current_user_status()
returns public.profile_status
language sql
stable
security definer
set search_path = public
as $$
  select status from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'admin', false);
$$;

create or replace function public.is_conversation_participant(conversation uuid, participant uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.conversation_participants cp
    where cp.conversation_id = conversation
      and cp.user_id = participant
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  display_name text;
begin
  display_name := coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1), 'New swapper');

  insert into public.profiles (id, email, display_name, initials, city, postal_code)
  values (
    new.id,
    new.email,
    display_name,
    public.make_initials(display_name),
    nullif(new.raw_user_meta_data ->> 'city', ''),
    nullif(new.raw_user_meta_data ->> 'postal_code', '')
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = excluded.display_name,
    initials = excluded.initials,
    updated_at = now();

  insert into public.public_profiles (id, display_name, initials, avatar_url, avatar_path)
  values (new.id, display_name, public.make_initials(display_name), null, null)
  on conflict (id) do update set
    display_name = excluded.display_name,
    initials = excluded.initials,
    avatar_path = excluded.avatar_path,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.sync_public_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.public_profiles (id, display_name, initials, avatar_url, avatar_path, updated_at)
  values (new.id, new.display_name, new.initials, new.avatar_url, new.avatar_path, now())
  on conflict (id) do update set
    display_name = excluded.display_name,
    initials = excluded.initials,
    avatar_url = excluded.avatar_url,
    avatar_path = excluded.avatar_path,
    updated_at = now();

  return new;
end;
$$;

create or replace function public.set_profile_initials()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.initials := public.make_initials(new.display_name);
  return new;
end;
$$;

drop trigger if exists set_profile_initials_on_profile_write on public.profiles;
create trigger set_profile_initials_on_profile_write
  before insert or update on public.profiles
  for each row execute function public.set_profile_initials();

drop trigger if exists sync_public_profile_on_profile_write on public.profiles;
create trigger sync_public_profile_on_profile_write
  after insert or update on public.profiles
  for each row execute function public.sync_public_profile();

create or replace function public.recalculate_public_profile_stats(profile_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.public_profiles pp
  set
    completed_swaps = (
      select count(*)::integer
      from public.swap_offers so
      where so.status = 'completed'
        and (so.sender_id = profile_id or so.receiver_id = profile_id)
    ),
    trust_score = coalesce((
      select round(avg(sr.rating)::numeric, 2)
      from public.swap_reviews sr
      where sr.reviewee_id = profile_id
    ), 5.00),
    updated_at = now()
  where pp.id = profile_id;
end;
$$;

create or replace function public.refresh_review_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.recalculate_public_profile_stats(coalesce(new.reviewee_id, old.reviewee_id));
  return coalesce(new, old);
end;
$$;

create or replace function public.refresh_offer_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.recalculate_public_profile_stats(coalesce(new.sender_id, old.sender_id));
  perform public.recalculate_public_profile_stats(coalesce(new.receiver_id, old.receiver_id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists refresh_review_stats_on_write on public.swap_reviews;
create trigger refresh_review_stats_on_write
  after insert or update or delete on public.swap_reviews
  for each row execute function public.refresh_review_stats();

drop trigger if exists refresh_offer_stats_on_write on public.swap_offers;
create trigger refresh_offer_stats_on_write
  after insert or update of status or delete on public.swap_offers
  for each row execute function public.refresh_offer_stats();

do $$ declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles',
    'public_profiles',
    'categories',
    'listings',
    'wishlist_alerts',
    'swap_offers',
    'conversations',
    'reports'
  ] loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', table_name, table_name);
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name);
  end loop;
end $$;

-- Drop first because Postgres cannot change OUT parameter return types with create or replace.
drop function if exists public.search_listings(text, text, numeric, numeric, numeric, text);

create or replace function public.search_listings(
  p_search text default null,
  p_category_slug text default null,
  p_radius_km numeric default null,
  p_origin_lat numeric default null,
  p_origin_lng numeric default null,
  p_sort text default 'newest'
)
returns table (
  id uuid,
  title text,
  description text,
  wants text,
  condition text,
  status text,
  city text,
  postal_code text,
  distance_km numeric,
  created_at timestamptz,
  category_name text,
  category_slug text,
  category_emoji text,
  owner_id uuid,
  owner_name text,
  owner_initials text,
  owner_avatar_url text,
  owner_trust_score numeric,
  image_url text
)
language sql
stable
as $$
  with ranked_images as (
    select distinct on (li.listing_id)
      li.listing_id,
      li.public_url
    from public.listing_images li
    order by li.listing_id, li.sort_order asc, li.created_at asc
  ),
  listing_rows as (
    select
      l.*,
      c.name as category_name,
      c.slug as category_slug,
      c.emoji as category_emoji,
      pp.display_name as owner_name,
      pp.initials as owner_initials,
      pp.avatar_url as owner_avatar_url,
      pp.trust_score as owner_trust_score,
      ri.public_url as image_url,
      case
        when p_origin_lat is not null and p_origin_lng is not null and l.latitude is not null and l.longitude is not null then
          6371 * acos(
            least(
              1,
              greatest(
                -1,
                cos(radians(p_origin_lat::double precision)) *
                cos(radians(l.latitude::double precision)) *
                cos(radians(l.longitude::double precision) - radians(p_origin_lng::double precision)) +
                sin(radians(p_origin_lat::double precision)) *
                sin(radians(l.latitude::double precision))
              )
            )
          )
        else null
      end as distance_value
    from public.listings l
    join public.categories c on c.id = l.category_id
    join public.public_profiles pp on pp.id = l.owner_id
    left join ranked_images ri on ri.listing_id = l.id
    where l.status = 'active'
      and c.active = true
      and (p_category_slug is null or c.slug = p_category_slug)
      and (
        p_search is null
        or l.title ilike '%' || p_search || '%'
        or coalesce(l.description, '') ilike '%' || p_search || '%'
        or coalesce(l.wants, '') ilike '%' || p_search || '%'
      )
  )
  select
    lr.id,
    lr.title,
    lr.description,
    lr.wants,
    lr.condition::text,
    lr.status::text,
    lr.city,
    lr.postal_code,
    round(lr.distance_value::numeric, 1) as distance_km,
    lr.created_at,
    lr.category_name,
    lr.category_slug,
    lr.category_emoji,
    lr.owner_id,
    lr.owner_name,
    lr.owner_initials,
    lr.owner_avatar_url,
    lr.owner_trust_score,
    lr.image_url
  from listing_rows lr
  where p_radius_km is null or lr.distance_value is null or lr.distance_value <= p_radius_km
  order by
    case when p_sort = 'closest' then lr.distance_value end asc nulls last,
    case when p_sort = 'highest-rated' then lr.owner_trust_score end desc nulls last,
    lr.created_at desc;
$$;

create or replace function public.platform_public_stats()
returns table (
  active_listings bigint,
  community_members bigint,
  completed_swaps bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    (select count(*) from public.listings where status = 'active') as active_listings,
    (select count(*) from public.public_profiles) as community_members,
    (select count(*) from public.swap_offers where status = 'completed') as completed_swaps;
$$;

insert into public.categories (name, slug, emoji, sort_order)
values
  ('Books', 'books', '📚', 10),
  ('Video Games', 'video-games', '🎮', 20),
  ('Board Games', 'board-games', '🧩', 30),
  ('Toys', 'toys', '🧸', 40),
  ('Music & DVDs', 'music-dvds', '💿', 50),
  ('Tech', 'tech', '💻', 60),
  ('Craft & Hobby', 'craft-hobby', '✂️', 70)
on conflict (slug) do update set
  name = excluded.name,
  emoji = excluded.emoji,
  sort_order = excluded.sort_order,
  active = true,
  updated_at = now();

alter table public.profiles enable row level security;
alter table public.public_profiles enable row level security;
alter table public.categories enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.saved_listings enable row level security;
alter table public.wishlist_alerts enable row level security;
alter table public.swap_offers enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.swap_reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;

drop policy if exists "Profiles are readable by owner or admin" on public.profiles;
create policy "Profiles are readable by owner or admin"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "Users can update safe profile fields" on public.profiles;
create policy "Users can update safe profile fields"
on public.profiles for update
to authenticated
using (id = auth.uid() and status <> 'banned')
with check (
  id = auth.uid()
  and role = public.current_user_role()
  and status = public.current_user_status()
);

drop policy if exists "Admins can manage profiles" on public.profiles;
create policy "Admins can manage profiles"
on public.profiles for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public profiles are public" on public.public_profiles;
create policy "Public profiles are public"
on public.public_profiles for select
to anon, authenticated
using (true);

drop policy if exists "Admins manage public profiles" on public.public_profiles;
create policy "Admins manage public profiles"
on public.public_profiles for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Active categories are public" on public.categories;
create policy "Active categories are public"
on public.categories for select
to anon, authenticated
using (active = true or public.is_admin());

drop policy if exists "Admins manage categories" on public.categories;
create policy "Admins manage categories"
on public.categories for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Active listings are public" on public.listings;
create policy "Active listings are public"
on public.listings for select
to anon, authenticated
using (status = 'active' or owner_id = auth.uid() or public.is_admin());

drop policy if exists "Users create own listings" on public.listings;
create policy "Users create own listings"
on public.listings for insert
to authenticated
with check (owner_id = auth.uid() and public.current_user_status() = 'active');

drop policy if exists "Users update own listings" on public.listings;
create policy "Users update own listings"
on public.listings for update
to authenticated
using (owner_id = auth.uid() and public.current_user_status() = 'active')
with check (owner_id = auth.uid());

drop policy if exists "Users delete own listings" on public.listings;
create policy "Users delete own listings"
on public.listings for delete
to authenticated
using (owner_id = auth.uid() or public.is_admin());

drop policy if exists "Admins manage listings" on public.listings;
create policy "Admins manage listings"
on public.listings for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Listing images follow listing visibility" on public.listing_images;
create policy "Listing images follow listing visibility"
on public.listing_images for select
to anon, authenticated
using (
  exists (
    select 1 from public.listings l
    where l.id = listing_id
      and (l.status = 'active' or l.owner_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists "Users manage own listing images" on public.listing_images;
create policy "Users manage own listing images"
on public.listing_images for all
to authenticated
using (owner_id = auth.uid() or public.is_admin())
with check (
  public.is_admin()
  or (
    owner_id = auth.uid()
    and exists (
      select 1 from public.listings l
      where l.id = listing_id
        and l.owner_id = auth.uid()
    )
  )
);

drop policy if exists "Users manage saved listings" on public.saved_listings;
create policy "Users manage saved listings"
on public.saved_listings for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users manage wishlist alerts" on public.wishlist_alerts;
create policy "Users manage wishlist alerts"
on public.wishlist_alerts for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Offer participants can read offers" on public.swap_offers;
create policy "Offer participants can read offers"
on public.swap_offers for select
to authenticated
using (sender_id = auth.uid() or receiver_id = auth.uid() or public.is_admin());

drop policy if exists "Users create outgoing offers" on public.swap_offers;
create policy "Users create outgoing offers"
on public.swap_offers for insert
to authenticated
with check (
  sender_id = auth.uid()
  and public.current_user_status() = 'active'
  and receiver_id = (select owner_id from public.listings where id = listing_id)
  and exists (select 1 from public.listings where id = listing_id and status = 'active')
  and offered_listing_id is not null
  and exists (
    select 1 from public.listings own_listing
    where own_listing.id = offered_listing_id
      and own_listing.owner_id = auth.uid()
      and own_listing.status = 'active'
      and own_listing.id <> listing_id
  )
);

drop policy if exists "Offer participants can update offers" on public.swap_offers;
create policy "Offer participants can update offers"
on public.swap_offers for update
to authenticated
using (sender_id = auth.uid() or receiver_id = auth.uid() or public.is_admin())
with check (sender_id = auth.uid() or receiver_id = auth.uid() or public.is_admin());

drop policy if exists "Conversation participants can read conversations" on public.conversations;
create policy "Conversation participants can read conversations"
on public.conversations for select
to authenticated
using (
  public.is_admin()
  or public.is_conversation_participant(id, auth.uid())
);

drop policy if exists "Offer participants can create conversations" on public.conversations;
create policy "Offer participants can create conversations"
on public.conversations for insert
to authenticated
with check (
  offer_id is null
  or exists (
    select 1 from public.swap_offers so
    where so.id = offer_id
      and (so.sender_id = auth.uid() or so.receiver_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists "Offer participants can update conversations" on public.conversations;
create policy "Offer participants can update conversations"
on public.conversations for update
to authenticated
using (
  public.is_admin()
  or exists (
    select 1 from public.swap_offers so
    where so.id = offer_id
      and (so.sender_id = auth.uid() or so.receiver_id = auth.uid())
  )
)
with check (
  public.is_admin()
  or exists (
    select 1 from public.swap_offers so
    where so.id = offer_id
      and (so.sender_id = auth.uid() or so.receiver_id = auth.uid())
  )
);

drop policy if exists "Conversation participants visible to participants" on public.conversation_participants;
create policy "Conversation participants visible to participants"
on public.conversation_participants for select
to authenticated
using (
  public.is_admin()
  or public.is_conversation_participant(conversation_id, auth.uid())
);

drop policy if exists "Users can join conversations for themselves" on public.conversation_participants;
create policy "Users can join conversations for themselves"
on public.conversation_participants for insert
to authenticated
with check (
  public.is_admin()
  or user_id = auth.uid()
  or exists (
    select 1
    from public.conversations c
    join public.swap_offers so on so.id = c.offer_id
    where c.id = conversation_id
      and (so.sender_id = auth.uid() or so.receiver_id = auth.uid())
      and (user_id = so.sender_id or user_id = so.receiver_id)
  )
);

drop policy if exists "Participants can read messages" on public.messages;
create policy "Participants can read messages"
on public.messages for select
to authenticated
using (
  public.is_admin()
  or public.is_conversation_participant(conversation_id, auth.uid())
);

drop policy if exists "Participants can send messages" on public.messages;
create policy "Participants can send messages"
on public.messages for insert
to authenticated
with check (
  sender_id = auth.uid()
  and public.is_conversation_participant(conversation_id, auth.uid())
);

drop policy if exists "Swap participants can read reviews" on public.swap_reviews;
create policy "Swap participants can read reviews"
on public.swap_reviews for select
to authenticated
using (reviewer_id = auth.uid() or reviewee_id = auth.uid() or public.is_admin());

drop policy if exists "Completed swap participants can review" on public.swap_reviews;
create policy "Completed swap participants can review"
on public.swap_reviews for insert
to authenticated
with check (
  reviewer_id = auth.uid()
  and exists (
    select 1 from public.swap_offers so
    where so.id = offer_id
      and so.status = 'completed'
      and (so.sender_id = auth.uid() or so.receiver_id = auth.uid())
      and (so.sender_id = reviewee_id or so.receiver_id = reviewee_id)
  )
);

drop policy if exists "Users manage own notifications" on public.notifications;
create policy "Users manage own notifications"
on public.notifications for all
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "Users can create reports" on public.reports;
create policy "Users can create reports"
on public.reports for insert
to authenticated
with check (reporter_id = auth.uid());

drop policy if exists "Users read own reports or admins read all" on public.reports;
create policy "Users read own reports or admins read all"
on public.reports for select
to authenticated
using (reporter_id = auth.uid() or public.is_admin());

drop policy if exists "Admins update reports" on public.reports;
create policy "Admins update reports"
on public.reports for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-photos',
  'listing-photos',
  true,
  10485760,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Listing photos are publicly readable" on storage.objects;
create policy "Listing photos are publicly readable"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'listing-photos');

drop policy if exists "Avatars are publicly readable" on storage.objects;
create policy "Avatars are publicly readable"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'avatars');

drop policy if exists "Users upload own listing photos" on storage.objects;
create policy "Users upload own listing photos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'listing-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users upload own avatars" on storage.objects;
create policy "Users upload own avatars"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users update own listing photos" on storage.objects;
create policy "Users update own listing photos"
on storage.objects for update
to authenticated
using (
  bucket_id = 'listing-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'listing-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users update own avatars" on storage.objects;
create policy "Users update own avatars"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users delete own listing photos" on storage.objects;
create policy "Users delete own listing photos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'listing-photos'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
);

drop policy if exists "Users delete own avatars" on storage.objects;
create policy "Users delete own avatars"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
);

-- V1 polish additions: Philippine area hierarchy, real review counts, offer photos, and chat metadata.
alter table public.profiles add column if not exists review_count integer not null default 0 check (review_count >= 0);
alter table public.public_profiles add column if not exists review_count integer not null default 0 check (review_count >= 0);

alter table public.profiles add column if not exists region_code text;
alter table public.profiles add column if not exists region_name text;
alter table public.profiles add column if not exists province_code text;
alter table public.profiles add column if not exists province_name text;
alter table public.profiles add column if not exists city_code text;
alter table public.profiles add column if not exists city_name text;
alter table public.profiles add column if not exists barangay_code text;
alter table public.profiles add column if not exists barangay_name text;
alter table public.profiles add column if not exists location_label text;

alter table public.listings add column if not exists region_code text;
alter table public.listings add column if not exists region_name text;
alter table public.listings add column if not exists province_code text;
alter table public.listings add column if not exists province_name text;
alter table public.listings add column if not exists city_code text;
alter table public.listings add column if not exists city_name text;
alter table public.listings add column if not exists barangay_code text;
alter table public.listings add column if not exists barangay_name text;
alter table public.listings add column if not exists location_label text;

alter table public.swap_offers add column if not exists offer_details text;
alter table public.swap_offers add column if not exists meetup_note text;
alter table public.conversations add column if not exists last_message_at timestamptz;
alter table public.conversation_participants add column if not exists last_read_at timestamptz;

create index if not exists profiles_area_idx on public.profiles(region_code, province_code, city_code, barangay_code);
create index if not exists listings_area_active_idx on public.listings(region_code, province_code, city_code, barangay_code, created_at desc)
where status = 'active';
create index if not exists conversations_last_message_idx on public.conversations(last_message_at desc nulls last);
create index if not exists conversation_participants_unread_idx on public.conversation_participants(user_id, last_read_at);

create table if not exists public.swap_offer_images (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.swap_offers(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null unique,
  public_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists swap_offer_images_offer_idx on public.swap_offer_images(offer_id, sort_order);
alter table public.swap_offer_images enable row level security;

create or replace function public.join_location_label(
  p_barangay text,
  p_city text,
  p_province text,
  p_region text
)
returns text
language sql
immutable
as $$
  select nullif(array_to_string(array_remove(array[p_barangay, p_city, p_province, p_region], null), ', '), '');
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  display_name text;
  profile_location_label text;
begin
  display_name := coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1), 'New swapper');
  profile_location_label := public.join_location_label(
    nullif(new.raw_user_meta_data ->> 'barangay_name', ''),
    nullif(new.raw_user_meta_data ->> 'city_name', ''),
    nullif(new.raw_user_meta_data ->> 'province_name', ''),
    nullif(new.raw_user_meta_data ->> 'region_name', '')
  );

  insert into public.profiles (
    id,
    email,
    display_name,
    initials,
    city,
    postal_code,
    region_code,
    region_name,
    province_code,
    province_name,
    city_code,
    city_name,
    barangay_code,
    barangay_name,
    location_label
  )
  values (
    new.id,
    new.email,
    display_name,
    public.make_initials(display_name),
    nullif(new.raw_user_meta_data ->> 'city_name', ''),
    nullif(new.raw_user_meta_data ->> 'postal_code', ''),
    nullif(new.raw_user_meta_data ->> 'region_code', ''),
    nullif(new.raw_user_meta_data ->> 'region_name', ''),
    nullif(new.raw_user_meta_data ->> 'province_code', ''),
    nullif(new.raw_user_meta_data ->> 'province_name', ''),
    nullif(new.raw_user_meta_data ->> 'city_code', ''),
    nullif(new.raw_user_meta_data ->> 'city_name', ''),
    nullif(new.raw_user_meta_data ->> 'barangay_code', ''),
    nullif(new.raw_user_meta_data ->> 'barangay_name', ''),
    profile_location_label
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = excluded.display_name,
    initials = excluded.initials,
    city = coalesce(excluded.city, public.profiles.city),
    region_code = coalesce(excluded.region_code, public.profiles.region_code),
    region_name = coalesce(excluded.region_name, public.profiles.region_name),
    province_code = coalesce(excluded.province_code, public.profiles.province_code),
    province_name = coalesce(excluded.province_name, public.profiles.province_name),
    city_code = coalesce(excluded.city_code, public.profiles.city_code),
    city_name = coalesce(excluded.city_name, public.profiles.city_name),
    barangay_code = coalesce(excluded.barangay_code, public.profiles.barangay_code),
    barangay_name = coalesce(excluded.barangay_name, public.profiles.barangay_name),
    location_label = coalesce(excluded.location_label, public.profiles.location_label),
    updated_at = now();

  insert into public.public_profiles (id, display_name, initials, avatar_url, avatar_path, review_count)
  values (new.id, display_name, public.make_initials(display_name), null, null, 0)
  on conflict (id) do update set
    display_name = excluded.display_name,
    initials = excluded.initials,
    updated_at = now();

  return new;
end;
$$;

create or replace function public.sync_public_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.public_profiles (id, display_name, initials, avatar_url, avatar_path, review_count, updated_at)
  values (new.id, new.display_name, new.initials, new.avatar_url, new.avatar_path, coalesce(new.review_count, 0), now())
  on conflict (id) do update set
    display_name = excluded.display_name,
    initials = excluded.initials,
    avatar_url = excluded.avatar_url,
    avatar_path = excluded.avatar_path,
    review_count = excluded.review_count,
    updated_at = now();

  return new;
end;
$$;

create or replace function public.recalculate_public_profile_stats(profile_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  reviews integer;
  score numeric(3,2);
  swaps integer;
begin
  select count(*)::integer, coalesce(round(avg(sr.rating)::numeric, 2), 5.00)
    into reviews, score
  from public.swap_reviews sr
  where sr.reviewee_id = profile_id;

  select count(*)::integer
    into swaps
  from public.swap_offers so
  where so.status = 'completed'
    and (so.sender_id = profile_id or so.receiver_id = profile_id);

  update public.public_profiles pp
  set completed_swaps = swaps,
      trust_score = score,
      review_count = reviews,
      updated_at = now()
  where pp.id = profile_id;

  update public.profiles p
  set review_count = reviews,
      updated_at = now()
  where p.id = profile_id;
end;
$$;

create or replace function public.touch_conversation_last_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
  set last_message_at = new.created_at,
      updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists touch_conversation_last_message_on_message on public.messages;
create trigger touch_conversation_last_message_on_message
  after insert on public.messages
  for each row execute function public.touch_conversation_last_message();

-- Replace the old distance-first RPC with area-first search.
drop function if exists public.search_listings(text, text, numeric, numeric, numeric, text);
drop function if exists public.search_listings(text, text, text, text, text, text, text, text);

create or replace function public.search_listings(
  p_search text default null,
  p_category_slug text default null,
  p_area_scope text default 'all',
  p_region_code text default null,
  p_province_code text default null,
  p_city_code text default null,
  p_barangay_code text default null,
  p_sort text default 'area'
)
returns table (
  id uuid,
  title text,
  description text,
  wants text,
  condition text,
  status text,
  city text,
  postal_code text,
  region_code text,
  region_name text,
  province_code text,
  province_name text,
  city_code text,
  city_name text,
  barangay_code text,
  barangay_name text,
  location_label text,
  area_rank integer,
  distance_km numeric,
  created_at timestamptz,
  category_name text,
  category_slug text,
  category_emoji text,
  owner_id uuid,
  owner_name text,
  owner_initials text,
  owner_avatar_url text,
  owner_trust_score numeric,
  owner_review_count integer,
  image_url text
)
language sql
stable
as $$
  with ranked_images as (
    select distinct on (li.listing_id)
      li.listing_id,
      li.public_url
    from public.listing_images li
    order by li.listing_id, li.sort_order asc, li.created_at asc
  ),
  listing_rows as (
    select
      l.*,
      c.name as category_name,
      c.slug as category_slug,
      c.emoji as category_emoji,
      pp.display_name as owner_name,
      pp.initials as owner_initials,
      pp.avatar_url as owner_avatar_url,
      pp.trust_score as owner_trust_score,
      pp.review_count as owner_review_count,
      ri.public_url as image_url,
      case
        when p_barangay_code is not null and l.barangay_code = p_barangay_code then 0
        when p_city_code is not null and l.city_code = p_city_code then 1
        when p_province_code is not null and l.province_code = p_province_code then 2
        when p_region_code is not null and l.region_code = p_region_code then 3
        else 4
      end as area_rank_value
    from public.listings l
    join public.categories c on c.id = l.category_id
    join public.public_profiles pp on pp.id = l.owner_id
    left join ranked_images ri on ri.listing_id = l.id
    where l.status = 'active'
      and c.active = true
      and (p_category_slug is null or c.slug = p_category_slug)
      and (
        p_search is null
        or l.title ilike '%' || p_search || '%'
        or coalesce(l.description, '') ilike '%' || p_search || '%'
        or coalesce(l.wants, '') ilike '%' || p_search || '%'
      )
      and (
        p_area_scope = 'all'
        or (p_area_scope = 'barangay' and p_barangay_code is not null and l.barangay_code = p_barangay_code)
        or (p_area_scope = 'city' and p_city_code is not null and l.city_code = p_city_code)
        or (p_area_scope = 'province' and p_province_code is not null and l.province_code = p_province_code)
      )
  )
  select
    lr.id,
    lr.title,
    lr.description,
    lr.wants,
    lr.condition::text,
    lr.status::text,
    lr.city,
    lr.postal_code,
    lr.region_code,
    lr.region_name,
    lr.province_code,
    lr.province_name,
    lr.city_code,
    lr.city_name,
    lr.barangay_code,
    lr.barangay_name,
    coalesce(lr.location_label, public.join_location_label(lr.barangay_name, lr.city_name, lr.province_name, lr.region_name)),
    lr.area_rank_value,
    null::numeric as distance_km,
    lr.created_at,
    lr.category_name,
    lr.category_slug,
    lr.category_emoji,
    lr.owner_id,
    lr.owner_name,
    lr.owner_initials,
    lr.owner_avatar_url,
    lr.owner_trust_score,
    lr.owner_review_count,
    lr.image_url
  from listing_rows lr
  order by
    case when p_sort = 'area' then lr.area_rank_value end asc,
    case when p_sort = 'highest-rated' then lr.owner_trust_score end desc nulls last,
    lr.created_at desc;
$$;

drop policy if exists "Offer participants can read offer images" on public.swap_offer_images;
create policy "Offer participants can read offer images"
on public.swap_offer_images for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.swap_offers so
    where so.id = offer_id
      and (so.sender_id = auth.uid() or so.receiver_id = auth.uid())
  )
);

drop policy if exists "Users manage own offer images" on public.swap_offer_images;
create policy "Users manage own offer images"
on public.swap_offer_images for all
to authenticated
using (owner_id = auth.uid() or public.is_admin())
with check (
  public.is_admin()
  or (
    owner_id = auth.uid()
    and exists (
      select 1 from public.swap_offers so
      where so.id = offer_id
        and so.sender_id = auth.uid()
    )
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'offer-photos',
  'offer-photos',
  true,
  10485760,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Offer photos are readable by authenticated users" on storage.objects;
create policy "Offer photos are readable by authenticated users"
on storage.objects for select
to authenticated
using (bucket_id = 'offer-photos');

drop policy if exists "Users upload own offer photos" on storage.objects;
create policy "Users upload own offer photos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'offer-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users update own offer photos" on storage.objects;
create policy "Users update own offer photos"
on storage.objects for update
to authenticated
using (
  bucket_id = 'offer-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'offer-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users delete own offer photos" on storage.objects;
create policy "Users delete own offer photos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'offer-photos'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
);

-- Blocker fix pass: atomic offer transitions, safer conversation visibility, and realtime messages.
create or replace function public.transition_swap_offer(
  p_offer_id uuid,
  p_next_status public.offer_status
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  offer_row public.swap_offers%rowtype;
  listing_ids uuid[];
  active_listing_count integer;
  conversation_id uuid;
  actor_is_admin boolean := coalesce(public.is_admin(), false);
begin
  if actor_id is null then
    raise exception 'Authentication required.';
  end if;

  if not actor_is_admin and coalesce(public.current_user_status(), 'banned'::public.profile_status) <> 'active' then
    raise exception 'Your account cannot update offers.';
  end if;

  select *
    into offer_row
  from public.swap_offers
  where id = p_offer_id
  for update;

  if not found then
    raise exception 'Offer not found.';
  end if;

  if p_next_status = 'accepted' then
    if not actor_is_admin and offer_row.receiver_id <> actor_id then
      raise exception 'Only the receiver can accept this offer.';
    end if;

    if offer_row.status <> 'pending' then
      raise exception 'Only pending offers can be accepted.';
    end if;

    if offer_row.offered_listing_id is null then
      raise exception 'This offer has no offered listing.';
    end if;

    listing_ids := array_remove(array[offer_row.listing_id, offer_row.offered_listing_id], null);

    perform 1
    from public.listings
    where id = any(listing_ids)
    for update;

    select count(*)::integer
      into active_listing_count
    from public.listings
    where id = any(listing_ids)
      and status = 'active';

    if active_listing_count <> array_length(listing_ids, 1) then
      raise exception 'One of these listings is no longer available.';
    end if;

    update public.swap_offers
    set status = 'accepted',
        updated_at = now()
    where id = offer_row.id;

    update public.listings
    set status = 'pending',
        updated_at = now()
    where id = any(listing_ids);

    update public.swap_offers
    set status = 'declined',
        updated_at = now()
    where id <> offer_row.id
      and status = 'pending'
      and (
        listing_id = any(listing_ids)
        or offered_listing_id = any(listing_ids)
      );

    insert into public.conversations (offer_id)
    values (offer_row.id)
    on conflict (offer_id) do update set updated_at = now()
    returning id into conversation_id;

    insert into public.conversation_participants (conversation_id, user_id)
    values
      (conversation_id, offer_row.receiver_id),
      (conversation_id, offer_row.sender_id)
    on conflict (conversation_id, user_id) do nothing;

    return conversation_id;
  elsif p_next_status = 'declined' then
    if not actor_is_admin and offer_row.receiver_id <> actor_id then
      raise exception 'Only the receiver can decline this offer.';
    end if;

    if offer_row.status <> 'pending' then
      raise exception 'Only pending offers can be declined.';
    end if;

    update public.swap_offers
    set status = 'declined',
        updated_at = now()
    where id = offer_row.id;

    return null;
  elsif p_next_status = 'cancelled' then
    if not actor_is_admin and offer_row.sender_id <> actor_id then
      raise exception 'Only the sender can cancel this offer.';
    end if;

    if offer_row.status <> 'pending' then
      raise exception 'Only pending offers can be cancelled.';
    end if;

    update public.swap_offers
    set status = 'cancelled',
        updated_at = now()
    where id = offer_row.id;

    return null;
  elsif p_next_status = 'completed' then
    if not actor_is_admin and offer_row.receiver_id <> actor_id then
      raise exception 'Only the receiver can complete this swap.';
    end if;

    if offer_row.status <> 'accepted' then
      raise exception 'Only accepted offers can be completed.';
    end if;

    listing_ids := array_remove(array[offer_row.listing_id, offer_row.offered_listing_id], null);

    perform 1
    from public.listings
    where id = any(listing_ids)
    for update;

    update public.swap_offers
    set status = 'completed',
        updated_at = now()
    where id = offer_row.id;

    update public.listings
    set status = 'swapped',
        updated_at = now()
    where id = any(listing_ids);

    update public.swap_offers
    set status = 'declined',
        updated_at = now()
    where id <> offer_row.id
      and status = 'pending'
      and (
        listing_id = any(listing_ids)
        or offered_listing_id = any(listing_ids)
      );

    select id
      into conversation_id
    from public.conversations
    where offer_id = offer_row.id;

    return conversation_id;
  end if;

  raise exception 'Unsupported offer status transition.';
end;
$$;

grant execute on function public.transition_swap_offer(uuid, public.offer_status) to authenticated;

drop policy if exists "Offer participants can update offers" on public.swap_offers;
drop policy if exists "Admins can update offers" on public.swap_offers;
create policy "Admins can update offers"
on public.swap_offers for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Conversation participants can read conversations" on public.conversations;
create policy "Conversation participants can read conversations"
on public.conversations for select
to authenticated
using (
  public.is_admin()
  or public.is_conversation_participant(id, auth.uid())
  or exists (
    select 1
    from public.swap_offers so
    where so.id = offer_id
      and (so.sender_id = auth.uid() or so.receiver_id = auth.uid())
  )
);

drop policy if exists "Users update own conversation read state" on public.conversation_participants;
create policy "Users update own conversation read state"
on public.conversation_participants for update
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

insert into public.conversations (offer_id)
select so.id
from public.swap_offers so
left join public.conversations c on c.offer_id = so.id
where so.status in ('accepted', 'completed')
  and c.id is null
on conflict (offer_id) do nothing;

with participant_rows as (
  select c.id as conversation_id, so.sender_id as user_id
  from public.conversations c
  join public.swap_offers so on so.id = c.offer_id
  where so.status in ('accepted', 'completed')
  union
  select c.id as conversation_id, so.receiver_id as user_id
  from public.conversations c
  join public.swap_offers so on so.id = c.offer_id
  where so.status in ('accepted', 'completed')
)
insert into public.conversation_participants (conversation_id, user_id)
select conversation_id, user_id
from participant_rows
on conflict (conversation_id, user_id) do nothing;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1
       from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'messages'
     ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;
