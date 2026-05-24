import { updateReportStatusAction } from "@/app/auth/actions";
import { getAdminReports, getAdminStats } from "@/lib/data";

export default async function AdminReportsPage() {
  const [reports, stats] = await Promise.all([getAdminReports(), getAdminStats()]);

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Reports & Disputes</h1>
        <p className="mt-0.5 text-sm text-muted">Community reports requiring your attention</p>
      </div>

      <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-5">
        <p className="text-sm font-semibold text-red-700">⚠️ {stats.pendingReports} open reports need review</p>
        <p className="mt-1 text-xs text-red-600">Resolve, dismiss, or keep reports under review.</p>
      </div>

      <div className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Report</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Reporter</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-background/60">
                <td className="px-6 py-4">
                  <p className="font-medium text-foreground">{report.reason}</p>
                  <p className="text-xs text-muted">
                    {report.targetType} · {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                  {report.details && <p className="mt-1 text-xs text-muted">{report.details}</p>}
                </td>
                <td className="px-6 py-4 text-muted">{report.reporterName}</td>
                <td className="px-6 py-4 capitalize text-muted">{report.status}</td>
                <td className="px-6 py-4">
                  <form action={updateReportStatusAction} className="flex items-center gap-2">
                    <input type="hidden" name="report_id" value={report.id} />
                    <select name="status" defaultValue={report.status} className="rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground">
                      <option value="open">Open</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="resolved">Resolved</option>
                      <option value="dismissed">Dismissed</option>
                    </select>
                    <button className="rounded-lg bg-green px-2.5 py-1 text-xs font-semibold text-white hover:bg-green-dark">
                      Save
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {!reports.length && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-muted">
                  Reports queue is clear.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
