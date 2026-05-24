import Link from "next/link";
import { ListingCard } from "@/components/listing-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { IconChevronDown, IconSearch, IconMapPin } from "@/components/icons";
import { RADIUS_OPTIONS } from "@/lib/constants";
import { getCategories, getPublicListings } from "@/lib/data";

type BrowsePageProps = {
  searchParams?: Promise<{
    q?: string;
    category?: string;
    radius?: string;
    sort?: string;
    error?: string;
  }>;
};

function parseRadius(value?: string) {
  const radius = Number(value);
  return Number.isFinite(radius) && radius > 0 ? radius : undefined;
}

function currentPath(params: Awaited<BrowsePageProps["searchParams"]>) {
  const query = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const queryString = query.toString();
  return queryString ? `/browse?${queryString}` : "/browse";
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;
  const radiusKm = parseRadius(params?.radius);
  const [categories, listings] = await Promise.all([
    getCategories(),
    getPublicListings({
      search: params?.q,
      category: params?.category,
      radiusKm,
      sort: params?.sort,
    }),
  ]);
  const returnTo = currentPath(params);

  return (
    <>
      <SiteHeader activeLink="browse" />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold text-foreground">Browse Listings</h1>
            <p className="mt-1 text-sm text-muted">Showing {listings.length} items near you</p>
          </div>
        </div>

        {params?.error && (
          <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {params.error}
          </p>
        )}

        <form action="/browse" className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5 shadow-sm">
            <IconSearch className="h-4 w-4 shrink-0 text-muted" />
            <input
              name="q"
              type="search"
              defaultValue={params?.q ?? ""}
              placeholder="Search listings..."
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 shadow-sm">
            <IconMapPin className="h-4 w-4 shrink-0 text-muted" />
            <select
              name="radius"
              defaultValue={radiusKm ?? RADIUS_OPTIONS[1].value}
              className="cursor-pointer bg-transparent text-sm font-medium text-foreground focus:outline-none"
            >
              {RADIUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <IconChevronDown className="h-3.5 w-3.5 text-muted" />
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 shadow-sm">
            <select
              name="category"
              defaultValue={params?.category ?? ""}
              className="cursor-pointer bg-transparent text-sm font-medium text-foreground focus:outline-none"
            >
              <option value="">All categories</option>
              {categories.map(({ name, slug }) => (
                <option key={slug} value={slug}>
                  {name}
                </option>
              ))}
            </select>
            <IconChevronDown className="h-3.5 w-3.5 text-muted" />
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 shadow-sm">
            <select
              name="sort"
              defaultValue={params?.sort ?? "newest"}
              className="cursor-pointer bg-transparent text-sm font-medium text-foreground focus:outline-none"
            >
              <option value="newest">Newest first</option>
              <option value="closest">Closest first</option>
              <option value="highest-rated">Highest rated</option>
            </select>
            <IconChevronDown className="h-3.5 w-3.5 text-muted" />
          </div>
          <button type="submit" className="rounded-xl bg-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-dark">
            Apply
          </button>
        </form>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          <Link
            href="/browse"
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold ${
              params?.category ? "border border-border bg-card text-muted hover:border-green hover:text-green" : "bg-green text-white"
            }`}
          >
            All
          </Link>
          {categories.map(({ name, slug, emoji }) => (
            <Link
              key={slug}
              href={`/browse?category=${slug}`}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium ${
                params?.category === slug
                  ? "bg-green text-white"
                  : "border border-border bg-card text-muted hover:border-green hover:text-green"
              }`}
            >
              {emoji} {name}
            </Link>
          ))}
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} returnTo={returnTo} />
          ))}
        </div>

        {!listings.length && (
          <div className="mt-8 rounded-2xl bg-card px-6 py-14 text-center shadow-sm ring-1 ring-border">
            <span className="text-5xl">🔎</span>
            <p className="mt-4 font-display text-lg font-semibold text-foreground">No listings found</p>
            <p className="mt-2 text-sm text-muted">Try a different category, radius, or search term.</p>
          </div>
        )}

        <p className="mt-12 text-center text-sm text-muted">
          Showing {listings.length} listing{listings.length === 1 ? "" : "s"} ·{" "}
          <Link href="/" className="text-green hover:underline">
            Back to home
          </Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
