import Link from "next/link";
import { notFound } from "next/navigation";
import { archiveListingAction, updateListingAction } from "@/app/auth/actions";
import { FormDropdown } from "@/components/form-dropdown";
import { IconArchive, IconEye } from "@/components/icons";
import { PhilippineLocationSelect } from "@/components/philippine-location-select";
import { PhotoUpload } from "@/components/photo-upload";
import { getCategories, getEditableListing } from "@/lib/data";

type EditListingPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string; message?: string }>;
};

const dropdownClass =
  "relative mt-2 flex w-full items-center rounded-xl border border-border bg-background px-4 py-3 text-foreground transition focus-within:border-green focus-within:ring-2 focus-within:ring-green/20";

export default async function EditListingPage({ params, searchParams }: EditListingPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [listing, categories] = await Promise.all([getEditableListing(id), getCategories()]);

  if (!listing) {
    notFound();
  }

  const categoryOptions = categories
    .filter((category) => category.id)
    .map(({ id: categoryId, name, emoji }) => ({ value: categoryId!, label: `${emoji} ${name}` }));
  const conditionOptions = [
    { value: "like_new", label: "Like New, barely used" },
    { value: "good", label: "Good, some wear and fully functional" },
    { value: "fair", label: "Fair, visible wear and works fine" },
  ];
  const statusOptions = [
    { value: "active", label: "Active and visible" },
    { value: "archived", label: "Archived and hidden" },
  ];
  const newPhotoLimit = Math.max(0, 6 - listing.images.length);

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">Edit Listing</h1>
          <p className="mt-0.5 text-sm text-muted">Update details, photos, and visibility</p>
        </div>
        <Link
          href={`/listings/${listing.id}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-gray-50"
        >
          <IconEye className="h-4 w-4" strokeWidth={1.75} />
          View public page
        </Link>
      </div>

      {query?.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{query.error}</p>
      )}
      {query?.message && (
        <p className="rounded-xl border border-green/20 bg-green-light px-4 py-3 text-sm text-green">{query.message}</p>
      )}

      <form action={updateListingAction} className="space-y-6 rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border sm:p-8">
        <input type="hidden" name="listing_id" value={listing.id} />

        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-foreground">
            Title <span className="font-normal text-orange">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={listing.title}
            className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted focus:border-green focus:outline-none focus:ring-2 focus:ring-green/20"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="category_id" className="block text-sm font-semibold text-foreground">
              Category <span className="font-normal text-orange">*</span>
            </label>
            <FormDropdown
              id="category_id"
              name="category_id"
              options={categoryOptions}
              defaultValue={listing.categoryId}
              className={dropdownClass}
            />
          </div>
          <div>
            <label htmlFor="condition" className="block text-sm font-semibold text-foreground">
              Condition <span className="font-normal text-orange">*</span>
            </label>
            <FormDropdown
              id="condition"
              name="condition"
              options={conditionOptions}
              defaultValue={listing.condition}
              className={dropdownClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-foreground">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={listing.description ?? ""}
            className="mt-2 w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted focus:border-green focus:outline-none focus:ring-2 focus:ring-green/20"
          />
        </div>

        <div>
          <label htmlFor="wants" className="block text-sm font-semibold text-foreground">
            What you want in return <span className="font-normal text-muted">(optional)</span>
          </label>
          <input
            id="wants"
            name="wants"
            type="text"
            defaultValue={listing.wants ?? ""}
            className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted focus:border-green focus:outline-none focus:ring-2 focus:ring-green/20"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground">Swap area</label>
          <div className="mt-2">
            <PhilippineLocationSelect defaultValue={listing.location} />
          </div>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-semibold text-foreground">
            Visibility
          </label>
          <FormDropdown
            id="status"
            name="status"
            options={statusOptions}
            defaultValue={listing.status === "archived" ? "archived" : "active"}
            className={dropdownClass}
          />
        </div>

        <div>
          <h2 className="block text-sm font-semibold text-foreground">Current photos</h2>
          {listing.images.length > 0 ? (
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {listing.images.map((image, index) => (
                <label key={image.id} className="group overflow-hidden rounded-xl bg-background ring-1 ring-border">
                  <span className="relative block aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.publicUrl} alt={image.altText ?? listing.title} className="h-full w-full object-cover" />
                    {index === 0 && (
                      <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
                        Cover
                      </span>
                    )}
                  </span>
                  <span className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted">
                    <input type="checkbox" name="delete_image_ids" value={image.id} className="h-4 w-4 accent-green" />
                    Delete this photo
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <p className="mt-2 rounded-xl bg-background px-4 py-3 text-sm text-muted">No photos yet.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground">
            Add photos <span className="font-normal text-muted">(up to {newPhotoLimit})</span>
          </label>
          <div className="mt-2">
            <PhotoUpload maxFiles={newPhotoLimit} />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
          <Link
            href="/dashboard/listings"
            className="flex items-center justify-center rounded-xl border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-gray-50"
          >
            Back to listings
          </Link>
          <button type="submit" className="flex-1 rounded-xl bg-green px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-dark">
            Save changes
          </button>
        </div>
      </form>

      <form action={archiveListingAction} className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
        <input type="hidden" name="listing_id" value={listing.id} />
        <button className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-gray-50">
          <IconArchive className="h-4 w-4" strokeWidth={1.75} />
          {listing.status === "archived" ? "Reactivate listing" : "Archive listing"}
        </button>
      </form>
    </div>
  );
}
