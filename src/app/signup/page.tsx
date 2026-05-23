import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
          <h1 className="text-2xl font-bold text-gray-900">Join SwapShelf</h1>
          <p className="mt-2 text-sm text-muted">
            Create an account to start swapping locally.
          </p>
          <form className="mt-8 space-y-5" action="/dashboard">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-900">
                Display Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Alex Morgan"
                className="mt-2 w-full rounded-lg border border-border px-4 py-2.5 focus:border-swapshelf-green focus:outline-none focus:ring-2 focus:ring-green-100"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="mt-2 w-full rounded-lg border border-border px-4 py-2.5 focus:border-swapshelf-green focus:outline-none focus:ring-2 focus:ring-green-100"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-900">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                className="mt-2 w-full rounded-lg border border-border px-4 py-2.5 focus:border-swapshelf-green focus:outline-none focus:ring-2 focus:ring-green-100"
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-semibold text-gray-900">
                Your Area
              </label>
              <input
                id="location"
                name="location"
                type="text"
                placeholder="City or postal code"
                className="mt-2 w-full rounded-lg border border-border px-4 py-2.5 focus:border-swapshelf-green focus:outline-none focus:ring-2 focus:ring-green-100"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-swapshelf-green py-3 font-semibold text-white transition hover:bg-swapshelf-green-dark"
            >
              Create Account
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-swapshelf-green hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
