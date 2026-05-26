import Link from "next/link";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-16 items-center px-6">
        <Logo />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <section className="w-full max-w-md rounded-3xl bg-card p-8 text-center shadow-sm ring-1 ring-border">
          <p className="text-sm font-semibold text-green">404</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-foreground">Page not found</h1>
          <p className="mt-2 text-sm text-muted">This SwapShelf page does not exist or has moved.</p>
          <Link
            href="/browse"
            className="mt-6 inline-flex rounded-xl bg-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-dark"
          >
            Browse listings
          </Link>
        </section>
      </main>
    </div>
  );
}
