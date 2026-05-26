"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin, requireUser } from "@/lib/auth";
import { locationFromForm } from "@/lib/location";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.email().trim(),
  password: z.string().min(1),
  next: z.string().optional(),
});

const forgotPasswordSchema = z.object({
  email: z.email().trim(),
});

const resetPasswordSchema = z
  .object({
    password: z.string().min(8).max(72),
    confirm_password: z.string().min(8).max(72),
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match.",
  });

const signupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().trim(),
  password: z.string().min(8).max(72),
  region_code: z.string().trim().min(1),
  region_name: z.string().trim().min(1),
  province_code: z.string().trim().min(1),
  province_name: z.string().trim().min(1),
  city_code: z.string().trim().min(1),
  city_name: z.string().trim().min(1),
  barangay_code: z.string().trim().optional(),
  barangay_name: z.string().trim().optional(),
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

const editableListingStatusSchema = z.enum(["active", "archived"]);

const profileSchema = z.object({
  display_name: z.string().trim().min(2).max(80),
  city: z.string().trim().max(120).optional(),
  postal_code: z.string().trim().max(40).optional(),
  search_radius_km: z.coerce.number().int().min(1).max(100),
  latitude: optionalLatitude,
  longitude: optionalLongitude,
});

const uuidSchema = z.uuid();
const maxListingPhotos = 6;
const maxListingPhotoSize = 10 * 1024 * 1024;
const allowedListingPhotoTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const maxOfferPhotos = 4;
const maxOfferPhotoSize = 10 * 1024 * 1024;
const allowedOfferPhotoTypes = allowedListingPhotoTypes;
const maxAvatarSize = 5 * 1024 * 1024;
const allowedAvatarTypes = new Set(["image/png", "image/jpeg", "image/webp"]);

export type SendMessageState = {
  error?: string;
  message?: {
    id: string;
    body: string;
    senderId: string;
    createdAt: string;
  };
};

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

async function originUrl() {
  const requestHeaders = await headers();
  return (
    requestHeaders.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000"
  );
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

function photoFiles(formData: FormData, name = "photos") {
  return formData.getAll(name).filter((entry): entry is File => entry instanceof File && entry.size > 0);
}

async function uploadListingPhoto({
  supabase,
  ownerId,
  listingId,
  title,
  photo,
  sortOrder,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  ownerId: string;
  listingId: string;
  title: string;
  photo: File;
  sortOrder: number;
}) {
  const ext = photo.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${ownerId}/${listingId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from("listing-photos").upload(path, photo, {
    contentType: photo.type || "image/jpeg",
    upsert: false,
  });

  if (uploadError) {
    return { error: uploadError.message || "Could not upload one of the photos." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("listing-photos").getPublicUrl(path);

  const { error: imageError } = await supabase.from("listing_images").insert({
    listing_id: listingId,
    owner_id: ownerId,
    storage_path: path,
    public_url: publicUrl,
    alt_text: title,
    sort_order: sortOrder,
  });

  if (imageError) {
    await supabase.storage.from("listing-photos").remove([path]);
    return { error: imageError.message || "Could not save one of the uploaded photos." };
  }

  return { error: null };
}

async function uploadOfferPhoto({
  supabase,
  ownerId,
  offerId,
  photo,
  sortOrder,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  ownerId: string;
  offerId: string;
  photo: File;
  sortOrder: number;
}) {
  const ext = photo.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${ownerId}/${offerId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from("offer-photos").upload(path, photo, {
    contentType: photo.type || "image/jpeg",
    upsert: false,
  });

  if (uploadError) {
    return { error: uploadError.message || "Could not upload one of the offer photos." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("offer-photos").getPublicUrl(path);

  const { error: imageError } = await supabase.from("swap_offer_images").insert({
    offer_id: offerId,
    owner_id: ownerId,
    storage_path: path,
    public_url: publicUrl,
    alt_text: "Offer photo",
    sort_order: sortOrder,
  });

  if (imageError) {
    await supabase.storage.from("offer-photos").remove([path]);
    return { error: imageError.message || "Could not save one of the offer photos." };
  }

  return { error: null };
}

function listingPhotoError(message: string): never {
  redirect(`/dashboard/listings/new?error=${encodeURIComponent(message)}`);
}

function listingEditError(listingId: string, message: string): never {
  redirect(`/dashboard/listings/${listingId}/edit?error=${encodeURIComponent(message)}`);
}

function profileError(message: string): never {
  redirect(`/dashboard/profile?error=${encodeURIComponent(message)}`);
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
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    authError("/login", error.message);
  }

  const requestedNext = nextPath(formData.get("next"), "/dashboard");
  let destination = requestedNext;

  if (data.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", data.user.id)
      .single();

    if (profile?.status === "banned") {
      revalidatePath("/", "layout");
      redirect("/banned");
    }

    if (requestedNext === "/dashboard" && profile?.role === "admin") {
      destination = "/admin";
    }
  }

  revalidatePath("/", "layout");
  redirect(destination);
}

export async function signupAction(formData: FormData) {
  configuredOrRedirect("/signup");

  const parsed = signupSchema.safeParse({
    name: value(formData, "name"),
    email: value(formData, "email"),
    password: value(formData, "password"),
    region_code: value(formData, "region_code"),
    region_name: value(formData, "region_name"),
    province_code: value(formData, "province_code"),
    province_name: value(formData, "province_name"),
    city_code: value(formData, "city_code"),
    city_name: value(formData, "city_name"),
    barangay_code: optionalValue(formData, "barangay_code"),
    barangay_name: optionalValue(formData, "barangay_name"),
  });

  if (!parsed.success) {
    authError("/signup", "Check your details, choose your swapping city, and use a password with at least 8 characters.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        display_name: parsed.data.name,
        city: parsed.data.city_name,
        region_code: parsed.data.region_code,
        region_name: parsed.data.region_name,
        province_code: parsed.data.province_code,
        province_name: parsed.data.province_name,
        city_code: parsed.data.city_code,
        city_name: parsed.data.city_name,
        barangay_code: parsed.data.barangay_code ?? null,
        barangay_name: parsed.data.barangay_name ?? null,
      },
    },
  });

  if (error) {
    authError("/signup", error.message);
  }

  authMessage("/login", "Check your email to confirm your account, then sign in.");
}

export async function forgotPasswordAction(formData: FormData) {
  configuredOrRedirect("/forgot-password");

  const parsed = forgotPasswordSchema.safeParse({
    email: value(formData, "email"),
  });

  if (!parsed.success) {
    authError("/forgot-password", "Enter the email address for your SwapShelf account.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${await originUrl()}/auth/confirm?type=recovery&next=/reset-password`,
  });

  if (error) {
    authError("/forgot-password", error.message);
  }

  authMessage("/login", "Check your email for a password reset link.");
}

export async function updatePasswordAction(formData: FormData) {
  configuredOrRedirect("/reset-password");

  const parsed = resetPasswordSchema.safeParse({
    password: value(formData, "password"),
    confirm_password: value(formData, "confirm_password"),
  });

  if (!parsed.success) {
    authError("/reset-password", "Use matching passwords with at least 8 characters.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    authError("/forgot-password", "Your reset link expired. Request a new one.");
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    authError("/reset-password", error.message);
  }

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  authMessage("/login", "Password updated. Sign in with your new password.");
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

  const formLocation = locationFromForm(formData);
  const listingLocation = {
    region_code: formLocation.regionCode ?? currentUser.profile.region_code,
    region_name: formLocation.regionName ?? currentUser.profile.region_name,
    province_code: formLocation.provinceCode ?? currentUser.profile.province_code,
    province_name: formLocation.provinceName ?? currentUser.profile.province_name,
    city_code: formLocation.cityCode ?? currentUser.profile.city_code,
    city_name: formLocation.cityName ?? currentUser.profile.city_name,
    barangay_code: formLocation.barangayCode ?? currentUser.profile.barangay_code,
    barangay_name: formLocation.barangayName ?? currentUser.profile.barangay_name,
    location_label: formLocation.locationLabel ?? currentUser.profile.location_label,
  };

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
      city: parsed.data.city ?? listingLocation.city_name ?? currentUser.profile.city,
      postal_code: parsed.data.postal_code ?? currentUser.profile.postal_code,
      ...listingLocation,
      latitude: parsed.data.latitude ?? currentUser.profile.latitude,
      longitude: parsed.data.longitude ?? currentUser.profile.longitude,
    })
    .select("id")
    .single();

  if (error || !listing) {
    redirect("/dashboard/listings/new?error=Could not publish this listing.");
  }

  const photos = photoFiles(formData);

  if (photos.length > maxListingPhotos) {
    await supabase.from("listings").delete().eq("id", listing.id);
    listingPhotoError(`You can upload up to ${maxListingPhotos} photos.`);
  }

  for (const photo of photos) {
    if (photo.size > maxListingPhotoSize) {
      await supabase.from("listings").delete().eq("id", listing.id);
      listingPhotoError("Each photo must be 10 MB or smaller.");
    }

    if (!allowedListingPhotoTypes.has(photo.type)) {
      await supabase.from("listings").delete().eq("id", listing.id);
      listingPhotoError("Photos must be PNG, JPG, WEBP, or GIF files.");
    }
  }

  for (const [index, photo] of photos.entries()) {
    const { error: photoError } = await uploadListingPhoto({
      supabase,
      ownerId: currentUser.id,
      listingId: listing.id,
      title: parsed.data.title,
      photo,
      sortOrder: index,
    });

    if (photoError) {
      await supabase.from("listings").delete().eq("id", listing.id);
      listingPhotoError(photoError);
    }
  }

  revalidatePath("/", "layout");
  redirect("/dashboard/listings");
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
  const offeredListingId = uuidSchema.safeParse(value(formData, "offered_listing_id"));
  const fallbackNext = listingId.success ? `/listings/${listingId.data}` : "/browse";
  const next = nextPath(formData.get("next"), fallbackNext);

  if (!listingId.success || !offeredListingId.success) {
    redirect(`${next}?error=${encodeURIComponent("Choose one of your active listings to offer.")}`);
  }

  const supabase = await createClient();
  const [{ data: listing }, { data: offeredListing }] = await Promise.all([
    supabase
      .from("listings")
      .select("id, owner_id, title")
      .eq("id", listingId.data)
      .eq("status", "active")
      .single(),
    supabase
      .from("listings")
      .select("id, owner_id, title")
      .eq("id", offeredListingId.data)
      .eq("owner_id", currentUser.id)
      .eq("status", "active")
      .single(),
  ]);

  if (!listing || listing.owner_id === currentUser.id) {
    redirect(`${next}?error=${encodeURIComponent("You cannot send an offer on that listing.")}`);
  }

  if (!offeredListing || offeredListing.id === listing.id) {
    redirect(`${next}?error=${encodeURIComponent("Choose a different active listing of your own to offer.")}`);
  }

  const { data: existingOffer } = await supabase
    .from("swap_offers")
    .select("id")
    .eq("listing_id", listing.id)
    .eq("sender_id", currentUser.id)
    .eq("offered_listing_id", offeredListing.id)
    .eq("status", "pending")
    .maybeSingle();

  if (existingOffer) {
    redirect(`${next}?error=${encodeURIComponent("You already have a pending offer using that item.")}`);
  }

  const offerPhotos = photoFiles(formData, "offer_photos");

  if (offerPhotos.length > maxOfferPhotos) {
    redirect(`${next}?error=${encodeURIComponent(`You can attach up to ${maxOfferPhotos} offer photos.`)}`);
  }

  for (const photo of offerPhotos) {
    if (photo.size > maxOfferPhotoSize) {
      redirect(`${next}?error=${encodeURIComponent("Each offer photo must be 10 MB or smaller.")}`);
    }

    if (!allowedOfferPhotoTypes.has(photo.type)) {
      redirect(`${next}?error=${encodeURIComponent("Offer photos must be PNG, JPG, WEBP, or GIF files.")}`);
    }
  }

  const { data: offer, error } = await supabase
    .from("swap_offers")
    .insert({
      listing_id: listing.id,
      sender_id: currentUser.id,
      receiver_id: listing.owner_id,
      offered_listing_id: offeredListing.id,
      message: optionalValue(formData, "message") ?? "I am interested in swapping for this item.",
      offer_details: optionalValue(formData, "offer_details") ?? null,
      meetup_note: optionalValue(formData, "meetup_note") ?? null,
    })
    .select("id")
    .single();

  if (error || !offer) {
    redirect(`${next}?error=${encodeURIComponent("Could not send that offer.")}`);
  }

  for (const [index, photo] of offerPhotos.entries()) {
    const { error: photoError } = await uploadOfferPhoto({
      supabase,
      ownerId: currentUser.id,
      offerId: offer.id,
      photo,
      sortOrder: index,
    });

    if (photoError) {
      redirect(`${next}?error=${encodeURIComponent(photoError)}`);
    }
  }

  revalidatePath("/", "layout");
  redirect("/dashboard/offers?message=Offer sent.");
}

export async function updateListingAction(formData: FormData) {
  configuredOrRedirect("/dashboard");
  const currentUser = await requireUser();
  const listingId = uuidSchema.safeParse(value(formData, "listing_id"));

  if (!listingId.success) {
    redirect("/dashboard/listings?error=Listing not found.");
  }

  const parsed = listingSchema
    .extend({
      status: editableListingStatusSchema,
    })
    .safeParse({
      title: value(formData, "title"),
      category_id: value(formData, "category_id"),
      condition: conditionLabelToValue(value(formData, "condition")),
      description: optionalValue(formData, "description"),
      wants: optionalValue(formData, "wants"),
      city: optionalValue(formData, "city"),
      postal_code: optionalValue(formData, "postal_code"),
      latitude: value(formData, "latitude"),
      longitude: value(formData, "longitude"),
      status: value(formData, "status") || "active",
    });

  if (!parsed.success) {
    listingEditError(listingId.data, "Please check the listing fields and try again.");
  }

  const supabase = await createClient();
  const { data: existing, error: existingError } = await supabase
    .from("listings")
    .select("id, owner_id, listing_images(id, storage_path, sort_order)")
    .eq("id", listingId.data)
    .eq("owner_id", currentUser.id)
    .single();

  if (existingError || !existing) {
    redirect("/dashboard/listings?error=Listing not found.");
  }

  const existingImages = Array.isArray(existing.listing_images) ? existing.listing_images : [];
  const deleteIds = new Set(
    formData
      .getAll("delete_image_ids")
      .filter((entry): entry is string => typeof entry === "string" && uuidSchema.safeParse(entry).success),
  );
  const imagesToDelete = existingImages.filter((image) => deleteIds.has(image.id));
  const remainingImages = existingImages.filter((image) => !deleteIds.has(image.id));
  const photos = photoFiles(formData);

  if (remainingImages.length + photos.length > maxListingPhotos) {
    listingEditError(listingId.data, `Listings can have up to ${maxListingPhotos} photos.`);
  }

  for (const photo of photos) {
    if (photo.size > maxListingPhotoSize) {
      listingEditError(listingId.data, "Each photo must be 10 MB or smaller.");
    }

    if (!allowedListingPhotoTypes.has(photo.type)) {
      listingEditError(listingId.data, "Photos must be PNG, JPG, WEBP, or GIF files.");
    }
  }

  const formLocation = locationFromForm(formData);
  const listingLocation = {
    region_code: formLocation.regionCode ?? currentUser.profile.region_code,
    region_name: formLocation.regionName ?? currentUser.profile.region_name,
    province_code: formLocation.provinceCode ?? currentUser.profile.province_code,
    province_name: formLocation.provinceName ?? currentUser.profile.province_name,
    city_code: formLocation.cityCode ?? currentUser.profile.city_code,
    city_name: formLocation.cityName ?? currentUser.profile.city_name,
    barangay_code: formLocation.barangayCode ?? currentUser.profile.barangay_code,
    barangay_name: formLocation.barangayName ?? currentUser.profile.barangay_name,
    location_label: formLocation.locationLabel ?? currentUser.profile.location_label,
  };

  const { error: updateError } = await supabase
    .from("listings")
    .update({
      category_id: parsed.data.category_id,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      condition: parsed.data.condition,
      wants: parsed.data.wants ?? null,
      city: parsed.data.city ?? listingLocation.city_name ?? currentUser.profile.city,
      postal_code: parsed.data.postal_code ?? currentUser.profile.postal_code,
      ...listingLocation,
      latitude: parsed.data.latitude ?? currentUser.profile.latitude,
      longitude: parsed.data.longitude ?? currentUser.profile.longitude,
      status: parsed.data.status,
    })
    .eq("id", listingId.data)
    .eq("owner_id", currentUser.id);

  if (updateError) {
    listingEditError(listingId.data, updateError.message || "Could not update this listing.");
  }

  if (imagesToDelete.length) {
    const deletePaths = imagesToDelete.map((image) => image.storage_path).filter(Boolean);
    await supabase.from("listing_images").delete().eq("owner_id", currentUser.id).in(
      "id",
      imagesToDelete.map((image) => image.id),
    );

    if (deletePaths.length) {
      await supabase.storage.from("listing-photos").remove(deletePaths);
    }
  }

  const nextSortOrder =
    remainingImages.reduce((highest, image) => Math.max(highest, image.sort_order ?? 0), -1) + 1;

  for (const [index, photo] of photos.entries()) {
    const { error: photoError } = await uploadListingPhoto({
      supabase,
      ownerId: currentUser.id,
      listingId: listingId.data,
      title: parsed.data.title,
      photo,
      sortOrder: nextSortOrder + index,
    });

    if (photoError) {
      listingEditError(listingId.data, photoError);
    }
  }

  revalidatePath("/", "layout");
  redirect(`/dashboard/listings/${listingId.data}/edit?message=Listing updated.`);
}

export async function archiveListingAction(formData: FormData) {
  configuredOrRedirect("/dashboard");
  const currentUser = await requireUser();
  const listingId = uuidSchema.safeParse(value(formData, "listing_id"));

  if (!listingId.success) {
    redirect("/dashboard?error=Listing not found.");
  }

  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("id, status")
    .eq("id", listingId.data)
    .eq("owner_id", currentUser.id)
    .single();

  if (!listing) {
    redirect("/dashboard/listings?error=Listing not found.");
  }

  const nextStatus = listing.status === "archived" ? "active" : "archived";
  const { error } = await supabase
    .from("listings")
    .update({ status: nextStatus })
    .eq("id", listing.id)
    .eq("owner_id", currentUser.id);

  revalidatePath("/", "layout");
  redirect(error ? "/dashboard/listings?error=Could not update that listing." : "/dashboard/listings");
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
  await requireUser();
  const offerId = uuidSchema.safeParse(value(formData, "offer_id"));
  const status = z.enum(["accepted", "declined", "cancelled", "completed"]).safeParse(value(formData, "status"));

  if (!offerId.success || !status.success) {
    redirect("/dashboard/offers?error=Could not update that offer.");
  }

  const supabase = await createClient();
  const { data: conversationId, error } = await supabase.rpc("transition_swap_offer", {
    p_offer_id: offerId.data,
    p_next_status: status.data,
  });

  revalidatePath("/", "layout");
  if (error) {
    redirect(`/dashboard/offers?error=${encodeURIComponent(error.message || "Could not update that offer.")}`);
  }

  if (status.data === "accepted" && typeof conversationId === "string") {
    redirect(`/dashboard/messages/${conversationId}`);
  }
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
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, offer_id, swap_offers(status)")
    .eq("id", conversationId.data)
    .single();
  const offer = Array.isArray(conversation?.swap_offers) ? conversation?.swap_offers[0] : conversation?.swap_offers;
  const { data: participant } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("conversation_id", conversationId.data)
    .eq("user_id", currentUser.id)
    .maybeSingle();

  if (!conversation || !participant || !offer || !["accepted", "completed"].includes(offer.status)) {
    redirect(`/dashboard/messages/${conversationId.data}?error=This chat is not available.`);
  }

  await supabase.from("messages").insert({
    conversation_id: conversationId.data,
    sender_id: currentUser.id,
    body: body.data,
  });
  await supabase
    .from("conversation_participants")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId.data)
    .eq("user_id", currentUser.id);

  revalidatePath("/dashboard/messages");
  redirect(`/dashboard/messages/${conversationId.data}`);
}

export async function sendMessageInlineAction(
  _state: SendMessageState,
  formData: FormData,
): Promise<SendMessageState> {
  configuredOrRedirect("/dashboard/messages");
  const currentUser = await requireUser();
  const conversationId = uuidSchema.safeParse(value(formData, "conversation_id"));
  const body = z.string().trim().min(1).max(2000).safeParse(value(formData, "body"));

  if (!conversationId.success || !body.success) {
    return { error: "Write a message before sending." };
  }

  const supabase = await createClient();
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, offer_id, swap_offers(status)")
    .eq("id", conversationId.data)
    .single();
  const offer = Array.isArray(conversation?.swap_offers) ? conversation?.swap_offers[0] : conversation?.swap_offers;
  const { data: participant } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("conversation_id", conversationId.data)
    .eq("user_id", currentUser.id)
    .maybeSingle();

  if (!conversation || !participant || !offer || !["accepted", "completed"].includes(offer.status)) {
    return { error: "This chat is not available." };
  }

  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId.data,
      sender_id: currentUser.id,
      body: body.data,
    })
    .select("id, body, sender_id, created_at")
    .single();

  if (error || !message) {
    return { error: error?.message || "Message could not be sent." };
  }

  await supabase
    .from("conversation_participants")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId.data)
    .eq("user_id", currentUser.id);

  revalidatePath("/dashboard/messages");
  return {
    message: {
      id: message.id,
      body: message.body,
      senderId: message.sender_id,
      createdAt: message.created_at,
    },
  };
}

export async function markConversationReadAction(formData: FormData) {
  configuredOrRedirect("/dashboard/messages");
  const currentUser = await requireUser();
  const conversationId = uuidSchema.safeParse(value(formData, "conversation_id"));

  if (!conversationId.success) {
    redirect("/dashboard/messages");
  }

  const supabase = await createClient();
  await supabase
    .from("conversation_participants")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId.data)
    .eq("user_id", currentUser.id);

  revalidatePath("/dashboard/messages");
  redirect(`/dashboard/messages/${conversationId.data}`);
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

  const formLocation = locationFromForm(formData);
  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.display_name,
      city: parsed.data.city ?? formLocation.cityName ?? null,
      postal_code: parsed.data.postal_code ?? null,
      region_code: formLocation.regionCode,
      region_name: formLocation.regionName,
      province_code: formLocation.provinceCode,
      province_name: formLocation.provinceName,
      city_code: formLocation.cityCode,
      city_name: formLocation.cityName,
      barangay_code: formLocation.barangayCode,
      barangay_name: formLocation.barangayName,
      location_label: formLocation.locationLabel,
      search_radius_km: parsed.data.search_radius_km,
      latitude: parsed.data.latitude ?? null,
      longitude: parsed.data.longitude ?? null,
    })
    .eq("id", currentUser.id);

  revalidatePath("/", "layout");
  redirect("/dashboard/profile?message=Profile updated.");
}

export async function updateAvatarAction(formData: FormData) {
  configuredOrRedirect("/dashboard/profile");
  const currentUser = await requireUser();
  const avatar = formData.get("avatar");

  if (!(avatar instanceof File) || avatar.size === 0) {
    profileError("Choose an avatar image to upload.");
  }

  if (avatar.size > maxAvatarSize) {
    profileError("Profile picture must be 5 MB or smaller.");
  }

  if (!allowedAvatarTypes.has(avatar.type)) {
    profileError("Profile picture must be a PNG, JPG, or WEBP image.");
  }

  const supabase = await createClient();
  const ext = avatar.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${currentUser.id}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from("avatars").upload(path, avatar, {
    contentType: avatar.type || "image/jpeg",
    upsert: false,
  });

  if (uploadError) {
    profileError(uploadError.message || "Could not upload your profile picture.");
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl, avatar_path: path })
    .eq("id", currentUser.id);

  if (error) {
    await supabase.storage.from("avatars").remove([path]);
    profileError(error.message || "Could not save your profile picture.");
  }

  if (currentUser.profile.avatar_path) {
    await supabase.storage.from("avatars").remove([currentUser.profile.avatar_path]);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard/profile?message=Profile picture updated.");
}

export async function createCategoryAction(formData: FormData) {
  configuredOrRedirect("/admin/categories");
  await requireAdmin();

  const name = z.string().trim().min(2).max(80).safeParse(value(formData, "name"));
  const emoji = z.string().trim().min(1).max(16).safeParse(value(formData, "emoji") || "Box");

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
