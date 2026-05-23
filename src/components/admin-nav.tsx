"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconLayoutDashboard, IconLogOut, IconShieldAlert,
  IconTag, IconUserPlus, IconList,
} from "@/components/icons";

const NAV_ITEMS = [
  { href: "/admin",             label: "Dashboard",         icon: IconLayoutDashboard },
  { href: "/admin/users",       label: "Manage Users",      icon: IconUserPlus        },
  { href: "/admin/listings",    label: "Review Listings",   icon: IconList            },
  { href: "/admin/reports",     label: "Reports & Disputes",icon: IconShieldAlert     },
  { href: "/admin/categories",  label: "Categories",        icon: IconTag             },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-0.5">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              active
                ? "bg-green/20 text-green-300"
                : "text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        );
      })}
      <Link
        href="/"
        className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-white/10 hover:text-white"
      >
        <IconLogOut className="h-4 w-4 shrink-0" />
        Exit Admin
      </Link>
    </nav>
  );
}
