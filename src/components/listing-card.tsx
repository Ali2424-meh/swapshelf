import { Heart, MapPin, Star } from "lucide-react";
import type { Listing } from "@/lib/constants";

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <article className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
      <div className="relative">
        <div
          className={`flex h-44 items-center justify-center bg-linear-to-br ${listing.imageGradient}`}
        />
        <button
          type="button"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm"
          aria-label="Add to wishlist"
        >
          <Heart className="h-4 w-4 text-gray-400" />
        </button>
        <span className="absolute bottom-3 left-3 rounded-full bg-swapshelf-green px-2.5 py-0.5 text-xs font-medium text-white">
          {listing.category}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900">{listing.title}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted">
          <MapPin className="h-3.5 w-3.5" />
          {listing.distanceKm} km
        </p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-swapshelf-green text-xs font-semibold text-white">
              {listing.ownerInitials}
            </span>
            <div>
              <p className="text-sm font-medium text-gray-900">{listing.ownerName}</p>
              <p className="flex items-center gap-0.5 text-xs text-muted">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {listing.rating}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="rounded-lg border-2 border-swapshelf-green px-3 py-1.5 text-sm font-semibold text-swapshelf-green transition hover:bg-green-50"
          >
            Offer Swap
          </button>
        </div>
      </div>
    </article>
  );
}
