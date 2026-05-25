import { cache } from "react";
import { requireAdmin, requireUser, getCurrentUser } from "@/lib/auth";
import {
  FALLBACK_CATEGORIES,
  FALLBACK_LISTINGS,
  iconForCategory,
  type CategoryDisplay,
  type Listing,
} from "@/lib/constants";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type PublicStats = {
  activeListings: number;
  communityMembers: number;
  completedSwaps: number;
};

export type DashboardListing = {
  id: string;
  title: string;
  status: string;
  condition: string;
  category: string;
  emoji: string;
  imageUrl: string | null;
  createdAt: string;
  pendingOfferCount: number;
};

export type OfferSummary = {
  id: string;
  direction: "incoming" | "outgoing";
  status: string;
  message: string | null;
  listingTitle: string;
  offeredListingTitle: string | null;
  otherPartyName: string;
  otherPartyInitials: string;
  otherPartyAvatarUrl: string | null;
  createdAt: string;
};

export type ListingImage = {
  id: string;
  publicUrl: string;
  storagePath: string;
  altText: string | null;
  sortOrder: number;
};

export type ListingDetail = Listing & {
  status: string;
  city: string | null;
  postalCode: string | null;
  createdAt: string;
  images: ListingImage[];
};

export type EditableListing = {
  id: string;
  title: string;
  description: string | null;
  wants: string | null;
  categoryId: string;
  condition: "like_new" | "good" | "fair";
  status: "active" | "pending" | "flagged" | "swapped" | "archived";
  city: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  images: ListingImage[];
};

export type OfferableListing = {
  id: string;
  title: string;
  category: string;
  condition: Listing["condition"];
  imageUrl: string | null;
};

export type ConversationSummary = {
  id: string;
  otherPartyName: string;
  otherPartyInitials: string;
  otherPartyAvatarUrl: string | null;
  latestMessage: string;
  latestAt: string | null;
};

export type WishlistData = {
  savedListings: Listing[];
  alerts: {
    id: string;
    query: string;
    radiusKm: number;
    active: boolean;
    createdAt: string;
  }[];
};

export type ProfileData = {
  displayName: string;
  initials: string;
  avatarUrl: string | null;
  email: string | null;
  city: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  searchRadiusKm: number;
  trustScore: number;
  completedSwaps: number;
  createdAt: string | null;
};

export type AdminStats = {
  totalUsers: number;
  activeListings: number;
  completedSwaps: number;
  pendingReports: number;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  status: string;
  role: string;
  completedSwaps: number;
  createdAt: string;
};

export type AdminListing = {
  id: string;
  title: string;
  ownerName: string;
  category: string;
  status: string;
  condition: string;
  createdAt: string;
};

export type AdminReport = {
  id: string;
  reporterName: string;
  targetType: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
};

const fallbackStats: PublicStats = {
  activeListings: 3892,
  communityMembers: 1248,
  completedSwaps: 9641,
};

const gradients = [
  "from-slate-400 to-slate-600",
  "from-amber-300 to-orange-400",
  "from-emerald-400 to-teal-500",
  "from-sky-400 to-blue-500",
  "from-yellow-500 to-amber-600",
  "from-rose-300 to-pink-500",
];

function conditionLabel(condition?: string): Listing["condition"] {
  if (condition === "like_new") return "Like New";
  if (condition === "fair") return "Fair";
  return "Good";
}

function titleCaseStatus(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function mapListing(
  row: Record<string, unknown>,
  index: number,
  savedIds: Set<string> = new Set(),
  currentUserId?: string,
): Listing {
  const id = String(row.id);
  const ownerId = typeof row.owner_id === "string" ? row.owner_id : undefined;

  return {
    id,
    title: String(row.title ?? "Untitled listing"),
    description: typeof row.description === "string" ? row.description : null,
    wants: typeof row.wants === "string" ? row.wants : null,
    category: String(row.category_name ?? "Other"),
    categorySlug: String(row.category_slug ?? ""),
    categoryEmoji: String(row.category_emoji ?? "📦"),
    distanceKm:
      typeof row.distance_km === "number" ? row.distance_km : row.distance_km ? Number(row.distance_km) : null,
    ownerId,
    ownerName: String(row.owner_name ?? "SwapShelf member"),
    ownerInitials: String(row.owner_initials ?? "SS"),
    ownerAvatarUrl: typeof row.owner_avatar_url === "string" ? row.owner_avatar_url : null,
    rating: row.owner_trust_score ? Number(row.owner_trust_score) : 5,
    imageUrl: typeof row.image_url === "string" ? row.image_url : null,
    imageGradient: gradients[index % gradients.length],
    condition: conditionLabel(String(row.condition ?? "good")),
    isSaved: savedIds.has(id),
    isOwn: currentUserId !== undefined && ownerId === currentUserId,
  };
}

function profileMap(rows: { id: string; display_name: string; initials: string; avatar_url?: string | null }[] = []) {
  return new Map(rows.map((row) => [row.id, row]));
}

function listingTitleMap(rows: { id: string; title: string }[] = []) {
  return new Map(rows.map((row) => [row.id, row.title]));
}

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function mapImages(rows: { id: string; public_url: string; storage_path: string; alt_text: string | null; sort_order: number | null }[] = []): ListingImage[] {
  return [...rows]
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((image) => ({
      id: image.id,
      publicUrl: image.public_url,
      storagePath: image.storage_path,
      altText: image.alt_text,
      sortOrder: image.sort_order ?? 0,
    }));
}

function distanceKm(
  originLat?: number | null,
  originLng?: number | null,
  targetLat?: number | null,
  targetLng?: number | null,
) {
  if (originLat == null || originLng == null || targetLat == null || targetLng == null) {
    return null;
  }

  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latDelta = toRadians(targetLat - originLat);
  const lngDelta = toRadians(targetLng - originLng);
  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(toRadians(originLat)) * Math.cos(toRadians(targetLat)) * Math.sin(lngDelta / 2) ** 2;

  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

function rawCondition(condition?: string): EditableListing["condition"] {
  if (condition === "like_new" || condition === "fair") return condition;
  return "good";
}

function rawStatus(status?: string): EditableListing["status"] {
  if (status === "pending" || status === "flagged" || status === "swapped" || status === "archived") return status;
  return "active";
}

export const getCategories = cache(async (includeInactive = false): Promise<CategoryDisplay[]> => {
  if (!hasSupabaseEnv()) {
    return FALLBACK_CATEGORIES;
  }

  const supabase = await createClient();
  let query = supabase
    .from("categories")
    .select("id, name, slug, emoji, active, sort_order")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (!includeInactive) {
    query = query.eq("active", true);
  }

  const { data, error } = await query;

  if (error || !data?.length) {
    return FALLBACK_CATEGORIES;
  }

  return data.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    emoji: category.emoji ?? "📦",
    icon: iconForCategory(category.slug),
    active: category.active,
    sort_order: category.sort_order,
  }));
});

export const getPublicStats = cache(async (): Promise<PublicStats> => {
  if (!hasSupabaseEnv()) {
    return fallbackStats;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("platform_public_stats").single();
  const statsRow = data as Partial<
    Record<"active_listings" | "community_members" | "completed_swaps", number | string>
  > | null;

  if (error || !statsRow) {
    return fallbackStats;
  }

  return {
    activeListings: Number(statsRow.active_listings ?? 0),
    communityMembers: Number(statsRow.community_members ?? 0),
    completedSwaps: Number(statsRow.completed_swaps ?? 0),
  };
});

export async function getPublicListings({
  search,
  category,
  radiusKm,
  sort,
  limit = 24,
}: {
  search?: string;
  category?: string;
  radiusKm?: number;
  sort?: string;
  limit?: number;
} = {}): Promise<Listing[]> {
  if (!hasSupabaseEnv()) {
    return FALLBACK_LISTINGS.slice(0, limit);
  }

  const currentUser = await getCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("search_listings", {
    p_search: search || null,
    p_category_slug: category || null,
    p_radius_km: radiusKm ?? null,
    p_origin_lat: currentUser?.profile.latitude ?? null,
    p_origin_lng: currentUser?.profile.longitude ?? null,
    p_sort: sort || "newest",
  });

  if (error || !data) {
    return [];
  }

  const allRows = data as Record<string, unknown>[];
  const rows = (currentUser
    ? allRows.filter((row) => String(row.owner_id) !== currentUser.id)
    : allRows
  ).slice(0, limit);
  let savedIds = new Set<string>();

  if (currentUser && rows.length) {
    const { data: savedRows } = await supabase
      .from("saved_listings")
      .select("listing_id")
      .eq("user_id", currentUser.id)
      .in(
        "listing_id",
        rows.map((row) => String(row.id)),
      );

    savedIds = new Set((savedRows ?? []).map((row) => row.listing_id as string));
  }

  return rows.map((row, index) => mapListing(row, index, savedIds, currentUser?.id));
}

export async function getListingDetail(id: string): Promise<ListingDetail | null> {
  if (!hasSupabaseEnv()) {
    const fallback = FALLBACK_LISTINGS.find((listing) => listing.id === id);

    return fallback
      ? {
          ...fallback,
          status: "active",
          city: null,
          postalCode: null,
          createdAt: new Date().toISOString(),
          images: [],
        }
      : null;
  }

  const currentUser = await getCurrentUser();
  const supabase = await createClient();
  const { data: listing, error } = await supabase
    .from("listings")
    .select(
      "id, owner_id, category_id, title, description, wants, condition, status, city, postal_code, latitude, longitude, created_at, categories(name, slug, emoji), listing_images(id, public_url, storage_path, alt_text, sort_order)",
    )
    .eq("id", id)
    .single();

  if (error || !listing) {
    return null;
  }

  const [{ data: owner }, { data: saved }] = await Promise.all([
    supabase
      .from("public_profiles")
      .select("id, display_name, initials, avatar_url, trust_score")
      .eq("id", listing.owner_id)
      .single(),
    currentUser
      ? supabase
          .from("saved_listings")
          .select("listing_id")
          .eq("user_id", currentUser.id)
          .eq("listing_id", listing.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const category = firstRelation(listing.categories);
  const images = mapImages(Array.isArray(listing.listing_images) ? listing.listing_images : []);
  const listingRow = {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    wants: listing.wants,
    condition: listing.condition,
    category_name: category?.name,
    category_slug: category?.slug,
    category_emoji: category?.emoji,
    distance_km: distanceKm(
      currentUser?.profile.latitude,
      currentUser?.profile.longitude,
      listing.latitude == null ? null : Number(listing.latitude),
      listing.longitude == null ? null : Number(listing.longitude),
    ),
    owner_id: listing.owner_id,
    owner_name: owner?.display_name,
    owner_initials: owner?.initials,
    owner_avatar_url: owner?.avatar_url,
    owner_trust_score: owner?.trust_score,
    image_url: images[0]?.publicUrl ?? null,
  };

  return {
    ...mapListing(
      listingRow,
      0,
      saved ? new Set([listing.id]) : new Set(),
      currentUser?.id,
    ),
    status: listing.status,
    city: listing.city,
    postalCode: listing.postal_code,
    createdAt: listing.created_at,
    images,
  };
}

export async function getEditableListing(id: string): Promise<EditableListing | null> {
  const currentUser = await requireUser();

  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createClient();
  const { data: listing, error } = await supabase
    .from("listings")
    .select(
      "id, owner_id, category_id, title, description, wants, condition, status, city, postal_code, latitude, longitude, listing_images(id, public_url, storage_path, alt_text, sort_order)",
    )
    .eq("id", id)
    .eq("owner_id", currentUser.id)
    .single();

  if (error || !listing) {
    return null;
  }

  return {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    wants: listing.wants,
    categoryId: listing.category_id,
    condition: rawCondition(listing.condition),
    status: rawStatus(listing.status),
    city: listing.city,
    postalCode: listing.postal_code,
    latitude: listing.latitude == null ? null : Number(listing.latitude),
    longitude: listing.longitude == null ? null : Number(listing.longitude),
    images: mapImages(Array.isArray(listing.listing_images) ? listing.listing_images : []),
  };
}

export async function getOfferableListings(excludeListingId?: string): Promise<OfferableListing[]> {
  const currentUser = await getCurrentUser();

  if (!currentUser || !hasSupabaseEnv()) {
    return [];
  }

  const supabase = await createClient();
  let query = supabase
    .from("listings")
    .select("id, title, condition, categories(name), listing_images(public_url, sort_order)")
    .eq("owner_id", currentUser.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (excludeListingId) {
    query = query.neq("id", excludeListingId);
  }

  const { data } = await query;

  return (data ?? []).map((listing) => {
    const category = firstRelation(listing.categories);
    const images = Array.isArray(listing.listing_images) ? listing.listing_images : [];
    const firstImage = images.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];

    return {
      id: listing.id,
      title: listing.title,
      category: category?.name ?? "Other",
      condition: conditionLabel(listing.condition),
      imageUrl: firstImage?.public_url ?? null,
    };
  });
}

export async function getDashboardListings(): Promise<DashboardListing[]> {
  const currentUser = await requireUser();

  if (!hasSupabaseEnv()) {
    return [];
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("id, title, status, condition, created_at, categories(name, emoji), listing_images(public_url, sort_order)")
    .eq("owner_id", currentUser.id)
    .order("created_at", { ascending: false });

  const listingIds = (data ?? []).map((listing) => listing.id);
  const { data: offers } = listingIds.length
    ? await supabase.from("swap_offers").select("listing_id, status").in("listing_id", listingIds)
    : { data: [] };
  const pendingOfferCounts = new Map<string, number>();

  for (const offer of offers ?? []) {
    if (offer.status === "pending") {
      pendingOfferCounts.set(offer.listing_id, (pendingOfferCounts.get(offer.listing_id) ?? 0) + 1);
    }
  }

  return (data ?? []).map((listing) => {
    const category = firstRelation(listing.categories);
    const images = Array.isArray(listing.listing_images) ? listing.listing_images : [];
    const firstImage = images.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];

    return {
      id: listing.id,
      title: listing.title,
      status: listing.status,
      condition: conditionLabel(listing.condition),
      category: category?.name ?? "Other",
      emoji: category?.emoji ?? "📦",
      imageUrl: firstImage?.public_url ?? null,
      createdAt: listing.created_at,
      pendingOfferCount: pendingOfferCounts.get(listing.id) ?? 0,
    };
  });
}

export async function getDashboardCounts() {
  const currentUser = await requireUser();

  if (!hasSupabaseEnv()) {
    return { listings: 0, swaps: 0, unreadNotifications: 0 };
  }

  const supabase = await createClient();
  const [listings, swaps, unreadNotifications] = await Promise.all([
    supabase.from("listings").select("id", { count: "exact", head: true }).eq("owner_id", currentUser.id),
    supabase
      .from("swap_offers")
      .select("id", { count: "exact", head: true })
      .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", currentUser.id)
      .is("read_at", null),
  ]);

  return {
    listings: listings.count ?? 0,
    swaps: swaps.count ?? 0,
    unreadNotifications: unreadNotifications.count ?? 0,
  };
}

export async function getSwapOffers(): Promise<OfferSummary[]> {
  const currentUser = await requireUser();

  if (!hasSupabaseEnv()) {
    return [];
  }

  const supabase = await createClient();
  const { data: offers } = await supabase
    .from("swap_offers")
    .select("id, status, message, created_at, sender_id, receiver_id, listing_id, offered_listing_id")
    .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
    .order("created_at", { ascending: false });

  if (!offers?.length) {
    return [];
  }

  const userIds = Array.from(new Set(offers.flatMap((offer) => [offer.sender_id, offer.receiver_id])));
  const listingIds = Array.from(
    new Set(offers.flatMap((offer) => [offer.listing_id, offer.offered_listing_id]).filter(Boolean)),
  );

  const [{ data: profiles }, { data: listings }] = await Promise.all([
    supabase.from("public_profiles").select("id, display_name, initials, avatar_url").in("id", userIds),
    supabase.from("listings").select("id, title").in("id", listingIds),
  ]);

  const profilesById = profileMap(profiles ?? []);
  const listingsById = listingTitleMap(listings ?? []);

  return offers.map((offer) => {
    const direction = offer.receiver_id === currentUser.id ? "incoming" : "outgoing";
    const otherPartyId = direction === "incoming" ? offer.sender_id : offer.receiver_id;
    const otherParty = profilesById.get(otherPartyId);

    return {
      id: offer.id,
      direction,
      status: titleCaseStatus(offer.status),
      message: offer.message,
      listingTitle: listingsById.get(offer.listing_id) ?? "Listing",
      offeredListingTitle: offer.offered_listing_id ? listingsById.get(offer.offered_listing_id) ?? "Your listing" : null,
      otherPartyName: otherParty?.display_name ?? "SwapShelf member",
      otherPartyInitials: otherParty?.initials ?? "SS",
      otherPartyAvatarUrl: otherParty?.avatar_url ?? null,
      createdAt: offer.created_at,
    };
  });
}

export async function getConversations(): Promise<ConversationSummary[]> {
  const currentUser = await requireUser();

  if (!hasSupabaseEnv()) {
    return [];
  }

  const supabase = await createClient();
  const { data: participantRows } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", currentUser.id);

  const conversationIds = (participantRows ?? []).map((row) => row.conversation_id);
  if (!conversationIds.length) {
    return [];
  }

  const [{ data: participants }, { data: messages }] = await Promise.all([
    supabase
      .from("conversation_participants")
      .select("conversation_id, user_id")
      .in("conversation_id", conversationIds),
    supabase
      .from("messages")
      .select("conversation_id, body, created_at")
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: false }),
  ]);

  const otherIds = Array.from(
    new Set((participants ?? []).filter((row) => row.user_id !== currentUser.id).map((row) => row.user_id)),
  );
  const { data: profiles } = otherIds.length
    ? await supabase.from("public_profiles").select("id, display_name, initials, avatar_url").in("id", otherIds)
    : { data: [] };

  const profilesById = profileMap(profiles ?? []);

  return conversationIds.map((conversationId) => {
    const otherId = participants?.find(
      (row) => row.conversation_id === conversationId && row.user_id !== currentUser.id,
    )?.user_id;
    const otherParty = otherId ? profilesById.get(otherId) : null;
    const latest = messages?.find((message) => message.conversation_id === conversationId);

    return {
      id: conversationId,
      otherPartyName: otherParty?.display_name ?? "SwapShelf member",
      otherPartyInitials: otherParty?.initials ?? "SS",
      otherPartyAvatarUrl: otherParty?.avatar_url ?? null,
      latestMessage: latest?.body ?? "No messages yet",
      latestAt: latest?.created_at ?? null,
    };
  });
}

export async function getWishlistData(): Promise<WishlistData> {
  const currentUser = await requireUser();

  if (!hasSupabaseEnv()) {
    return { savedListings: [], alerts: [] };
  }

  const supabase = await createClient();
  const [{ data: saved }, { data: alerts }] = await Promise.all([
    supabase.from("saved_listings").select("listing_id").eq("user_id", currentUser.id).order("created_at", { ascending: false }),
    supabase
      .from("wishlist_alerts")
      .select("id, query, radius_km, active, created_at")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false }),
  ]);

  const listingIds = (saved ?? []).map((row) => row.listing_id);
  let savedListings: Listing[] = [];

  if (listingIds.length) {
    const { data: rows } = await supabase.rpc("search_listings", {
      p_search: null,
      p_category_slug: null,
      p_radius_km: null,
      p_origin_lat: currentUser.profile.latitude,
      p_origin_lng: currentUser.profile.longitude,
      p_sort: "newest",
    });

    const savedIds = new Set(listingIds);
    savedListings = ((rows ?? []) as Record<string, unknown>[])
      .filter((row) => savedIds.has(String(row.id)))
      .map((row, index) => mapListing(row, index, savedIds, currentUser.id));
  }

  return {
    savedListings,
    alerts: (alerts ?? []).map((alert) => ({
      id: alert.id,
      query: alert.query,
      radiusKm: alert.radius_km,
      active: alert.active,
      createdAt: alert.created_at,
    })),
  };
}

export async function getProfileData(): Promise<ProfileData> {
  const currentUser = await requireUser();

  if (!hasSupabaseEnv()) {
    return {
      displayName: "SwapShelf member",
      initials: "SS",
      avatarUrl: null,
      email: null,
      city: null,
      postalCode: null,
      latitude: null,
      longitude: null,
      searchRadiusKm: 10,
      trustScore: 5,
      completedSwaps: 0,
      createdAt: null,
    };
  }

  const supabase = await createClient();
  const { data: publicProfile } = await supabase
    .from("public_profiles")
    .select("trust_score, completed_swaps, created_at")
    .eq("id", currentUser.id)
    .single();

  return {
    displayName: currentUser.profile.display_name,
    initials: currentUser.profile.initials,
    avatarUrl: currentUser.profile.avatar_url,
    email: currentUser.email,
    city: currentUser.profile.city,
    postalCode: currentUser.profile.postal_code,
    latitude: currentUser.profile.latitude,
    longitude: currentUser.profile.longitude,
    searchRadiusKm: currentUser.profile.search_radius_km,
    trustScore: Number(publicProfile?.trust_score ?? 5),
    completedSwaps: Number(publicProfile?.completed_swaps ?? 0),
    createdAt: publicProfile?.created_at ?? null,
  };
}

export async function getAdminStats(): Promise<AdminStats> {
  await requireAdmin();

  if (!hasSupabaseEnv()) {
    return { totalUsers: 0, activeListings: 0, completedSwaps: 0, pendingReports: 0 };
  }

  const supabase = await createClient();
  const [users, listings, completedSwaps, reports] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("swap_offers").select("id", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "open"),
  ]);

  return {
    totalUsers: users.count ?? 0,
    activeListings: listings.count ?? 0,
    completedSwaps: completedSwaps.count ?? 0,
    pendingReports: reports.count ?? 0,
  };
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  await requireAdmin();

  if (!hasSupabaseEnv()) {
    return [];
  }

  const supabase = await createClient();
  const [{ data: profiles }, { data: publicProfiles }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, display_name, status, role, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.from("public_profiles").select("id, completed_swaps"),
  ]);

  const publicProfileMap = new Map((publicProfiles ?? []).map((profile) => [profile.id, profile]));

  return (profiles ?? []).map((profile) => ({
    id: profile.id,
    name: profile.display_name,
    email: profile.email,
    status: profile.status,
    role: profile.role,
    completedSwaps: publicProfileMap.get(profile.id)?.completed_swaps ?? 0,
    createdAt: profile.created_at,
  }));
}

export async function getAdminListings(): Promise<AdminListing[]> {
  await requireAdmin();

  if (!hasSupabaseEnv()) {
    return [];
  }

  const supabase = await createClient();
  const { data: listings } = await supabase
    .from("listings")
    .select("id, title, status, condition, created_at, owner_id, categories(name)")
    .order("created_at", { ascending: false })
    .limit(50);

  const ownerIds = Array.from(new Set((listings ?? []).map((listing) => listing.owner_id)));
  const { data: owners } = ownerIds.length
    ? await supabase.from("public_profiles").select("id, display_name, initials").in("id", ownerIds)
    : { data: [] };
  const ownersById = profileMap(owners ?? []);

  return (listings ?? []).map((listing) => {
    const category = Array.isArray(listing.categories) ? listing.categories[0] : listing.categories;

    return {
      id: listing.id,
      title: listing.title,
      ownerName: ownersById.get(listing.owner_id)?.display_name ?? "SwapShelf member",
      category: category?.name ?? "Other",
      status: listing.status,
      condition: conditionLabel(listing.condition),
      createdAt: listing.created_at,
    };
  });
}

export async function getAdminReports(): Promise<AdminReport[]> {
  await requireAdmin();

  if (!hasSupabaseEnv()) {
    return [];
  }

  const supabase = await createClient();
  const { data: reports } = await supabase
    .from("reports")
    .select("id, reporter_id, target_type, reason, details, status, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  const reporterIds = Array.from(new Set((reports ?? []).map((report) => report.reporter_id)));
  const { data: reporters } = reporterIds.length
    ? await supabase.from("public_profiles").select("id, display_name, initials").in("id", reporterIds)
    : { data: [] };
  const reportersById = profileMap(reporters ?? []);

  return (reports ?? []).map((report) => ({
    id: report.id,
    reporterName: reportersById.get(report.reporter_id)?.display_name ?? "SwapShelf member",
    targetType: titleCaseStatus(report.target_type),
    reason: report.reason,
    details: report.details,
    status: report.status,
    createdAt: report.created_at,
  }));
}
