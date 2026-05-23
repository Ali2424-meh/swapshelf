import Link from "next/link";
import { Star } from "lucide-react";
import { DashboardNav } from "@/components/dashboard-nav";
import { SiteHeader } from "@/components/site-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <SiteHeader
        rightAction={
          <Link href="/dashboard" className="text-sm font-medium text-gray-700">
            Dashboard
          </Link>
        }
      />
      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-8 sm:px-6">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <div className="flex flex-col items-center text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-swapshelf-green text-xl font-bold text-white">
                AM
              </span>
              <h2 className="mt-3 font-semibold text-gray-900">Alex Morgan</h2>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                4.9 Trust Score
              </p>
            </div>
            <DashboardNav />
          </div>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
