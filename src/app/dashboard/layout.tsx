import Link from "next/link";
import { DashboardNav } from "@/components/dashboard-nav";
import { SiteHeader } from "@/components/site-header";
import { IconStar, IconBell } from "@/components/icons";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        rightAction={
          <div className="flex items-center gap-2">
            <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted hover:text-foreground">
              <IconBell className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-gray-50"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green text-xs font-bold text-white">
                AM
              </span>
              Alex M.
            </Link>
          </div>
        }
      />
      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-8 sm:px-6">
        {/* Sidebar */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
            <div className="flex flex-col items-center text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green text-xl font-bold text-white shadow-sm">
                AM
              </span>
              <h2 className="mt-3 font-display text-lg font-semibold text-foreground">Alex Morgan</h2>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted">
                <IconStar className="h-3.5 w-3.5 fill-amber-400 text-amber-400" filled />
                4.9 Trust Score
              </p>
              <div className="mt-3 flex gap-4 text-center">
                <div>
                  <p className="font-semibold text-foreground text-sm">0</p>
                  <p className="text-xs text-muted">Listings</p>
                </div>
                <div className="w-px bg-border" />
                <div>
                  <p className="font-semibold text-foreground text-sm">12</p>
                  <p className="text-xs text-muted">Swaps</p>
                </div>
              </div>
            </div>
            <DashboardNav />
          </div>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
