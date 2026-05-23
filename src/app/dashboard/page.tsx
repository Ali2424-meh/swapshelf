import Link from "next/link";
import { PackageOpen } from "lucide-react";

export default function MyListingsPage() {
  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
        <Link
          href="/dashboard/listings/new"
          className="inline-flex items-center justify-center rounded-lg bg-swapshelf-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-swapshelf-green-dark"
        >
          + Post New Item
        </Link>
      </div>
      <div className="mt-8 flex flex-col items-center justify-center rounded-xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-gray-100">
        <PackageOpen className="h-16 w-16 text-gray-300" strokeWidth={1} />
        <h2 className="mt-4 text-lg font-semibold text-gray-900">No active listings</h2>
        <p className="mt-2 max-w-sm text-sm text-muted">
          You haven&apos;t posted any items for swap yet.
        </p>
        <Link
          href="/dashboard/listings/new"
          className="mt-4 text-sm font-semibold text-swapshelf-green hover:underline"
        >
          Post your first item
        </Link>
      </div>
    </>
  );
}
