import Link from "next/link";
import { IconPlus } from "@/components/icons";
import { getDashboardListings } from "@/lib/data";

export default async function MyListingsPage() {
  const listings = await getDashboardListings();

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

      {listings.length ? (
        <div className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Item</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Category</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Condition</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {listings.map((listing) => (
                <tr key={listing.id} className="hover:bg-background/60">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {listing.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={listing.imageUrl} alt="" className="h-12 w-12 rounded-xl object-cover" />
                      ) : (
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-light text-xl">
                          {listing.emoji}
                        </span>
                      )}
                      <div>
                        <p className="font-medium text-foreground">{listing.title}</p>
                        <p className="text-xs text-muted">Listed {new Date(listing.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted">{listing.category}</td>
                  <td className="px-5 py-4 text-muted">{listing.condition}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      {listing.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-card px-6 py-20 text-center shadow-sm ring-1 ring-border">
          <span className="text-6xl">📦</span>
          <h2 className="mt-5 font-display text-xl font-semibold text-foreground">No active listings</h2>
          <p className="mt-2 max-w-sm text-sm text-muted">
            You haven&apos;t posted any items for swap yet. Share something you no longer need.
          </p>
          <Link
            href="/dashboard/listings/new"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-green px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-dark"
          >
            <IconPlus className="h-4 w-4" />
            Post your first item
          </Link>
        </div>
      )}
    </div>
  );
}
