"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/auth/actions";
import {
  IconArrowLeftRight, IconBox, IconHeart, IconLayoutDashboard, IconLogOut,
  IconMessageCircle, IconPlus, IconUser,
} from "@/components/icons";

const NAV_ITEMS = [
  { href: "/dashboard",          label: "Overview",        icon: IconLayoutDashboard },
  { href: "/dashboard/listings", label: "My Listings",     icon: IconBox },
  { href: "/dashboard/offers",   label: "Swap Offers",     icon: IconArrowLeftRight },
  { href: "/dashboard/messages", label: "Messages",        icon: IconMessageCircle },
  { href: "/dashboard/wishlist", label: "Wishlist",        icon: IconHeart },
  { href: "/dashboard/profile",  label: "Profile & Trust", icon: IconUser },
];

type DashboardNavProps = {
  pendingOffers?: number;
  unreadMessages?: number;
};

export function DashboardNav({ pendingOffers, unreadMessages }: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <nav className="mt-4 space-y-1">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
        const badge =
          href === "/dashboard/offers" ? pendingOffers :
          href === "/dashboard/messages" ? unreadMessages :
          undefined;

        return (
          <Link
            key={href}
            href={href}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium ${
              active
                ? "bg-green text-white shadow-sm"
                : "text-foreground/70 hover:bg-green-light hover:text-green"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2.25 : 1.75} />
            <span className="flex-1">{label}</span>
            {badge !== undefined && badge > 0 && (
              <span className={`flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                active ? "bg-white/20 text-white" : "bg-green text-white"
              }`}>
                {badge > 99 ? "99+" : badge}
              </span>
            )}
          </Link>
        );
      })}

      {/* Post CTA */}
      <div className="pt-3">
        <Link
          href="/dashboard/listings/new"
          className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-green/30 bg-green-light px-4 py-2.5 text-[13px] font-semibold text-green hover:border-green hover:bg-green hover:text-white"
        >
          <IconPlus className="h-3.5 w-3.5" strokeWidth={2.5} />
          Post New Item
        </Link>
      </div>

      {/* Divider + Logout */}
      <div className="!mt-4 border-t border-border pt-2">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-muted hover:bg-red-50 hover:text-red-600"
          >
            <IconLogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            Log Out
          </button>
        </form>
      </div>
    </nav>
  );
}
