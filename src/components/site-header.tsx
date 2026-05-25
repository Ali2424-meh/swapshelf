import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { AppShell } from "./app-shell";
import { IconLayoutDashboard, IconShield } from "./icons";
import { Logo } from "./logo";
import { UserMenu } from "./user-menu";

type SiteHeaderProps = {
  activeLink?: "browse" | "how-it-works";
};

export async function SiteHeader({ activeLink }: SiteHeaderProps) {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
      <AppShell className="flex h-16 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-1 sm:flex">
          {[
            { href: "/browse", label: "Browse", key: "browse" },
            { href: "/how-it-works", label: "How it works", key: "how-it-works" },
          ].map(({ href, label, key }) => (
            <Link
              key={key}
              href={href}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                activeLink === key ? "bg-green-light text-green" : "text-muted hover:bg-gray-100 hover:text-foreground"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
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

              <UserMenu
                displayName={user.profile.display_name}
                email={user.email}
                initials={user.profile.initials}
                avatarUrl={user.profile.avatar_url}
                role={user.profile.role}
                areaLabel={user.profile.area_label}
              />
            </>
          ) : (
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
      </AppShell>
    </header>
  );
}
