import Link from "next/link";
import { IconPlus } from "@/components/icons";

export default function MyListingsPage() {
  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">My Listings</h1>
          <p className="mt-0.5 text-sm text-muted">Items you&apos;ve posted for swap</p>
        </div>
        <Link
          href="/dashboard/listings/new"
          className="inline-flex items-center gap-2 rounded-xl bg-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-dark"
        >
          <IconPlus className="h-4 w-4" />
          Post New Item
        </Link>
      </div>

      <div className="flex flex-col items-center justify-center rounded-2xl bg-card px-6 py-20 text-center shadow-sm ring-1 ring-border">
        <span className="text-6xl">📦</span>
        <h2 className="mt-5 font-display text-xl font-semibold text-foreground">No active listings</h2>
        <p className="mt-2 max-w-sm text-sm text-muted">
          You haven&apos;t posted any items for swap yet. Share something you no longer need!
        </p>
        <Link
          href="/dashboard/listings/new"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-green px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-dark"
        >
          <IconPlus className="h-4 w-4" />
          Post your first item
        </Link>
      </div>
    </div>
  );
}
