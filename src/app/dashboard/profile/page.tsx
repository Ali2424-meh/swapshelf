import { Star } from "lucide-react";

export default function ProfilePage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900">Profile & Trust</h1>
      <div className="mt-8 space-y-6">
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-swapshelf-green text-lg font-bold text-white">
              AM
            </span>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Alex Morgan</h2>
              <p className="flex items-center gap-1 text-sm text-muted">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                4.9 Trust Score · 12 completed swaps
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h3 className="font-semibold text-gray-900">Location & radius</h3>
          <p className="mt-2 text-sm text-muted">
            Default search radius: Within 5 km. Location settings will connect to maps in a
            future update.
          </p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h3 className="font-semibold text-gray-900">Swap history</h3>
          <p className="mt-2 text-sm text-muted">Your completed swaps and ratings will appear here.</p>
        </div>
      </div>
    </>
  );
}
