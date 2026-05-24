import { updateListingStatusAction } from "@/app/auth/actions";
import { FormDropdown } from "@/components/form-dropdown";
import { getAdminListings } from "@/lib/data";

const LISTING_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "flagged", label: "Flagged" },
  { value: "swapped", label: "Swapped" },
  { value: "archived", label: "Archived" },
];

export default async function AdminListingsPage() {
  const listings = await getAdminListings();

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Review Listings</h1>
        <p className="mt-0.5 text-sm text-muted">Moderate active, flagged, and archived listings</p>
      </div>

      <div className="rounded-2xl bg-card shadow-sm ring-1 ring-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Listing</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Owner</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Category</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Moderate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {listings.map((listing) => (
              <tr key={listing.id} className="hover:bg-background/60">
                <td className="px-6 py-4">
                  <p className="font-medium text-foreground">{listing.title}</p>
                  <p className="text-xs text-muted">{listing.condition} · {new Date(listing.createdAt).toLocaleDateString()}</p>
                </td>
                <td className="px-6 py-4 text-muted">{listing.ownerName}</td>
                <td className="px-6 py-4 text-muted">{listing.category}</td>
                <td className="px-6 py-4 capitalize text-muted">{listing.status}</td>
                <td className="px-6 py-4">
                  <form action={updateListingStatusAction} className="flex items-center gap-2">
                    <input type="hidden" name="listing_id" value={listing.id} />
                    <FormDropdown
                      name="status"
                      defaultValue={listing.status}
                      options={LISTING_STATUS_OPTIONS}
                      className="relative flex min-w-[112px] items-center rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground transition focus-within:border-green focus-within:ring-1 focus-within:ring-green/20"
                    />
                    <button className="rounded-lg bg-green px-2.5 py-1 text-xs font-semibold text-white hover:bg-green-dark">
                      Save
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {!listings.length && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-muted">
                  Queue is clear.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
