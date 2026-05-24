import { createOfferAction, createReportAction, toggleSavedListingAction } from "@/app/auth/actions";
import { IconHeart, IconMapPin, IconStar } from "@/components/icons";
import type { Listing } from "@/lib/constants";

const CONDITION_COLORS: Record<string, string> = {
  "Like New": "bg-green-100 text-green-800",
  "Good":     "bg-amber-100 text-amber-800",
  "Fair":     "bg-orange-100 text-orange-800",
};

export function ListingCard({ listing, returnTo = "/browse" }: { listing: Listing; returnTo?: string }) {
  return (
    <article className="card-hover group overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border">
      <div className="relative">
        {listing.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.imageUrl} alt={listing.title} className="h-44 w-full object-cover" />
        ) : (
          <div className={`flex h-44 items-center justify-center bg-gradient-to-br ${listing.imageGradient}`}>
            <span className="select-none text-4xl opacity-60">{listing.categoryEmoji ?? getCategoryEmoji(listing.category)}</span>
          </div>
        )}
        <form action={toggleSavedListingAction} className="absolute right-3 top-3">
          <input type="hidden" name="listing_id" value={listing.id} />
          <input type="hidden" name="next" value={returnTo} />
          <button
            type="submit"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm hover:bg-white"
            aria-label={listing.isSaved ? "Remove from wishlist" : "Add to wishlist"}
          >
            <IconHeart className={`h-4 w-4 ${listing.isSaved ? "fill-red-500 text-red-500" : "text-muted"}`} filled={listing.isSaved} />
          </button>
        </form>
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
        <h3 className="font-semibold text-foreground group-hover:text-green transition-colors">
          {listing.title}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted">
          <IconMapPin className="h-3.5 w-3.5 shrink-0" />
          {listing.distanceKm} km away
        </p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green text-xs font-semibold text-white">
              {listing.ownerInitials}
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">{listing.ownerName}</p>
              <p className="flex items-center gap-0.5 text-xs text-muted">
                <IconStar className="h-3 w-3 fill-amber-400 text-amber-400" filled />
                {listing.rating}
              </p>
            </div>
          </div>
          <form action={createOfferAction}>
            <input type="hidden" name="listing_id" value={listing.id} />
            <button
              type="submit"
              className="rounded-lg border-2 border-green px-3 py-1.5 text-sm font-semibold text-green transition hover:bg-green hover:text-white"
            >
              Offer Swap
            </button>
          </form>
        </div>
        <form action={createReportAction} className="mt-3 text-right">
          <input type="hidden" name="target_type" value="listing" />
          <input type="hidden" name="target_id" value={listing.id} />
          <input type="hidden" name="reason" value="Listing concern" />
          <input type="hidden" name="next" value={returnTo} />
          <button type="submit" className="text-xs font-medium text-muted hover:text-red-600">
            Report listing
          </button>
        </form>
      </div>
    </article>
  );
}

function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    "Video Games": "🎮", "Books": "📚", "Board Games": "🎲",
    "Tech": "💻", "Craft & Hobby": "✂️", "Music & DVDs": "💿", "Toys": "🧸",
  };
  return map[category] ?? "📦";
}
