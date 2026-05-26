export default function AdminLoading() {
  return (
    <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border">
      <div className="h-6 w-44 animate-pulse rounded-lg bg-background" />
      <div className="mt-6 space-y-3">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-14 animate-pulse rounded-xl bg-background" />
        ))}
      </div>
    </div>
  );
}
