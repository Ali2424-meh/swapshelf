import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";

type LogoProps = {
  className?: string;
  showText?: boolean;
};

export function Logo({ className = "", showText = true }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-swapshelf-green text-white">
        <ArrowLeftRight className="h-5 w-5" strokeWidth={2.5} />
      </span>
      {showText && (
        <span className="text-xl font-bold tracking-tight text-gray-900">
          SwapShelf
        </span>
      )}
    </Link>
  );
}
