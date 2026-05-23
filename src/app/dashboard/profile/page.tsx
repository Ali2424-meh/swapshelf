import { IconStar, IconCheck } from "@/components/icons";

export default function ProfilePage() {
  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Profile & Trust</h1>
        <p className="mt-0.5 text-sm text-muted">Manage your public profile and settings</p>
      </div>

      {/* Profile card */}
      <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green text-xl font-bold text-white shadow-sm">
            AM
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">Alex Morgan</h2>
            <p className="flex items-center gap-1 text-sm text-muted">
              <IconStar className="h-3.5 w-3.5 fill-amber-400 text-amber-400" filled />
              4.9 Trust Score · 12 completed swaps
            </p>
            <p className="mt-1 text-xs text-muted">Member since January 2026</p>
          </div>
          <button className="ml-auto rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-gray-50">
            Edit profile
          </button>
        </div>
      </div>

      {/* Verification */}
      <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border">
        <h3 className="font-display text-base font-semibold text-foreground">Verifications</h3>
        <div className="mt-4 space-y-3">
          {[
            { label: "Email address", verified: true },
            { label: "Phone number",  verified: false },
            { label: "Government ID", verified: false },
          ].map(({ label, verified }) => (
            <div key={label} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-sm">
                <span className={`flex h-5 w-5 items-center justify-center rounded-full ${verified ? "bg-green text-white" : "bg-gray-100 text-muted"}`}>
                  {verified ? <IconCheck className="h-3 w-3" strokeWidth={3} /> : "–"}
                </span>
                <span className={verified ? "text-foreground" : "text-muted"}>{label}</span>
              </div>
              {!verified && (
                <button className="text-xs font-medium text-green hover:underline">Verify</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-foreground">Location & radius</h3>
          <button className="text-sm font-medium text-green hover:underline">Edit</button>
        </div>
        <p className="mt-2 text-sm text-muted">
          Default search radius: <strong className="text-foreground">Within 5 km</strong>
        </p>
      </div>

      {/* Swap history */}
      <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border">
        <h3 className="font-display text-base font-semibold text-foreground">Swap history</h3>
        <p className="mt-2 text-sm text-muted">Your completed swaps and ratings will appear here once you start swapping.</p>
      </div>
    </div>
  );
}
