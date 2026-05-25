"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/auth/actions";
import {
  IconArrowLeftRight, IconBox, IconHeart, IconLogOut,
  IconMessageCircle, IconUser,
} from "@/components/icons";

const NAV_ITEMS = [
  { href: "/dashboard",          label: "My Listings",     icon: IconBox            },
  { href: "/dashboard/offers",   label: "Swap Offers",     icon: IconArrowLeftRight },
  { href: "/dashboard/messages", label: "Messages",        icon: IconMessageCircle  },
  { href: "/dashboard/wishlist", label: "Wishlist",        icon: IconHeart          },
  { href: "/dashboard/profile",  label: "Profile & Trust", icon: IconUser           },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-5 space-y-0.5">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href === "/dashboard" && pathname.startsWith("/dashboard/listings"));
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              active
                ? "bg-green text-white shadow-sm"
                : "text-muted hover:bg-gray-100 hover:text-foreground"
            }`}
          >
            {/* Fixed: h-4.5 is not a valid Tailwind class — use h-4 w-4 */}
            <Icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2.5 : 1.75} />
            {label}
          </Link>
        );
      })}
      <div className="my-2 border-t border-border" />
      <form action={logoutAction}>
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <IconLogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          Log Out
        </button>
      </form>
    </nav>
  );
}
