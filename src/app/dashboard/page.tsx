import Link from "next/link";
import {
  IconArrowLeftRight,
  IconBox,
  IconMapPin,
  IconMessageCircle,
  IconPlus,
  IconTrendingUp,
} from "@/components/icons";
import { getConversations, getDashboardCounts, getDashboardListings, getProfileData, getSwapOffers } from "@/lib/data";

export default async function DashboardOverviewPage() {
  const [counts, listings, offers, conversations, profile] = await Promise.all([
    getDashboardCounts(),
    getDashboardListings(),
    getSwapOffers(),
    getConversations(),
    getProfileData(),
  ]);
  const pendingIncoming = offers.filter((offer) => offer.direction === "incoming" && offer.status === "Pending");
  const activeListings = listings.filter((listing) => listing.status === "active").length;
  const archivedListings = listings.filter((listing) => listing.status === "archived").length;
  const unreadMessages = conversations.reduce((sum, conversation) => sum + conversation.unreadCount, 0);

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted">Your swap activity, listing health, and local area at a glance</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/listings/new"
            className="inline-flex items-center gap-2 rounded-xl bg-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-dark"
          >
            <IconPlus className="h-4 w-4" />
            Post New Item
          </Link>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground hover:bg-gray-50"
          >
            Browse
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={IconBox} label="Listings" value={counts.listings} hint={`${activeListings} active, ${archivedListings} archived`} />
        <StatCard icon={IconArrowLeftRight} label="Pending offers" value={pendingIncoming.length} hint="Waiting for your response" />
        <StatCard icon={IconMessageCircle} label="Unread messages" value={unreadMessages} hint={`${conversations.length} active chats`} />
        <StatCard icon={IconTrendingUp} label="Completed swaps" value={profile.completedSwaps} hint={profile.reviewCount ? `${profile.reviewCount} reviews` : "No ratings yet"} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
        <section className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground">Recent Listings</h2>
              <p className="mt-0.5 text-sm text-muted">Keep your active items fresh and complete.</p>
            </div>
            <Link href="/dashboard/listings" className="text-sm font-semibold text-green hover:underline">
              View all
            </Link>
          </div>

          <div className="mt-4 divide-y divide-border">
            {listings.slice(0, 5).map((listing) => (
              <div key={listing.id} className="flex items-center gap-3 py-3">
                {listing.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={listing.imageUrl} alt="" className="h-12 w-12 rounded-xl object-cover" />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-light">
                    <IconBox className="h-5 w-5 text-green" strokeWidth={1.75} />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{listing.title}</p>
                  <p className="truncate text-xs text-muted">{listing.areaLabel ?? "Area not set"}</p>
                </div>
                <span className="rounded-full bg-green-light px-2.5 py-0.5 text-xs font-semibold text-green">
                  {listing.pendingOfferCount} offers
                </span>
              </div>
            ))}
            {!listings.length && <EmptyLine href="/dashboard/listings/new" label="Post your first listing" />}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
            <div className="flex items-center gap-2">
              <IconMapPin className="h-5 w-5 text-green" strokeWidth={1.75} />
              <h2 className="font-display text-lg font-semibold text-foreground">Swapping Area</h2>
            </div>
            <p className="mt-2 text-sm text-muted">{profile.areaLabel ?? "Choose your area so browse can prioritize nearby listings."}</p>
            <Link href="/dashboard/profile" className="mt-4 inline-flex rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-gray-50">
              Update area
            </Link>
          </section>

          <section className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">Needs Attention</h2>
              <Link href="/dashboard/offers" className="text-sm font-semibold text-green hover:underline">
                Offers
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {pendingIncoming.slice(0, 3).map((offer) => (
                <Link key={offer.id} href="/dashboard/offers" className="block rounded-xl bg-background p-3 hover:bg-green-light">
                  <p className="text-sm font-semibold text-foreground">{offer.listingTitle}</p>
                  <p className="mt-0.5 text-xs text-muted">From {offer.otherPartyName}</p>
                </Link>
              ))}
              {!pendingIncoming.length && <p className="rounded-xl bg-background p-3 text-sm text-muted">No pending incoming offers.</p>}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof IconBox;
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <section className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-light">
          <Icon className="h-5 w-5 text-green" strokeWidth={1.75} />
        </span>
        <span className="font-display text-2xl font-semibold text-foreground">{value}</span>
      </div>
      <p className="mt-4 text-sm font-semibold text-foreground">{label}</p>
      <p className="mt-0.5 text-xs text-muted">{hint}</p>
    </section>
  );
}

function EmptyLine({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="block rounded-xl bg-background p-4 text-center text-sm font-medium text-green hover:bg-green-light">
      {label}
    </Link>
  );
}
