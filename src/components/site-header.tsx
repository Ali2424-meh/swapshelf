import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/app/auth/actions";
import { Logo } from "./logo";
import { IconLayoutDashboard, IconShield, IconLogOut, IconUser } from "./icons";

type SiteHeaderProps = {
  activeLink?: "browse" | "how-it-works";
};

// Async server component — reads the real session on every render.
// No prop needed to pass user down; Next.js/React cache() dedupes the DB call.
export async function SiteHeader({ activeLink }: SiteHeaderProps) {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-1 sm:flex">
          {[
            { href: "/browse",       label: "Browse",       key: "browse"       },
            { href: "/how-it-works", label: "How it works", key: "how-it-works" },
          ].map(({ href, label, key }) => (
            <Link
              key={key}
              href={href}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                activeLink === key
                  ? "bg-green-light text-green"
                  : "text-muted hover:bg-gray-100 hover:text-foreground"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            /* ── Logged-in state ── */
            <>
              <Link
                href="/dashboard"
                className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-gray-100 hover:text-foreground sm:flex"
              >
                <IconLayoutDashboard className="h-4 w-4" strokeWidth={1.75} />
                Dashboard
              </Link>

              {user.profile.role === "admin" && (
                <Link
                  href="/admin"
                  className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-gray-100 hover:text-foreground sm:flex"
                >
                  <IconShield className="h-4 w-4" strokeWidth={1.75} />
                  Admin
                </Link>
              )}

              {/* Avatar dropdown (pure CSS — no JS needed) */}
              <div className="relative group">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl border border-border bg-card px-2.5 py-1.5 text-sm font-medium text-foreground hover:bg-gray-50"
                >
                  {user.profile.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.profile.avatar_url}
                      alt={user.profile.display_name}
                      className="h-7 w-7 rounded-full object-cover ring-1 ring-border"
                    />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green text-xs font-bold text-white">
                      {user.profile.initials}
                    </span>
                  )}
                  <span className="hidden sm:inline">{user.profile.display_name}</span>
                </button>

                {/* Dropdown — visible on hover via CSS group */}
                <div className="invisible absolute right-0 top-full z-50 mt-2 w-52 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">
                  <div className="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
                    <div className="border-b border-border px-4 py-3">
                      <p className="text-sm font-semibold text-foreground">{user.profile.display_name}</p>
                      <p className="mt-0.5 truncate text-xs text-muted">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link href="/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-gray-50">
                        <IconLayoutDashboard className="h-4 w-4 text-muted" strokeWidth={1.75} />
                        My Dashboard
                      </Link>
                      <Link href="/dashboard/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-gray-50">
                        <IconUser className="h-4 w-4 text-muted" strokeWidth={1.75} />
                        Profile & Settings
                      </Link>
                      {user.profile.role === "admin" && (
                        <Link href="/admin" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-gray-50">
                          <IconShield className="h-4 w-4 text-muted" strokeWidth={1.75} />
                          Admin Panel
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-border py-1">
                      <form action={logoutAction}>
                        <button type="submit" className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                          <IconLogOut className="h-4 w-4" strokeWidth={1.75} />
                          Log out
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* ── Logged-out state ── */
            <>
              <Link
                href="/login"
                className="hidden rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:bg-gray-100 sm:inline-flex"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-green px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-dark"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
