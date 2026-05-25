import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { FormDropdown } from "@/components/form-dropdown";
import { IconMapPin, IconSearch } from "@/components/icons";
import { ListingCard } from "@/components/listing-card";
import { PhilippineLocationSelect } from "@/components/philippine-location-select";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { AREA_SCOPE_OPTIONS } from "@/lib/constants";
import { getCategories, getPublicListings } from "@/lib/data";

type BrowsePageProps = {
  searchParams?: Promise<{
    q?: string;
    category?: string;
    area_scope?: string;
    region_code?: string;
    region_name?: string;
    province_code?: string;
    province_name?: string;
    city_code?: string;
    city_name?: string;
    barangay_code?: string;
    barangay_name?: string;
    sort?: string;
    error?: string;
  }>;
};

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
  const [categories, listings] = await Promise.all([
    getCategories(),
    getPublicListings({
      search: params?.q,
      category: params?.category,
      areaScope: params?.area_scope,
      regionCode: params?.region_code,
      provinceCode: params?.province_code,
      cityCode: params?.city_code,
      barangayCode: params?.barangay_code,
      sort: params?.sort,
      limit: 36,
    }),
  ]);
  const returnTo = currentPath(params);
  const activeCategory = params?.category ?? "";
  const dropdownClass =
    "relative flex items-center rounded-xl border border-border bg-card px-3 py-2.5 shadow-sm transition focus-within:border-green focus-within:ring-1 focus-within:ring-green/20";
  const categoryOptions = [
    { value: "", label: "All categories" },
    ...categories.map(({ name, slug, emoji }) => ({ value: slug, label: `${emoji} ${name}` })),
  ];
  const sortOptions = [
    { value: "area", label: "Best area match" },
    { value: "newest", label: "Newest first" },
    { value: "highest-rated", label: "Highest rated" },
  ];

  return (
    <>
      <SiteHeader activeLink="browse" />
      <main className="py-8">
        <AppShell>
          <div className="mb-7">
            <h1 className="font-display text-3xl font-semibold text-foreground">Browse Listings</h1>
            <p className="mt-1 text-sm text-muted">
              {listings.length > 0
                ? `${listings.length} item${listings.length === 1 ? "" : "s"} ranked by your swapping area`
                : "No listings match your filters"}
            </p>
          </div>

          {params?.error && (
            <p className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {params.error}
            </p>
          )}

          <form action="/browse" className="space-y-4 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 focus-within:border-green focus-within:ring-1 focus-within:ring-green/20">
              <IconSearch className="h-4 w-4 shrink-0 text-muted" />
              <input
                name="q"
                type="search"
                defaultValue={params?.q ?? ""}
                placeholder="Search by title, keyword..."
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
              />
            </div>

            <PhilippineLocationSelect
              compact
              defaultValue={{
                regionCode: params?.region_code,
                regionName: params?.region_name,
                provinceCode: params?.province_code,
                provinceName: params?.province_name,
                cityCode: params?.city_code,
                cityName: params?.city_name,
                barangayCode: params?.barangay_code,
                barangayName: params?.barangay_name,
              }}
            />

            <div className="flex flex-wrap items-center gap-2">
              <FormDropdown
                key={`scope-${params?.area_scope ?? "all"}`}
                name="area_scope"
                defaultValue={params?.area_scope ?? "all"}
                options={AREA_SCOPE_OPTIONS}
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
                key={`sort-${params?.sort ?? "area"}`}
                name="sort"
                defaultValue={params?.sort ?? "area"}
                options={sortOptions}
                className={dropdownClass}
              />

              <button
                type="submit"
                className="rounded-xl bg-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-dark"
              >
                Apply
              </button>

              {(params?.q || params?.category || params?.region_code || params?.area_scope || params?.sort) && (
                <Link
                  href="/browse"
                  className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted transition hover:border-foreground hover:text-foreground"
                >
                  Clear
                </Link>
              )}
            </div>
          </form>

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
            {categories.map(({ name, slug }) => (
              <Link
                key={slug}
                href={`/browse?category=${slug}${params?.q ? `&q=${params.q}` : ""}`}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition ${
                  activeCategory === slug
                    ? "bg-green text-white shadow-sm"
                    : "border border-border bg-card text-muted hover:border-green hover:text-green"
                }`}
              >
                {name}
              </Link>
            ))}
          </div>

          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} returnTo={returnTo} />
            ))}
          </div>

          {!listings.length && (
            <div className="mt-6 flex flex-col items-center justify-center rounded-2xl bg-card px-6 py-20 text-center shadow-sm ring-1 ring-border">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-light">
                <IconSearch className="h-8 w-8 text-green" strokeWidth={1.5} />
              </span>
              <p className="mt-4 font-display text-xl font-semibold text-foreground">No listings found</p>
              <p className="mt-2 max-w-sm text-sm text-muted">
                Try all Philippines, a different category, or a simpler search term.
              </p>
              <Link
                href="/browse"
                className="mt-6 rounded-xl border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-gray-50"
              >
                Clear all filters
              </Link>
            </div>
          )}
        </AppShell>
      </main>
      <SiteFooter />
    </>
  );
}
