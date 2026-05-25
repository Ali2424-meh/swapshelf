import { cache } from "react";
import { redirect } from "next/navigation";
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
    latitude: number | null;
    longitude: number | null;
    search_radius_km: number;
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
      "display_name, initials, avatar_url, avatar_path, role, status, city, postal_code, latitude, longitude, search_radius_km",
    )
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? null,
    profile: profile as CurrentUser["profile"],
  };
});

export async function requireUser() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.profile.status === "banned") {
    redirect("/login?error=Your account is unavailable.");
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
