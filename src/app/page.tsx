import { ChevronDown, MapPin, Search } from "lucide-react";
import Link from "next/link";
import { ListingCard } from "@/components/listing-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CATEGORIES, NEARBY_LISTINGS, RADIUS_OPTIONS } from "@/lib/constants";

export default function HomePage() {
  return (
    <>
      <SiteHeader activeLink="browse" />
      <main>
        <section className="bg-swapshelf-green px-4 py-16 text-center text-white sm:py-20">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Trade what you have. Get what you love.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-green-50">
            Join your local community to swap books, games, and more.
          </p>
          <form className="mx-auto mt-8 flex max-w-3xl flex-col gap-2 rounded-full bg-white p-2 shadow-lg sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-2 px-4 py-2">
              <Search className="h-5 w-5 shrink-0 text-gray-400" />
              <input
                type="search"
                placeholder="Search for items, categories..."
                className="w-full bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none"
              />
            </div>
            <div className="hidden h-8 w-px bg-gray-200 sm:block" />
            <div className="flex items-center gap-2 border-t border-gray-100 px-4 py-2 sm:border-t-0">
              <MapPin className="h-5 w-5 shrink-0 text-gray-400" />
              <select
                defaultValue={RADIUS_OPTIONS[0]}
                className="cursor-pointer bg-transparent text-sm font-medium text-gray-700 focus:outline-none"
              >
                {RADIUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
            <button
              type="submit"
              className="rounded-full bg-swapshelf-orange px-8 py-3 font-semibold text-white transition hover:bg-swapshelf-orange-hover sm:py-2.5"
            >
              Search
            </button>
          </form>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="text-xl font-bold text-gray-900">Browse Categories</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
            {CATEGORIES.map(({ name, slug, icon: Icon }) => (
              <Link
                key={slug}
                href={`/browse?category=${slug}`}
                className="flex flex-col items-center gap-3 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md"
              >
                <Icon className="h-8 w-8 text-swapshelf-green" strokeWidth={1.5} />
                <span className="text-center text-sm font-semibold text-gray-900">
                  {name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Newly Listed Nearby</h2>
            <Link
              href="/browse"
              className="text-sm font-semibold text-swapshelf-green hover:text-swapshelf-green-dark"
            >
              View all
            </Link>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {NEARBY_LISTINGS.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
