import { ADMIN_STATS } from "@/lib/constants";

export default function AdminReportsPage() {
  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Reports & Disputes</h1>
        <p className="mt-0.5 text-sm text-muted">Community reports requiring your attention</p>
      </div>

      <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-5">
        <p className="text-sm font-semibold text-red-700">
          ⚠️ {ADMIN_STATS.pendingReports} open reports need review
        </p>
        <p className="mt-1 text-xs text-red-600">Dispute resolution tools will be available once the database is connected.</p>
      </div>

      <div className="rounded-2xl bg-card px-6 py-14 text-center shadow-sm ring-1 ring-border">
        <span className="text-5xl">🛡️</span>
        <p className="mt-4 font-display text-lg font-semibold text-foreground">Reports queue</p>
        <p className="mt-2 text-sm text-muted">Reports submitted by users will appear here. Connect Supabase to enable full moderation tools.</p>
      </div>
    </div>
  );
}
