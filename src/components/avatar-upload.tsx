"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { updateAvatarAction } from "@/app/auth/actions";
import { IconUpload } from "@/components/icons";

type AvatarUploadProps = {
  initials: string;
  currentAvatarUrl?: string | null;
};

export function AvatarUpload({ initials, currentAvatarUrl }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const displayUrl = preview ?? currentAvatarUrl;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setSubmitting(true);
    formRef.current?.requestSubmit();
  }

  return (
    <form ref={formRef} action={updateAvatarAction} className="group relative">
      <div className="relative h-20 w-20">
        {displayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayUrl}
            alt="Profile picture"
            className="h-20 w-20 rounded-2xl object-cover ring-2 ring-border"
          />
        ) : (
          <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-green text-2xl font-bold text-white shadow-sm">
            {initials}
          </span>
        )}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={submitting}
          className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-2xl bg-black/50 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100 disabled:cursor-wait"
          aria-label="Change profile picture"
        >
          {submitting ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <IconUpload className="h-5 w-5 text-white" strokeWidth={2} />
              <span className="text-[10px] font-semibold text-white">Change</span>
            </>
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        name="avatar"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={handleChange}
      />
    </form>
  );
}
