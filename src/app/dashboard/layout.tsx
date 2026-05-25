import { DashboardNav } from "@/components/dashboard-nav";
import { MobileSidebarTrigger } from "@/components/mobile-sidebar";
import { SiteHeader } from "@/components/site-header";
import { AppShell } from "@/components/app-shell";
import { Avatar } from "@/components/avatar";
import { IconMapPin } from "@/components/icons";
import { requireUser } from "@/lib/auth";
import { getConversations, getDashboardCounts, getSwapOffers } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await requireUser();
  const [counts, offers, conversations] = await Promise.all([
    getDashboardCounts(),
    getSwapOffers(),
    getConversations(),
  ]);

  const pendingOffers = offers.filter((o) => o.direction === "incoming" && o.status === "Pending").length;
  const unreadMessages = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Mobile nav trigger */}
      <div className="border-b border-border bg-card px-4 py-2 lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <MobileSidebarTrigger
            displayName={currentUser.profile.display_name}
            initials={currentUser.profile.initials}
            avatarUrl={currentUser.profile.avatar_url}
            areaLabel={currentUser.profile.area_label}
            counts={counts}
            pendingOffers={pendingOffers}
            unreadMessages={unreadMessages}
          />
          <span className="text-sm font-medium text-muted">Dashboard</span>
        </div>
      </div>

      <AppShell className="flex gap-8 py-8">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 lg:fixed lg:left-0 lg:top-16 lg:block lg:h-[calc(100vh-64px)] lg:overflow-y-auto lg:py-6 lg:pl-6">
          {/* Profile card */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <Avatar
                src={currentUser.profile.avatar_url}
                alt={currentUser.profile.display_name}
                initials={currentUser.profile.initials}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-semibold text-foreground">
                  {currentUser.profile.display_name}
                </h2>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                  <IconMapPin className="h-3 w-3 shrink-0" strokeWidth={1.75} />
                  <span className="truncate">{currentUser.profile.area_label ?? "Set your area"}</span>
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-4 flex rounded-xl bg-background p-2.5">
              <div className="flex-1 text-center">
                <p className="text-base font-semibold text-foreground">{counts.listings}</p>
                <p className="text-[11px] text-muted">Listings</p>
              </div>
              <div className="w-px bg-border" />
              <div className="flex-1 text-center">
                <p className="text-base font-semibold text-foreground">{counts.swaps}</p>
                <p className="text-[11px] text-muted">Swaps</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <DashboardNav pendingOffers={pendingOffers} unreadMessages={unreadMessages} />
        </aside>

        <div className="min-w-0 flex-1 lg:ml-64">{children}</div>
      </AppShell>
    </div>
  );
}
