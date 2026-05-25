"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { logoutAction } from "@/app/auth/actions";
import {
  IconArrowLeftRight,
  IconBox,
  IconChevronDown,
  IconHeart,
  IconLayoutDashboard,
  IconLogOut,
  IconMessageCircle,
  IconShield,
  IconUser,
} from "@/components/icons";

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

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const items = [
    { href: "/dashboard", label: "Dashboard", icon: IconLayoutDashboard },
    { href: "/dashboard/listings", label: "My Listings", icon: IconBox },
    { href: "/dashboard/offers", label: "Swap Offers", icon: IconArrowLeftRight },
    { href: "/dashboard/messages", label: "Messages", icon: IconMessageCircle },
    { href: "/dashboard/wishlist", label: "Wishlist", icon: IconHeart },
    { href: "/dashboard/profile", label: "Profile & Trust", icon: IconUser },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-2 rounded-xl border border-border bg-card px-2.5 py-1.5 text-sm font-medium text-foreground hover:bg-gray-50"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={displayName} className="h-7 w-7 rounded-full object-cover ring-1 ring-border" />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green text-xs font-bold text-white">
            {initials}
          </span>
        )}
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
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={displayName} className="h-10 w-10 rounded-full object-cover ring-1 ring-border" />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green text-sm font-bold text-white">
                  {initials}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
                <p className="truncate text-xs text-muted">{email}</p>
              </div>
            </div>
            {areaLabel && <p className="mt-2 truncate text-xs text-muted">{areaLabel}</p>}
          </div>

          <div className="py-1">
            {items.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground transition-all duration-200 hover:bg-green/5 hover:text-green hover:pl-5 hover:pr-3"
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
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground transition-all duration-200 hover:bg-green/5 hover:text-green hover:pl-5 hover:pr-3"
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
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 transition-all duration-200 hover:bg-red-50 hover:pl-5 hover:pr-3"
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
