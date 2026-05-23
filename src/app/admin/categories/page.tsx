import { CATEGORIES } from "@/lib/constants";
import { IconPlus } from "@/components/icons";

export default function AdminCategoriesPage() {
  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">Categories</h1>
          <p className="mt-0.5 text-sm text-muted">Manage item categories and visibility</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-green px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-dark">
          <IconPlus className="h-4 w-4" />
          Add category
        </button>
      </div>
      <div className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Category</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {CATEGORIES.map(({ name, slug, emoji }) => (
              <tr key={slug} className="hover:bg-background/60">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{emoji}</span>
                    <span className="font-medium text-foreground">{name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-muted">{slug}</td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Active</span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-xs font-medium text-muted hover:text-foreground">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
