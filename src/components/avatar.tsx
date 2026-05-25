type AvatarProps = {
  src: string | null;
  alt: string;
  initials: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE_CLASSES = {
  sm: "h-7 w-7",
  md: "h-10 w-10",
  lg: "h-16 w-16",
} as const;

const INITIALS_TEXT_SIZE = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-xl",
} as const;

export function Avatar({ src, alt, initials, size = "md", className = "" }: AvatarProps) {
  const sizeClass = SIZE_CLASSES[size];
  const rounding = size === "lg" ? "rounded-2xl" : "rounded-full";

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={`${sizeClass} ${rounding} object-cover ring-1 ring-border ${className}`}
      />
    );
  }

  return (
    <span
      className={`flex ${sizeClass} items-center justify-center ${rounding} bg-green ${INITIALS_TEXT_SIZE[size]} font-bold text-white ${className}`}
    >
      {initials}
    </span>
  );
}
