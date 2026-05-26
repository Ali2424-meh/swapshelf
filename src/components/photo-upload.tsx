"use client";

import { useEffect, useRef, useState } from "react";
import { IconUpload, IconX } from "@/components/icons";

type SelectedPhoto = {
  id: string;
  file: File;
  previewUrl: string;
};

type PhotoUploadProps = {
  maxFiles?: number;
  name?: string;
};

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

export function PhotoUpload({ maxFiles = 6, name = "photos" }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const photosRef = useRef<SelectedPhoto[]>([]);
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const transfer = new DataTransfer();
    photos.forEach((photo) => transfer.items.add(photo.file));
    input.files = transfer.files;
  }, [photos]);

  useEffect(() => {
    return () => {
      photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    };
  }, []);

  function addFiles(files: FileList | null) {
    if (!files || files.length === 0 || maxFiles <= 0) return;
    setError(null);

    const next = [...photos];

    for (const file of Array.from(files)) {
      if (next.length >= maxFiles) {
        setError(`You can upload up to ${maxFiles} photo${maxFiles === 1 ? "" : "s"}.`);
        break;
      }

      if (!ALLOWED.has(file.type)) {
        setError("Only PNG, JPG, WEBP, or GIF files are allowed.");
        continue;
      }

      if (file.size > MAX_BYTES) {
        setError("Each photo must be 10 MB or smaller.");
        continue;
      }

      next.push({
        id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    setPhotos(next);
  }

  function removePhoto(id: string) {
    setPhotos((current) => {
      const removed = current.find((photo) => photo.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return current.filter((photo) => photo.id !== id);
    });
  }

  const canAddMore = photos.length < maxFiles;

  return (
    <div className="space-y-3">
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {photos.map((photo, index) => (
            <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100 ring-1 ring-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.previewUrl} alt={photo.file.name} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(photo.id)}
                className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white shadow-sm transition hover:bg-black sm:h-5 sm:w-5 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                aria-label="Remove photo"
              >
                <IconX className="h-3 w-3" strokeWidth={2.5} />
              </button>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}

      <input
        ref={inputRef}
        name={name}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple
        className="sr-only"
        onChange={(event) => addFiles(event.currentTarget.files)}
      />

      {canAddMore ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            addFiles(event.dataTransfer.files);
          }}
          className="flex w-full cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border bg-background px-6 py-8 text-center transition hover:border-green hover:bg-green-light"
        >
          <IconUpload className="h-8 w-8 text-muted" strokeWidth={1.5} />
          <span>
            <span className="block text-sm font-medium text-foreground">
              {photos.length === 0 ? "Click or drag photos here" : `Add more (${maxFiles - photos.length} remaining)`}
            </span>
            <span className="mt-0.5 block text-xs text-muted">
              PNG, JPG, WEBP, GIF. Up to 10 MB each.
            </span>
          </span>
        </button>
      ) : (
        <p className="rounded-xl bg-background px-4 py-3 text-xs text-muted">
          Photo limit reached. Remove an existing photo before adding more.
        </p>
      )}
    </div>
  );
}
