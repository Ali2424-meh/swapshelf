import Link from "next/link";
import { Logo } from "@/components/logo";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-16 items-center px-6">
        <Logo />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-fade-up">
          <div className="rounded-3xl bg-card p-8 shadow-sm ring-1 ring-border sm:p-10">
            <h1 className="font-display text-3xl font-semibold text-foreground">Join SwapShelf</h1>
            <p className="mt-2 text-sm text-muted">Create a free account and start swapping locally.</p>
            <form className="mt-8 space-y-5" action="/dashboard">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-foreground">
                  Display name
                </label>
                <input
                  id="name" name="name" type="text" required placeholder="Alex Morgan"
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted focus:border-green focus:outline-none focus:ring-2 focus:ring-green/20"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-foreground">
                  Email address
                </label>
                <input
                  id="email" name="email" type="email" required autoComplete="email"
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted focus:border-green focus:outline-none focus:ring-2 focus:ring-green/20"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-foreground">
                  Password
                </label>
                <input
                  id="password" name="password" type="password" required
                  autoComplete="new-password" placeholder="At least 8 characters"
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted focus:border-green focus:outline-none focus:ring-2 focus:ring-green/20"
                />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-semibold text-foreground">
                  Your area <span className="font-normal text-muted">(optional)</span>
                </label>
                <input
                  id="location" name="location" type="text"
                  placeholder="City or postal code"
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted focus:border-green focus:outline-none focus:ring-2 focus:ring-green/20"
                />
              </div>
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" required className="mt-0.5 h-4 w-4 rounded border-border accent-green" />
                <span className="text-sm text-muted">
                  I agree to the{" "}
                  <Link href="#" className="text-green hover:underline">Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="#" className="text-green hover:underline">Privacy Policy</Link>
                </span>
              </label>
              <button
                type="submit"
                className="w-full rounded-xl bg-green py-3.5 font-semibold text-white shadow-sm transition hover:bg-green-dark"
              >
                Create account
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-muted">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-green hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
