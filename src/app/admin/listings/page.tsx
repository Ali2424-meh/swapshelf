export default function AdminListingsPage() {
  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Review Listings</h1>
        <p className="mt-0.5 text-sm text-muted">Flagged and pending listings awaiting moderation</p>
      </div>
      <div className="rounded-2xl bg-card px-6 py-14 text-center shadow-sm ring-1 ring-border">
        <span className="text-5xl">✅</span>
        <p className="mt-4 font-display text-lg font-semibold text-foreground">Queue is clear</p>
        <p className="mt-2 text-sm text-muted">Flagged and pending listings will appear here once the database is connected.</p>
      </div>
    </div>
  );
}
