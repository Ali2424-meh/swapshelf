import { updateUserStatusAction } from "@/app/auth/actions";
import { getAdminUsers } from "@/lib/data";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  flagged: "bg-red-100 text-red-700",
  banned: "bg-stone-200 text-stone-700",
};

export default async function AdminUsersPage() {
  const users = await getAdminUsers();

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">Manage Users</h1>
          <p className="mt-0.5 text-sm text-muted">Review and moderate user accounts</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">User</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Role</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Swaps</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Moderate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-background/60">
                <td className="px-6 py-4">
                  <p className="font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted">{user.email}</p>
                </td>
                <td className="px-6 py-4 capitalize text-muted">{user.role}</td>
                <td className="px-6 py-4 font-medium text-foreground">{user.completedSwaps}</td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[user.status] ?? STATUS_COLORS.active}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <form action={updateUserStatusAction} className="flex items-center gap-2">
                    <input type="hidden" name="user_id" value={user.id} />
                    <select name="status" defaultValue={user.status} className="rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground">
                      <option value="active">Active</option>
                      <option value="flagged">Flagged</option>
                      <option value="banned">Banned</option>
                    </select>
                    <button className="rounded-lg bg-green px-2.5 py-1 text-xs font-semibold text-white hover:bg-green-dark">
                      Save
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {!users.length && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-muted">
                  No users yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
