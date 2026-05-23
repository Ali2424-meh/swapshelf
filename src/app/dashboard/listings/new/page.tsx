import Link from "next/link";

export default function NewListingPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900">Post New Item</h1>
      <form className="mt-8 space-y-5 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-900">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder="e.g. The Last of Us Part II (PS4)"
            className="mt-2 w-full rounded-lg border border-border px-4 py-2.5 focus:border-swapshelf-green focus:outline-none focus:ring-2 focus:ring-green-100"
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-semibold text-gray-900">
            Category
          </label>
          <select
            id="category"
            name="category"
            className="mt-2 w-full rounded-lg border border-border px-4 py-2.5 focus:border-swapshelf-green focus:outline-none"
          >
            <option>Books</option>
            <option>Video Games</option>
            <option>Board Games</option>
            <option>Toys & Collectibles</option>
            <option>Music & DVDs</option>
            <option>Tech Accessories</option>
            <option>Craft & Hobby</option>
          </select>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-900">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="mt-2 w-full rounded-lg border border-border px-4 py-2.5 focus:border-swapshelf-green focus:outline-none focus:ring-2 focus:ring-green-100"
            placeholder="Condition, platform, included items..."
          />
        </div>
        <div>
          <label htmlFor="photos" className="block text-sm font-semibold text-gray-900">
            Photos
          </label>
          <input
            id="photos"
            name="photos"
            type="file"
            accept="image/*"
            multiple
            className="mt-2 w-full text-sm text-muted"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded-lg bg-swapshelf-green px-6 py-2.5 text-sm font-semibold text-white hover:bg-swapshelf-green-dark"
          >
            Publish listing
          </button>
          <Link
            href="/dashboard"
            className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}
