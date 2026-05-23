import Link from "next/link";
import { IconUpload } from "@/components/icons";
import { CATEGORIES } from "@/lib/constants";

export default function NewListingPage() {
  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Post New Item</h1>
        <p className="mt-0.5 text-sm text-muted">Share something you no longer need</p>
      </div>

      <form className="space-y-6 rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border sm:p-8">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-foreground">
            Title <span className="text-orange font-normal">*</span>
          </label>
          <input
            id="title" name="title" type="text" required
            placeholder="e.g. The Last of Us Part II (PS4) — Complete"
            className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted focus:border-green focus:outline-none focus:ring-2 focus:ring-green/20"
          />
        </div>

        {/* Category + Condition */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-foreground">
              Category <span className="text-orange font-normal">*</span>
            </label>
            <select
              id="category" name="category"
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:border-green focus:outline-none"
            >
              <option value="">Select a category…</option>
              {CATEGORIES.map(({ name }) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="condition" className="block text-sm font-semibold text-foreground">
              Condition <span className="text-orange font-normal">*</span>
            </label>
            <select
              id="condition" name="condition"
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:border-green focus:outline-none"
            >
              <option value="">Select condition…</option>
              <option value="like-new">Like New — barely used</option>
              <option value="good">Good — some wear, fully functional</option>
              <option value="fair">Fair — visible wear, works fine</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-foreground">
            Description
          </label>
          <textarea
            id="description" name="description" rows={4}
            placeholder="Describe the item — condition details, platform, what's included, etc."
            className="mt-2 w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted focus:border-green focus:outline-none focus:ring-2 focus:ring-green/20"
          />
        </div>

        {/* What you'd like in return */}
        <div>
          <label htmlFor="wants" className="block text-sm font-semibold text-foreground">
            What you&apos;d like in return <span className="font-normal text-muted">(optional)</span>
          </label>
          <input
            id="wants" name="wants" type="text"
            placeholder="e.g. Open to any book swap, PS4 games, board games…"
            className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted focus:border-green focus:outline-none focus:ring-2 focus:ring-green/20"
          />
        </div>

        {/* Photos */}
        <div>
          <label className="block text-sm font-semibold text-foreground">Photos</label>
          <label
            htmlFor="photos"
            className="mt-2 flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border bg-background px-6 py-10 text-center hover:border-green hover:bg-green-light transition"
          >
            <IconUpload className="h-8 w-8 text-muted" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-medium text-foreground">Click to upload photos</p>
              <p className="mt-0.5 text-xs text-muted">PNG, JPG, WEBP up to 10 MB each</p>
            </div>
            <input id="photos" name="photos" type="file" accept="image/*" multiple className="sr-only" />
          </label>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
          <Link
            href="/dashboard"
            className="flex items-center justify-center rounded-xl border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="flex-1 rounded-xl bg-green px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-dark"
          >
            Publish listing
          </button>
        </div>
      </form>
    </div>
  );
}
