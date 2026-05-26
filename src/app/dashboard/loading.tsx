export default function DashboardLoading() {
  return (
    <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border">
      <div className="h-6 w-40 animate-pulse rounded-lg bg-background" />
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-28 animate-pulse rounded-xl bg-background" />
        ))}
      </div>
    </div>
  );
}
