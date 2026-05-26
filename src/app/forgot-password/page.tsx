import Link from "next/link";
import { forgotPasswordAction } from "@/app/auth/actions";
import { Logo } from "@/components/logo";
import { PendingSubmitButton } from "@/components/pending-submit-button";

type ForgotPasswordPageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-16 items-center px-6">
        <Logo />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-fade-up rounded-3xl bg-card p-8 shadow-sm ring-1 ring-border sm:p-10">
          <h1 className="font-display text-3xl font-semibold text-foreground">Reset your password</h1>
          <p className="mt-2 text-sm text-muted">
            Enter your account email and we will send a secure reset link.
          </p>

          {params?.error && (
            <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {params.error}
            </p>
          )}
          {params?.message && (
            <p className="mt-5 rounded-xl border border-green/20 bg-green-light px-4 py-3 text-sm text-green">
              {params.message}
            </p>
          )}

          <form action={forgotPasswordAction} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-foreground">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted focus:border-green focus:outline-none focus:ring-2 focus:ring-green/20"
              />
            </div>
            <PendingSubmitButton
              pendingChildren="Sending link..."
              className="w-full rounded-xl bg-green py-3.5 font-semibold text-white shadow-sm transition hover:bg-green-dark"
            >
              Send reset link
            </PendingSubmitButton>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Remembered it?{" "}
            <Link href="/login" className="font-semibold text-green hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
