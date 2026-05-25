import { createWishlistAlertAction } from "@/app/auth/actions";
import { FormDropdown } from "@/components/form-dropdown";
import { IconHeart } from "@/components/icons";
import { ListingCard } from "@/components/listing-card";
import { getCategories, getWishlistData } from "@/lib/data";

export default async function WishlistPage() {
  const [wishlist, categories] = await Promise.all([getWishlistData(), getCategories()]);
  const categoryOptions = [
    { value: "", label: "Any category" },
    ...categories
      .filter((category) => category.id)
      .map(({ id, name, emoji }) => ({ value: id!, label: `${emoji} ${name}` })),
  ];

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Wishlist & Alerts</h1>
        <p className="mt-0.5 text-sm text-muted">Items you&apos;re looking for</p>
      </div>

      <form action={createWishlistAlertAction} className="grid gap-3 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border sm:grid-cols-[1fr_auto_auto]">
        <input
          name="query"
          type="text"
          placeholder="Add an alert, e.g. Dune, PS5 controller, Catan..."
          className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-green focus:outline-none"
        />
        <FormDropdown
          name="category_id"
          defaultValue=""
          options={categoryOptions}
          className="relative flex min-w-[180px] items-center rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground transition focus-within:border-green focus-within:ring-2 focus-within:ring-green/20"
        />
        <button className="rounded-xl bg-green px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-dark">Create alert</button>
      </form>

      {wishlist.alerts.length > 0 && (
        <div className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
          <h2 className="font-display text-lg font-semibold text-foreground">Active alerts</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {wishlist.alerts.map((alert) => (
              <span key={alert.id} className="rounded-full bg-green-light px-3 py-1 text-xs font-medium text-green">
                {alert.query} · {alert.radiusKm} km
              </span>
            ))}
          </div>
        </div>
      )}

      {wishlist.savedListings.length ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {wishlist.savedListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} returnTo="/dashboard/wishlist" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-card px-6 py-20 text-center shadow-sm ring-1 ring-border">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-light">
            <IconHeart className="h-8 w-8 text-green" strokeWidth={1.5} />
          </span>
          <h2 className="mt-5 font-display text-xl font-semibold text-foreground">Wishlist is empty</h2>
          <p className="mt-2 max-w-sm text-sm text-muted">
            Save items you want and get notified when similar listings appear nearby.
          </p>
        </div>
      )}
    </div>
  );
}
