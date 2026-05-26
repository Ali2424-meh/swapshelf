export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="rounded-2xl bg-card px-6 py-5 text-center shadow-sm ring-1 ring-border">
        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-green border-t-transparent" />
        <p className="mt-3 text-sm font-medium text-muted">Loading SwapShelf...</p>
      </div>
    </main>
  );
}
