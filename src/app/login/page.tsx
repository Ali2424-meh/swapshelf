import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back!</h1>
          <p className="mt-2 text-sm text-muted">
            Sign in to manage your swaps and offers.
          </p>
          <form className="mt-8 space-y-5" action="/dashboard">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="user@example.com (use admin@swapshelf.com)"
                className="mt-2 w-full rounded-lg border border-border px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-swapshelf-green focus:outline-none focus:ring-2 focus:ring-green-100"
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
                autoComplete="current-password"
                defaultValue="••••••••"
                className="mt-2 w-full rounded-lg border border-border px-4 py-2.5 text-gray-900 focus:border-swapshelf-green focus:outline-none focus:ring-2 focus:ring-green-100"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-swapshelf-green py-3 font-semibold text-white transition hover:bg-swapshelf-green-dark"
            >
              Log In
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-muted">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-swapshelf-green hover:underline">
              Sign up
            </Link>
          </p>
          <p className="mt-4 text-center text-xs text-muted">
            <Link href="/admin" className="hover:text-gray-700">
              Admin panel →
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
