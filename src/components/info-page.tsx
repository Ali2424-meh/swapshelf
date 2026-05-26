import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

type InfoPageProps = {
  title: string;
  eyebrow: string;
  children: ReactNode;
};

export function InfoPage({ title, eyebrow, children }: InfoPageProps) {
  return (
    <>
      <SiteHeader />
      <main className="py-10">
        <AppShell>
          <article className="mx-auto max-w-3xl rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border sm:p-8">
            <p className="text-sm font-semibold text-green">{eyebrow}</p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-foreground">{title}</h1>
            <div className="mt-6 space-y-4 text-sm leading-6 text-muted">{children}</div>
          </article>
        </AppShell>
      </main>
      <SiteFooter />
    </>
  );
}
