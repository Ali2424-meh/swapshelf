import Link from "next/link";

type LogoProps = { className?: string; showText?: boolean };

export function Logo({ className = "", showText = true }: LogoProps) {
  return (
    <Link href="/" className={`group flex items-center gap-2.5 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green text-white shadow-sm">
        <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 7h12M4 7l3-3M4 7l3 3M16 13H4M16 13l-3-3M16 13l-3 3"/>
        </svg>
      </span>
      {showText && (
        <span className="font-display text-xl font-semibold tracking-tight text-foreground">
          Swap<span className="text-green">Shelf</span>
        </span>
      )}
    </Link>
  );
}
