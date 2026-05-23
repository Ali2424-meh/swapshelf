import Link from "next/link";
import { ListingCard } from "@/components/listing-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { NEARBY_LISTINGS } from "@/lib/constants";

export default function BrowsePage() {
  return (
    <>
      <SiteHeader activeLink="browse" />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900">Browse listings</h1>
        <p className="mt-2 text-muted">Showing items near you. Filters connect in the next phase.</p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {NEARBY_LISTINGS.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-muted">
          <Link href="/" className="text-swapshelf-green hover:underline">
            ← Back to home
          </Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
