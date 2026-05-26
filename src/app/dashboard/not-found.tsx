import Link from "next/link";

export default function DashboardNotFound() {
  return (
    <section className="rounded-2xl bg-card p-8 text-center shadow-sm ring-1 ring-border">
      <p className="text-sm font-semibold text-green">404</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-foreground">Dashboard page not found</h1>
      <p className="mt-2 text-sm text-muted">The dashboard item you requested is unavailable.</p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex rounded-xl bg-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-dark"
      >
        Back to dashboard
      </Link>
    </section>
  );
}
