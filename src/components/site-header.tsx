import Link from "next/link";
import { Logo } from "./logo";

type SiteHeaderProps = {
  activeLink?: "browse" | "how-it-works";
  rightAction?: React.ReactNode;
};

export function SiteHeader({ activeLink, rightAction }: SiteHeaderProps) {
  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-8 sm:flex">
          <Link
            href="/"
            className={`text-sm font-medium ${
              activeLink === "browse"
                ? "text-gray-900"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Browse
          </Link>
          <Link
            href="/how-it-works"
            className={`text-sm font-medium ${
              activeLink === "how-it-works"
                ? "text-gray-900"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            How it works
          </Link>
        </nav>
        {rightAction ?? (
          <Link
            href="/login"
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Log in
          </Link>
        )}
      </div>
    </header>
  );
}
