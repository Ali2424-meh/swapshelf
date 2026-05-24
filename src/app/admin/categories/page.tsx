import { createCategoryAction, updateCategoryAction } from "@/app/auth/actions";
import { IconPlus } from "@/components/icons";
import { getCategories } from "@/lib/data";

export default async function AdminCategoriesPage() {
  const categories = await getCategories(true);

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Categories</h1>
        <p className="mt-0.5 text-sm text-muted">Manage item categories and visibility</p>
      </div>

      <form action={createCategoryAction} className="grid gap-3 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border sm:grid-cols-[auto_1fr_auto_auto]">
        <input
          name="emoji"
          aria-label="Emoji"
          placeholder="📦"
          maxLength={8}
          className="w-20 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-green focus:outline-none"
        />
        <input
          name="name"
          placeholder="New category name"
          className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-green focus:outline-none"
        />
        <input
          name="sort_order"
          type="number"
          placeholder="Order"
          className="w-28 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-green focus:outline-none"
        />
        <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-green px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-dark">
          <IconPlus className="h-4 w-4" />
          Add category
        </button>
      </form>

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
            {categories.map(({ id, name, slug, emoji, active }) => (
              <tr key={slug} className="hover:bg-background/60">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{emoji}</span>
                    <span className="font-medium text-foreground">{name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-muted">{slug}</td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${active ? "bg-green-100 text-green-800" : "bg-stone-200 text-stone-700"}`}>
                    {active ? "Active" : "Hidden"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {id && (
                    <form action={updateCategoryAction} className="inline-flex">
                      <input type="hidden" name="category_id" value={id} />
                      <input type="hidden" name="active" value={active ? "false" : "true"} />
                      <button className="text-xs font-medium text-muted hover:text-foreground">
                        {active ? "Hide" : "Activate"}
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
