import Link from "next/link";
import { Logo } from "./logo";

type SiteHeaderProps = {
  activeLink?: "browse" | "how-it-works";
  rightAction?: React.ReactNode;
};

export function SiteHeader({ activeLink, rightAction }: SiteHeaderProps) {
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
          {rightAction ?? (
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
