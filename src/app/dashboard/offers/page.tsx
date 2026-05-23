import { ArrowLeftRight } from "lucide-react";

export default function SwapOffersPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900">Swap Offers</h1>
      <div className="mt-8 flex flex-col items-center justify-center rounded-xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-gray-100">
        <ArrowLeftRight className="h-16 w-16 text-gray-300" strokeWidth={1} />
        <h2 className="mt-4 text-lg font-semibold text-gray-900">No pending offers</h2>
        <p className="mt-2 max-w-sm text-sm text-muted">
          When someone offers a swap on your listings, it will appear here.
        </p>
      </div>
    </>
  );
}
