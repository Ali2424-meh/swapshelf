import Link from "next/link";
import { AppShell } from "./app-shell";
import { Logo } from "./logo";

const FOOTER_LINKS = [
  {
    heading: "Product",
    links: [
      { label: "Browse listings", href: "/browse" },
      { label: "How it works",   href: "/how-it-works" },
      { label: "Sign up free",   href: "/signup" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "FAQ",             href: "/faq" },
      { label: "Safety tips",     href: "/safety" },
      { label: "Contact us",      href: "/contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy policy",  href: "/privacy" },
      { label: "Terms of service",href: "/terms" },
      { label: "Cookie policy",   href: "/cookies" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <AppShell className="py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Logo />
            <p className="text-sm leading-relaxed text-muted">
              A local marketplace for trading items you no longer need — no money required.
            </p>
          </div>
          {FOOTER_LINKS.map(({ heading, links }) => (
            <div key={heading}>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">
                {heading}
              </h4>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-muted hover:text-foreground">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted">© 2026 SwapShelf. All rights reserved.</p>
          <p className="text-xs text-muted">Built for communities, not corporations.</p>
        </div>
      </AppShell>
    </footer>
  );
}
