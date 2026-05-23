import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const STEPS = [
  {
    emoji: "📍",
    title: "Set your location",
    description: "Choose your area and how far you're willing to travel for a swap. We'll show you items close to you first.",
  },
  {
    emoji: "📦",
    title: "Post or browse items",
    description: "List what you have with photos and a description, or browse books, games, tech, and more listed by people nearby.",
  },
  {
    emoji: "💬",
    title: "Offer a swap & chat",
    description: "Found something you want? Send a swap offer and use our built-in messaging to arrange a safe meet-up.",
  },
  {
    emoji: "⭐",
    title: "Complete & build trust",
    description: "Finish the swap and rate each other. Your trust score grows with every successful exchange.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <SiteHeader activeLink="how-it-works" />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <span className="inline-block rounded-full bg-green-light px-4 py-1.5 text-sm font-semibold text-green">
            It&apos;s simple
          </span>
          <h1 className="font-display mt-4 text-4xl font-semibold text-foreground sm:text-5xl">
            How SwapShelf works
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
            A local marketplace for trading items you no longer need — no money required, no shipping involved.
          </p>
        </div>

        <ol className="mt-16 space-y-6">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-5 rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border">
              <div className="flex flex-col items-center gap-2">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green text-white text-sm font-bold">
                  {i + 1}
                </span>
                {i < STEPS.length - 1 && <div className="mt-1 w-0.5 flex-1 bg-border" />}
              </div>
              <div className="pb-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{step.emoji}</span>
                  <h2 className="font-display text-xl font-semibold text-foreground">{step.title}</h2>
                </div>
                <p className="mt-2 leading-relaxed text-muted">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-12 rounded-2xl bg-green-light p-8 text-center">
          <h3 className="font-display text-xl font-semibold text-green">Ready to start swapping?</h3>
          <p className="mt-2 text-sm text-green/80">Join thousands of locals trading items they love. It&apos;s completely free.</p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/signup" className="rounded-xl bg-green px-8 py-3 font-semibold text-white hover:bg-green-dark">
              Create free account
            </Link>
            <Link href="/browse" className="rounded-xl border border-green px-8 py-3 font-semibold text-green hover:bg-green hover:text-white">
              Browse listings
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
