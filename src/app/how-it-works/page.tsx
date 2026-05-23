import Link from "next/link";
import { ArrowLeftRight, MapPin, MessageCircle, Star } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const STEPS = [
  {
    icon: MapPin,
    title: "Set your location",
    description: "Choose your area and how far you're willing to travel for a swap.",
  },
  {
    icon: ArrowLeftRight,
    title: "Post or browse items",
    description: "List what you have with photos, or find books, games, and more nearby.",
  },
  {
    icon: MessageCircle,
    title: "Offer a swap & chat",
    description: "Send swap offers and message the other person to arrange a meet-up.",
  },
  {
    icon: Star,
    title: "Complete & build trust",
    description: "Finish the swap and rate each other to grow your trust score.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <SiteHeader activeLink="how-it-works" />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-bold text-gray-900">How SwapShelf works</h1>
        <p className="mt-4 text-lg text-muted">
          A local marketplace for trading items you no longer need — no money required.
        </p>
        <ol className="mt-12 space-y-10">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-swapshelf-green">
                <step.icon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm font-medium text-swapshelf-green">Step {i + 1}</p>
                <h2 className="mt-1 text-xl font-semibold text-gray-900">{step.title}</h2>
                <p className="mt-2 text-muted">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-12 text-center">
          <Link
            href="/signup"
            className="inline-block rounded-lg bg-swapshelf-green px-8 py-3 font-semibold text-white hover:bg-swapshelf-green-dark"
          >
            Get started
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
