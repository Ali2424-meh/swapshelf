import Link from "next/link";
import { createReportAction, toggleSavedListingAction } from "@/app/auth/actions";
import { IconHeart, IconMapPin, IconStar } from "@/components/icons";
import type { Listing } from "@/lib/constants";

const CONDITION_COLORS: Record<string, string> = {
  "Like New": "bg-green-100 text-green-800",
  Good: "bg-amber-100 text-amber-800",
  Fair: "bg-orange-100 text-orange-800",
};

export function ListingCard({ listing, returnTo = "/browse" }: { listing: Listing; returnTo?: string }) {
  const isOwn = listing.isOwn === true;

  return (
    <article className="card-hover group overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border">
      <div className="relative">
        {listing.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.imageUrl} alt={listing.title} className="h-44 w-full object-cover" />
        ) : (
          <div className={`flex h-44 items-center justify-center bg-gradient-to-br ${listing.imageGradient}`}>
            <span className="select-none text-4xl opacity-60">{listing.categoryEmoji ?? "📦"}</span>
          </div>
        )}

        {!isOwn && (
          <form action={toggleSavedListingAction} className="absolute right-3 top-3">
            <input type="hidden" name="listing_id" value={listing.id} />
            <input type="hidden" name="next" value={returnTo} />
            <button
              type="submit"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm hover:bg-white"
              aria-label={listing.isSaved ? "Remove from wishlist" : "Add to wishlist"}
            >
              <IconHeart
                className={`h-4 w-4 ${listing.isSaved ? "fill-red-500 text-red-500" : "text-muted"}`}
                filled={listing.isSaved}
              />
            </button>
          </form>
        )}

        {isOwn && (
          <span className="absolute right-3 top-3 rounded-full bg-green px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm">
            Yours
          </span>
        )}

        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          <span className="rounded-full bg-black/50 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
            {listing.category}
          </span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${CONDITION_COLORS[listing.condition]}`}>
            {listing.condition}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-foreground transition-colors group-hover:text-green">
          <Link href={`/listings/${listing.id}`}>{listing.title}</Link>
        </h3>

        <p className="mt-1 flex items-center gap-1 text-sm text-muted">
          <IconMapPin className="h-3.5 w-3.5 shrink-0" />
          {listing.distanceKm != null ? `${listing.distanceKm.toFixed(1)} km away` : "Nearby"}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {listing.ownerAvatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={listing.ownerAvatarUrl}
                alt={listing.ownerName}
                className="h-8 w-8 rounded-full object-cover ring-1 ring-border"
              />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green text-xs font-semibold text-white">
                {listing.ownerInitials}
              </span>
            )}
            <div>
              <p className="text-sm font-medium text-foreground">{listing.ownerName}</p>
              <p className="flex items-center gap-0.5 text-xs text-muted">
                <IconStar className="h-3 w-3 fill-amber-400 text-amber-400" filled />
                {listing.rating.toFixed(1)}
              </p>
            </div>
          </div>

          {isOwn ? (
            <Link
              href={`/dashboard/listings/${listing.id}/edit`}
              className="rounded-lg border-2 border-border px-3 py-1.5 text-sm font-medium text-muted transition hover:border-green hover:text-green"
            >
              Manage
            </Link>
          ) : (
            <Link
              href={`/listings/${listing.id}`}
              className="rounded-lg border-2 border-green px-3 py-1.5 text-sm font-semibold text-green transition hover:bg-green hover:text-white"
            >
              Offer Swap
            </Link>
          )}
        </div>

        {!isOwn && (
          <form action={createReportAction} className="mt-3 text-right">
            <input type="hidden" name="target_type" value="listing" />
            <input type="hidden" name="target_id" value={listing.id} />
            <input type="hidden" name="reason" value="Listing concern" />
            <input type="hidden" name="next" value={returnTo} />
            <button type="submit" className="text-xs font-medium text-muted hover:text-red-600">
              Report listing
            </button>
          </form>
        )}
      </div>
    </article>
  );
}
