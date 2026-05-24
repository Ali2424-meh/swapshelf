"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin, requireUser } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.email().trim(),
  password: z.string().min(1),
  next: z.string().optional(),
});

const signupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().trim(),
  password: z.string().min(8).max(72),
  location: z.string().trim().max(120).optional(),
});

const optionalLatitude = z.preprocess(
  (val) => (val === "" || val === null ? undefined : val),
  z.coerce.number().min(-90).max(90).optional(),
);

const optionalLongitude = z.preprocess(
  (val) => (val === "" || val === null ? undefined : val),
  z.coerce.number().min(-180).max(180).optional(),
);

const listingSchema = z.object({
  title: z.string().trim().min(3).max(120),
  category_id: z.uuid(),
  condition: z.enum(["like_new", "good", "fair"]),
  description: z.string().trim().max(2000).optional(),
  wants: z.string().trim().max(240).optional(),
  city: z.string().trim().max(120).optional(),
  postal_code: z.string().trim().max(40).optional(),
  latitude: optionalLatitude,
  longitude: optionalLongitude,
});

const profileSchema = z.object({
  display_name: z.string().trim().min(2).max(80),
  city: z.string().trim().max(120).optional(),
  postal_code: z.string().trim().max(40).optional(),
  search_radius_km: z.coerce.number().int().min(1).max(100),
  latitude: optionalLatitude,
  longitude: optionalLongitude,
});

const uuidSchema = z.uuid();

function configuredOrRedirect(path = "/login") {
  if (!hasSupabaseEnv()) {
    redirect(`${path}?error=Supabase is not configured yet. Follow SUPABASE_SETUP.md.`);
  }
}

function value(formData: FormData, key: string) {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw : "";
}

function optionalValue(formData: FormData, key: string) {
  const raw = value(formData, key).trim();
  return raw.length ? raw : undefined;
}

function nextPath(raw: FormDataEntryValue | null, fallback: string) {
  if (typeof raw !== "string" || !raw.startsWith("/") || raw.startsWith("//")) {
    return fallback;
  }

  return raw;
}

function authError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function authMessage(path: string, message: string): never {
  redirect(`${path}?message=${encodeURIComponent(message)}`);
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function conditionLabelToValue(raw: string) {
  if (raw === "like-new") return "like_new";
  return raw;
}

export async function loginAction(formData: FormData) {
  configuredOrRedirect("/login");

  const parsed = loginSchema.safeParse({
    email: value(formData, "email"),
    password: value(formData, "password"),
    next: value(formData, "next") || undefined,
  });

  if (!parsed.success) {
    authError("/login", "Enter a valid email and password.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    authError("/login", error.message);
  }

  revalidatePath("/", "layout");
  redirect(nextPath(formData.get("next"), "/dashboard"));
}

export async function signupAction(formData: FormData) {
  configuredOrRedirect("/signup");

  const parsed = signupSchema.safeParse({
    name: value(formData, "name"),
    email: value(formData, "email"),
    password: value(formData, "password"),
    location: optionalValue(formData, "location"),
  });

  if (!parsed.success) {
    authError("/signup", "Check your details and use a password with at least 8 characters.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        display_name: parsed.data.name,
        city: parsed.data.location ?? null,
      },
    },
  });

  if (error) {
    authError("/signup", error.message);
  }

  authMessage("/login", "Check your email to confirm your account, then sign in.");
}

export async function logoutAction() {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");
  redirect("/login?message=You have been signed out.");
}

export async function createListingAction(formData: FormData) {
  configuredOrRedirect("/dashboard/listings/new");
  const currentUser = await requireUser();

  const parsed = listingSchema.safeParse({
    title: value(formData, "title"),
    category_id: value(formData, "category_id"),
    condition: conditionLabelToValue(value(formData, "condition")),
    description: optionalValue(formData, "description"),
    wants: optionalValue(formData, "wants"),
    city: optionalValue(formData, "city"),
    postal_code: optionalValue(formData, "postal_code"),
    latitude: value(formData, "latitude"),
    longitude: value(formData, "longitude"),
  });

  if (!parsed.success) {
    redirect("/dashboard/listings/new?error=Please complete the required listing fields.");
  }

  const supabase = await createClient();
  const { data: listing, error } = await supabase
    .from("listings")
    .insert({
      owner_id: currentUser.id,
      category_id: parsed.data.category_id,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      condition: parsed.data.condition,
      wants: parsed.data.wants ?? null,
      city: parsed.data.city ?? currentUser.profile.city,
      postal_code: parsed.data.postal_code ?? currentUser.profile.postal_code,
      latitude: parsed.data.latitude ?? currentUser.profile.latitude,
      longitude: parsed.data.longitude ?? currentUser.profile.longitude,
    })
    .select("id")
    .single();

  if (error || !listing) {
    redirect("/dashboard/listings/new?error=Could not publish this listing.");
  }

  const photos = formData
    .getAll("photos")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0)
    .slice(0, 6);

  for (const [index, photo] of photos.entries()) {
    const ext = photo.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${currentUser.id}/${listing.id}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("listing-photos")
      .upload(path, photo, {
        contentType: photo.type || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      continue;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("listing-photos").getPublicUrl(path);

    await supabase.from("listing_images").insert({
      listing_id: listing.id,
      owner_id: currentUser.id,
      storage_path: path,
      public_url: publicUrl,
      alt_text: parsed.data.title,
      sort_order: index,
    });
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function toggleSavedListingAction(formData: FormData) {
  configuredOrRedirect("/login");
  const currentUser = await requireUser();
  const listingId = uuidSchema.safeParse(value(formData, "listing_id"));

  if (!listingId.success) {
    redirect("/browse");
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("saved_listings")
    .select("listing_id")
    .eq("user_id", currentUser.id)
    .eq("listing_id", listingId.data)
    .maybeSingle();

  if (existing) {
    await supabase.from("saved_listings").delete().eq("user_id", currentUser.id).eq("listing_id", listingId.data);
  } else {
    await supabase.from("saved_listings").insert({ user_id: currentUser.id, listing_id: listingId.data });
  }

  revalidatePath("/", "layout");
  redirect(nextPath(formData.get("next"), "/browse"));
}

export async function createOfferAction(formData: FormData) {
  configuredOrRedirect("/login");
  const currentUser = await requireUser();
  const listingId = uuidSchema.safeParse(value(formData, "listing_id"));

  if (!listingId.success) {
    redirect("/browse");
  }

  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("id, owner_id, title")
    .eq("id", listingId.data)
    .eq("status", "active")
    .single();

  if (!listing || listing.owner_id === currentUser.id) {
    redirect("/browse?error=You cannot send an offer on that listing.");
  }

  const { error } = await supabase
    .from("swap_offers")
    .insert({
      listing_id: listing.id,
      sender_id: currentUser.id,
      receiver_id: listing.owner_id,
      message: optionalValue(formData, "message") ?? "I am interested in swapping for this item.",
    });

  revalidatePath("/", "layout");
  redirect(error ? "/browse?error=Could not send that offer." : "/dashboard/offers");
}

export async function createReportAction(formData: FormData) {
  configuredOrRedirect("/login");
  const currentUser = await requireUser();
  const targetType = z.enum(["listing", "user", "message"]).safeParse(value(formData, "target_type"));
  const targetId = uuidSchema.safeParse(value(formData, "target_id"));
  const reason = z.string().trim().min(3).max(160).safeParse(value(formData, "reason") || "Community report");

  if (!targetType.success || !targetId.success || !reason.success) {
    redirect(nextPath(formData.get("next"), "/browse"));
  }

  const insertData = {
    reporter_id: currentUser.id,
    target_type: targetType.data,
    target_listing_id: targetType.data === "listing" ? targetId.data : null,
    target_user_id: targetType.data === "user" ? targetId.data : null,
    target_message_id: targetType.data === "message" ? targetId.data : null,
    reason: reason.data,
    details: optionalValue(formData, "details") ?? null,
  };

  const supabase = await createClient();
  await supabase.from("reports").insert(insertData);

  redirect(nextPath(formData.get("next"), "/browse"));
}

export async function updateOfferStatusAction(formData: FormData) {
  configuredOrRedirect("/dashboard/offers");
  const currentUser = await requireUser();
  const offerId = uuidSchema.safeParse(value(formData, "offer_id"));
  const status = z.enum(["accepted", "declined", "cancelled", "completed"]).safeParse(value(formData, "status"));

  if (!offerId.success || !status.success) {
    redirect("/dashboard/offers?error=Could not update that offer.");
  }

  const supabase = await createClient();
  const { data: offer } = await supabase
    .from("swap_offers")
    .select("id, sender_id, receiver_id, listing_id")
    .eq("id", offerId.data)
    .single();

  if (!offer || (offer.sender_id !== currentUser.id && offer.receiver_id !== currentUser.id)) {
    redirect("/dashboard/offers?error=You cannot update that offer.");
  }

  await supabase.from("swap_offers").update({ status: status.data }).eq("id", offer.id);

  if (status.data === "accepted") {
    const { data: existingConversation } = await supabase
      .from("conversations")
      .select("id")
      .eq("offer_id", offer.id)
      .maybeSingle();

    const { data: conversation } = existingConversation
      ? { data: existingConversation }
      : await supabase
          .from("conversations")
          .insert({ offer_id: offer.id })
          .select("id")
          .single();

    if (conversation) {
      await supabase.from("conversation_participants").upsert(
        [
          { conversation_id: conversation.id, user_id: offer.sender_id },
          { conversation_id: conversation.id, user_id: offer.receiver_id },
        ],
        { ignoreDuplicates: true, onConflict: "conversation_id,user_id" },
      );
    }
  }

  revalidatePath("/", "layout");
  redirect("/dashboard/offers");
}

export async function sendMessageAction(formData: FormData) {
  configuredOrRedirect("/dashboard/messages");
  const currentUser = await requireUser();
  const conversationId = uuidSchema.safeParse(value(formData, "conversation_id"));
  const body = z.string().trim().min(1).max(2000).safeParse(value(formData, "body"));

  if (!conversationId.success || !body.success) {
    redirect("/dashboard/messages?error=Message could not be sent.");
  }

  const supabase = await createClient();
  await supabase.from("messages").insert({
    conversation_id: conversationId.data,
    sender_id: currentUser.id,
    body: body.data,
  });

  revalidatePath("/dashboard/messages");
  redirect("/dashboard/messages");
}

export async function createWishlistAlertAction(formData: FormData) {
  configuredOrRedirect("/dashboard/wishlist");
  const currentUser = await requireUser();
  const query = z.string().trim().min(2).max(120).safeParse(value(formData, "query"));

  if (!query.success) {
    redirect("/dashboard/wishlist?error=Add at least two characters.");
  }

  const supabase = await createClient();
  await supabase.from("wishlist_alerts").insert({
    user_id: currentUser.id,
    query: query.data,
    category_id: optionalValue(formData, "category_id") ?? null,
    radius_km: Number(value(formData, "radius_km")) || currentUser.profile.search_radius_km,
  });

  revalidatePath("/dashboard/wishlist");
  redirect("/dashboard/wishlist");
}

export async function updateProfileAction(formData: FormData) {
  configuredOrRedirect("/dashboard/profile");
  const currentUser = await requireUser();
  const parsed = profileSchema.safeParse({
    display_name: value(formData, "display_name"),
    city: optionalValue(formData, "city"),
    postal_code: optionalValue(formData, "postal_code"),
    search_radius_km: value(formData, "search_radius_km") || "10",
    latitude: value(formData, "latitude"),
    longitude: value(formData, "longitude"),
  });

  if (!parsed.success) {
    redirect("/dashboard/profile?error=Profile update failed. Check the fields and try again.");
  }

  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.display_name,
      city: parsed.data.city ?? null,
      postal_code: parsed.data.postal_code ?? null,
      search_radius_km: parsed.data.search_radius_km,
      latitude: parsed.data.latitude ?? null,
      longitude: parsed.data.longitude ?? null,
    })
    .eq("id", currentUser.id);

  revalidatePath("/", "layout");
  redirect("/dashboard/profile?message=Profile updated.");
}

export async function createCategoryAction(formData: FormData) {
  configuredOrRedirect("/admin/categories");
  await requireAdmin();

  const name = z.string().trim().min(2).max(80).safeParse(value(formData, "name"));
  const emoji = z.string().trim().min(1).max(8).safeParse(value(formData, "emoji") || "📦");

  if (!name.success || !emoji.success) {
    redirect("/admin/categories?error=Category name is required.");
  }

  const supabase = await createClient();
  await supabase.from("categories").insert({
    name: name.data,
    slug: slugify(name.data),
    emoji: emoji.data,
    sort_order: Number(value(formData, "sort_order")) || 100,
  });

  revalidatePath("/", "layout");
  redirect("/admin/categories");
}

export async function updateCategoryAction(formData: FormData) {
  configuredOrRedirect("/admin/categories");
  await requireAdmin();
  const categoryId = uuidSchema.safeParse(value(formData, "category_id"));

  if (!categoryId.success) {
    redirect("/admin/categories?error=Missing category.");
  }

  const supabase = await createClient();
  await supabase
    .from("categories")
    .update({ active: value(formData, "active") === "true" })
    .eq("id", categoryId.data);

  revalidatePath("/", "layout");
  redirect("/admin/categories");
}

export async function updateListingStatusAction(formData: FormData) {
  configuredOrRedirect("/admin/listings");
  await requireAdmin();
  const listingId = uuidSchema.safeParse(value(formData, "listing_id"));
  const status = z.enum(["active", "pending", "flagged", "swapped", "archived"]).safeParse(value(formData, "status"));

  if (!listingId.success || !status.success) {
    redirect("/admin/listings?error=Could not update listing.");
  }

  const supabase = await createClient();
  await supabase.from("listings").update({ status: status.data }).eq("id", listingId.data);

  revalidatePath("/", "layout");
  redirect("/admin/listings");
}

export async function updateReportStatusAction(formData: FormData) {
  configuredOrRedirect("/admin/reports");
  await requireAdmin();
  const reportId = uuidSchema.safeParse(value(formData, "report_id"));
  const status = z.enum(["open", "reviewing", "resolved", "dismissed"]).safeParse(value(formData, "status"));

  if (!reportId.success || !status.success) {
    redirect("/admin/reports?error=Could not update report.");
  }

  const supabase = await createClient();
  await supabase
    .from("reports")
    .update({
      status: status.data,
      admin_notes: optionalValue(formData, "admin_notes") ?? null,
    })
    .eq("id", reportId.data);

  revalidatePath("/admin/reports");
  redirect("/admin/reports");
}

export async function updateUserStatusAction(formData: FormData) {
  configuredOrRedirect("/admin/users");
  await requireAdmin();
  const userId = uuidSchema.safeParse(value(formData, "user_id"));
  const status = z.enum(["active", "flagged", "banned"]).safeParse(value(formData, "status"));

  if (!userId.success || !status.success) {
    redirect("/admin/users?error=Could not update user.");
  }

  const supabase = await createClient();
  await supabase.from("profiles").update({ status: status.data }).eq("id", userId.data);

  revalidatePath("/admin/users");
  redirect("/admin/users");
}
