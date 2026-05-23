import { CATEGORIES } from "@/lib/constants";

export default function AdminCategoriesPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
      <div className="mt-8 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
        <ul className="divide-y divide-border">
          {CATEGORIES.map(({ name, slug }) => (
            <li
              key={slug}
              className="flex items-center justify-between px-6 py-4 text-sm"
            >
              <span className="font-medium text-gray-900">{name}</span>
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-swapshelf-green-dark">
                Active
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
