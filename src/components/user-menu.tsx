"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { logoutAction } from "@/app/auth/actions";
import { Avatar } from "@/components/avatar";
import { IconChevronDown, IconLogOut, IconShield } from "@/components/icons";
import { DASHBOARD_NAV_ITEMS } from "@/lib/constants";
import { useClickOutside } from "@/lib/hooks";

type UserMenuProps = {
  displayName: string;
  email: string | null;
  initials: string;
  avatarUrl: string | null;
  role: "user" | "admin";
  areaLabel?: string | null;
};

export function UserMenu({ displayName, email, initials, avatarUrl, role, areaLabel }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, close);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-2 rounded-xl border border-border bg-card px-2.5 py-1.5 text-sm font-medium text-foreground hover:bg-gray-50"
      >
        <Avatar src={avatarUrl} alt={displayName} initials={initials} size="sm" />
        <span className="hidden max-w-36 truncate sm:inline">{displayName}</span>
        <IconChevronDown className={`h-3.5 w-3.5 text-muted ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-border bg-card shadow-lg animate-in fade-in zoom-in-95 duration-100 ease-out origin-top-right"
        >
          <div className="border-b border-border px-4 py-3">
            <div className="flex items-center gap-3">
              <Avatar src={avatarUrl} alt={displayName} initials={initials} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
                <p className="truncate text-xs text-muted">{email}</p>
              </div>
            </div>
            {areaLabel && <p className="mt-2 truncate text-xs text-muted">{areaLabel}</p>}
          </div>

          <div className="py-1">
            {DASHBOARD_NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-green-light hover:text-green"
              >
                <Icon className="h-4 w-4 text-muted" strokeWidth={1.75} />
                {label}
              </Link>
            ))}
            {role === "admin" && (
              <Link
                href="/admin"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-green-light hover:text-green"
              >
                <IconShield className="h-4 w-4 text-muted" strokeWidth={1.75} />
                Admin Panel
              </Link>
            )}
          </div>

          <div className="border-t border-border py-1">
            <form action={logoutAction}>
              <button
                type="submit"
                role="menuitem"
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <IconLogOut className="h-4 w-4" strokeWidth={1.75} />
                Log out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
