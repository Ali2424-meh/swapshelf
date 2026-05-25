import Link from "next/link";
import { notFound } from "next/navigation";
import { createOfferAction, createReportAction, toggleSavedListingAction } from "@/app/auth/actions";
import { AppShell } from "@/components/app-shell";
import { FormDropdown } from "@/components/form-dropdown";
import { IconArrowLeftRight, IconHeart, IconMapPin, IconPackageOpen, IconShield, IconStar } from "@/components/icons";
import { PhotoUpload } from "@/components/photo-upload";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth";
import { getListingDetail, getOfferableListings } from "@/lib/data";

type ListingPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string; message?: string }>;
};

export default async function ListingDetailPage({ params, searchParams }: ListingPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [listing, currentUser, offerableListings] = await Promise.all([
    getListingDetail(id),
    getCurrentUser(),
    getOfferableListings(id),
  ]);

  if (!listing) {
    notFound();
  }

  const returnTo = `/listings/${listing.id}`;
  const offerOptions = [
    { value: "", label: "Choose one of your listings..." },
    ...offerableListings.map((item) => ({
      value: item.id,
      label: `${item.title} (${item.condition})`,
    })),
  ];

  return (
    <>
      <SiteHeader />
      <main className="py-8">
        <AppShell>
        <Link href="/browse" className="text-sm font-semibold text-green hover:text-green-dark">
          Back to browse
        </Link>

        {query?.error && (
          <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{query.error}</p>
        )}
        {query?.message && (
          <p className="mt-5 rounded-xl border border-green/20 bg-green-light px-4 py-3 text-sm text-green">{query.message}</p>
        )}

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
          <section className="space-y-5">
            <div className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border">
              {listing.images.length > 0 ? (
                <div className="grid gap-2 p-2 sm:grid-cols-2">
                  {listing.images.map((image, index) => (
                    <div
                      key={image.id}
                      className={`overflow-hidden rounded-xl bg-background ${index === 0 ? "sm:col-span-2" : ""}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.publicUrl}
                        alt={image.altText ?? listing.title}
                        className={`${index === 0 ? "h-80" : "h-44"} w-full object-cover`}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`flex h-80 items-center justify-center bg-gradient-to-br ${listing.imageGradient}`}>
                  <IconPackageOpen className="h-20 w-20 text-white/70" strokeWidth={1.25} />
                </div>
              )}
            </div>

            <article className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-green-light px-3 py-1 text-xs font-semibold text-green">
                  {listing.category}
                </span>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                  {listing.condition}
                </span>
              </div>
              <h1 className="mt-4 font-display text-3xl font-semibold text-foreground">{listing.title}</h1>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
                <IconMapPin className="h-4 w-4" />
                {listing.areaLabel ?? listing.city ?? "Area not set"}
              </p>

              {listing.description && (
                <div className="mt-6">
                  <h2 className="font-display text-lg font-semibold text-foreground">Description</h2>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted">{listing.description}</p>
                </div>
              )}

              {listing.wants && (
                <div className="mt-6 rounded-xl bg-green-light p-4">
                  <h2 className="font-display text-base font-semibold text-green">Owner wants</h2>
                  <p className="mt-1 text-sm text-green/80">{listing.wants}</p>
                </div>
              )}
            </article>
          </section>

          <aside className="space-y-5">
            <section className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
              <div className="flex items-center gap-3">
                {listing.ownerAvatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={listing.ownerAvatarUrl}
                    alt={listing.ownerName}
                    className="h-12 w-12 rounded-full object-cover ring-1 ring-border"
                  />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green text-sm font-bold text-white">
                    {listing.ownerInitials}
                  </span>
                )}
                <div>
                  <p className="font-semibold text-foreground">{listing.ownerName}</p>
                  {listing.reviewCount > 0 && listing.rating != null ? (
                    <p className="flex items-center gap-1 text-sm text-muted">
                      <IconStar className="h-3.5 w-3.5 fill-amber-400 text-amber-400" filled />
                      {listing.rating.toFixed(1)} from {listing.reviewCount} reviews
                    </p>
                  ) : (
                    <p className="text-sm text-muted">No ratings yet</p>
                  )}
                </div>
              </div>
              <p className="mt-4 flex items-center gap-2 rounded-xl bg-background px-3 py-2 text-xs text-muted">
                <IconShield className="h-4 w-4 text-green" strokeWidth={1.75} />
                Always meet in a public place and inspect items before completing a swap.
              </p>
            </section>

            {listing.isOwn ? (
              <section className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
                <h2 className="font-display text-lg font-semibold text-foreground">This is your listing</h2>
                <p className="mt-1 text-sm text-muted">Manage edits and status from your dashboard.</p>
                <Link
                  href={`/dashboard/listings/${listing.id}/edit`}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-dark"
                >
                  Edit listing
                </Link>
              </section>
            ) : (
              <section className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
                <h2 className="font-display text-lg font-semibold text-foreground">Offer a swap</h2>
                {!currentUser ? (
                  <Link
                    href={`/login?next=${encodeURIComponent(returnTo)}`}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-dark"
                  >
                    Log in to offer
                  </Link>
                ) : offerableListings.length === 0 ? (
                  <div className="mt-4 rounded-xl bg-background p-4">
                    <p className="text-sm text-muted">Post an active listing first so you have something to offer.</p>
                    <Link
                      href="/dashboard/listings/new"
                      className="mt-3 inline-flex rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-gray-50"
                    >
                      Post an item
                    </Link>
                  </div>
                ) : (
                  <form action={createOfferAction} className="mt-4 space-y-3">
                    <input type="hidden" name="listing_id" value={listing.id} />
                    <input type="hidden" name="next" value={returnTo} />
                    <FormDropdown
                      name="offered_listing_id"
                      defaultValue=""
                      options={offerOptions}
                      className="relative flex w-full items-center rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground transition focus-within:border-green focus-within:ring-2 focus-within:ring-green/20"
                    />
                    <textarea
                      name="message"
                      rows={3}
                      required
                      placeholder="Write the main offer message..."
                      className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-green focus:outline-none focus:ring-2 focus:ring-green/20"
                    />
                    <textarea
                      name="offer_details"
                      rows={3}
                      placeholder="Describe the item you are offering, inclusions, condition, or trade terms..."
                      className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-green focus:outline-none focus:ring-2 focus:ring-green/20"
                    />
                    <textarea
                      name="meetup_note"
                      rows={2}
                      placeholder="Optional meetup note, preferred area, or availability"
                      className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-green focus:outline-none focus:ring-2 focus:ring-green/20"
                    />
                    <PhotoUpload maxFiles={4} name="offer_photos" />
                    <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-dark">
                      <IconArrowLeftRight className="h-4 w-4" />
                      Send offer
                    </button>
                  </form>
                )}
              </section>
            )}

            {!listing.isOwn && (
              <section className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
                <form action={toggleSavedListingAction}>
                  <input type="hidden" name="listing_id" value={listing.id} />
                  <input type="hidden" name="next" value={returnTo} />
                  <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-gray-50">
                    <IconHeart className={`h-4 w-4 ${listing.isSaved ? "fill-red-500 text-red-500" : ""}`} filled={listing.isSaved} />
                    {listing.isSaved ? "Saved" : "Save listing"}
                  </button>
                </form>
                <form action={createReportAction} className="mt-3">
                  <input type="hidden" name="target_type" value="listing" />
                  <input type="hidden" name="target_id" value={listing.id} />
                  <input type="hidden" name="reason" value="Listing concern" />
                  <input type="hidden" name="next" value={returnTo} />
                  <button className="w-full text-center text-xs font-medium text-muted hover:text-red-600">
                    Report listing
                  </button>
                </form>
              </section>
            )}
          </aside>
        </div>
        </AppShell>
      </main>
      <SiteFooter />
    </>
  );
}
