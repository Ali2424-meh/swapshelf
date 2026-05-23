import Link from "next/link";
import { Logo } from "@/components/logo";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-16 items-center px-6">
        <Logo />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-fade-up">
          <div className="rounded-3xl bg-card p-8 shadow-sm ring-1 ring-border sm:p-10">
            <h1 className="font-display text-3xl font-semibold text-foreground">Welcome back</h1>
            <p className="mt-2 text-sm text-muted">Sign in to manage your swaps and offers.</p>
            <form className="mt-8 space-y-5" action="/dashboard">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-foreground">
                  Email address
                </label>
                <input
                  id="email" name="email" type="email" autoComplete="email"
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted focus:border-green focus:outline-none focus:ring-2 focus:ring-green/20"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-semibold text-foreground">
                    Password
                  </label>
                  <Link href="#" className="text-xs font-medium text-green hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password" name="password" type="password" autoComplete="current-password"
                  placeholder="••••••••"
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:border-green focus:outline-none focus:ring-2 focus:ring-green/20"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-green py-3.5 font-semibold text-white shadow-sm transition hover:bg-green-dark"
              >
                Sign in
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-muted">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-semibold text-green hover:underline">
                Create one free
              </Link>
            </p>
          </div>
          <p className="mt-4 text-center text-xs text-muted">
            Administrator?{" "}
            <Link href="/admin" className="text-muted hover:text-foreground underline">
              Admin panel →
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
