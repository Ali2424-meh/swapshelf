"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="rounded-2xl bg-card p-8 text-center shadow-sm ring-1 ring-border">
      <h1 className="font-display text-2xl font-semibold text-foreground">Admin page could not load</h1>
      <p className="mt-2 text-sm text-muted">Try again after a moment.</p>
      <button
        type="button"
        onClick={() => unstable_retry()}
        className="mt-6 rounded-xl bg-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-dark"
      >
        Try again
      </button>
    </section>
  );
}
