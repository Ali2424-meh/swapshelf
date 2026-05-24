import Link from "next/link";
import { FormDropdown } from "@/components/form-dropdown";
import { ListingCard } from "@/components/listing-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { IconSearch, IconMapPin } from "@/components/icons";
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
  const qs = query.toString();
  return qs ? `/browse?${qs}` : "/browse";
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
  const activeCategory = params?.category ?? "";
  const dropdownClass =
    "relative flex items-center rounded-xl border border-border bg-card px-3 py-2.5 shadow-sm transition focus-within:border-green focus-within:ring-1 focus-within:ring-green/20";
  const radiusOptions = RADIUS_OPTIONS.map(({ value, label }) => ({ value, label }));
  const categoryOptions = [
    { value: "", label: "All categories" },
    ...categories.map(({ name, slug, emoji }) => ({ value: slug, label: `${emoji} ${name}` })),
  ];
  const sortOptions = [
    { value: "newest", label: "Newest first" },
    { value: "closest", label: "Closest first" },
    { value: "highest-rated", label: "Highest rated" },
  ];

  return (
    <>
      <SiteHeader activeLink="browse" />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">

        {/* Page title */}
        <div className="mb-7">
          <h1 className="font-display text-3xl font-semibold text-foreground">Browse Listings</h1>
          <p className="mt-1 text-sm text-muted">
            {listings.length > 0
              ? `${listings.length} item${listings.length === 1 ? "" : "s"} near you`
              : "No listings match your filters"}
          </p>
        </div>

        {params?.error && (
          <p className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {params.error}
          </p>
        )}

        {/* ── Filter bar ── */}
        <form action="/browse" className="space-y-3">
          {/* Row 1: Search */}
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm focus-within:border-green focus-within:ring-1 focus-within:ring-green/20 transition">
            <IconSearch className="h-4 w-4 shrink-0 text-muted" />
            <input
              name="q"
              type="search"
              defaultValue={params?.q ?? ""}
              placeholder="Search by title, keyword..."
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
            />
          </div>

          {/* Row 2: Filter pills + submit */}
          <div className="flex flex-wrap items-center gap-2">
            <FormDropdown
              key={`radius-${radiusKm ?? RADIUS_OPTIONS[1].value}`}
              name="radius"
              defaultValue={radiusKm ?? RADIUS_OPTIONS[1].value}
              options={radiusOptions}
              icon={<IconMapPin className="mr-2 h-3.5 w-3.5 shrink-0 text-muted" />}
              className={dropdownClass}
            />
            <FormDropdown
              key={`category-${activeCategory}`}
              name="category"
              defaultValue={activeCategory}
              options={categoryOptions}
              className={dropdownClass}
            />
            <FormDropdown
              key={`sort-${params?.sort ?? "newest"}`}
              name="sort"
              defaultValue={params?.sort ?? "newest"}
              options={sortOptions}
              className={dropdownClass}
            />

            <button
              type="submit"
              className="rounded-xl bg-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-dark"
            >
              Apply
            </button>

            {/* Clear filters — only show when active */}
            {(params?.q || params?.category || params?.radius || (params?.sort && params.sort !== "newest")) && (
              <Link
                href="/browse"
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted hover:border-foreground hover:text-foreground transition"
              >
                Clear
              </Link>
            )}
          </div>
        </form>

        {/* ── Category chips (quick filter) ── */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link
            href={params?.q ? `/browse?q=${params.q}` : "/browse"}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              !activeCategory
                ? "bg-green text-white shadow-sm"
                : "border border-border bg-card text-muted hover:border-green hover:text-green"
            }`}
          >
            All
          </Link>
          {categories.map(({ name, slug, emoji }) => (
            <Link
              key={slug}
              href={`/browse?category=${slug}${params?.q ? `&q=${params.q}` : ""}`}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition ${
                activeCategory === slug
                  ? "bg-green text-white shadow-sm"
                  : "border border-border bg-card text-muted hover:border-green hover:text-green"
              }`}
            >
              {emoji} {name}
            </Link>
          ))}
        </div>

        {/* ── Listings grid ── */}
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} returnTo={returnTo} />
          ))}
        </div>

        {!listings.length && (
          <div className="mt-6 flex flex-col items-center justify-center rounded-2xl bg-card px-6 py-20 text-center shadow-sm ring-1 ring-border">
            <span className="text-5xl">🔎</span>
            <p className="mt-4 font-display text-xl font-semibold text-foreground">No listings found</p>
            <p className="mt-2 max-w-sm text-sm text-muted">
              Try a wider radius, a different category, or a simpler search term.
            </p>
            <Link
              href="/browse"
              className="mt-6 rounded-xl border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-gray-50"
            >
              Clear all filters
            </Link>
          </div>
        )}

        {listings.length > 0 && (
          <p className="mt-10 text-center text-sm text-muted">
            Showing {listings.length} listing{listings.length === 1 ? "" : "s"} ·{" "}
            <Link href="/" className="text-green hover:underline">Back to home</Link>
          </p>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
