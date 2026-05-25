import { cache } from "react";
import { redirect } from "next/navigation";
import { cityProvinceLabel } from "@/lib/location";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type ProfileRole = "user" | "admin";
export type ProfileStatus = "active" | "flagged" | "banned";

export type CurrentUser = {
  id: string;
  email: string | null;
  profile: {
    display_name: string;
    initials: string;
    avatar_url: string | null;
    avatar_path: string | null;
    role: ProfileRole;
    status: ProfileStatus;
    city: string | null;
    postal_code: string | null;
    region_code: string | null;
    region_name: string | null;
    province_code: string | null;
    province_name: string | null;
    city_code: string | null;
    city_name: string | null;
    barangay_code: string | null;
    barangay_name: string | null;
    location_label: string | null;
    latitude: number | null;
    longitude: number | null;
    search_radius_km: number;
    area_label: string | null;
  };
};

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "display_name, initials, avatar_url, avatar_path, role, status, city, postal_code, region_code, region_name, province_code, province_name, city_code, city_name, barangay_code, barangay_name, location_label, latitude, longitude, search_radius_km",
    )
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return null;
  }

  const typedProfile = profile as Omit<CurrentUser["profile"], "area_label">;

  return {
    id: user.id,
    email: user.email ?? null,
    profile: {
      ...typedProfile,
      area_label:
        typedProfile.location_label ??
        cityProvinceLabel({
          regionName: typedProfile.region_name,
          provinceName: typedProfile.province_name,
          cityName: typedProfile.city_name ?? typedProfile.city,
          barangayName: typedProfile.barangay_name,
        }),
    },
  };
});

export async function requireUser() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.profile.status === "banned") {
    redirect("/banned");
  }

  return currentUser;
}

export async function requireAdmin() {
  const currentUser = await requireUser();

  if (currentUser.profile.role !== "admin") {
    redirect("/dashboard");
  }

  return currentUser;
}
