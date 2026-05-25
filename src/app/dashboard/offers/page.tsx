import Link from "next/link";
import { updateOfferStatusAction } from "@/app/auth/actions";
import { IconArrowLeftRight } from "@/components/icons";
import { getSwapOffers } from "@/lib/data";

type SwapOffersPageProps = {
  searchParams?: Promise<{ error?: string; message?: string }>;
};

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-800",
  Accepted: "bg-green-100 text-green-800",
  Declined: "bg-red-100 text-red-700",
  Cancelled: "bg-gray-100 text-gray-600",
  Completed: "bg-blue-100 text-blue-800",
};

export default async function SwapOffersPage({ searchParams }: SwapOffersPageProps) {
  const [offers, params] = await Promise.all([getSwapOffers(), searchParams]);
  const incoming = offers.filter((offer) => offer.direction === "incoming");
  const outgoing = offers.filter((offer) => offer.direction === "outgoing");

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Swap Offers</h1>
        <p className="mt-0.5 text-sm text-muted">Incoming and outgoing swap requests</p>
      </div>

      {params?.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{params.error}</p>
      )}
      {params?.message && (
        <p className="rounded-xl border border-green/20 bg-green-light px-4 py-3 text-sm text-green">{params.message}</p>
      )}

      {offers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-card px-6 py-20 text-center shadow-sm ring-1 ring-border">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-light">
            <IconArrowLeftRight className="h-8 w-8 text-green" strokeWidth={1.5} />
          </span>
          <h2 className="mt-5 font-display text-xl font-semibold text-foreground">No swap offers yet</h2>
          <p className="mt-2 max-w-sm text-sm text-muted">
            Browse listings nearby and send your first offer, or post an item and wait for offers to come to you.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/browse" className="rounded-xl bg-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-dark">
              Browse listings
            </Link>
            <Link
              href="/dashboard/listings/new"
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-gray-50"
            >
              Post an item
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {incoming.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-lg font-semibold text-foreground">
                Incoming
                <span className="ml-2 rounded-full bg-green-light px-2 py-0.5 text-xs font-semibold text-green">
                  {incoming.length}
                </span>
              </h2>
              <div className="space-y-3">
                {incoming.map((offer) => (
                  <OfferCard key={offer.id} offer={offer} />
                ))}
              </div>
            </section>
          )}
          {outgoing.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-lg font-semibold text-foreground">
                Outgoing
                <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                  {outgoing.length}
                </span>
              </h2>
              <div className="space-y-3">
                {outgoing.map((offer) => (
                  <OfferCard key={offer.id} offer={offer} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function OfferCard({ offer }: { offer: Awaited<ReturnType<typeof getSwapOffers>>[number] }) {
  return (
    <article className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {offer.otherPartyAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={offer.otherPartyAvatarUrl}
              alt={offer.otherPartyName}
              className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-border"
            />
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green text-sm font-bold text-white">
              {offer.otherPartyInitials}
            </span>
          )}
          <div>
            <p className="font-semibold text-foreground">{offer.listingTitle}</p>
            <p className="text-sm text-muted">
              {offer.direction === "incoming" ? "From" : "To"} {offer.otherPartyName} ·{" "}
              {new Date(offer.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </p>
            {offer.offeredListingTitle && (
              <p className="mt-0.5 text-xs text-muted">Offered: {offer.offeredListingTitle}</p>
            )}
          </div>
        </div>
        <span className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[offer.status] ?? STATUS_STYLES.Pending}`}>
          {offer.status}
        </span>
      </div>

      {offer.message && (
        <p className="mt-4 rounded-xl bg-background p-3 text-sm leading-relaxed text-muted">
          &ldquo;{offer.message}&rdquo;
        </p>
      )}
      {(offer.offerDetails || offer.meetupNote || offer.images.length > 0) && (
        <div className="mt-4 rounded-xl bg-background p-3">
          {offer.offerDetails && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Offer details</p>
              <p className="mt-1 whitespace-pre-line text-sm text-foreground">{offer.offerDetails}</p>
            </div>
          )}
          {offer.meetupNote && (
            <div className="mt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Meetup note</p>
              <p className="mt-1 whitespace-pre-line text-sm text-foreground">{offer.meetupNote}</p>
            </div>
          )}
          {offer.images.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {offer.images.map((image) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={image.id} src={image.publicUrl} alt={image.altText ?? "Offer photo"} className="aspect-square rounded-lg object-cover" />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {offer.direction === "incoming" && offer.status === "Pending" && (
          <>
            <form action={updateOfferStatusAction}>
              <input type="hidden" name="offer_id" value={offer.id} />
              <input type="hidden" name="status" value="accepted" />
              <button className="rounded-lg bg-green px-4 py-2 text-sm font-semibold text-white hover:bg-green-dark">
                Accept
              </button>
            </form>
            <form action={updateOfferStatusAction}>
              <input type="hidden" name="offer_id" value={offer.id} />
              <input type="hidden" name="status" value="declined" />
              <button className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-gray-50">
                Decline
              </button>
            </form>
          </>
        )}
        {offer.direction === "outgoing" && offer.status === "Pending" && (
          <form action={updateOfferStatusAction}>
            <input type="hidden" name="offer_id" value={offer.id} />
            <input type="hidden" name="status" value="cancelled" />
            <button className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-gray-50">
              Cancel offer
            </button>
          </form>
        )}
        {offer.status === "Accepted" && (
          <>
            <Link
              href={offer.conversationId ? `/dashboard/messages/${offer.conversationId}` : "/dashboard/messages"}
              className="rounded-lg bg-green px-4 py-2 text-sm font-semibold text-white hover:bg-green-dark"
            >
              Open chat
            </Link>
            <form action={updateOfferStatusAction}>
              <input type="hidden" name="offer_id" value={offer.id} />
              <input type="hidden" name="status" value="completed" />
              <button className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-gray-50">
                Mark completed
              </button>
            </form>
          </>
        )}
      </div>
    </article>
  );
}
