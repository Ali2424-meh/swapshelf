import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ListingCard } from "@/components/listing-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { IconPackageOpen, IconSearch } from "@/components/icons";
import { RADIUS_OPTIONS } from "@/lib/constants";
import { RadiusSelect } from "@/components/radius-select";
import { getCategories, getPublicListings, getPublicStats } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, listings, stats] = await Promise.all([
    getCategories(),
    getPublicListings({ limit: 6 }),
    getPublicStats(),
  ]);

  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative bg-green px-4 py-20 text-center text-white sm:py-28">
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, #fff 0%, transparent 50%), radial-gradient(circle at 80% 20%, #fff 0%, transparent 40%)",
            }}
          />
          <div className="relative">
            <span className="inline-block rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
              🌿 Free to join · No money needed
            </span>
            <h1 className="font-display mx-auto mt-5 max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              Trade what you have.
              <br />
              <span className="text-amber-300">Get what you love.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-lg text-green-100">
              Join your local community to swap books, games, and more — no cash required.
            </p>

            {/* Search bar — fixed: appearance-none on select removes native arrow */}
            <form
              action="/browse"
              className="relative z-10 mx-auto mt-10 flex max-w-2xl flex-col rounded-2xl bg-white shadow-xl sm:flex-row sm:items-center"
            >
              <div className="flex flex-1 items-center gap-3 px-5 py-3.5">
                <IconSearch className="h-5 w-5 shrink-0 text-muted" />
                <input
                  name="q"
                  type="search"
                  placeholder="Search books, games, tech..."
                  className="w-full bg-transparent text-foreground placeholder:text-muted focus:outline-none"
                />
              </div>
              <div className="hidden h-8 w-px bg-border sm:block" />
              <RadiusSelect defaultValue={RADIUS_OPTIONS[1].value} />
              <button
                type="submit"
                className="m-1.5 rounded-xl bg-orange px-7 py-3 font-semibold text-white transition hover:bg-orange-hover"
              >
                Search
              </button>
            </form>
          </div>
        </section>

        {/* Stats bar */}
        <section className="border-b border-border bg-card">
          <AppShell className="flex divide-x divide-border">
            {[
              { label: "Active listings",   value: stats.activeListings.toLocaleString()   },
              { label: "Community members", value: stats.communityMembers.toLocaleString() },
              { label: "Completed swaps",   value: stats.completedSwaps.toLocaleString()   },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-1 flex-col items-center py-5 text-center">
                <span className="font-display text-2xl font-semibold text-green">{value}</span>
                <span className="mt-0.5 text-xs text-muted">{label}</span>
              </div>
            ))}
          </AppShell>
        </section>

        {/* Categories */}
        <AppShell className="py-14">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground">Browse Categories</h2>
              <p className="mt-1 text-sm text-muted">Find what you&apos;re looking for</p>
            </div>
            <Link href="/browse" className="text-sm font-semibold text-green hover:text-green-dark">
              View all →
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {categories.map(({ name, slug, emoji }) => (
              <Link
                key={slug}
                href={`/browse?category=${slug}`}
                className="card-hover group flex flex-col items-center gap-3 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border"
              >
                <span className="text-3xl">{emoji}</span>
                <span className="text-center text-xs font-semibold text-foreground group-hover:text-green">
                  {name}
                </span>
              </Link>
            ))}
          </div>
        </AppShell>

        {/* Listings */}
        <AppShell className="pb-20">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground">Newly Listed Nearby</h2>
              <p className="mt-1 text-sm text-muted">Fresh items from your community</p>
            </div>
            <Link href="/browse" className="text-sm font-semibold text-green hover:text-green-dark">
              View all →
            </Link>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {listings.map((listing, i) => (
              <div key={listing.id} className={`animate-fade-up animate-fade-up-${Math.min(i + 1, 6)}`}>
                <ListingCard listing={listing} returnTo="/" />
              </div>
            ))}
          </div>
          {!listings.length && (
            <div className="mt-6 rounded-2xl bg-card px-6 py-14 text-center shadow-sm ring-1 ring-border">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-light">
                <IconPackageOpen className="h-8 w-8 text-green" strokeWidth={1.5} />
              </span>
              <p className="mt-4 font-display text-lg font-semibold text-foreground">No listings yet</p>
              <p className="mt-2 text-sm text-muted">Be the first to list something in your area!</p>
            </div>
          )}
        </AppShell>

        {/* CTA */}
        <section className="mx-4 mb-20 overflow-hidden rounded-3xl bg-foreground px-6 py-14 text-center text-white sm:mx-6 sm:py-16">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Ready to start swapping?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-gray-400">
            Join thousands of locals trading items they love. It&apos;s free, safe, and easy.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="rounded-xl bg-green px-8 py-3.5 font-semibold text-white shadow-sm hover:bg-green-dark"
            >
              Create free account
            </Link>
            <Link
              href="/how-it-works"
              className="rounded-xl border border-white/20 bg-white/10 px-8 py-3.5 font-semibold text-white hover:bg-white/20"
            >
              How it works
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
