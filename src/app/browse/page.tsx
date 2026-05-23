import Link from "next/link";
import { ListingCard } from "@/components/listing-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { IconChevronDown, IconSearch, IconMapPin } from "@/components/icons";
import { CATEGORIES, NEARBY_LISTINGS, RADIUS_OPTIONS } from "@/lib/constants";

export default function BrowsePage() {
  return (
    <>
      <SiteHeader activeLink="browse" />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* Page header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold text-foreground">Browse Listings</h1>
            <p className="mt-1 text-sm text-muted">Showing {NEARBY_LISTINGS.length} items near you</p>
          </div>
        </div>

        {/* Filters row */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5 shadow-sm">
            <IconSearch className="h-4 w-4 shrink-0 text-muted" />
            <input
              type="search"
              placeholder="Search listings..."
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 shadow-sm">
            <IconMapPin className="h-4 w-4 shrink-0 text-muted" />
            <select className="cursor-pointer bg-transparent text-sm font-medium text-foreground focus:outline-none">
              {RADIUS_OPTIONS.map((opt) => <option key={opt}>{opt}</option>)}
            </select>
            <IconChevronDown className="h-3.5 w-3.5 text-muted" />
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 shadow-sm">
            <select className="cursor-pointer bg-transparent text-sm font-medium text-foreground focus:outline-none">
              <option>All categories</option>
              {CATEGORIES.map(({ name }) => <option key={name}>{name}</option>)}
            </select>
            <IconChevronDown className="h-3.5 w-3.5 text-muted" />
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 shadow-sm">
            <select className="cursor-pointer bg-transparent text-sm font-medium text-foreground focus:outline-none">
              <option>Newest first</option>
              <option>Closest first</option>
              <option>Highest rated</option>
            </select>
            <IconChevronDown className="h-3.5 w-3.5 text-muted" />
          </div>
        </div>

        {/* Category chips */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          <button className="shrink-0 rounded-full bg-green px-4 py-1.5 text-xs font-semibold text-white">All</button>
          {CATEGORIES.map(({ name, emoji }) => (
            <button key={name} className="shrink-0 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted hover:border-green hover:text-green">
              {emoji} {name}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {NEARBY_LISTINGS.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-muted">
          Showing all {NEARBY_LISTINGS.length} listings ·{" "}
          <Link href="/" className="text-green hover:underline">Back to home</Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
