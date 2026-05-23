import { IconSearch, IconChevronDown } from "@/components/icons";

export default function AdminUsersPage() {
  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">Manage Users</h1>
          <p className="mt-0.5 text-sm text-muted">Search, review, and moderate user accounts</p>
        </div>
        <button className="rounded-xl bg-green px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-dark">
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5">
          <IconSearch className="h-4 w-4 shrink-0 text-muted" />
          <input
            type="search" placeholder="Search by name or email…"
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5">
          <select className="bg-transparent text-sm text-foreground focus:outline-none">
            <option>All statuses</option>
            <option>Active</option>
            <option>Flagged</option>
            <option>Banned</option>
          </select>
          <IconChevronDown className="h-3.5 w-3.5 text-muted" />
        </div>
      </div>

      <div className="rounded-2xl bg-card px-6 py-14 text-center shadow-sm ring-1 ring-border">
        <span className="text-5xl">🔌</span>
        <p className="mt-4 font-display text-lg font-semibold text-foreground">Connect to database</p>
        <p className="mt-2 text-sm text-muted">User management table loads from Supabase once the database is configured.</p>
      </div>
    </div>
  );
}
