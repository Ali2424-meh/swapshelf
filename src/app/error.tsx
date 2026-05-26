"use client";

import { useEffect } from "react";

export default function RootError({
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
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <section className="w-full max-w-md rounded-3xl bg-card p-8 text-center shadow-sm ring-1 ring-border">
        <h1 className="font-display text-2xl font-semibold text-foreground">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted">The page could not finish loading. Try again in a moment.</p>
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="mt-6 rounded-xl bg-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-dark"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
