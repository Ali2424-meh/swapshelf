import Link from "next/link";
import { AdminMobileNav, AdminNav } from "@/components/admin-nav";
import { IconShield } from "@/components/icons";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await requireAdmin();

  return (
    <div className="min-h-screen bg-background md:flex">
      <div className="sticky top-0 z-40 md:hidden">
        <AdminMobileNav displayName={currentUser.profile.display_name} />
      </div>
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col bg-admin-sidebar px-3 py-5 text-white md:flex">
        <Link href="/admin" className="flex items-center gap-2.5 px-3 py-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green/20">
            <IconShield className="h-4 w-4 text-green-400" strokeWidth={2} />
          </span>
          <span className="font-display font-semibold text-sm">Admin Panel</span>
        </Link>
        <div className="mt-6 flex flex-1 flex-col">
          <AdminNav />
        </div>
        <div className="px-3 py-3 border-t border-white/10 mt-4">
          <p className="mb-1 text-xs font-medium text-gray-300">{currentUser.profile.display_name}</p>
          <p className="text-xs text-gray-500">SwapShelf v1.0.0</p>
        </div>
      </aside>
      {/* Main */}
      <main className="min-w-0 flex-1 bg-background p-4 sm:p-6 md:p-8">{children}</main>
    </div>
  );
}
