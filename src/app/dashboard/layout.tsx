import { DashboardNav } from "@/components/dashboard-nav";
import { SiteHeader } from "@/components/site-header";
import { AppShell } from "@/components/app-shell";
import { IconMapPin } from "@/components/icons";
import { requireUser } from "@/lib/auth";
import { getDashboardCounts } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await requireUser();
  const counts = await getDashboardCounts();

  return (
    <div className="min-h-screen bg-background">
      {/* SiteHeader now reads session itself — no rightAction needed */}
      <SiteHeader />
      <AppShell className="flex gap-6 py-8">
        {/* Sidebar */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
            <div className="flex flex-col items-center text-center">
              {currentUser.profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentUser.profile.avatar_url}
                  alt={currentUser.profile.display_name}
                  className="h-16 w-16 rounded-2xl object-cover shadow-sm ring-1 ring-border"
                />
              ) : (
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green text-xl font-bold text-white shadow-sm">
                  {currentUser.profile.initials}
                </span>
              )}
              <h2 className="mt-3 font-display text-lg font-semibold text-foreground">{currentUser.profile.display_name}</h2>
              <p className="mt-1 flex max-w-full items-center gap-1 text-sm text-muted">
                <IconMapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                <span className="truncate">{currentUser.profile.area_label ?? "Area not set"}</span>
              </p>
              <div className="mt-3 flex gap-4 text-center">
                <div>
                  <p className="text-sm font-semibold text-foreground">{counts.listings}</p>
                  <p className="text-xs text-muted">Listings</p>
                </div>
                <div className="w-px bg-border" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{counts.swaps}</p>
                  <p className="text-xs text-muted">Swaps</p>
                </div>
              </div>
            </div>
            <DashboardNav />
          </div>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </AppShell>
    </div>
  );
}
