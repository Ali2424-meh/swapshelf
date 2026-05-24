import { updateProfileAction } from "@/app/auth/actions";
import { IconCheck, IconStar } from "@/components/icons";
import { getProfileData } from "@/lib/data";

type ProfilePageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const [profile, params] = await Promise.all([getProfileData(), searchParams]);

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Profile & Trust</h1>
        <p className="mt-0.5 text-sm text-muted">Manage your public profile and settings</p>
      </div>

      {params?.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{params.error}</p>
      )}
      {params?.message && (
        <p className="rounded-xl border border-green/20 bg-green-light px-4 py-3 text-sm text-green">{params.message}</p>
      )}

      <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green text-xl font-bold text-white shadow-sm">
            {profile.initials}
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">{profile.displayName}</h2>
            <p className="flex items-center gap-1 text-sm text-muted">
              <IconStar className="h-3.5 w-3.5 fill-amber-400 text-amber-400" filled />
              {profile.trustScore.toFixed(1)} Trust Score · {profile.completedSwaps} completed swaps
            </p>
            <p className="mt-1 text-xs text-muted">
              {profile.createdAt ? `Member since ${new Date(profile.createdAt).toLocaleDateString()}` : "Member profile"}
            </p>
          </div>
        </div>
      </div>

      <form action={updateProfileAction} className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border">
        <h3 className="font-display text-base font-semibold text-foreground">Public profile</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="display_name" className="block text-sm font-semibold text-foreground">
              Display name
            </label>
            <input
              id="display_name"
              name="display_name"
              defaultValue={profile.displayName}
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-green focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="search_radius_km" className="block text-sm font-semibold text-foreground">
              Default search radius
            </label>
            <input
              id="search_radius_km"
              name="search_radius_km"
              type="number"
              min={1}
              max={100}
              defaultValue={profile.searchRadiusKm}
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-green focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="city" className="block text-sm font-semibold text-foreground">
              Area
            </label>
            <input
              id="city"
              name="city"
              defaultValue={profile.city ?? ""}
              placeholder="City or neighborhood"
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-green focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="postal_code" className="block text-sm font-semibold text-foreground">
              Postal code
            </label>
            <input
              id="postal_code"
              name="postal_code"
              defaultValue={profile.postalCode ?? ""}
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-green focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="latitude" className="block text-sm font-semibold text-foreground">
              Approx latitude <span className="font-normal text-muted">(optional)</span>
            </label>
            <input
              id="latitude"
              name="latitude"
              type="number"
              step="0.000001"
              defaultValue={profile.latitude ?? ""}
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-green focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="longitude" className="block text-sm font-semibold text-foreground">
              Approx longitude <span className="font-normal text-muted">(optional)</span>
            </label>
            <input
              id="longitude"
              name="longitude"
              type="number"
              step="0.000001"
              defaultValue={profile.longitude ?? ""}
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-green focus:outline-none"
            />
          </div>
        </div>
        <button className="mt-5 rounded-xl bg-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-dark">
          Save profile
        </button>
      </form>

      <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border">
        <h3 className="font-display text-base font-semibold text-foreground">Verifications</h3>
        <div className="mt-4 space-y-3">
          {[
            { label: "Email address", verified: Boolean(profile.email) },
            { label: "Phone number", verified: false },
            { label: "Government ID", verified: false },
          ].map(({ label, verified }) => (
            <div key={label} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-sm">
                <span className={`flex h-5 w-5 items-center justify-center rounded-full ${verified ? "bg-green text-white" : "bg-gray-100 text-muted"}`}>
                  {verified ? <IconCheck className="h-3 w-3" strokeWidth={3} /> : "-"}
                </span>
                <span className={verified ? "text-foreground" : "text-muted"}>{label}</span>
              </div>
              {!verified && <button className="text-xs font-medium text-green hover:underline">Verify</button>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
