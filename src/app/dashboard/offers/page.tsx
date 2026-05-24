import { updateOfferStatusAction } from "@/app/auth/actions";
import { getSwapOffers } from "@/lib/data";

const statusColors: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-800",
  Accepted: "bg-green-100 text-green-800",
  Declined: "bg-red-100 text-red-700",
  Cancelled: "bg-gray-100 text-gray-700",
  Completed: "bg-blue-100 text-blue-700",
};

export default async function SwapOffersPage() {
  const offers = await getSwapOffers();

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Swap Offers</h1>
        <p className="mt-0.5 text-sm text-muted">Incoming and outgoing swap requests</p>
      </div>

      {offers.length ? (
        <div className="space-y-3">
          {offers.map((offer) => (
            <article key={offer.id} className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green text-sm font-bold text-white">
                    {offer.otherPartyInitials}
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">{offer.listingTitle}</p>
                    <p className="text-sm text-muted">
                      {offer.direction === "incoming" ? "From" : "To"} {offer.otherPartyName} ·{" "}
                      {new Date(offer.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[offer.status] ?? statusColors.Pending}`}>
                  {offer.status}
                </span>
              </div>
              {offer.message && <p className="mt-4 rounded-xl bg-background p-3 text-sm text-muted">{offer.message}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                {offer.direction === "incoming" && offer.status === "Pending" && (
                  <>
                    <form action={updateOfferStatusAction}>
                      <input type="hidden" name="offer_id" value={offer.id} />
                      <input type="hidden" name="status" value="accepted" />
                      <button className="rounded-lg bg-green px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-dark">
                        Accept
                      </button>
                    </form>
                    <form action={updateOfferStatusAction}>
                      <input type="hidden" name="offer_id" value={offer.id} />
                      <input type="hidden" name="status" value="declined" />
                      <button className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-gray-50">
                        Decline
                      </button>
                    </form>
                  </>
                )}
                {offer.direction === "outgoing" && offer.status === "Pending" && (
                  <form action={updateOfferStatusAction}>
                    <input type="hidden" name="offer_id" value={offer.id} />
                    <input type="hidden" name="status" value="cancelled" />
                    <button className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-gray-50">
                      Cancel
                    </button>
                  </form>
                )}
                {offer.status === "Accepted" && (
                  <form action={updateOfferStatusAction}>
                    <input type="hidden" name="offer_id" value={offer.id} />
                    <input type="hidden" name="status" value="completed" />
                    <button className="rounded-lg bg-green px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-dark">
                      Mark completed
                    </button>
                  </form>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-card px-6 py-20 text-center shadow-sm ring-1 ring-border">
          <span className="text-6xl">🔄</span>
          <h2 className="mt-5 font-display text-xl font-semibold text-foreground">No pending offers</h2>
          <p className="mt-2 max-w-sm text-sm text-muted">
            When someone offers a swap on your listings, or you send one, it will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
