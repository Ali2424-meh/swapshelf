import { cache } from "react";
import { requireAdmin, requireUser, getCurrentUser } from "@/lib/auth";
import { FALLBACK_CATEGORIES, FALLBACK_LISTINGS, iconForCategory, type CategoryDisplay, type Listing } from "@/lib/constants";
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
};

export type OfferSummary = {
  id: string;
  direction: "incoming" | "outgoing";
  status: string;
  message: string | null;
  listingTitle: string;
  otherPartyName: string;
  otherPartyInitials: string;
  createdAt: string;
};

export type ConversationSummary = {
  id: string;
  otherPartyName: string;
  otherPartyInitials: string;
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

function mapListing(row: Record<string, unknown>, index: number, savedIds: Set<string> = new Set()): Listing {
  const id = String(row.id);
  const categorySlug = String(row.category_slug ?? "");

  return {
    id,
    title: String(row.title ?? "Untitled listing"),
    description: typeof row.description === "string" ? row.description : null,
    wants: typeof row.wants === "string" ? row.wants : null,
    category: String(row.category_name ?? "Other"),
    categorySlug,
    categoryEmoji: String(row.category_emoji ?? "📦"),
    distanceKm: typeof row.distance_km === "number" ? row.distance_km : row.distance_km ? Number(row.distance_km) : null,
    ownerId: typeof row.owner_id === "string" ? row.owner_id : undefined,
    ownerName: String(row.owner_name ?? "SwapShelf member"),
    ownerInitials: String(row.owner_initials ?? "SS"),
    rating: row.owner_trust_score ? Number(row.owner_trust_score) : 5,
    imageUrl: typeof row.image_url === "string" ? row.image_url : null,
    imageGradient: gradients[index % gradients.length],
    condition: conditionLabel(String(row.condition ?? "good")),
    isSaved: savedIds.has(id),
  };
}

function profileMap(rows: { id: string; display_name: string; initials: string }[] = []) {
  return new Map(rows.map((row) => [row.id, row]));
}

function listingTitleMap(rows: { id: string; title: string }[] = []) {
  return new Map(rows.map((row) => [row.id, row.title]));
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
  const statsRow = data as Partial<Record<"active_listings" | "community_members" | "completed_swaps", number | string>> | null;

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

  const rows = (data as Record<string, unknown>[]).slice(0, limit);
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

  return rows.map((row, index) => mapListing(row, index, savedIds));
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

  return (data ?? []).map((listing) => {
    const category = Array.isArray(listing.categories) ? listing.categories[0] : listing.categories;
    const images = Array.isArray(listing.listing_images) ? listing.listing_images : [];
    const firstImage = images.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];

    return {
      id: listing.id,
      title: listing.title,
      status: titleCaseStatus(listing.status),
      condition: conditionLabel(listing.condition),
      category: category?.name ?? "Other",
      emoji: category?.emoji ?? "📦",
      imageUrl: firstImage?.public_url ?? null,
      createdAt: listing.created_at,
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
  const listingIds = Array.from(new Set(offers.flatMap((offer) => [offer.listing_id, offer.offered_listing_id]).filter(Boolean)));

  const [{ data: profiles }, { data: listings }] = await Promise.all([
    supabase.from("public_profiles").select("id, display_name, initials").in("id", userIds),
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
      otherPartyName: otherParty?.display_name ?? "SwapShelf member",
      otherPartyInitials: otherParty?.initials ?? "SS",
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
    supabase.from("conversation_participants").select("conversation_id, user_id").in("conversation_id", conversationIds),
    supabase.from("messages").select("conversation_id, body, created_at").in("conversation_id", conversationIds).order("created_at", { ascending: false }),
  ]);

  const otherIds = Array.from(
    new Set((participants ?? []).filter((row) => row.user_id !== currentUser.id).map((row) => row.user_id)),
  );
  const { data: profiles } = otherIds.length
    ? await supabase.from("public_profiles").select("id, display_name, initials").in("id", otherIds)
    : { data: [] };

  const profilesById = profileMap(profiles ?? []);

  return conversationIds.map((conversationId) => {
    const otherId = participants?.find((row) => row.conversation_id === conversationId && row.user_id !== currentUser.id)?.user_id;
    const otherParty = otherId ? profilesById.get(otherId) : null;
    const latest = messages?.find((message) => message.conversation_id === conversationId);

    return {
      id: conversationId,
      otherPartyName: otherParty?.display_name ?? "SwapShelf member",
      otherPartyInitials: otherParty?.initials ?? "SS",
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
      .map((row, index) => mapListing(row, index, savedIds));
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
