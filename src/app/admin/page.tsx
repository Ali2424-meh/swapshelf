import Link from "next/link";
import { ADMIN_STATS } from "@/lib/constants";

export default function AdminDashboardPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <p className="text-sm font-medium text-muted">Total Users</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {ADMIN_STATS.totalUsers.toLocaleString()}
          </p>
          <p className="mt-2 text-sm font-medium text-swapshelf-green">
            ↑ {ADMIN_STATS.usersGrowth} this month
          </p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <p className="text-sm font-medium text-muted">Active Listings</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {ADMIN_STATS.activeListings.toLocaleString()}
          </p>
          <p className="mt-2 text-sm font-medium text-swapshelf-green">
            ↑ {ADMIN_STATS.listingsGrowth} this month
          </p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <p className="text-sm font-medium text-muted">Pending Reports</p>
          <p className="mt-2 text-3xl font-bold text-red-600">{ADMIN_STATS.pendingReports}</p>
          <p className="mt-2 text-sm font-medium text-red-600">Needs review</p>
        </div>
      </div>
      <div className="mt-8 rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-semibold text-gray-900">Recent Users</h2>
          <Link
            href="/admin/users"
            className="text-sm font-medium text-swapshelf-green hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="px-6 py-12 text-center text-sm text-muted">
          Data table for user management will load here.
        </div>
      </div>
    </>
  );
}
