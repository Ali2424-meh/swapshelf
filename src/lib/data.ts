import { cache } from "react";
import { requireAdmin, requireUser, getCurrentUser } from "@/lib/auth";
import {
  FALLBACK_CATEGORIES,
  FALLBACK_LISTINGS,
  iconForCategory,
  type CategoryDisplay,
  type Listing,
} from "@/lib/constants";
import { cityProvinceLabel, locationLabel, type PhilippineLocation } from "@/lib/location";
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
  areaLabel: string | null;
};

export type OfferSummary = {
  id: string;
  direction: "incoming" | "outgoing";
  status: string;
  message: string | null;
  offerDetails: string | null;
  meetupNote: string | null;
  listingTitle: string;
  listingUnavailable: boolean;
  offeredListingTitle: string | null;
  conversationId: string | null;
  images: ListingImage[];
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
  location: PhilippineLocation;
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
  location: PhilippineLocation;
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
  listingTitle: string;
  offeredListingTitle: string | null;
  offerStatus: string;
  latestMessage: string;
  latestAt: string | null;
  unreadCount: number;
};

export type ConversationMessage = {
  id: string;
  body: string;
  senderId: string;
  senderName: string;
  senderInitials: string;
  senderAvatarUrl: string | null;
  createdAt: string;
  isOwn: boolean;
};

export type ConversationThreadData = {
  id: string;
  currentUserId: string;
  otherPartyName: string;
  otherPartyInitials: string;
  otherPartyAvatarUrl: string | null;
  listingTitle: string;
  offeredListingTitle: string | null;
  offerStatus: string;
  canSend: boolean;
  messages: ConversationMessage[];
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
  reviewCount: number;
  completedSwaps: number;
  location: PhilippineLocation;
  areaLabel: string | null;
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
  const reviewCount = row.owner_review_count ? Number(row.owner_review_count) : 0;
  const rating = reviewCount > 0 && row.owner_trust_score != null ? Number(row.owner_trust_score) : null;

  return {
    id,
    title: String(row.title ?? "Untitled listing"),
    description: typeof row.description === "string" ? row.description : null,
    wants: typeof row.wants === "string" ? row.wants : null,
    category: String(row.category_name ?? "Other"),
    categorySlug: String(row.category_slug ?? ""),
    categoryEmoji: String(row.category_emoji ?? ""),
    distanceKm:
      typeof row.distance_km === "number" ? row.distance_km : row.distance_km ? Number(row.distance_km) : null,
    areaLabel:
      typeof row.location_label === "string" && row.location_label.length
        ? row.location_label
        : cityProvinceLabel({
            regionName: typeof row.region_name === "string" ? row.region_name : null,
            provinceName: typeof row.province_name === "string" ? row.province_name : null,
            cityName: typeof row.city_name === "string" ? row.city_name : typeof row.city === "string" ? row.city : null,
            barangayName: typeof row.barangay_name === "string" ? row.barangay_name : null,
          }),
    areaRank: row.area_rank == null ? null : Number(row.area_rank),
    ownerId,
    ownerName: String(row.owner_name ?? "SwapShelf member"),
    ownerInitials: String(row.owner_initials ?? "SS"),
    ownerAvatarUrl: typeof row.owner_avatar_url === "string" ? row.owner_avatar_url : null,
    rating,
    reviewCount,
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
  areaScope,
  regionCode,
  provinceCode,
  cityCode,
  barangayCode,
  sort,
  limit = 24,
}: {
  search?: string;
  category?: string;
  areaScope?: string;
  regionCode?: string;
  provinceCode?: string;
  cityCode?: string;
  barangayCode?: string;
  sort?: string;
  limit?: number;
} = {}): Promise<Listing[]> {
  if (!hasSupabaseEnv()) {
    return FALLBACK_LISTINGS.slice(0, limit);
  }

  const currentUser = await getCurrentUser();
  const supabase = await createClient();
  const selectedRegionCode = regionCode || currentUser?.profile.region_code || null;
  const selectedProvinceCode = provinceCode || currentUser?.profile.province_code || null;
  const selectedCityCode = cityCode || currentUser?.profile.city_code || null;
  const selectedBarangayCode = barangayCode || currentUser?.profile.barangay_code || null;
  const { data, error } = await supabase.rpc("search_listings", {
    p_search: search || null,
    p_category_slug: category || null,
    p_area_scope: areaScope || "all",
    p_region_code: selectedRegionCode,
    p_province_code: selectedProvinceCode,
    p_city_code: selectedCityCode,
    p_barangay_code: selectedBarangayCode,
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
          location: {},
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
      "id, owner_id, category_id, title, description, wants, condition, status, city, postal_code, region_code, region_name, province_code, province_name, city_code, city_name, barangay_code, barangay_name, location_label, latitude, longitude, created_at, categories(name, slug, emoji), listing_images(id, public_url, storage_path, alt_text, sort_order)",
    )
    .eq("id", id)
    .single();

  if (error || !listing) {
    return null;
  }

  const [{ data: owner }, { data: saved }] = await Promise.all([
    supabase
      .from("public_profiles")
      .select("id, display_name, initials, avatar_url, trust_score, review_count")
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
  const listingLocation = {
    regionCode: listing.region_code,
    regionName: listing.region_name,
    provinceCode: listing.province_code,
    provinceName: listing.province_name,
    cityCode: listing.city_code,
    cityName: listing.city_name,
    barangayCode: listing.barangay_code,
    barangayName: listing.barangay_name,
  };
  const listingRow = {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    wants: listing.wants,
    condition: listing.condition,
    category_name: category?.name,
    category_slug: category?.slug,
    category_emoji: category?.emoji,
    region_name: listing.region_name,
    province_name: listing.province_name,
    city_name: listing.city_name,
    barangay_name: listing.barangay_name,
    location_label: listing.location_label ?? locationLabel(listingLocation),
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
    owner_review_count: owner?.review_count,
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
    location: listingLocation,
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
      "id, owner_id, category_id, title, description, wants, condition, status, city, postal_code, region_code, region_name, province_code, province_name, city_code, city_name, barangay_code, barangay_name, latitude, longitude, listing_images(id, public_url, storage_path, alt_text, sort_order)",
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
    location: {
      regionCode: listing.region_code,
      regionName: listing.region_name,
      provinceCode: listing.province_code,
      provinceName: listing.province_name,
      cityCode: listing.city_code,
      cityName: listing.city_name,
      barangayCode: listing.barangay_code,
      barangayName: listing.barangay_name,
    },
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
    .select(
      "id, title, status, condition, created_at, location_label, city_name, province_name, city, categories(name, emoji), listing_images(public_url, sort_order)",
    )
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
      areaLabel: listing.location_label ?? cityProvinceLabel({ cityName: listing.city_name ?? listing.city, provinceName: listing.province_name }),
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
    .select(
      "id, status, message, offer_details, meetup_note, created_at, sender_id, receiver_id, listing_id, offered_listing_id, swap_offer_images(id, public_url, storage_path, alt_text, sort_order), conversations(id)",
    )
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
    supabase.from("listings").select("id, title, status").in("id", listingIds),
  ]);

  const profilesById = profileMap(profiles ?? []);
  const listingsById = listingTitleMap(listings ?? []);
  const listingStatusById = new Map((listings ?? []).map((listing) => [listing.id, listing.status]));

  return offers.map((offer) => {
    const direction = offer.receiver_id === currentUser.id ? "incoming" : "outgoing";
    const otherPartyId = direction === "incoming" ? offer.sender_id : offer.receiver_id;
    const otherParty = profilesById.get(otherPartyId);

    return {
      id: offer.id,
      direction,
      status: titleCaseStatus(offer.status),
      message: offer.message,
      offerDetails: offer.offer_details ?? null,
      meetupNote: offer.meetup_note ?? null,
      listingTitle: listingsById.get(offer.listing_id) ?? "Listing unavailable",
      listingUnavailable: !listingsById.has(offer.listing_id) || listingStatusById.get(offer.listing_id) === "archived",
      offeredListingTitle: offer.offered_listing_id ? listingsById.get(offer.offered_listing_id) ?? "Your listing" : null,
      conversationId: firstRelation(offer.conversations)?.id ?? null,
      images: mapImages(Array.isArray(offer.swap_offer_images) ? offer.swap_offer_images : []),
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
    .select("conversation_id, last_read_at")
    .eq("user_id", currentUser.id);

  const conversationIds = (participantRows ?? []).map((row) => row.conversation_id);
  if (!conversationIds.length) {
    return [];
  }

  const [{ data: conversations }, { data: participants }, { data: messages }] = await Promise.all([
    supabase.from("conversations").select("id, offer_id, last_message_at").in("id", conversationIds),
    supabase
      .from("conversation_participants")
      .select("conversation_id, user_id")
      .in("conversation_id", conversationIds),
    supabase
      .from("messages")
      .select("id, conversation_id, body, created_at, sender_id")
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: false }),
  ]);

  const offerIds = Array.from(new Set((conversations ?? []).map((conversation) => conversation.offer_id).filter(Boolean)));
  const { data: offers } = offerIds.length
    ? await supabase
        .from("swap_offers")
        .select("id, status, listing_id, offered_listing_id")
        .in("id", offerIds)
    : { data: [] };
  const listingIds = Array.from(
    new Set((offers ?? []).flatMap((offer) => [offer.listing_id, offer.offered_listing_id]).filter(Boolean)),
  );
  const { data: listings } = listingIds.length
    ? await supabase.from("listings").select("id, title").in("id", listingIds)
    : { data: [] };

  const otherIds = Array.from(
    new Set((participants ?? []).filter((row) => row.user_id !== currentUser.id).map((row) => row.user_id)),
  );
  const { data: profiles } = otherIds.length
    ? await supabase.from("public_profiles").select("id, display_name, initials, avatar_url").in("id", otherIds)
    : { data: [] };

  const profilesById = profileMap(profiles ?? []);
  const offersById = new Map((offers ?? []).map((offer) => [offer.id, offer]));
  const listingsById = listingTitleMap(listings ?? []);
  const participantByConversation = new Map((participantRows ?? []).map((row) => [row.conversation_id, row]));

  return conversationIds.map((conversationId) => {
    const conversation = conversations?.find((row) => row.id === conversationId);
    const offer = conversation?.offer_id ? offersById.get(conversation.offer_id) : null;
    const otherId = participants?.find(
      (row) => row.conversation_id === conversationId && row.user_id !== currentUser.id,
    )?.user_id;
    const otherParty = otherId ? profilesById.get(otherId) : null;
    const latest = messages?.find((message) => message.conversation_id === conversationId);
    const lastReadAt = participantByConversation.get(conversationId)?.last_read_at;
    const unreadCount = (messages ?? []).filter(
      (message) =>
        message.conversation_id === conversationId &&
        message.sender_id !== currentUser.id &&
        (!lastReadAt || new Date(message.created_at) > new Date(lastReadAt)),
    ).length;

    return {
      id: conversationId,
      otherPartyName: otherParty?.display_name ?? "SwapShelf member",
      otherPartyInitials: otherParty?.initials ?? "SS",
      otherPartyAvatarUrl: otherParty?.avatar_url ?? null,
      listingTitle: offer ? listingsById.get(offer.listing_id) ?? "Listing unavailable" : "Listing unavailable",
      offeredListingTitle: offer?.offered_listing_id ? listingsById.get(offer.offered_listing_id) ?? null : null,
      offerStatus: offer ? titleCaseStatus(offer.status) : "Unknown",
      latestMessage: latest?.body ?? "No messages yet",
      latestAt: latest?.created_at ?? conversation?.last_message_at ?? null,
      unreadCount,
    };
  });
}

export async function getConversationThread(conversationId: string): Promise<ConversationThreadData | null> {
  const currentUser = await requireUser();

  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createClient();
  const { data: ownParticipant } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", currentUser.id)
    .maybeSingle();

  if (!ownParticipant) {
    return null;
  }

  const [{ data: conversation }, { data: participants }, { data: messages }] = await Promise.all([
    supabase.from("conversations").select("id, offer_id").eq("id", conversationId).single(),
    supabase.from("conversation_participants").select("user_id").eq("conversation_id", conversationId),
    supabase
      .from("messages")
      .select("id, sender_id, body, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true }),
  ]);

  if (!conversation) {
    return null;
  }

  await supabase
    .from("conversation_participants")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", currentUser.id);

  const otherId = participants?.find((participant) => participant.user_id !== currentUser.id)?.user_id;
  const participantIds = Array.from(new Set([currentUser.id, otherId].filter(Boolean))) as string[];
  const [{ data: profiles }, { data: offer }] = await Promise.all([
    supabase.from("public_profiles").select("id, display_name, initials, avatar_url").in("id", participantIds),
    conversation.offer_id
      ? supabase
          .from("swap_offers")
          .select("id, status, listing_id, offered_listing_id")
          .eq("id", conversation.offer_id)
          .single()
      : Promise.resolve({ data: null }),
  ]);
  const listingIds = offer ? [offer.listing_id, offer.offered_listing_id].filter(Boolean) : [];
  const { data: listings } = listingIds.length
    ? await supabase.from("listings").select("id, title").in("id", listingIds)
    : { data: [] };

  const profilesById = profileMap(profiles ?? []);
  const listingsById = listingTitleMap(listings ?? []);
  const otherParty = otherId ? profilesById.get(otherId) : null;

  return {
    id: conversationId,
    currentUserId: currentUser.id,
    otherPartyName: otherParty?.display_name ?? "SwapShelf member",
    otherPartyInitials: otherParty?.initials ?? "SS",
    otherPartyAvatarUrl: otherParty?.avatar_url ?? null,
    listingTitle: offer ? listingsById.get(offer.listing_id) ?? "Listing unavailable" : "Listing unavailable",
    offeredListingTitle: offer?.offered_listing_id ? listingsById.get(offer.offered_listing_id) ?? null : null,
    offerStatus: offer ? titleCaseStatus(offer.status) : "Unknown",
    canSend: offer ? ["accepted", "completed"].includes(offer.status) : false,
    messages: (messages ?? []).map((message) => {
      const sender = profilesById.get(message.sender_id);

      return {
        id: message.id,
        body: message.body,
        senderId: message.sender_id,
        senderName: sender?.display_name ?? "SwapShelf member",
        senderInitials: sender?.initials ?? "SS",
        senderAvatarUrl: sender?.avatar_url ?? null,
        createdAt: message.created_at,
        isOwn: message.sender_id === currentUser.id,
      };
    }),
  };
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
      p_area_scope: "all",
      p_region_code: currentUser.profile.region_code,
      p_province_code: currentUser.profile.province_code,
      p_city_code: currentUser.profile.city_code,
      p_barangay_code: currentUser.profile.barangay_code,
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
      reviewCount: 0,
      completedSwaps: 0,
      location: {},
      areaLabel: null,
      createdAt: null,
    };
  }

  const supabase = await createClient();
  const { data: publicProfile } = await supabase
    .from("public_profiles")
    .select("trust_score, review_count, completed_swaps, created_at")
    .eq("id", currentUser.id)
    .single();
  const location = {
    regionCode: currentUser.profile.region_code,
    regionName: currentUser.profile.region_name,
    provinceCode: currentUser.profile.province_code,
    provinceName: currentUser.profile.province_name,
    cityCode: currentUser.profile.city_code,
    cityName: currentUser.profile.city_name,
    barangayCode: currentUser.profile.barangay_code,
    barangayName: currentUser.profile.barangay_name,
  };

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
    reviewCount: Number(publicProfile?.review_count ?? 0),
    completedSwaps: Number(publicProfile?.completed_swaps ?? 0),
    location,
    areaLabel: currentUser.profile.area_label ?? locationLabel(location),
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
