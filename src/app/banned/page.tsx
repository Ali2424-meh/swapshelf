import { redirect } from "next/navigation";
import { logoutAction } from "@/app/auth/actions";
import { Logo } from "@/components/logo";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { getCurrentUser } from "@/lib/auth";

export default async function BannedPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.profile.status !== "banned") {
    redirect(currentUser.profile.role === "admin" ? "/admin" : "/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-16 items-center px-6">
        <Logo />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <section className="w-full max-w-lg rounded-3xl bg-card p-8 text-center shadow-sm ring-1 ring-border sm:p-10">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl font-bold text-red-600">
            !
          </span>
          <h1 className="mt-5 font-display text-3xl font-semibold text-foreground">Account unavailable</h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            Your SwapShelf account has been banned, so marketplace actions, messages, and dashboard access are
            currently disabled.
          </p>
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-left">
            <p className="text-sm font-semibold text-red-700">Signed in as {currentUser.email}</p>
            <p className="mt-1 text-xs leading-5 text-red-700/80">
              If you believe this was a mistake, contact SwapShelf support with the email address on this account.
            </p>
          </div>
          <form action={logoutAction} className="mt-6">
            <PendingSubmitButton
              pendingChildren="Signing out..."
              className="w-full rounded-xl bg-green py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-dark"
            >
              Sign out
            </PendingSubmitButton>
          </form>
        </section>
      </main>
    </div>
  );
}
