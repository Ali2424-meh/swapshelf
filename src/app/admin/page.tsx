import Link from "next/link";
import { IconTrendingUp, IconAlertCircle, IconExternalLink } from "@/components/icons";
import { getAdminStats, getAdminUsers } from "@/lib/data";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  flagged: "bg-red-100 text-red-700",
  banned: "bg-stone-200 text-stone-700",
};

export default async function AdminDashboardPage() {
  const [stats, users] = await Promise.all([getAdminStats(), getAdminUsers()]);
  const recentUsers = users.slice(0, 5);

  return (
    <div className="animate-fade-up space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Platform Overview</h1>
        <p className="mt-1 text-sm text-muted">Live metrics from Supabase</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Users", value: stats.totalUsers.toLocaleString(), growth: "All time", icon: "👥" },
          { label: "Active Listings", value: stats.activeListings.toLocaleString(), growth: "Available now", icon: "📦" },
          { label: "Completed Swaps", value: stats.completedSwaps.toLocaleString(), growth: "All time", icon: "🔄" },
          { label: "Pending Reports", value: stats.pendingReports.toString(), growth: "Needs review", icon: "⚠️", alert: true },
        ].map(({ label, value, growth, icon, alert }) => (
          <div key={label} className={`rounded-2xl bg-card p-6 shadow-sm ring-1 ${alert ? "ring-red-200" : "ring-border"}`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted">{label}</p>
              <span className="text-xl">{icon}</span>
            </div>
            <p className={`mt-2 font-display text-3xl font-semibold ${alert ? "text-red-600" : "text-foreground"}`}>{value}</p>
            <p className={`mt-1.5 flex items-center gap-1 text-xs font-medium ${alert ? "text-red-500" : "text-green"}`}>
              {alert ? <IconAlertCircle className="h-3.5 w-3.5" /> : <IconTrendingUp className="h-3.5 w-3.5" />}
              {growth}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-card shadow-sm ring-1 ring-border">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-display font-semibold text-foreground">Recent Users</h2>
          <Link href="/admin/users" className="flex items-center gap-1 text-sm font-medium text-green hover:underline">
            View all <IconExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Swaps</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-background/60">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-medium text-foreground">{user.completedSwaps}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[user.status] ?? STATUS_COLORS.active}`}>
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!recentUsers.length && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-muted">
                    No users yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
