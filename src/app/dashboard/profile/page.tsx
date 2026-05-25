import Link from "next/link";
import { updateProfileAction } from "@/app/auth/actions";
import { AvatarUpload } from "@/components/avatar-upload";
import { IconArrowLeftRight, IconCheck, IconShield, IconStar } from "@/components/icons";
import { PhilippineLocationSelect } from "@/components/philippine-location-select";
import { getProfileData } from "@/lib/data";

type ProfilePageProps = {
  searchParams?: Promise<{ error?: string; message?: string }>;
};

const TRUST_TIERS = [
  { min: 0, label: "New member", color: "text-gray-500", bg: "bg-gray-100" },
  { min: 3, label: "Trusted", color: "text-amber-700", bg: "bg-amber-100" },
  { min: 4, label: "Well trusted", color: "text-green", bg: "bg-green-100" },
  { min: 4.8, label: "Top swapper", color: "text-green", bg: "bg-green-100" },
];

function getTrustTier(score: number) {
  return [...TRUST_TIERS].reverse().find((tier) => score >= tier.min) ?? TRUST_TIERS[0];
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const [profile, params] = await Promise.all([getProfileData(), searchParams]);
  const tier = profile.reviewCount > 0 ? getTrustTier(profile.trustScore) : TRUST_TIERS[0];

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Profile & Settings</h1>
        <p className="mt-0.5 text-sm text-muted">Manage your public profile, location, and verifications</p>
      </div>

      {params?.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{params.error}</p>
      )}
      {params?.message && (
        <p className="rounded-xl border border-green/20 bg-green-light px-4 py-3 text-sm text-green">{params.message}</p>
      )}

      <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <AvatarUpload initials={profile.initials} currentAvatarUrl={profile.avatarUrl} />
          <div className="flex-1">
            <h2 className="font-display text-xl font-semibold text-foreground">{profile.displayName}</h2>
            <p className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted">
              {profile.reviewCount > 0 ? (
                <span className="flex items-center gap-1">
                  <IconStar className="h-3.5 w-3.5 fill-amber-400 text-amber-400" filled />
                  {profile.trustScore.toFixed(1)} from {profile.reviewCount} reviews
                </span>
              ) : (
                <span>No ratings yet</span>
              )}
              <span className="flex items-center gap-1">
                <IconArrowLeftRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                {profile.completedSwaps} completed swaps
              </span>
            </p>
            <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${tier.bg} ${tier.color}`}>
              {tier.label}
            </span>
            {profile.createdAt && (
              <p className="mt-2 text-xs text-muted">
                Member since{" "}
                {new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
              </p>
            )}
          </div>
        </div>
        <p className="mt-3 text-xs text-muted">Hover over your photo to change it. PNG, JPG, or WEBP. Max 5 MB.</p>
      </div>

      <form action={updateProfileAction} className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border">
        <h3 className="font-display text-base font-semibold text-foreground">Public info</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="display_name" className="block text-sm font-semibold text-foreground">
              Display name
            </label>
            <input
              id="display_name"
              name="display_name"
              defaultValue={profile.displayName}
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-green focus:outline-none focus:ring-2 focus:ring-green/20"
            />
          </div>
          <div>
            <label htmlFor="search_radius_km" className="block text-sm font-semibold text-foreground">
              Legacy search radius (km)
            </label>
            <input
              id="search_radius_km"
              name="search_radius_km"
              type="number"
              min={1}
              max={100}
              defaultValue={profile.searchRadiusKm}
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-green focus:outline-none focus:ring-2 focus:ring-green/20"
            />
          </div>
        </div>

        <div className="mt-5">
          <label className="block text-sm font-semibold text-foreground">Your swapping area</label>
          <div className="mt-2">
            <PhilippineLocationSelect defaultValue={profile.location} requiredCity />
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 rounded-xl bg-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-dark"
        >
          Save changes
        </button>
      </form>

      <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border">
        <div className="flex items-center gap-2">
          <IconShield className="h-5 w-5 text-green" strokeWidth={1.75} />
          <h3 className="font-display text-base font-semibold text-foreground">Identity & Verifications</h3>
        </div>
        <p className="mt-1 text-xs text-muted">
          Verifications build trust with the community. Verified members swap more.
        </p>
        <div className="mt-4 space-y-3">
          {[
            { label: "Email address", hint: profile.email ?? "", verified: Boolean(profile.email) },
            { label: "Phone number", hint: "Not yet verified", verified: false },
            { label: "Government ID", hint: "Not yet verified", verified: false },
          ].map(({ label, hint, verified }) => (
            <div key={label} className="flex items-center justify-between rounded-xl bg-background px-4 py-3">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${
                    verified ? "bg-green text-white" : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {verified ? <IconCheck className="h-3.5 w-3.5" strokeWidth={2.5} /> : <span className="text-xs font-bold">?</span>}
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted">{verified ? hint : "Not yet verified"}</p>
                </div>
              </div>
              {!verified && (
                <button
                  type="button"
                  className="rounded-lg border border-green px-3 py-1.5 text-xs font-semibold text-green transition hover:bg-green hover:text-white"
                >
                  Verify
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-green-light p-6">
        <h3 className="font-display text-base font-semibold text-green">How trust score works</h3>
        <p className="mt-2 text-sm text-green/80">
          Your public rating appears after you receive real reviews from completed swaps. Until then, your profile
          is shown as a new member.
        </p>
        <Link href="/how-it-works" className="mt-3 inline-block text-sm font-semibold text-green underline underline-offset-2">
          Learn more
        </Link>
      </div>
    </div>
  );
}
