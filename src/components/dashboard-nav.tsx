"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  Box,
  Heart,
  LogOut,
  MessageCircle,
  Star,
  User,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "My Listings", icon: Box },
  { href: "/dashboard/offers", label: "Swap Offers", icon: ArrowLeftRight },
  { href: "/dashboard/messages", label: "Messages", icon: MessageCircle },
  { href: "/dashboard/wishlist", label: "Wishlist & Alerts", icon: Heart },
  { href: "/dashboard/profile", label: "Profile & Trust", icon: User },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-4 space-y-1">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              active
                ? "bg-swapshelf-green text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Icon className="h-5 w-5" strokeWidth={active ? 2 : 1.5} />
            {label}
          </Link>
        );
      })}
      <Link
        href="/"
        className="mt-6 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        <LogOut className="h-5 w-5" />
        Log Out
      </Link>
    </nav>
  );
}
