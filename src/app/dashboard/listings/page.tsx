import Link from "next/link";
import { archiveListingAction } from "@/app/auth/actions";
import { IconArchive, IconArrowLeftRight, IconEye, IconPackageOpen, IconPencil, IconPlus } from "@/components/icons";
import { getDashboardListings } from "@/lib/data";

type MyListingsPageProps = {
  searchParams?: Promise<{ error?: string; message?: string }>;
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  pending: "bg-amber-100 text-amber-800",
  flagged: "bg-red-100 text-red-700",
  swapped: "bg-blue-100 text-blue-800",
  archived: "bg-gray-100 text-gray-600",
};

function statusLabel(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function MyListingsPage({ searchParams }: MyListingsPageProps) {
  const [listings, params] = await Promise.all([getDashboardListings(), searchParams]);

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">My Listings</h1>
          <p className="mt-0.5 text-sm text-muted">Items you have posted for swap</p>
        </div>
        <Link
          href="/dashboard/listings/new"
          className="inline-flex items-center gap-2 rounded-xl bg-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-dark"
        >
          <IconPlus className="h-4 w-4" />
          Post New Item
        </Link>
      </div>

      {params?.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{params.error}</p>
      )}
      {params?.message && (
        <p className="rounded-xl border border-green/20 bg-green-light px-4 py-3 text-sm text-green">{params.message}</p>
      )}

      {listings.length ? (
        <div className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Item</th>
                <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted md:table-cell">
                  Area
                </th>
                <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted lg:table-cell">
                  Condition
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Actions</th>
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
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-light">
                          <IconPackageOpen className="h-5 w-5 text-green" strokeWidth={1.75} />
                        </span>
                      )}
                      <div>
                        <p className="font-medium text-foreground">{listing.title}</p>
                        <p className="text-xs text-muted">
                          Listed{" "}
                          {new Date(listing.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden max-w-56 px-5 py-4 text-muted md:table-cell">
                    <span className="line-clamp-2">{listing.areaLabel ?? "Area not set"}</span>
                  </td>
                  <td className="hidden px-5 py-4 text-muted lg:table-cell">{listing.condition}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_STYLES[listing.status] ?? STATUS_STYLES.active
                      }`}
                    >
                      {statusLabel(listing.status)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        href={`/listings/${listing.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-foreground"
                      >
                        <IconEye className="h-3 w-3" strokeWidth={2} />
                        View
                      </Link>
                      <Link
                        href={`/dashboard/listings/${listing.id}/edit`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-green hover:underline"
                      >
                        <IconPencil className="h-3 w-3" strokeWidth={2} />
                        Edit
                      </Link>
                      <Link href="/dashboard/offers" className="inline-flex items-center gap-1 text-xs font-medium text-green hover:underline">
                        <IconArrowLeftRight className="h-3 w-3" strokeWidth={2} />
                        Offers{listing.pendingOfferCount ? ` (${listing.pendingOfferCount})` : ""}
                      </Link>
                      <form action={archiveListingAction}>
                        <input type="hidden" name="listing_id" value={listing.id} />
                        <button className="inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-foreground">
                          <IconArchive className="h-3 w-3" strokeWidth={2} />
                          {listing.status === "archived" ? "Reactivate" : "Archive"}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-card px-6 py-20 text-center shadow-sm ring-1 ring-border">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-light">
            <IconPackageOpen className="h-8 w-8 text-green" strokeWidth={1.5} />
          </span>
          <h2 className="mt-5 font-display text-xl font-semibold text-foreground">No listings yet</h2>
          <p className="mt-2 max-w-sm text-sm text-muted">
            Share something you no longer need and let someone nearby offer a swap for it.
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
