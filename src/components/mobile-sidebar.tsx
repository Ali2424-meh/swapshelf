"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/auth/actions";
import {
  IconArrowLeftRight,
  IconBox,
  IconHeart,
  IconLayoutDashboard,
  IconLogOut,
  IconMenu,
  IconMessageCircle,
  IconPlus,
  IconUser,
  IconX,
} from "@/components/icons";
import { PendingSubmitButton } from "@/components/pending-submit-button";

const NAV_ITEMS = [
  { href: "/dashboard",          label: "Overview",        icon: IconLayoutDashboard },
  { href: "/dashboard/listings", label: "My Listings",     icon: IconBox },
  { href: "/dashboard/offers",   label: "Swap Offers",     icon: IconArrowLeftRight },
  { href: "/dashboard/messages", label: "Messages",        icon: IconMessageCircle },
  { href: "/dashboard/wishlist", label: "Wishlist",        icon: IconHeart },
  { href: "/dashboard/profile",  label: "Profile & Trust", icon: IconUser },
];

type MobileSidebarProps = {
  displayName: string;
  initials: string;
  avatarUrl: string | null;
  areaLabel: string | null;
  counts: { listings: number; swaps: number };
  pendingOffers?: number;
  unreadMessages?: number;
};

export function MobileSidebarTrigger(props: MobileSidebarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Hamburger trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        className="flex h-9 w-9 items-center justify-center rounded-xl text-muted hover:bg-background hover:text-foreground lg:hidden"
      >
        <IconMenu className="h-5 w-5" strokeWidth={1.75} />
      </button>

      {/* Backdrop + Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <div
            ref={overlayRef}
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
            style={{ animation: "fadeIn 200ms ease" }}
          />

          {/* Drawer */}
          <aside
            className="absolute left-0 top-0 flex h-full w-72 flex-col bg-card shadow-2xl"
            style={{ animation: "slideIn 250ms cubic-bezier(0.16, 1, 0.3, 1)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-3">
                {props.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={props.avatarUrl}
                    alt={props.displayName}
                    className="h-9 w-9 rounded-xl object-cover ring-1 ring-border"
                  />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green text-sm font-bold text-white">
                    {props.initials}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{props.displayName}</p>
                  {props.areaLabel && (
                    <p className="truncate text-[11px] text-muted">{props.areaLabel}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close navigation menu"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-background hover:text-foreground"
              >
                <IconX className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            {/* Stats */}
            <div className="flex border-b border-border">
              <div className="flex-1 py-3 text-center">
                <p className="text-sm font-semibold text-foreground">{props.counts.listings}</p>
                <p className="text-[11px] text-muted">Listings</p>
              </div>
              <div className="w-px bg-border" />
              <div className="flex-1 py-3 text-center">
                <p className="text-sm font-semibold text-foreground">{props.counts.swaps}</p>
                <p className="text-[11px] text-muted">Swaps</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
                const badge =
                  href === "/dashboard/offers" ? props.pendingOffers :
                  href === "/dashboard/messages" ? props.unreadMessages :
                  undefined;

                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
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

              <div className="pt-3">
                <Link
                  href="/dashboard/listings/new"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-green/30 bg-green-light px-4 py-2.5 text-[13px] font-semibold text-green hover:border-green hover:bg-green hover:text-white"
                >
                  <IconPlus className="h-3.5 w-3.5" strokeWidth={2.5} />
                  Post New Item
                </Link>
              </div>
            </nav>

            {/* Footer */}
            <div className="border-t border-border px-3 py-3">
              <form action={logoutAction}>
                <PendingSubmitButton
                  pendingChildren="Logging out..."
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-muted hover:bg-red-50 hover:text-red-600"
                >
                  <IconLogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  Log Out
                </PendingSubmitButton>
              </form>
            </div>
          </aside>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  );
}
