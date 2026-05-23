import Link from "next/link";
import { ADMIN_STATS } from "@/lib/constants";
import { IconTrendingUp, IconAlertCircle, IconExternalLink } from "@/components/icons";

const RECENT_USERS = [
  { id: "1", name: "Maria Santos",   email: "maria@example.com", joined: "2 hours ago",  swaps: 0,  status: "active"   },
  { id: "2", name: "James Reyes",    email: "james@example.com", joined: "5 hours ago",  swaps: 3,  status: "active"   },
  { id: "3", name: "Chloe Tan",      email: "chloe@example.com", joined: "1 day ago",    swaps: 7,  status: "active"   },
  { id: "4", name: "Daniel Ramirez", email: "dan@example.com",   joined: "2 days ago",   swaps: 1,  status: "flagged"  },
  { id: "5", name: "Aisha Patel",    email: "aisha@example.com", joined: "3 days ago",   swaps: 14, status: "active"   },
];

const STATUS_COLORS: Record<string, string> = {
  active:  "bg-green-100 text-green-800",
  flagged: "bg-red-100 text-red-700",
};

export default function AdminDashboardPage() {
  return (
    <div className="animate-fade-up space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Platform Overview</h1>
        <p className="mt-1 text-sm text-muted">Real-time metrics and platform health</p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Users",       value: ADMIN_STATS.totalUsers.toLocaleString(),       growth: ADMIN_STATS.usersGrowth,    icon: "👥" },
          { label: "Active Listings",   value: ADMIN_STATS.activeListings.toLocaleString(),   growth: ADMIN_STATS.listingsGrowth, icon: "📦" },
          { label: "Completed Swaps",   value: ADMIN_STATS.completedSwaps.toLocaleString(),   growth: ADMIN_STATS.swapsGrowth,    icon: "🔄" },
          { label: "Pending Reports",   value: ADMIN_STATS.pendingReports.toString(),          growth: "Needs review",             icon: "⚠️", alert: true },
        ].map(({ label, value, growth, icon, alert }) => (
          <div key={label} className={`rounded-2xl bg-card p-6 shadow-sm ring-1 ${alert ? "ring-red-200" : "ring-border"}`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted">{label}</p>
              <span className="text-xl">{icon}</span>
            </div>
            <p className={`mt-2 font-display text-3xl font-semibold ${alert ? "text-red-600" : "text-foreground"}`}>
              {value}
            </p>
            <p className={`mt-1.5 flex items-center gap-1 text-xs font-medium ${alert ? "text-red-500" : "text-green"}`}>
              {alert ? <IconAlertCircle className="h-3.5 w-3.5" /> : <IconTrendingUp className="h-3.5 w-3.5" />}
              {growth} this month
            </p>
          </div>
        ))}
      </div>

      {/* Recent users table */}
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
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {RECENT_USERS.map(({ id, name, email, joined, swaps, status }) => (
                <tr key={id} className="hover:bg-background/60">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green text-xs font-bold text-white">
                        {name.split(" ").map(n => n[0]).join("")}
                      </span>
                      <div>
                        <p className="font-medium text-foreground">{name}</p>
                        <p className="text-xs text-muted">{email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted">{joined}</td>
                  <td className="px-6 py-4 font-medium text-foreground">{swaps}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[status]}`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-xs font-medium text-green hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
