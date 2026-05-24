-- SwapShelf Supabase schema
-- Run this in the Supabase SQL Editor after creating your project.

create extension if not exists "pgcrypto";

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

  insert into public.public_profiles (id, display_name, initials, avatar_url)
  values (new.id, display_name, public.make_initials(display_name), null)
  on conflict (id) do update set
    display_name = excluded.display_name,
    initials = excluded.initials,
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
  insert into public.public_profiles (id, display_name, initials, avatar_url, updated_at)
  values (new.id, new.display_name, new.initials, new.avatar_url, now())
  on conflict (id) do update set
    display_name = excluded.display_name,
    initials = excluded.initials,
    avatar_url = excluded.avatar_url,
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

drop policy if exists "Listing photos are publicly readable" on storage.objects;
create policy "Listing photos are publicly readable"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'listing-photos');

drop policy if exists "Users upload own listing photos" on storage.objects;
create policy "Users upload own listing photos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'listing-photos'
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

drop policy if exists "Users delete own listing photos" on storage.objects;
create policy "Users delete own listing photos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'listing-photos'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
);
