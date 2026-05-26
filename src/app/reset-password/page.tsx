import Link from "next/link";
import { updatePasswordAction } from "@/app/auth/actions";
import { Logo } from "@/components/logo";
import { PendingSubmitButton } from "@/components/pending-submit-button";

type ResetPasswordPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-16 items-center px-6">
        <Logo />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-fade-up rounded-3xl bg-card p-8 shadow-sm ring-1 ring-border sm:p-10">
          <h1 className="font-display text-3xl font-semibold text-foreground">Choose a new password</h1>
          <p className="mt-2 text-sm text-muted">Use at least 8 characters.</p>

          {params?.error && (
            <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {params.error}
            </p>
          )}

          <form action={updatePasswordAction} className="mt-8 space-y-5">
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-foreground">
                New password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:border-green focus:outline-none focus:ring-2 focus:ring-green/20"
              />
            </div>
            <div>
              <label htmlFor="confirm_password" className="block text-sm font-semibold text-foreground">
                Confirm password
              </label>
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:border-green focus:outline-none focus:ring-2 focus:ring-green/20"
              />
            </div>
            <PendingSubmitButton
              pendingChildren="Updating password..."
              className="w-full rounded-xl bg-green py-3.5 font-semibold text-white shadow-sm transition hover:bg-green-dark"
            >
              Update password
            </PendingSubmitButton>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Need a new link?{" "}
            <Link href="/forgot-password" className="font-semibold text-green hover:underline">
              Request another
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
