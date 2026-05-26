import type { ComponentType } from "react";
import {
  IconArrowLeftRight,
  IconBlocks,
  IconBookOpen,
  IconBox,
  IconDisc,
  IconGamepad,
  IconHeart,
  IconLaptop,
  IconLayoutDashboard,
  IconMessageCircle,
  IconPuzzle,
  IconScissors,
  IconUser,
} from "@/components/icons";

type IconComponent = ComponentType<{ className?: string; strokeWidth?: number }>;
export type CategoryIconKey = "book" | "gamepad" | "puzzle" | "blocks" | "disc" | "laptop" | "scissors" | "box";

export type CategoryDisplay = {
  id?: string;
  name: string;
  slug: string;
  iconKey: CategoryIconKey;
  icon: IconComponent;
  active?: boolean;
  sort_order?: number;
};

export const FALLBACK_CATEGORIES: CategoryDisplay[] = [
  { name: "Books", slug: "books", iconKey: "book", icon: IconBookOpen, active: true, sort_order: 10 },
  { name: "Video Games", slug: "video-games", iconKey: "gamepad", icon: IconGamepad, active: true, sort_order: 20 },
  { name: "Board Games", slug: "board-games", iconKey: "puzzle", icon: IconPuzzle, active: true, sort_order: 30 },
  { name: "Toys", slug: "toys", iconKey: "blocks", icon: IconBlocks, active: true, sort_order: 40 },
  { name: "Music & DVDs", slug: "music-dvds", iconKey: "disc", icon: IconDisc, active: true, sort_order: 50 },
  { name: "Tech", slug: "tech", iconKey: "laptop", icon: IconLaptop, active: true, sort_order: 60 },
  { name: "Craft & Hobby", slug: "craft-hobby", iconKey: "scissors", icon: IconScissors, active: true, sort_order: 70 },
];

export const CATEGORY_ICON_OPTIONS: { value: CategoryIconKey; label: string; icon: IconComponent }[] = [
  { value: "book", label: "Book", icon: IconBookOpen },
  { value: "gamepad", label: "Gamepad", icon: IconGamepad },
  { value: "puzzle", label: "Puzzle", icon: IconPuzzle },
  { value: "blocks", label: "Blocks", icon: IconBlocks },
  { value: "disc", label: "Disc", icon: IconDisc },
  { value: "laptop", label: "Laptop", icon: IconLaptop },
  { value: "scissors", label: "Scissors", icon: IconScissors },
  { value: "box", label: "Box", icon: IconBox },
];

export const AREA_SCOPE_OPTIONS = [
  { label: "Same barangay", value: "barangay" },
  { label: "Same city/municipality", value: "city" },
  { label: "Same province", value: "province" },
  { label: "All Philippines", value: "all" },
];

export const RADIUS_OPTIONS = [
  { label: "Within 5 km", value: 5 },
  { label: "Within 10 km", value: 10 },
  { label: "Within 25 km", value: 25 },
  { label: "Within 50 km", value: 50 },
];

export type Listing = {
  id: string;
  title: string;
  description?: string | null;
  wants?: string | null;
  category: string;
  categorySlug?: string;
  categoryIconKey?: CategoryIconKey;
  distanceKm: number | null;
  areaLabel?: string | null;
  areaRank?: number | null;
  ownerId?: string;
  ownerName: string;
  ownerInitials: string;
  ownerAvatarUrl?: string | null;
  rating: number | null;
  reviewCount: number;
  imageUrl?: string | null;
  imageGradient: string;
  condition: "Like New" | "Good" | "Fair";
  isSaved?: boolean;
  isOwn?: boolean;
};

export const FALLBACK_LISTINGS: Listing[] = [
  {
    id: "demo-1",
    title: "The Last of Us Part II (PS4)",
    category: "Video Games",
    categorySlug: "video-games",
    categoryIconKey: "gamepad",
    distanceKm: null,
    areaLabel: "Cebu City, Cebu",
    ownerName: "Alex M.",
    ownerInitials: "AM",
    rating: null,
    reviewCount: 0,
    imageGradient: "from-slate-400 to-slate-600",
    condition: "Like New",
    isSaved: false,
    isOwn: false,
  },
  {
    id: "demo-2",
    title: "Dune Hardcover First Edition",
    category: "Books",
    categorySlug: "books",
    categoryIconKey: "book",
    distanceKm: null,
    areaLabel: "Quezon City, Metro Manila",
    ownerName: "Sam K.",
    ownerInitials: "SK",
    rating: null,
    reviewCount: 0,
    imageGradient: "from-amber-300 to-orange-400",
    condition: "Good",
    isSaved: false,
    isOwn: false,
  },
  {
    id: "demo-3",
    title: "Catan Complete Set",
    category: "Board Games",
    categorySlug: "board-games",
    categoryIconKey: "puzzle",
    distanceKm: null,
    areaLabel: "Davao City, Davao del Sur",
    ownerName: "Jordan P.",
    ownerInitials: "JP",
    rating: null,
    reviewCount: 0,
    imageGradient: "from-emerald-400 to-teal-500",
    condition: "Like New",
    isSaved: false,
    isOwn: false,
  },
];

export function iconForCategory(iconKeyOrSlug?: string | null): IconComponent {
  const map: Record<string, IconComponent> = {
    book: IconBookOpen,
    gamepad: IconGamepad,
    puzzle: IconPuzzle,
    blocks: IconBlocks,
    disc: IconDisc,
    laptop: IconLaptop,
    scissors: IconScissors,
    box: IconBox,
    books: IconBookOpen,
    "video-games": IconGamepad,
    "board-games": IconPuzzle,
    toys: IconBlocks,
    "music-dvds": IconDisc,
    tech: IconLaptop,
    "craft-hobby": IconScissors,
  };
  return map[iconKeyOrSlug ?? ""] ?? IconBox;
}

export const DASHBOARD_NAV_ITEMS = [
  { href: "/dashboard",          label: "Overview",        icon: IconLayoutDashboard },
  { href: "/dashboard/listings", label: "My Listings",     icon: IconBox },
  { href: "/dashboard/offers",   label: "Swap Offers",     icon: IconArrowLeftRight },
  { href: "/dashboard/messages", label: "Messages",        icon: IconMessageCircle },
  { href: "/dashboard/wishlist", label: "Wishlist",        icon: IconHeart },
  { href: "/dashboard/profile",  label: "Profile & Trust", icon: IconUser },
];
