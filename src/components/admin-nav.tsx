"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  IconLayoutDashboard, IconLogOut, IconMenu, IconShield, IconShieldAlert,
  IconTag, IconUserPlus, IconList,
  IconX,
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

export function AdminMobileNav({ displayName }: { displayName: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <div className="flex h-14 items-center justify-between border-b border-white/10 bg-admin-sidebar px-4 text-white">
        <Link href="/admin" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green/20">
            <IconShield className="h-4 w-4 text-green-400" strokeWidth={2} />
          </span>
          <span className="font-display text-sm font-semibold">Admin Panel</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open admin navigation"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-300 hover:bg-white/10 hover:text-white"
        >
          <IconMenu className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close admin navigation"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute right-0 top-0 flex h-full w-72 flex-col bg-admin-sidebar px-3 py-4 text-white shadow-2xl">
            <div className="flex items-center justify-between px-3 pb-4">
              <div>
                <p className="text-sm font-semibold">{displayName}</p>
                <p className="text-xs text-gray-400">SwapShelf admin</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close admin navigation"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-300 hover:bg-white/10 hover:text-white"
              >
                <IconX className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-0.5">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                      active ? "bg-green/20 text-green-300" : "text-gray-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                );
              })}
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-white/10 hover:text-white"
              >
                <IconLogOut className="h-4 w-4 shrink-0" />
                Exit Admin
              </Link>
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
